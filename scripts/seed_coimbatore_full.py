# -*- coding: utf-8 -*-
"""
Terra_vault — Full Coimbatore District Cadastral & Land Record Seed Generator
Populates authentic cadastral parcels, Patta/Chitta records, mutation history chains,
inheritance lineage trees, and blockchain testnet anchors across all 9 Taluks of Coimbatore:
Coimbatore North, Coimbatore South, Pollachi, Sulur, Mettupalayam, Annur, Kinathukadavu, Madukkarai, Valparai.
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


COIMBATORE_PARCELS = [
    # ── 1. POLLACHI TALUK — Coconut Plantation & Agricultural Estate ───────────
    {
        "survey_no": "312/1A",
        "subdivision": "1A",
        "patta_no": "5120",
        "owner_name": "P. Natesan / பி. நடேசன்",
        "father_name": "Palanichamy Gounder / பழனிச்சாமி கவுண்டர்",
        "co_owners": ["N. Karpagam (Wife)", "N. Senthil (Son)"],
        "village": "Pollachi South (பொள்ளாச்சி தெற்கு)",
        "taluk": "Pollachi",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641002",
        "land_type": "தோட்டக்கால் (Coconut Plantation / தோட்டம்)",
        "land_category": "Agriculture",
        "soil_type": "Deep Red Loam / செம்மண்",
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
                "transferor": "Palanichamy Gounder (Father)",
                "transferee": "P. Natesan",
                "extent": "5.20 Acres",
                "status": "Verified on Cadastral Register"
            },
            {
                "step": 2,
                "date": "2023-11-10",
                "deed_type": "Joint Co-ownership Mutation (கூட்டுப் பட்டா சேர்த்தல்)",
                "doc_no": "Mutation Order POL-2023-441",
                "transferor": "P. Natesan",
                "transferee": "P. Natesan, N. Karpagam & N. Senthil",
                "extent": "5.20 Acres",
                "status": "Active Joint Title / Anchored to Polygon Amoy"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Palanichamy Gounder (பழனிச்சாமி கவுண்டர்)",
                "relation": "Patriarch (1928 - 1995)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "P. Natesan (பி. நடேசன்)",
                        "relation": "Current Primary Title Holder (Age 56)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "N. Senthil (செந்தில்)", "relation": "Son / Co-parcener (Age 30)"},
                            {"name": "N. Divya (திவ்யா)", "relation": "Daughter (Age 27)"}
                        ]
                    }
                ]
            }
        }
    },
    {
        "survey_no": "89/2",
        "subdivision": "2",
        "patta_no": "2340",
        "owner_name": "K. Shanmugasundaram / கே. சண்முகசுந்தரம்",
        "father_name": "Kaliappa Gounder / காளியப்ப கவுண்டர்",
        "co_owners": ["S. Boopathi (Brother)"],
        "village": "Anaimalai (ஆனைமலை)",
        "taluk": "Pollachi",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641008",
        "land_type": "நன்செய் (Wet Land / Irrigated Paddy & Nutmeg)",
        "land_category": "Agriculture",
        "soil_type": "Riverine Clay Alluvium / ஆற்று வண்டல்",
        "area_acres": 3.75,
        "area_cents": 375,
        "area_sqm": 15175.7,
        "guideline_value_sqft": 1400,
        "market_value_inr": 24000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.9310, 10.5820],
            [76.9350, 10.5825],
            [76.9355, 10.5860],
            [76.9315, 10.5855],
            [76.9310, 10.5820]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1988-04-20",
                "deed_type": "Ryotwari Patta (ரயத்துவாரி பட்டா)",
                "doc_no": "Settlement Survey 89/2, SRO Anaimalai",
                "transferor": "Government of Tamil Nadu",
                "transferee": "Kaliappa Gounder",
                "extent": "3.75 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2015-08-14",
                "deed_type": "Succession / Virasat Order (வாரிசு பட்டா மாறுதல்)",
                "doc_no": "Revenue Order REV-POL-2015-119",
                "transferor": "Late Kaliappa Gounder",
                "transferee": "K. Shanmugasundaram & S. Boopathi",
                "extent": "3.75 Acres (Joint Co-ownership)",
                "status": "Active Joint Title"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Kaliappa Gounder (காளியப்ப கவுண்டர்)",
                "relation": "Father (1932 - 2014)",
                "generation": "Gen 1",
                "children": [
                    {"name": "K. Shanmugasundaram (சண்முகசுந்தரம்)", "relation": "Elder Son / Lead Title Holder", "generation": "Gen 2", "heirs": []},
                    {"name": "S. Boopathi (பூபதி)", "relation": "Second Son / Joint Owner", "generation": "Gen 2", "heirs": []}
                ]
            }
        }
    },

    # ── 2. COIMBATORE NORTH — Saravanampatti IT Corridor & Thudiyalur ─────────
    {
        "survey_no": "102/1A",
        "subdivision": "1A",
        "patta_no": "7820",
        "owner_name": "Kovai Tech Infra Pvt Ltd / கோவை டெக் இன்ஃப்ரா",
        "father_name": "Rep by Dir. R. Soundararajan",
        "co_owners": [],
        "village": "Saravanampatti (சரவணம்பட்டி)",
        "taluk": "Coimbatore North",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641035",
        "land_type": "வணிக வளாகம் / IT SEZ (Commercial / IT Park)",
        "land_category": "Commercial",
        "soil_type": "Gravelly Red Soil / செம்மண் சரளை",
        "area_acres": 4.50,
        "area_cents": 450,
        "area_sqm": 18210.8,
        "guideline_value_sqft": 5200,
        "market_value_inr": 165000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.9920, 11.0780],
            [76.9965, 11.0785],
            [76.9970, 11.0825],
            [76.9925, 11.0820],
            [76.9920, 11.0780]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "2006-03-12",
                "deed_type": "Registered Sale Deed (கிரைய ஆவணம்)",
                "doc_no": "Doc 1102/2006, SRO Gandhipuram",
                "transferor": "Arumuga Naicker Heirs",
                "transferee": "Kovai Tech Infra Pvt Ltd",
                "extent": "4.50 Acres",
                "status": "Verified / Clear Title"
            },
            {
                "step": 2,
                "date": "2021-06-30",
                "deed_type": "DTCP & IT Park Planning Approval (நகரமைப்பு திட்ட அனுமதி)",
                "doc_no": "DTCP Approval No 42/2021/CBE",
                "transferor": "Directorate of Town & Country Planning",
                "transferee": "Kovai Tech Infra Pvt Ltd",
                "extent": "4.50 Acres",
                "status": "Anchored to Polygon Amoy"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Corporate Entity: Kovai Tech Infra Pvt Ltd",
                "relation": "Registered Private Limited Company (CIN: U70102TZ2006PTC012345)",
                "generation": "Corporate Title",
                "children": []
            }
        }
    },
    {
        "survey_no": "245/2B",
        "subdivision": "2B",
        "patta_no": "4190",
        "owner_name": "V. Sadasivam / வி. சதாசிவம்",
        "father_name": "Velusamy Chettiar / வேலுசாமி செட்டியார்",
        "co_owners": ["S. Gomathi (Wife)"],
        "village": "Thudiyalur (துடியலூர்)",
        "taluk": "Coimbatore North",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641034",
        "land_type": "மனை (DTCP Approved Residential Layout)",
        "land_category": "Residential",
        "soil_type": "Hard Gravel Red Soil / செம்மண்",
        "area_acres": 0.55,
        "area_cents": 55,
        "area_sqm": 2225.7,
        "guideline_value_sqft": 3800,
        "market_value_inr": 32000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.9480, 11.0720],
            [76.9515, 11.0725],
            [76.9520, 11.0755],
            [76.9485, 11.0750],
            [76.9480, 11.0720]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1998-02-18",
                "deed_type": "Registered Sale Deed (கிரைய ஆவணம்)",
                "doc_no": "Doc 489/1998, SRO Thudiyalur",
                "transferor": "Gnanasekaran Gounder",
                "transferee": "Velusamy Chettiar",
                "extent": "55 Cents",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2018-09-22",
                "deed_type": "Family Settlement Deed (குடும்ப ஏற்பாட்டு ஆவணம்)",
                "doc_no": "Doc 3102/2018, SRO Thudiyalur",
                "transferor": "Velusamy Chettiar",
                "transferee": "V. Sadasivam & S. Gomathi",
                "extent": "55 Cents",
                "status": "Active Joint Title"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Velusamy Chettiar (வேலுசாமி செட்டியார்)",
                "relation": "Father (Donor / Settlor)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "V. Sadasivam (வி. சதாசிவம்)",
                        "relation": "Current Primary Owner (Age 52)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "S. Arvind (அரவிந்த்)", "relation": "Son (Age 24)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 3. COIMBATORE SOUTH — Peelamedu & Singanallur Industrial Corridor ─────
    {
        "survey_no": "418/3",
        "subdivision": "3",
        "patta_no": "8902",
        "owner_name": "A. Nachimuthu Mudaliar / நாச்சிமுத்து முதலியார்",
        "father_name": "Angappa Mudaliar / அங்கப்ப முதலியார்",
        "co_owners": ["N. Loganathan (Son)"],
        "village": "Peelamedu (பீளமேடு)",
        "taluk": "Coimbatore South",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641004",
        "land_type": "வணிக மனை (Avinashi Road Commercial Plot)",
        "land_category": "Commercial",
        "soil_type": "Alluvial Loam / வண்டல் செம்மண்",
        "area_acres": 1.15,
        "area_cents": 115,
        "area_sqm": 4653.8,
        "guideline_value_sqft": 7500,
        "market_value_inr": 88000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.0120, 11.0280],
            [77.0160, 11.0285],
            [77.0165, 11.0315],
            [77.0125, 11.0310],
            [77.0120, 11.0280]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1984-06-10",
                "deed_type": "Ancestral Partition (பாகப்பிரிவினை ஆவணம்)",
                "doc_no": "Doc 890/1984, SRO Peelamedu",
                "transferor": "Angappa Mudaliar Family",
                "transferee": "A. Nachimuthu Mudaliar",
                "extent": "1.15 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2022-04-18",
                "deed_type": "Co-owner Inclusion Mutation (கூட்டுப் பட்டா)",
                "doc_no": "Mutation CBE-S-2022-311",
                "transferor": "A. Nachimuthu Mudaliar",
                "transferee": "A. Nachimuthu & N. Loganathan",
                "extent": "1.15 Acres",
                "status": "Active Title / Anchored"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Angappa Mudaliar (அங்கப்ப முதலியார்)",
                "relation": "Patriarch (1915 - 1980)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "A. Nachimuthu Mudaliar (நாச்சிமுத்து முதலியார்)",
                        "relation": "Elder Son / Title Holder (Age 68)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "N. Loganathan (லோகநாதன்)", "relation": "Son / Co-owner (Age 42)"},
                            {"name": "N. Mythili (மைத்திலி)", "relation": "Daughter (Age 39)"}
                        ]
                    }
                ]
            }
        }
    },
    {
        "survey_no": "15/4",
        "subdivision": "4",
        "patta_no": "3104",
        "owner_name": "L. Soundararajan / எல். சௌந்தரராஜன்",
        "father_name": "Lakshmana Perumal Naidu / லட்சுமண பெருமாள்",
        "co_owners": [],
        "village": "Singanallur (சிங்கநல்லூர்)",
        "taluk": "Coimbatore South",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641005",
        "land_type": "தொழிற்சாலை மனை (Engineering & Foundry Industrial)",
        "land_category": "Industrial",
        "soil_type": "Clay Loam / களிமண் கலந்த செம்மண்",
        "area_acres": 2.20,
        "area_cents": 220,
        "area_sqm": 8903.0,
        "guideline_value_sqft": 4200,
        "market_value_inr": 65000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.0280, 10.9980],
            [77.0325, 10.9985],
            [77.0330, 11.0020],
            [77.0285, 11.0015],
            [77.0280, 10.9980]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "2002-11-05",
                "deed_type": "Industrial Plot Allotment / Sale (தொழில்பேட்டை மனை கிரயம்)",
                "doc_no": "Doc 1842/2002, SRO Singanallur",
                "transferor": "SIDCO Coimbatore",
                "transferee": "L. Soundararajan",
                "extent": "2.20 Acres",
                "status": "Verified"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Lakshmana Perumal Naidu (லட்சுமண பெருமாள்)",
                "relation": "Father",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "L. Soundararajan (எல். சௌந்தரராஜன்)",
                        "relation": "Sole Proprietor / Title Holder",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "S. Rajesh (ராஜேஷ்)", "relation": "Son (Age 28)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 4. SULUR TALUK — Textile & Agro-engineering Corridor ──────────────────
    {
        "survey_no": "55/2C",
        "subdivision": "2C",
        "patta_no": "6210",
        "owner_name": "T. Ramasamy Gounder / டி. ராமசாமி கவுண்டர்",
        "father_name": "Thirumoorthy Gounder / திருமூர்த்தி கவுண்டர்",
        "co_owners": ["R. Thangaraj (Son)", "R. Balasubramaniam (Son)"],
        "village": "Arasur (அரசூர்)",
        "taluk": "Sulur",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641407",
        "land_type": "தொழிற்சாலை (Textile Weaving & Spinning Mill / ஆலை)",
        "land_category": "Industrial",
        "soil_type": "Red Sandy Soil / செம்மண் மணல்",
        "area_acres": 6.80,
        "area_cents": 680,
        "area_sqm": 27518.6,
        "guideline_value_sqft": 2600,
        "market_value_inr": 92000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.1250, 11.0420],
            [77.1310, 11.0425],
            [77.1315, 11.0470],
            [77.1255, 11.0465],
            [77.1250, 11.0420]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1995-07-20",
                "deed_type": "Ancestral Partition (பாகப்பிரிவினை)",
                "doc_no": "Doc 980/1995, SRO Sulur",
                "transferor": "Thirumoorthy Gounder",
                "transferee": "T. Ramasamy Gounder",
                "extent": "6.80 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2019-12-04",
                "deed_type": "Partnership Title Deed (கூட்டு வணிக ஆவணம்)",
                "doc_no": "Doc 2410/2019, SRO Sulur",
                "transferor": "T. Ramasamy Gounder",
                "transferee": "T. Ramasamy, R. Thangaraj & R. Balasubramaniam",
                "extent": "6.80 Acres",
                "status": "Active Joint Title / Anchored"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Thirumoorthy Gounder (திருமூர்த்தி கவுண்டர்)",
                "relation": "Patriarch (1922 - 1990)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "T. Ramasamy Gounder (ராமசாமி கவுண்டர்)",
                        "relation": "Managing Partner (Age 64)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "R. Thangaraj (தங்கராஜ்)", "relation": "Son / Co-owner (Age 38)"},
                            {"name": "R. Balasubramaniam (பாலசுப்ரமணியம்)", "relation": "Son / Co-owner (Age 35)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 5. METTUPALAYAM TALUK — Bhavani River Basin Wet Lands & Banana Farms ───
    {
        "survey_no": "194/3C",
        "subdivision": "3C",
        "patta_no": "1840",
        "owner_name": "M. Sivakumar / எம். சிவகுமார்",
        "father_name": "Marappa Gounder / மாரப்ப கவுண்டர்",
        "co_owners": ["S. Banumathi (Wife)"],
        "village": "Karamadai (காரமடை)",
        "taluk": "Mettupalayam",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641104",
        "land_type": "நன்செய் (Bhavani River Basin Irrigated Wet Land / வாழை)",
        "land_category": "Agriculture",
        "soil_type": "Rich River Silt Alluvial / பவானி ஆற்று வண்டல்",
        "area_acres": 4.10,
        "area_cents": 410,
        "area_sqm": 16592.1,
        "guideline_value_sqft": 1600,
        "market_value_inr": 28000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.9580, 11.2350],
            [76.9625, 11.2355],
            [76.9630, 11.2390],
            [76.9585, 11.2385],
            [76.9580, 11.2350]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1980-03-15",
                "deed_type": "Ancestral Title (பரம்பரை பாத்தியதை)",
                "doc_no": "Settlement 194/3, SRO Mettupalayam",
                "transferor": "Marappa Gounder",
                "transferee": "M. Sivakumar",
                "extent": "4.10 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2021-08-19",
                "deed_type": "Joint Co-ownership Mutation (கூட்டுப் பட்டா)",
                "doc_no": "Revenue Order MTP-2021-098",
                "transferor": "M. Sivakumar",
                "transferee": "M. Sivakumar & S. Banumathi",
                "extent": "4.10 Acres",
                "status": "Active Title / Anchored"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Marappa Gounder (மாரப்ப கவுண்டர்)",
                "relation": "Father (1925 - 2002)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "M. Sivakumar (எம். சிவகுமார்)",
                        "relation": "Title Holder (Age 55)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "S. Manikandan (மணிகண்டன்)", "relation": "Son (Age 29)"},
                            {"name": "S. Kavitha (கவிதா)", "relation": "Daughter (Age 26)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 6. ANNUR TALUK — Agro-industrial & Rainfed Cotton Farms ────────────────
    {
        "survey_no": "91/1",
        "subdivision": "1",
        "patta_no": "3950",
        "owner_name": "C. Duraisamy / சி. துரைசாமி",
        "father_name": "Chinnasamy Naicker / சின்னசாமி நாயக்கர்",
        "co_owners": ["D. Gokul (Son)"],
        "village": "Pogalur (பொகலூர்)",
        "taluk": "Annur",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641653",
        "land_type": "புன்செய் (Rainfed Cotton & Maize Farm / மானாவாரி)",
        "land_category": "Agriculture",
        "soil_type": "Black Cotton Soil / கரிசல் மண்",
        "area_acres": 7.40,
        "area_cents": 740,
        "area_sqm": 29946.7,
        "guideline_value_sqft": 950,
        "market_value_inr": 34000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.1650, 11.2280],
            [77.1710, 11.2285],
            [77.1715, 11.2335],
            [77.1655, 11.2330],
            [77.1650, 11.2280]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1990-05-14",
                "deed_type": "Ancestral Partition (பாகப்பிரிவினை)",
                "doc_no": "Doc 612/1990, SRO Annur",
                "transferor": "Chinnasamy Naicker",
                "transferee": "C. Duraisamy",
                "extent": "7.40 Acres",
                "status": "Verified"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Chinnasamy Naicker (சின்னசாமி நாயக்கர்)",
                "relation": "Father (1930 - 1998)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "C. Duraisamy (சி. துரைசாமி)",
                        "relation": "Primary Title Holder (Age 60)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "D. Gokul (கோகுல்)", "relation": "Son (Age 32)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 7. KINATHUKADAVU TALUK — Coconut & Windmill Agro-corridor ──────────────
    {
        "survey_no": "76/2A",
        "subdivision": "2A",
        "patta_no": "4812",
        "owner_name": "K. Chinnasamy Gounder / கே. சின்னசாமி கவுண்டர்",
        "father_name": "Kandhasamy Gounder / கந்தசாமி கவுண்டர்",
        "co_owners": ["C. Jayakumar (Son)"],
        "village": "Vadakkipalayam (வடக்கிபாளையம்)",
        "taluk": "Kinathukadavu",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "642109",
        "land_type": "தோட்டக்கால் & காற்றாலை நிலம் (Coconut & Windmill Estate)",
        "land_category": "Agriculture",
        "soil_type": "Deep Red Sandy Loam / செம்மண்",
        "area_acres": 8.50,
        "area_cents": 850,
        "area_sqm": 34398.3,
        "guideline_value_sqft": 1350,
        "market_value_inr": 48000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [77.0180, 10.7950],
            [77.0250, 10.7955],
            [77.0255, 10.8010],
            [77.0185, 10.8005],
            [77.0180, 10.7950]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1986-11-20",
                "deed_type": "Ancestral Partition (பாகப்பிரிவினை)",
                "doc_no": "Doc 1045/1986, SRO Kinathukadavu",
                "transferor": "Kandhasamy Gounder",
                "transferee": "K. Chinnasamy Gounder",
                "extent": "8.50 Acres",
                "status": "Verified"
            },
            {
                "step": 2,
                "date": "2020-03-11",
                "deed_type": "Windmill Lease Agreement & Joint Mutation (காற்றாலை குத்தகை & பட்டா)",
                "doc_no": "Lease Doc 410/2020, SRO Kinathukadavu",
                "transferor": "K. Chinnasamy Gounder",
                "transferee": "K. Chinnasamy & C. Jayakumar",
                "extent": "8.50 Acres",
                "status": "Active Joint Title / Anchored"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Kandhasamy Gounder (கந்தசாமி கவுண்டர்)",
                "relation": "Patriarch (1920 - 1988)",
                "generation": "Gen 1",
                "children": [
                    {
                        "name": "K. Chinnasamy Gounder (சின்னசாமி கவுண்டர்)",
                        "relation": "Current Primary Owner (Age 66)",
                        "generation": "Gen 2",
                        "heirs": [
                            {"name": "C. Jayakumar (ஜெயக்குமார்)", "relation": "Son / Co-parcener (Age 37)"}
                        ]
                    }
                ]
            }
        }
    },

    # ── 8. MADUKKARAI TALUK — Mineral, Limestone & Logistics Belt ──────────────
    {
        "survey_no": "12/3",
        "subdivision": "3",
        "patta_no": "2910",
        "owner_name": "ACC Coimbatore Limestone Utilities / ஏசிசி கோயம்புத்தூர்",
        "father_name": "Rep by Authorized Officer S. Ramanathan",
        "co_owners": [],
        "village": "Ettimadai (எட்டிமடை)",
        "taluk": "Madukkarai",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "641105",
        "land_type": "சுண்ணாம்பு & தொழில்துறை மனை (Limestone Industrial / Mining)",
        "land_category": "Industrial",
        "soil_type": "Calcareous Limestone Soil / சுண்ணாம்பு பாறை மண்",
        "area_acres": 12.00,
        "area_cents": 1200,
        "area_sqm": 48562.3,
        "guideline_value_sqft": 2100,
        "market_value_inr": 110000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.8850, 10.9020],
            [76.8940, 10.9025],
            [76.8945, 10.9095],
            [76.8855, 10.9090],
            [76.8850, 10.9020]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1978-08-15",
                "deed_type": "Mining Lease & Acquisition (சுரங்க குத்தகை ஆவணம்)",
                "doc_no": "Mining Lease ML-78-412, Dept of Geology & Mines",
                "transferor": "Government of Tamil Nadu",
                "transferee": "ACC Cement Works",
                "extent": "12.00 Acres",
                "status": "Verified / Clear Title"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Corporate Leasehold Title: ACC Cement Works",
                "relation": "Public Industrial Mineral Lease",
                "generation": "Corporate Entity",
                "children": []
            }
        }
    },

    # ── 9. VALPARAI TALUK — High-Range Tea Estate & Plantations ────────────────
    {
        "survey_no": "501/1",
        "subdivision": "1",
        "patta_no": "9901",
        "owner_name": "Annamalai Hills Plantation Ltd / ஆனைமலை பிளான்டேஷன்",
        "father_name": "Rep by Gen. Manager K. Vijayaraghavan",
        "co_owners": [],
        "village": "Valparai Town (வால்பாறை)",
        "taluk": "Valparai",
        "district": "Coimbatore",
        "state": "Tamil Nadu",
        "village_lgd_code": "642127",
        "land_type": "தேயிலைத் தோட்டம் (High-Range Tea Plantation Estate)",
        "land_category": "Agriculture",
        "soil_type": "Humus Rich Forest Loam / மலைத் தோட்ட மண்",
        "area_acres": 25.00,
        "area_cents": 2500,
        "area_sqm": 101171.4,
        "guideline_value_sqft": 1100,
        "market_value_inr": 185000000,
        "encumbrance_status": "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
        "polygon": [
            [76.9450, 10.3200],
            [76.9580, 10.3210],
            [76.9590, 10.3320],
            [76.9460, 10.3310],
            [76.9450, 10.3200]
        ],
        "mutation_history": [
            {
                "step": 1,
                "date": "1965-02-10",
                "deed_type": "Plantation Freehold Grant (தேயிலைத் தோட்ட பட்டா)",
                "doc_no": "Grant 501/Valparai, SRO Pollachi",
                "transferor": "Government of Madras",
                "transferee": "Annamalai Hills Plantation Ltd",
                "extent": "25.00 Acres",
                "status": "Verified / Clear Heritage Title"
            }
        ],
        "inheritance_tree": {
            "root": {
                "name": "Corporate Entity: Annamalai Hills Plantation Ltd",
                "relation": "Registered Plantation Estate Company (CIN: L01132TZ1965PLC000890)",
                "generation": "Corporate Entity",
                "children": []
            }
        }
    }
]


async def seed_coimbatore():
    print("🌱 Initializing Full Coimbatore District Cadastral & Land Record Seed (9 Taluks)...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        for pdata in COIMBATORE_PARCELS:
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
                district="Coimbatore",
                state="Tamil Nadu",
                village_lgd_code=pdata["village_lgd_code"],
                area_value=pdata["area_acres"],
                area_unit="Acres",
                land_type=pdata["land_type"],
                guideline_value=pdata["guideline_value_sqft"],
                encumbrance_status=pdata["encumbrance_status"],
                mutation_history=pdata["mutation_history"],
                inheritance_tree=pdata["inheritance_tree"],
                mutation_no=pdata["mutation_history"][-1]["doc_no"] if pdata["mutation_history"] else "MUT-2024-CBE",
                transaction_type=pdata["mutation_history"][-1]["deed_type"] if pdata["mutation_history"] else "Settlement",
                detected_script="Tamil / English",
                quality_score=0.98,
                overall_confidence=0.99,
                status="verified",
                blockchain_anchored=True,
                raw_doc_url="http://localhost:8000/static/sample_patta_tn.png",
                enhanced_doc_url="http://localhost:8000/static/sample_patta_tn.png",
                doc_sha256="0x" + uuid.uuid4().hex + uuid.uuid4().hex
            )
            db.add(rec)

            # Create Blockchain Anchor
            anchor = BlockchainAnchor(
                id=new_id(),
                record_id=rec_id,
                record_hash="0x" + uuid.uuid4().hex + uuid.uuid4().hex,
                tx_hash="0x" + uuid.uuid4().hex + uuid.uuid4().hex,
                block_number=46288500 + len(pdata["survey_no"]) * 10,
                verifier_id="cbe_district_revenue_officer",
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
                district="Coimbatore",
                state="Tamil Nadu",
                geojson_str=json.dumps(geojson_geom),
                area_sqm=pdata["area_sqm"],
                extra_metadata=plot_meta,
                source="tamilnadu-eservices-cbe"
            )
            db.add(gis_plot)
            print(f"  ✓ Seeded [{pdata['taluk'].upper()}] SF No. {pdata['survey_no']} (Patta {pdata['patta_no']}) — {pdata['land_type']}")

        # 2. Add Maturity Scores for All 9 Taluks in Coimbatore
        coimbatore_taluks = [
            ("Coimbatore North (வடக்கு)", "6411", 0.96, 0.98, 4200),
            ("Coimbatore South (தெற்கு)", "6412", 0.98, 0.99, 5800),
            ("Pollachi (பொள்ளாச்சி)", "6413", 0.94, 0.96, 3600),
            ("Sulur (சூலூர்)", "6414", 0.91, 0.93, 2900),
            ("Mettupalayam (மேட்டுப்பாளையம்)", "6415", 0.88, 0.91, 2400),
            ("Annur (அன்னூர்)", "6416", 0.85, 0.89, 1850),
            ("Kinathukadavu (கிணத்துக்கடவு)", "6417", 0.89, 0.92, 2100),
            ("Madukkarai (மடுக்கரை)", "6418", 0.87, 0.90, 1750),
            ("Valparai (வால்பாறை)", "6419", 0.82, 0.86, 1200),
        ]
        for name, code, mat_score, conf, total in coimbatore_taluks:
            ms = MaturityScore(
                id=new_id(),
                geo_level="tehsil",
                geo_name=name,
                lgd_code=code,
                pct_verified=mat_score,
                avg_confidence=conf,
                maturity_score=mat_score,
                total_records=total
            )
            db.add(ms)

        await db.commit()
        print("\n✨ Successfully seeded Full Coimbatore District (9 Taluks, 10 Parcels, 9 Taluk Maturity Scores)!")


if __name__ == "__main__":
    asyncio.run(seed_coimbatore())
