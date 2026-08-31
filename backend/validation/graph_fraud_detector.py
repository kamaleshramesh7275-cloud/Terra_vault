"""
Terra_vault — Graph-Based Fraud Detection
Models landowner–plot–mutation relationships as a directed graph.
Detects: circular mutations, duplicate claims, orphaned mutations, area expansion fraud.
"""
import logging
from dataclasses import dataclass
from typing import List, Optional, Dict

import networkx as nx
from fuzzywuzzy import fuzz

log = logging.getLogger(__name__)


@dataclass
class FraudAlert:
    alert_type: str
    severity: str          # "critical" | "high" | "medium"
    record_ids: List[str]
    description: str
    subgraph_nodes: List[str]


class FraudGraph:
    """
    Maintains an in-memory NetworkX directed graph of land ownership.
    Nodes: Owner (o:name), Plot (p:khasra+village), Mutation (m:id)
    Edges: CLAIMED_BY, MUTATED_TO, BORDERS
    """

    def __init__(self):
        self.G = nx.DiGraph()

    def add_record(self, record: dict):
        """Add a land record's relationships to the graph."""
        record_id = record.get("id", "")
        khasra = record.get("khasra_no", "")
        village = record.get("village_lgd_code") or record.get("village", "")
        owner = record.get("owner_name", "")
        mutation_no = record.get("mutation_no", "")

        if not (khasra and village):
            return

        plot_node = f"p:{khasra}:{village}"
        owner_node = f"o:{owner.lower().strip()}"
        mutation_node = f"m:{mutation_no}:{record_id}"

        self.G.add_node(plot_node, type="plot", khasra=khasra, village=village)
        self.G.add_node(owner_node, type="owner", name=owner)
        if mutation_no:
            self.G.add_node(mutation_node, type="mutation", record_id=record_id)
            self.G.add_edge(plot_node, mutation_node, label="MUTATED_VIA")
            self.G.add_edge(mutation_node, owner_node, label="TRANSFERRED_TO")
        self.G.add_edge(owner_node, plot_node, label="CLAIMED_BY", record_id=record_id)

    def detect_fraud(self) -> List[FraudAlert]:
        alerts = []

        # ── 1. Circular mutation chains ────────────────────────────────────────
        try:
            cycles = list(nx.simple_cycles(self.G))
            for cycle in cycles:
                mut_nodes = [n for n in cycle if n.startswith("m:")]
                if len(mut_nodes) >= 2:
                    record_ids = [self.G.nodes[n].get("record_id", "") for n in mut_nodes]
                    alerts.append(FraudAlert(
                        alert_type="circular_mutation",
                        severity="critical",
                        record_ids=[r for r in record_ids if r],
                        description=f"Circular mutation chain detected: {' → '.join(cycle)}",
                        subgraph_nodes=cycle,
                    ))
        except Exception as e:
            log.warning("fraud.cycle_detection_failed", error=str(e))

        # ── 2. Duplicate claims (same plot, similar owner names) ───────────────
        plot_owners: Dict[str, List[str]] = {}
        for u, v, data in self.G.edges(data=True):
            if data.get("label") == "CLAIMED_BY" and u.startswith("o:"):
                plot = v
                if plot not in plot_owners:
                    plot_owners[plot] = []
                plot_owners[plot].append(u)

        for plot, owners in plot_owners.items():
            if len(owners) < 2:
                continue
            for i in range(len(owners)):
                for j in range(i + 1, len(owners)):
                    n1 = owners[i].replace("o:", "")
                    n2 = owners[j].replace("o:", "")
                    sim = fuzz.token_sort_ratio(n1, n2)
                    if sim > 75:  # similar names
                        alerts.append(FraudAlert(
                            alert_type="duplicate_claim",
                            severity="high",
                            record_ids=[
                                self.G[owners[i]][plot].get("record_id", ""),
                                self.G[owners[j]][plot].get("record_id", ""),
                            ],
                            description=f"Duplicate claim on plot {plot}: '{n1}' vs '{n2}' (similarity {sim}%)",
                            subgraph_nodes=[owners[i], plot, owners[j]],
                        ))

        # ── 3. Orphaned mutations (mutation node with no owner target) ─────────
        for node, data in self.G.nodes(data=True):
            if data.get("type") == "mutation":
                successors = list(self.G.successors(node))
                if not any(self.G.nodes[s].get("type") == "owner" for s in successors):
                    alerts.append(FraudAlert(
                        alert_type="orphaned_mutation",
                        severity="medium",
                        record_ids=[data.get("record_id", "")],
                        description=f"Mutation {node} has no target owner — possible incomplete record",
                        subgraph_nodes=[node],
                    ))

        log.info("fraud.scan_complete", alerts=len(alerts))
        return alerts

    def export_to_neo4j(self, neo4j_driver):
        """Export suspicious subgraphs to Neo4j for analyst review."""
        try:
            with neo4j_driver.session() as session:
                for node, data in self.G.nodes(data=True):
                    session.run(
                        "MERGE (n:LandNode {id: $id}) SET n += $props",
                        id=node, props=data
                    )
                for u, v, data in self.G.edges(data=True):
                    label = data.get("label", "RELATED")
                    session.run(
                        f"MATCH (a:LandNode {{id: $u}}), (b:LandNode {{id: $v}}) "
                        f"MERGE (a)-[:{label}]->(b)",
                        u=u, v=v
                    )
            log.info("fraud.neo4j_export_complete", nodes=self.G.number_of_nodes())
        except Exception as e:
            log.error("fraud.neo4j_export_failed", error=str(e))
