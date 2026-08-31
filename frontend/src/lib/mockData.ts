// Terra_vault — High-Fidelity Cadastral & Land Record Seed Data (Client-side & Offline Ready)

export const MOCK_COIMBATORE_PARCELS = [
  {
    id: "cbe-plot-001",
    survey_no: "312/1A",
    subdivision: "1A",
    patta_no: "5120",
    owner_name: "P. Natesan / பி. நடேசன்",
    father_name: "Palanichamy Gounder / பழனிச்சாமி கவுண்டர்",
    co_owners: ["N. Karpagam (Wife)", "N. Senthil (Son)"],
    village: "Pollachi South (பொள்ளாச்சி தெற்கு)",
    taluk: "Pollachi",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "641002",
    land_type: "தோட்டக்கால் (Coconut Plantation / தோட்டம்)",
    land_category: "Agriculture",
    soil_type: "Deep Red Loam / செம்மண்",
    area_acres: 5.20,
    area_cents: 520,
    area_sqm: 21043.6,
    guideline_value_sqft: 1850,
    market_value_inr: 35000000,
    encumbrance_status: "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
    blockchain_hash: "0x9f83ab24e18374a2b91834cd981723eabbc09182374928173491827349182734",
    polygon: [
      [77.0010, 10.6550],
      [77.0055, 10.6555],
      [77.0060, 10.6590],
      [77.0015, 10.6585],
      [77.0010, 10.6550]
    ],
    mutation_history: [
      {
        step: 1,
        date: "1992-10-15",
        deed_type: "Ancestral Partition (குடும்ப பாகப்பிரிவினை)",
        doc_no: "Doc 1540/1992, SRO Pollachi",
        transferor: "Palanichamy Gounder (Father)",
        transferee: "P. Natesan",
        extent: "5.20 Acres",
        status: "Verified on Cadastral Register"
      },
      {
        step: 2,
        date: "2023-11-10",
        deed_type: "Joint Co-ownership Mutation (கூட்டுப் பட்டா சேர்த்தல்)",
        doc_no: "Mutation Order POL-2023-441",
        transferor: "P. Natesan",
        transferee: "P. Natesan, N. Karpagam & N. Senthil",
        extent: "5.20 Acres",
        status: "Active Joint Title / Anchored to Polygon Amoy"
      }
    ],
    inheritance_tree: {
      root: {
        name: "Palanichamy Gounder (பழனிச்சாமி கவுண்டர்)",
        relation: "Patriarch (1928 - 1995)",
        generation: "Gen 1",
        children: [
          {
            name: "P. Natesan (பி. நடேசன்)",
            relation: "Current Primary Title Holder (Age 56)",
            generation: "Gen 2",
            heirs: [
              { name: "N. Senthil (செந்தில்)", relation: "Son / Co-parcener (Age 30)" },
              { name: "N. Divya (திவ்யா)", relation: "Daughter (Age 27)" }
            ]
          }
        ]
      }
    }
  },
  {
    id: "cbe-plot-002",
    survey_no: "88/2C",
    subdivision: "2C",
    patta_no: "2194",
    owner_name: "Dr. K. Swaminathan / டாக்டர் கே. சுவாமிநாதன்",
    father_name: "Kumarasamy Chettiar / குமாரசாமி செட்டியார்",
    co_owners: ["S. Meenakshi (Wife)"],
    village: "Saravanampatti (சரவணம்பட்டி IT SEZ)",
    taluk: "Coimbatore North",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "641035",
    land_type: "Commercial IT Park / ஐடி பூங்கா மனை",
    land_category: "Commercial",
    soil_type: "Gravel Loam / சரளை மண்",
    area_acres: 2.85,
    area_cents: 285,
    area_sqm: 11533.5,
    guideline_value_sqft: 6200,
    market_value_inr: 85000000,
    encumbrance_status: "Clean / Nil Encumbrance",
    blockchain_hash: "0x3e18a93bc4182903fe5728192837482910aefc91823749281734918273491827",
    polygon: [
      [76.9920, 11.0820],
      [76.9965, 11.0830],
      [76.9955, 11.0865],
      [76.9910, 11.0855],
      [76.9920, 11.0820]
    ],
    mutation_history: [
      {
        step: 1,
        date: "2005-03-20",
        deed_type: "Agricultural Conversion (நில பயன்பாடு மாற்றம்)",
        doc_no: "DTCP Approval 42/2005",
        transferor: "Revenue Dept",
        transferee: "Dr. K. Swaminathan",
        extent: "2.85 Acres",
        status: "Commercial Clearance Granted"
      },
      {
        step: 2,
        date: "2024-01-15",
        deed_type: "Digital Title Conversion",
        doc_no: "TV-2024-CBE-882C",
        transferor: "Dr. K. Swaminathan",
        transferee: "Dr. K. Swaminathan & S. Meenakshi",
        extent: "2.85 Acres",
        status: "Anchored to Polygon Amoy"
      }
    ],
    inheritance_tree: {
      root: {
        name: "Kumarasamy Chettiar (குமாரசாமி செட்டியார்)",
        relation: "Founder (1935 - 2008)",
        generation: "Gen 1",
        children: [
          {
            name: "Dr. K. Swaminathan (சுவாமிநாதன்)",
            relation: "Title Holder",
            generation: "Gen 2",
            heirs: [
              { name: "S. Siddharth (சித்தார்த்)", relation: "Son (Age 24)" }
            ]
          }
        ]
      }
    }
  },
  {
    id: "cbe-plot-003",
    survey_no: "415/3",
    subdivision: "3",
    patta_no: "8411",
    owner_name: "R. Shanmugam / ஆர். சண்முகம்",
    father_name: "Ramasamy / ராமசாமி",
    co_owners: ["S. Vijaya"],
    village: "Singanallur (சிங்கநல்லூர் நஞ்சை)",
    taluk: "Coimbatore South",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "641005",
    land_type: "நஞ்சை (Wetland / Paddy Field)",
    land_category: "Agriculture",
    soil_type: "Clayey Loam / களிமண்",
    area_acres: 3.40,
    area_cents: 340,
    area_sqm: 13759.3,
    guideline_value_sqft: 3100,
    market_value_inr: 45000000,
    encumbrance_status: "Clean / Nil Encumbrance",
    blockchain_hash: "0x89ab12cd34ef567890123456789abcdef0123456789abcdef0123456789abcdef0",
    polygon: [
      [77.0180, 10.9950],
      [77.0230, 10.9960],
      [77.0220, 10.9995],
      [77.0170, 10.9985],
      [77.0180, 10.9950]
    ],
    mutation_history: [
      {
        step: 1,
        date: "1998-04-12",
        deed_type: "Sale Deed (கிரைய பத்திரம்)",
        doc_no: "Doc 882/1998, SRO Singanallur",
        transferor: "V. Karuppasamy",
        transferee: "R. Shanmugam",
        extent: "3.40 Acres",
        status: "Registered"
      }
    ],
    inheritance_tree: {
      root: {
        name: "Ramasamy (ராமசாமி)",
        relation: "Ancestor",
        generation: "Gen 1",
        children: [
          {
            name: "R. Shanmugam",
            relation: "Current Owner",
            generation: "Gen 2",
            heirs: [{ name: "S. Karthi", relation: "Son" }]
          }
        ]
      }
    }
  },
  {
    id: "cbe-plot-004",
    survey_no: "124/4B",
    subdivision: "4B",
    patta_no: "3302",
    owner_name: "M/s Texmo Industries / டெக்ஸ்மோ இண்டஸ்ட்ரீஸ்",
    father_name: "Authorized Signatory: V. Ramachandran",
    co_owners: [],
    village: "Sulur Industrial Estate (சூலூர்)",
    taluk: "Sulur",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "641402",
    land_type: "Industrial Foundry & Mills / தொழில் மனை",
    land_category: "Industrial",
    soil_type: "Black Cotton Soil / கரிசல் மண்",
    area_acres: 8.50,
    area_cents: 850,
    area_sqm: 34398.2,
    guideline_value_sqft: 2800,
    market_value_inr: 120000000,
    encumbrance_status: "Hypothecated to Canara Bank (Secured Working Capital)",
    blockchain_hash: "0x77ab12fe9988aa55112233445566778899aabbccddeeff001122334455667788",
    polygon: [
      [77.1200, 11.0250],
      [77.1260, 11.0260],
      [77.1250, 11.0310],
      [77.1190, 11.0300],
      [77.1200, 11.0250]
    ],
    mutation_history: [
      {
        step: 1,
        date: "2010-08-01",
        deed_type: "SIPCOT Industrial Allotment",
        doc_no: "Allotment #SUL-IND-102",
        transferor: "SIPCOT Govt of TN",
        transferee: "Texmo Industries",
        extent: "8.50 Acres",
        status: "Industrial Leasehold to Freehold"
      }
    ],
    inheritance_tree: {
      root: {
        name: "Corporate Entity",
        relation: "Registered Enterprise",
        generation: "Gen 1",
        children: []
      }
    }
  },
  {
    id: "cbe-plot-005",
    survey_no: "56/1",
    subdivision: "1",
    patta_no: "1908",
    owner_name: "K. Subramaniam / கே. சுப்பிரமணியம்",
    father_name: "Kandasamy / கந்தசாமி",
    co_owners: ["S. Saraswathi"],
    village: "Sirumugai / சிறுமுகை",
    taluk: "Mettupalayam",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "641302",
    land_type: "புஞ்சை வாழைத் தோட்டம் (Banana Plantation / புஞ்சை)",
    land_category: "Agriculture",
    soil_type: "River Alluvial / வண்டல் மண்",
    area_acres: 4.10,
    area_cents: 410,
    area_sqm: 16592.1,
    guideline_value_sqft: 1400,
    market_value_inr: 28000000,
    encumbrance_status: "Clean / Nil Encumbrance",
    blockchain_hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    polygon: [
      [76.9400, 11.3100],
      [76.9450, 11.3110],
      [76.9440, 11.3150],
      [76.9390, 11.3140],
      [76.9400, 11.3100]
    ],
    mutation_history: [
      {
        step: 1,
        date: "2001-02-14",
        deed_type: "Inheritance Mutation",
        doc_no: "Pattadar Order 55/2001",
        transferor: "Kandasamy",
        transferee: "K. Subramaniam",
        extent: "4.10 Acres",
        status: "Verified"
      }
    ],
    inheritance_tree: {
      root: {
        name: "Kandasamy",
        relation: "Patriarch",
        generation: "Gen 1",
        children: [
          {
            name: "K. Subramaniam",
            relation: "Owner",
            generation: "Gen 2",
            heirs: [{ name: "S. Rajesh", relation: "Son" }]
          }
        ]
      }
    }
  },
  {
    id: "cbe-plot-006",
    survey_no: "205/3A",
    subdivision: "3A",
    patta_no: "4419",
    owner_name: "T. Annadurai / டி. அண்ணாதுரை",
    father_name: "Thangavelu / தங்கவேலு",
    co_owners: [],
    village: "Kinathukadavu West (கிணத்துக்கடவு)",
    taluk: "Kinathukadavu",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "642109",
    land_type: "தென்னை & காற்றாலை நிலம் (Windmill & Farm)",
    land_category: "Agriculture",
    soil_type: "Red Gravel / செம்மண்",
    area_acres: 6.75,
    area_cents: 675,
    area_sqm: 27316.3,
    guideline_value_sqft: 1250,
    market_value_inr: 42000000,
    encumbrance_status: "Clean / Nil Encumbrance",
    blockchain_hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    polygon: [
      [77.0150, 10.8200],
      [77.0210, 10.8210],
      [77.0200, 10.8260],
      [77.0140, 10.8250],
      [77.0150, 10.8200]
    ],
    mutation_history: [],
    inheritance_tree: {
      root: {
        name: "Thangavelu",
        relation: "Founder",
        generation: "Gen 1",
        children: [{ name: "T. Annadurai", relation: "Current Owner", generation: "Gen 2", heirs: [] }]
      }
    }
  },
  {
    id: "cbe-plot-007",
    survey_no: "19/2",
    subdivision: "2",
    patta_no: "6710",
    owner_name: "Tata Coffee Estates / டாடா காபி",
    father_name: "Authorized Officer: S. Chandrasekar",
    co_owners: [],
    village: "Valparai Tea Belt (வால்பாறை)",
    taluk: "Valparai",
    district: "Coimbatore",
    state: "Tamil Nadu",
    village_lgd_code: "642127",
    land_type: "தேயிலைத் தோட்டம் (Tea Plantation)",
    land_category: "Agriculture",
    soil_type: "Forest Peat Loam / மலை மண்",
    area_acres: 24.50,
    area_cents: 2450,
    area_sqm: 99148.0,
    guideline_value_sqft: 950,
    market_value_inr: 180000000,
    encumbrance_status: "Clean / Nil Encumbrance",
    blockchain_hash: "0x445566778899aabbccddeeff00112233445566778899aabbccddeeff00112233",
    polygon: [
      [76.9500, 10.3200],
      [76.9600, 10.3220],
      [76.9580, 10.3300],
      [76.9480, 10.3280],
      [76.9500, 10.3200]
    ],
    mutation_history: [],
    inheritance_tree: { root: { name: "Estate Entity", relation: "Corporate", generation: "Gen 1", children: [] } }
  }
];

export function getMockGeoJSON(options?: { taluk?: string; land_type?: string; q?: string }) {
  let filtered = MOCK_COIMBATORE_PARCELS;
  if (options?.taluk && options.taluk !== "All") {
    filtered = filtered.filter(p => p.taluk.toLowerCase().includes(options.taluk!.toLowerCase()));
  }
  if (options?.land_type && options.land_type !== "All") {
    filtered = filtered.filter(p => p.land_category.toLowerCase() === options.land_type!.toLowerCase());
  }
  if (options?.q) {
    const query = options.q.toLowerCase();
    filtered = filtered.filter(p =>
      p.survey_no.toLowerCase().includes(query) ||
      p.owner_name.toLowerCase().includes(query) ||
      p.patta_no.toLowerCase().includes(query) ||
      p.village.toLowerCase().includes(query)
    );
  }

  return {
    type: "FeatureCollection",
    features: filtered.map(p => ({
      type: "Feature",
      id: p.id,
      geometry: {
        type: "Polygon",
        coordinates: [p.polygon]
      },
      properties: {
        ...p,
        category: p.land_category
      }
    }))
  };
}

export const MOCK_RECORDS = [
  {
    id: "rec-cbe-001",
    owner_name: "P. Natesan / பி. நடேசன்",
    father_name: "Palanichamy Gounder",
    khasra_no: "312/1A",
    khata_no: "5120",
    survey_no: "312/1A",
    state: "Tamil Nadu",
    district: "Coimbatore",
    tehsil: "Pollachi",
    village: "Pollachi South",
    area_value: "5.20",
    area_unit: "Acres",
    land_type: "தோட்டக்கால் (Coconut Plantation)",
    status: "verified",
    verification_status: "VERIFIED_ON_CHAIN",
    blockchain_hash: "0x9f83ab24e18374a2b91834cd981723eabbc09182374928173491827349182734",
    overall_confidence: 0.96,
    doc_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    created_at: "2026-08-28T10:15:00Z"
  },
  {
    id: "rec-cbe-002",
    owner_name: "Dr. K. Swaminathan",
    father_name: "Kumarasamy Chettiar",
    khasra_no: "88/2C",
    khata_no: "2194",
    survey_no: "88/2C",
    state: "Tamil Nadu",
    district: "Coimbatore",
    tehsil: "Coimbatore North",
    village: "Saravanampatti",
    area_value: "2.85",
    area_unit: "Acres",
    land_type: "Commercial IT Park",
    status: "verified",
    verification_status: "VERIFIED_ON_CHAIN",
    blockchain_hash: "0x3e18a93bc4182903fe5728192837482910aefc91823749281734918273491827",
    overall_confidence: 0.98,
    doc_sha256: "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    created_at: "2026-08-29T14:20:00Z"
  },
  {
    id: "rec-cbe-003",
    owner_name: "R. Shanmugam",
    father_name: "Ramasamy",
    khasra_no: "415/3",
    khata_no: "8411",
    survey_no: "415/3",
    state: "Tamil Nadu",
    district: "Coimbatore",
    tehsil: "Coimbatore South",
    village: "Singanallur",
    area_value: "3.40",
    area_unit: "Acres",
    land_type: "நஞ்சை (Wetland)",
    status: "verified",
    verification_status: "VERIFIED_ON_CHAIN",
    blockchain_hash: "0x89ab12cd34ef567890123456789abcdef0123456789abcdef0123456789abcdef0",
    overall_confidence: 0.94,
    doc_sha256: "c4ca4238a0b923820dcc509a6f75849b282c0e8a7dd65f6f3630f9a941f71a17",
    created_at: "2026-08-30T09:00:00Z"
  },
  {
    id: "rec-cbe-004",
    owner_name: "M/s Texmo Industries",
    father_name: "V. Ramachandran (Signatory)",
    khasra_no: "124/4B",
    khata_no: "3302",
    survey_no: "124/4B",
    state: "Tamil Nadu",
    district: "Coimbatore",
    tehsil: "Sulur",
    village: "Sulur Industrial Area",
    area_value: "8.50",
    area_unit: "Acres",
    land_type: "Industrial Foundry & Mills",
    status: "verified",
    verification_status: "VERIFIED_ON_CHAIN",
    blockchain_hash: "0x77ab12fe9988aa55112233445566778899aabbccddeeff001122334455667788",
    overall_confidence: 0.99,
    doc_sha256: "8b1a9953c4611296a827abf8c47804d7",
    created_at: "2026-08-30T16:45:00Z"
  }
];

export const MOCK_REVIEW_QUEUE = [
  {
    id: "task-001",
    record_id: "rec-cbe-005",
    assigned_at: "2026-08-31T07:30:00Z",
    status: "pending",
    doc_url: "/data/sample_patta_faded.png",
    flagged_fields: ["owner_name", "area_value"],
    confidence_scores: {
      owner_name: 0.62,
      father_name: 0.88,
      khasra_no: 0.91,
      area_value: 0.58,
      village: 0.95
    },
    suggested_values: {
      owner_name: "M. பழனிசாமி / M. Palanisamy",
      father_name: "Muthusamy Gounder",
      khasra_no: "102/3B",
      area_value: "1.75",
      village: "Annur West"
    },
    raw_ocr_text: "பட்டா எண்: 102/3B உரிமையாளர்: M.பழ...சாமி பரப்பளவு: 1.75 ஏக்கர்"
  },
  {
    id: "task-002",
    record_id: "rec-cbe-006",
    assigned_at: "2026-08-31T08:15:00Z",
    status: "pending",
    doc_url: "/data/sample_deed_stamp.png",
    flagged_fields: ["khasra_no"],
    confidence_scores: {
      owner_name: 0.92,
      father_name: 0.90,
      khasra_no: 0.64,
      area_value: 0.89,
      village: 0.93
    },
    suggested_values: {
      owner_name: "S. K. Murugesan",
      father_name: "Kandhasamy",
      khasra_no: "77/1A",
      area_value: "2.10",
      village: "Madukkarai"
    },
    raw_ocr_text: "சர்வே எண்: 77/1A (மங்கலான முத்திரை) உரிமையாளர்: S.K.முருகேசன்"
  }
];

export const MOCK_MATURITY_SUMMARY = {
  overall_score: 88.4,
  total_records: 12480,
  verified_records: 11120,
  pending_review: 42,
  dispute_count: 14,
  taluk_breakdown: [
    { taluk: "Pollachi", score: 94.2, records: 2840, verified: 2790 },
    { taluk: "Coimbatore North", score: 91.5, records: 3100, verified: 2950 },
    { taluk: "Coimbatore South", score: 89.0, records: 2400, verified: 2200 },
    { taluk: "Sulur", score: 86.8, records: 1800, verified: 1610 },
    { taluk: "Mettupalayam", score: 85.0, records: 1240, verified: 1090 },
    { taluk: "Annur", score: 82.4, records: 1100, verified: 980 }
  ]
};
