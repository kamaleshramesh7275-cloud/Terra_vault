# -*- coding: utf-8 -*-
"""
Terra_vault — Tamil Nadu Cadastral & Land Record Seed Generator
Populates realistic Patta / Chitta land records, cadastral FMB plots,
mutation history chains, inheritance lineage trees, and blockchain testnet anchors.
"""
import sys
import os
import uuid
import json
import asyncio
from datetime import datetime

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
sys.path.insert(0, backend_path)

from core.database import engine, AsyncSessionLocal, Base
from core.models import LandRecord, FieldConfidence, ReviewTask, BlockchainAnchor, GISPlot, MaturityScore


def new_id():
    return str(uuid.uuid4())


TAMILNADU_PLOTS = [
    {
        "survey_no": "142/3A",
        "subdivision": "3A",
        "patta_no": "1084",
        "owner_name": "R. Selvakumar / ஆர். செல்வகுமார்",
        "father_name": "Ramasamy Gounder / ராமசாமி கவுண்டர்",
        "co_owners": ["S. Revathi (Wife)", "S. Karthi (Son)"],
        "village": "Malianpur (மலையன்பூர்)",
        "taluk": "Sriperumbudur (ஸ்ரீபெரும்புதூர்)",
        "district": "Kanchipuram",
        "state": "Tamil Nadu",
        "village_lgd_code": "629104",
        "land_type": "நன்செய் (Wet / Irrigated Agricultural)",
        "soil_type": "Red Sandy Clay Loam / செம்மண்",
        "area_acres": 2.45,
        "area_cents": 245,
        "area_sqm": 9914.7,
        "guideline_value_sqft": 1650,
        "market_value_inr": 12500000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        # Coordinates in Sriperumbudur / Kanchipuram region (~12.9698° N, 79.9482° E)
        "polygon": [
            [79.9472, 12.9688],
            [79.9495, 12.9691],
            [79.9501, 12.9712],
            [79.9478, 12.9710],
            [79.9472, 12.9688]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1982-04-14",
                "deed_type": "Ancestral Partition Deed (பாகப்பிரிவினை ஆவணம்)",
                "doc_no": "Doc 412/1982, SRO Sriperumbudur",
                "transferor": "Periyathambi Gounder (Grandfather)",
                "transferee": "Ramasamy Gounder (Father)",
                "extent": "4.90 Acres",
                "status": "Verified on Cadastral Register"
            },
            {
                "step": 2,
                "date": "2008-11-20",
                "deed_type": "Legal Heir Succession (வாரிசுரிமை பட்டா மாறுதல்)",
                "doc_no": "Mutation Order M-2008-419",
                "transferor": "Late Ramasamy Gounder",
                "transferee": "R. Selvakumar & R. Murugesan (Sons)",
                "extent": "Divided into 2.45 Acres each (Subdivision 3A & 3B)",
                "status": "Verified with Revenue Records"
            },
            {
                "step": 3,
                "date": "2024-02-15",
                "deed_type": "Family Settlement & Co-owner Inclusion (குடும்ப ஏற்பாட்டு ஆவணம்)",
                "doc_no": "Doc 1092/2024, SRO Sriperumbudur",
                "transferor": "R. Selvakumar",
                "transferee": "R. Selvakumar, S. Revathi & S. Karthi (Joint Title)",
                "extent": "2.45 Acres (Full Extent)",
                "status": "Active Title / Anchored to Polygon Amoy"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Periyathambi Gounder (பெரியதம்பி கவுண்டர்)",
                "relation": "Great Grandfather (1920 - 1985)",
                "generation": "Gen 1 (Patriarch)",
                "children": [
                    {
                        "name": "Ramasamy Gounder (ராமசாமி கவுண்டர்)",
                        "relation": "Father (1948 - 2008)",
                        "generation": "Gen 2",
                        "children": [
                            {
                                "name": "R. Selvakumar (ஆர். செல்வகுமார்)",
                                "relation": "Current Primary Registered Owner (Age 48)",
                                "generation": "Gen 3",
                                "heirs": [
                                    {"name": "S. Karthi (கார்த்தி)", "relation": "Son / Co-parcener (Age 22)"},
                                    {"name": "S. Deepa (தீபா)", "relation": "Daughter / Co-parcener (Age 20)"}
                                ]
                            },
                            {
                                "name": "R. Murugesan (ஆர். முருகேசன்)",
                                "relation": "Brother / Owner of adjacent Plot 142/3B (Age 45)",
                                "generation": "Gen 3",
                                "heirs": []
                            }
                        ]
                    }
                ]
            }
        }
    },
    {
        "survey_no": "89/1B",
        "subdivision": "1B",
        "patta_no": "642",
        "owner_name": "M. Meenakshi Sundaram / மீ. மீனாட்சி சுந்தரம்",
        "father_name": "Muthusamy Pillai / முத்துசாமி பிள்ளை",
        "co_owners": ["M. Vasantha (Wife)"],
        "village": "Thiruvalluvar Nagar / திருவள்ளுவர் நகர்",
        "taluk": "Alandur (ஆலந்தூர்)",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "village_lgd_code": "580124",
        "land_type": "மனை (Residential Plot / Natham)",
        "soil_type": "Coastal Alluvial / வண்டல் மண்",
        "area_acres": 0.35,
        "area_cents": 35,
        "area_sqm": 1416.4,
        "guideline_value_sqft": 4800,
        "market_value_inr": 28000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [80.1985, 12.9962],
            [80.2012, 12.9965],
            [80.2015, 12.9984],
            [80.1988, 12.9982],
            [80.1985, 12.9962]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1994-08-10",
                "deed_type": "Registered Sale Deed (கிரைய ஆவணம்)",
                "doc_no": "Doc 2314/1994, SRO Alandur",
                "transferor": "Sundaresan Chettiar",
                "transferee": "Muthusamy Pillai",
                "extent": "35 Cents (15,246 sq.ft)",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2016-05-18",
                "deed_type": "Gift Settlement Deed (தான செட்டில்மென்ட் ஆவணம்)",
                "doc_no": "Doc 1845/2016, SRO Alandur",
                "transferor": "Muthusamy Pillai",
                "transferee": "M. Meenakshi Sundaram",
                "extent": "35 Cents (Full Plot)",
                "status": "Active Title / Anchored to Blockchain"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Muthusamy Pillai (முத்துசாமி பிள்ளை)",
                "relation": "Father (Donor / Settlor)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "M. Meenakshi Sundaram (மீ. மீனாட்சி சுந்தரம்)",
                        "relation": "Title Holder (Recipient under Gift Settlement)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "M. Vignesh (விக்னேஷ்)", "relation": "Son (Age 26)"}
                        ]
                    }
                ]
            }
        }
    },
    {
        "survey_no": "204/2",
        "subdivision": "2",
        "patta_no": "2190",
        "owner_name": "K. Anbazhagan / கே. அன்பழகன்",
        "father_name": "Kandhasamy Thevar / கந்தசாமி தேவர்",
        "co_owners": ["K. Subramanian (Brother)", "K. Rajeshwari (Sister)"],
        "village": "Melur Rural (மேலூர் கிராமம்)",
        "taluk": "Melur (மேலூர்)",
        "district": "Madurai",
        "state": "Tamil Nadu",
        "village_lgd_code": "632810",
        "land_type": "புன்செய் (Dry / Rainfed Agricultural)",
        "soil_type": "Black Cotton Soil / கரிசல் மண்",
        "area_acres": 4.10,
        "area_cents": 410,
        "area_sqm": 16592.1,
        "guideline_value_sqft": 850,
        "market_value_inr": 18500000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [78.3340, 10.0280],
            [78.3375, 10.0285],
            [78.3380, 10.0315],
            [78.3345, 10.0310],
            [78.3340, 10.0280]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1975-01-12",
                "deed_type": "Ryotwari Patta Settlement (ரயத்துவாரி பட்டா ஆவணம்)",
                "doc_no": "Settlement Survey 204/2",
                "transferor": "Government of Tamil Nadu",
                "transferee": "Kandhasamy Thevar",
                "extent": "4.10 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2019-09-04",
                "deed_type": "Succession / Virasat Order (வாரிசு அடிப்படையில் பட்டா மாறுதல்)",
                "doc_no": "Revenue Order REV-MDU-2019-881",
                "transferor": "Late Kandhasamy Thevar",
                "transferee": "K. Anbazhagan, K. Subramanian & K. Rajeshwari (Joint Heirs)",
                "extent": "4.10 Acres (Undivided Co-ownership)",
                "status": "Active Joint Title / Anchored to Blockchain"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Kandhasamy Thevar (கந்தசாமி தேவர்)",
                "relation": "Original Patta Holder (1935 - 2018)",
                "generation": "Gen 1",
                "children": [
                    {"name": "K. Anbazhagan (அன்பழகன்)", "relation": "Elder Son / Lead Title Holder", "generation": "Gen 2", "heirs": []},
                    {"name": "K. Subramanian (சுப்பிரமணியன்)", "relation": "Second Son / Joint Co-owner", "generation": "Gen 2", "heirs": []},
                    {"name": "K. Rajeshwari (ராஜேஸ்வரி)", "relation": "Daughter / Joint Co-owner", "generation": "Gen 2", "heirs": []}
                ]
            }
        }
    },
    {
        "survey_no": "55/4C",
        "subdivision": "4C",
        "patta_no": "3411",
        "owner_name": "S. Thangavel Naidu / எஸ். தங்கவேல் நாயுடு",
        "father_name": "Shanmuga Naidu / சண்முக நாயுடு",
        "co_owners": [],
        "village": "Kumbakonam East (கும்பகோணம் கிழக்கு)",
        "taluk": "Kumbakonam (கும்பகோணம்)",
        "district": "Thanjavur",
        "state": "Tamil Nadu",
        "village_lgd_code": "639201",
        "land_type": "நன்செய் (Cauvery Delta Wet Land / நெல் பாசன நிலம்)",
        "soil_type": "Deltaic Alluvial Clay / வண்டல் நிலம்",
        "area_acres": 3.80,
        "area_cents": 380,
        "area_sqm": 15378.0,
        "guideline_value_sqft": 1200,
        "market_value_inr": 22000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [79.3780, 10.9610],
            [79.3810, 10.9615],
            [79.3815, 10.9642],
            [79.3785, 10.9638],
            [79.3780, 10.9610]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "2001-03-22",
                "deed_type": "Registered Sale Deed (கிரைய ஆவணம்)",
                "doc_no": "Doc 884/2001, SRO Kumbakonam",
                "transferor": "Govindaraj Udayar",
                "transferee": "S. Thangavel Naidu",
                "extent": "3.80 Acres",
                "status": "Verified / Blockchain Validated"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Shanmuga Naidu (சண்முக நாயுடு)",
                "relation": "Father",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "S. Thangavel Naidu (எஸ். தங்கவேல் நாயுடு)",
                        "relation": "Current Sole Title Holder (Age 54)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "T. Balaji (பாலாஜி)", "relation": "Son (Age 28)"},
                            {"name": "T. Sowmya (சௌமியா)", "relation": "Daughter (Age 24)"}
                        ]
                    }
                ]
            }
        }
    },
    {
        "survey_no": "312/1A",
        "subdivision": "1A",
        "patta_no": "5120",
        "owner_name": "P. Natesan / பி. நடேசன்",
        "father_name": "Palanichamy / பழனிச்சாமி",
        "co_owners": ["N. Karpagam (Wife)"],
        "village": "Pollachi South (பொள்ளாச்சி தெற்கு)",
        "taluk": "Pollachi (பொள்ளாச்சி)",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641002",
        "land_type": "தோட்டக்கால் (Coconut Plantation / தோட்டம்)",
        "soil_type": "Deep Red Loam / தோட்டம் செம்மண்",
        "area_acres": 5.20,
        "area_cents": 520,
        "area_sqm": 21043.6,
        "guideline_value_sqft": 1850,
        "market_value_inr": 35000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.0010, 10.6550],
            [77.0055, 10.6555],
            [77.0060, 10.6590],
            [77.0015, 10.6585],
            [77.0010, 10.6550]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1992-10-15",
                "deed_type": "Ancestral Partition (குடும்ப பாகப்பிரிவினை)",
                "doc_no": "Doc 1540/1992, SRO Pollachi",
                "transferor": "Palanichamy (Father)",
                "transferee": "P. Natesan",
                "extent": "5.20 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2023-11-10",
                "deed_type": "Joint Co-ownership Mutation (கூட்டுப் பட்டா சேர்த்தல்)",
                "doc_no": "Mutation Order POL-2023-441",
                "transferor": "P. Natesan",
                "transferee": "P. Natesan & N. Karpagam",
                "extent": "5.20 Acres",
                "status": "Active Joint Title / Anchored"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Palanichamy (பழனிச்சாமி)",
                "relation": "Father (Patriarch)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "P. Natesan (பி. நடேசன்)",
                        "relation": "Current Primary Owner",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "N. Senthil (செந்தில்)", "relation": "Son (Age 30)"}
                        ]
                    }
                ]
            }
        }
    }
]


async def seed():
    print("🌱 Initializing Tamil Nadu Cadastral & Land Record Seed...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # 1. Clean existing records for fresh seed or check
        for pdata in TAMILNADU_PLOTS:
            rec_id = new_id()
            plot_id = new_id()

            # Create LandRecord
            rec = LandRecord(
                id=rec_id,
                owner_name=pdata["owner_name"],
                father_name=pdata["father_name"],
                khasra_no=pdata["survey_no"],
                survey_no=pdata["survey_no"],
                patta_no=pdata["patta_no"],
                survey_subdivision=pdata["subdivision"],
                co_owners=pdata["co_owners"],
                village=pdata["village"],
                tehsil=pdata["taluk"],
                district=pdata["district"],
                state=pdata["state"],
                village_lgd_code=pdata["village_lgd_code"],
                area_value=pdata["area_acres"],
                area_unit="Acres",
                land_type=pdata["land_type"],
                guideline_value=pdata["guideline_value_sqft"],
                encumbrance_status=pdata["encumbrance_status"],
                mutation_history=pdata["mutation_history"],
                inheritance_tree=pdata["inheritance_tree"],
                mutation_no=pdata["mutation_history"][-1]["doc_no"] if pdata["mutation_history"] else "MUT-2024-001",
                transaction_type=pdata["mutation_history"][-1]["deed_type"] if pdata["mutation_history"] else "Sale",
                detected_script="Tamil / Tamil-Bilingual",
                quality_score=0.96,
                overall_confidence=0.98,
                status="verified",
                blockchain_anchored=True,
                raw_doc_url="http://localhost:8000/static/sample_patta_tn.png",
                enhanced_doc_url="http://localhost:8000/static/sample_patta_tn.png",
                doc_sha256="7a39d84fbc910248ad938c31e920d39e248b9812903841029384910283948192"
            )
            db.add(rec)

            # Create Blockchain Anchor
            anchor = BlockchainAnchor(
                id=new_id(),
                record_id=rec_id,
                record_hash="0x" + "7a39d84fbc910248ad938c31e920d39e248b9812903841029384910283948192",
                tx_hash="0x" + uuid.uuid4().hex + uuid.uuid4().hex,
                block_number=12894100 + len(pdata["survey_no"]),
                verifier_id="tn_revenue_officer_admin",
                network="polygon-amoy"
            )
            db.add(anchor)

            # Create GIS Plot polygon
            geojson_geom = {
                "type": "Polygon",
                "coordinates": [pdata["polygon"]]
            }

            plot_meta = {
                **pdata,
                "record_id": rec_id,
                "blockchain_anchored": True,
                "blockchain": {
                    "record_hash": anchor.record_hash,
                    "tx_hash": anchor.tx_hash,
                    "block_number": anchor.block_number,
                    "network": "polygon-amoy"
                }
            }

            gis_plot = GISPlot(
                id=plot_id,
                khasra_no=pdata["survey_no"],
                survey_no=pdata["survey_no"],
                patta_no=pdata["patta_no"],
                owner_name=pdata["owner_name"],
                village_lgd_code=pdata["village_lgd_code"],
                district=pdata["district"],
                state="Tamil Nadu",
                geojson_str=json.dumps(geojson_geom),
                area_sqm=pdata["area_sqm"],
                extra_metadata=plot_meta,
                source="tamilnadu-eservices-patta"
            )
            db.add(gis_plot)
            print(f"  ✓ Added Survey No. {pdata['survey_no']} (Patta {pdata['patta_no']}) in {pdata['district']}")

        # 2. Add Maturity Scores for Tamil Nadu Districts
        tn_districts = [
            ("Kanchipuram (காஞ்சிபுரம்)", "629", 0.94, 0.96, 1420),
            ("Chennai (சென்னை)", "580", 0.98, 0.99, 3100),
            ("Coimbatore (கோயம்புத்தூர்)", "641", 0.89, 0.92, 1850),
            ("Thanjavur (தஞ்சாவூர்)", "639", 0.85, 0.88, 1290),
            ("Madurai (மதுரை)", "632", 0.78, 0.81, 980),
            ("Salem (சேலம்)", "636", 0.65, 0.72, 740),
            ("Tirunelveli (திருநெல்வேலி)", "627", 0.71, 0.75, 820),
        ]
        for name, code, mat_score, conf, total in tn_districts:
            ms = MaturityScore(
                id=new_id(),
                geo_level="district",
                geo_name=name,
                lgd_code=code,
                pct_verified=mat_score,
                avg_confidence=conf,
                maturity_score=mat_score,
                total_records=total
            )
            db.add(ms)

        await db.commit()
        print("\n✨ Successfully seeded Tamil Nadu Cadastral & Land Records into database!")


if __name__ == "__main__":
    asyncio.run(seed())
