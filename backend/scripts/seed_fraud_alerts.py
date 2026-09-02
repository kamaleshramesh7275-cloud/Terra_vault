import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from core.models import FraudAlert
from core.config import settings

async def seed_fraud_alerts():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    print("Clearing existing fraud alerts...")
    async with async_session() as session:
        await session.execute(text("DELETE FROM fraud_alerts"))
        await session.commit()
        
        alerts = [
            FraudAlert(
                alert_type="duplicate_claim",
                severity="critical",
                record_ids=["demorecord1", "demorecord2"],
                description="Detected multiple competing claims for the same survey number from unrelated parties.",
                subgraph_nodes=["104/A", "104/B"],
                resolved=False
            ),
            FraudAlert(
                alert_type="circular_mutation",
                severity="high",
                record_ids=["demorecord3"],
                description="Fast-paced sequential mutations looping back to original party, indicating possible money laundering or stamp duty evasion.",
                subgraph_nodes=["2/1", "2/2", "Khasra 2"],
                resolved=False
            ),
            FraudAlert(
                alert_type="area_expansion",
                severity="medium",
                record_ids=["demorecord4"],
                description="Total subdivided area exceeds the original parent survey boundary.",
                subgraph_nodes=["7/A", "7/B", "SF.7"],
                resolved=False
            ),
            FraudAlert(
                alert_type="orphaned_mutation",
                severity="critical",
                record_ids=[],
                description="Mutation registered without corresponding registered sale deed (Title Break).",
                subgraph_nodes=["205/3", "45/2", "99/1"],
                resolved=False
            )
        ]
        
        session.add_all(alerts)
        await session.commit()
        print(f"Successfully seeded {len(alerts)} fraud alerts.")

if __name__ == "__main__":
    asyncio.run(seed_fraud_alerts())
