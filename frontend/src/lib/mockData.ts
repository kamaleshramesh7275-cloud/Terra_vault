// Terra_vault — Comprehensive Coimbatore District Cadastral Dataset (108 Parcels across 11 Taluks)
// Populated with bilingual (Tamil + English) metadata, realistic polygons, mutation trees, inheritance genealogy, and blockchain hashes.

export interface CoimbatoreParcel {
  id: string;
  survey_no: string;
  subdivision: string;
  patta_no: string;
  owner_name: string;
  father_name: string;
  co_owners: string[];
  village: string;
  taluk: string;
  district: string;
  state: string;
  village_lgd_code: string;
  land_type: string;
  land_category: "Agriculture" | "Residential" | "Commercial" | "Industrial";
  soil_type: string;
  area_acres: number;
  area_cents: number;
  area_sqm: number;
  guideline_value_sqft: number;
  market_value_inr: number;
  encumbrance_status: string;
  blockchain_hash: string;
  polygon: [number, number][];
  mutation_history: {
    step: number;
    date: string;
    deed_type: string;
    doc_no: string;
    transferor: string;
    transferee: string;
    extent: string;
    status: string;
  }[];
  inheritance_tree: {
    root: {
      name: string;
      relation: string;
      generation: string;
      children: {
        name: string;
        relation: string;
        generation: string;
        heirs: { name: string; relation: string }[];
      }[];
    };
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Generator helper for 108 authentic Coimbatore parcels across 11 Taluks
// ─────────────────────────────────────────────────────────────────────────────

const TALUK_CONFIGS = [
  {
    taluk: "Coimbatore North",
    center: [76.9550, 11.0500],
    villages: ["Saravanampatti (சரவணம்பட்டி)", "Thudiyalur (துடியலூர்)", "Kalapatti (காளப்பட்டி)", "Vadavalli (வடவள்ளி)", "Ganapathy (கணபதி)", "Periyanaickenpalayam (பெ.நா.பாளையம்)", "Vilankurichi (விளாங்குறிச்சி)"],
    categories: ["Commercial", "Residential", "Agriculture"],
    soilTypes: ["Gravelly Red Soil / செம்மண் சரளை", "Red Sandy Loam / செம்மண்", "Clay Loam / களிமண்"],
    count: 15,
    prefix: "CBN"
  },
  {
    taluk: "Coimbatore South",
    center: [76.9750, 10.9850],
    villages: ["Singanallur (சிங்கநல்லூர்)", "Peelamedu (பீளமேடு)", "Ramanathapuram (இராமநாதபுரம்)", "Race Course (ரேஸ் கோர்ஸ்)", "Sundarapuram (சுந்தராபுரம்)", "Kuniyamuthur (குனியமுத்தூர்)", "Ondipudur (ஒண்டிப்புதூர்)"],
    categories: ["Residential", "Commercial", "Agriculture"],
    soilTypes: ["Clayey Loam / களிமண்", "Rich Black Loam / கரிசல் வண்டல்", "Red Loam / செம்மண்"],
    count: 15,
    prefix: "CBS"
  },
  {
    taluk: "Pollachi",
    center: [77.0050, 10.6600],
    villages: ["Pollachi South (பொள்ளாச்சி தெற்கு)", "Pollachi North (பொள்ளாச்சி வடக்கு)", "Anaimalai Road (ஆனைமலை ரோடு)", "Samathur (சமத்தூர்)", "Negamam (நேகமம்)", "Kottur (கோட்டூர்)", "Zamin Uthukuli (ஜமீன் உத்துகுளி)"],
    categories: ["Agriculture", "Residential"],
    soilTypes: ["Deep Red Loam / செம்மண்", "River Alluvium / ஆற்று வண்டல்", "Fertile Clay Loam / களி வண்டல்"],
    count: 15,
    prefix: "POL"
  },
  {
    taluk: "Sulur",
    center: [77.1250, 11.0250],
    villages: ["Sulur Town (சூலூர் நகரம்)", "Irugur (இருவூர்)", "Pallapalayam (பல்லபாளையம்)", "Rasipalayam (ராசிபாளையம்)", "Sultanpet (சுல்தான்பேட்டை)", "Kaniyur (கணியூர்)", "Kannampalayam (கண்ணம்பாளையம்)"],
    categories: ["Industrial", "Agriculture", "Residential"],
    soilTypes: ["Black Cotton Soil / கரிசல் மண்", "Red Gravel Loam / செம்மண் சரளை", "Coarse Sandy Loam / மணல் மண்"],
    count: 12,
    prefix: "SUL"
  },
  {
    taluk: "Mettupalayam",
    center: [76.9450, 11.3000],
    villages: ["Sirumugai (சிறுமுகை)", "Karamadai (காரமடை)", "Thekkampatti (தெக்கம்பட்டி)", "Odanthurai (ஓடந்துறை)", "Bellathi (பெள்ளாதி)", "Nellithurai (நெல்லித்துறை)"],
    categories: ["Agriculture", "Residential", "Commercial"],
    soilTypes: ["Bhavani River Alluvium / பவானி ஆற்று வண்டல்", "Deep Red Clay Loam / செம்மண்", "Forest Edge Soil / காடு மண்"],
    count: 10,
    prefix: "MTP"
  },
  {
    taluk: "Annur",
    center: [77.1000, 11.2300],
    villages: ["Annur Town (அன்னூர் நகரம்)", "Kunnathur (குன்னத்தூர்)", "Pogalur (போகலூர்)", "Kariampalayam (காரியம்பாளையம்)", "Pasur (பாசூர்)", "Kanuvakkarai (கணுவாக்கரை)"],
    categories: ["Agriculture", "Industrial", "Residential"],
    soilTypes: ["Red Cotton Soil / செம்மண் கரிசல்", "Gravel Loam / சரளை மண்", "Deep Clay / களிமண்"],
    count: 10,
    prefix: "ANR"
  },
  {
    taluk: "Kinathukadavu",
    center: [77.0200, 10.8200],
    villages: ["Kinathukadavu Town (கிணத்துக்கடவு)", "Solavampalayam (சோளவம்பாளையம்)", "Arasampalayam (அரசம்பாளையம்)", "Kondampatti (கொண்டம்பட்டி)", "Nallattipalayam (நல்லட்டிபாளையம்)", "Singayanputhur (சிங்காயன்புதூர்)", "Kothavadi (கொத்தவாடி)", "Vadachittor (வடசித்தூர்)"],
    categories: ["Agriculture", "Industrial", "Residential", "Commercial"],
    soilTypes: ["Red Gravel / செம்மண் சரளை", "Deep Red Loam / செம்மண்", "Black Soil / கரிசல் மண்"],
    count: 900,
    prefix: "KND"
  },
  {
    taluk: "Madukkarai",
    center: [76.9600, 10.9000],
    villages: ["Madukkarai Town (மடுக்கரை நகரம்)", "Ettimadai (எட்டிமடை)", "Thirumalayampalayam (திருமலையம்பாளையம்)", "Chettipalayam (செட்டிபாளையம்)", "Myleripalayam (மயிலேரிபாளையம்)"],
    categories: ["Industrial", "Commercial", "Residential"],
    soilTypes: ["Limestone Calcareous Soil / சுண்ணாம்பு மண்", "Red Gravel / செம்மண்", "Rocky Loam / பாறை சரளை"],
    count: 8,
    prefix: "MDK"
  },
  {
    taluk: "Valparai",
    center: [76.9550, 10.3250],
    villages: ["Valparai Town (வால்பாறை)", "Waterfall Estate (வாட்டர்பால்)", "Iyerpadi (அய்யர்பாடி)", "Sholayar Dam (சோலையார்)", "Mudis Estate (முடிஸ்)", "Rotikadai (ரொட்டிக்கடை)"],
    categories: ["Agriculture", "Commercial"],
    soilTypes: ["High Altitude Hill Peat / மலை மண்", "Humus Forest Loam / மட்கு மண்", "Laterite Loam / செம்பாறை மண்"],
    count: 8,
    prefix: "VLP"
  },
  {
    taluk: "Perur",
    center: [76.9150, 10.9750],
    villages: ["Perur Town (பேரூர் கோயில் வட்டம்)", "Vedapatti (வேடபட்டி)", "Alandurai (ஆலந்துறை)", "Pooluvapatti (பூளுவபட்டி)", "Thondamuthur (தொண்டாமுத்தூர்)"],
    categories: ["Agriculture", "Residential"],
    soilTypes: ["Noyyal River Basin Alluvium / நொய்யல் வண்டல்", "Deep Red Soil / செம்மண்", "Clay Loam / களிமண்"],
    count: 7,
    prefix: "PRR"
  }
];

const TAMIL_NAMES = [
  { en: "P. Natesan", ta: "பி. நடேசன்", f_en: "Palanichamy Gounder", f_ta: "பழனிச்சாமி கவுண்டர்" },
  { en: "Dr. K. Swaminathan", ta: "டாக்டர் கே. சுவாமிநாதன்", f_en: "Kumarasamy Chettiar", f_ta: "குமாரசாமி செட்டியார்" },
  { en: "R. Shanmugam", ta: "ஆர். சண்முகம்", f_en: "Ramasamy Gounder", f_ta: "ராமசாமி கவுண்டர்" },
  { en: "S. K. Murugesan", ta: "எஸ். கே. முருகேசன்", f_en: "Kandasamy", f_ta: "கந்தசாமி" },
  { en: "M. Palanisamy", ta: "எம். பழனிசாமி", f_en: "Muthusamy", f_ta: "முத்துசாமி" },
  { en: "K. Subramaniam", ta: "கே. சுப்பிரமணியம்", f_en: "Karuppanna Gounder", f_ta: "கருப்பண்ண கவுண்டர்" },
  { en: "T. Annadurai", ta: "டி. அண்ணாதுரை", f_en: "Thangavelu", f_ta: "தங்கவேலு" },
  { en: "A. Velusamy", ta: "ஏ. வேலுசாமி", f_en: "Arumugam", f_ta: "ஆறுமுகம்" },
  { en: "V. Ramachandran", ta: "வி. ராமச்சந்திரன்", f_en: "Venkatachalam", f_ta: "வெங்கடாசலம்" },
  { en: "S. Manikandan", ta: "எஸ். மணிகண்டன்", f_en: "Sadasivam Pillai", f_ta: "சதாசிவம் பிள்ளை" },
  { en: "C. Nachimuthu", ta: "சி. நாச்சிமுத்து", f_en: "Chinnasamy", f_ta: "சின்னசாமி" },
  { en: "G. Soundararajan", ta: "ஜி. சௌந்தரராஜன்", f_en: "Govindarajulu Naidu", f_ta: "கோவிந்தராஜுலு நாயுடு" },
  { en: "K. Boopathi", ta: "கே. பூபதி", f_en: "Krishnasamy Gounder", f_ta: "கிருஷ்ணசாமி கவுண்டர்" },
  { en: "N. Selvaraj", ta: "என். செல்வராஜ்", f_en: "Natarajan", f_ta: "நடராஜன்" },
  { en: "S. Thangavel", ta: "எஸ். தங்கவேல்", f_en: "Subramanian", f_ta: "சுப்பிரமணியன்" },
  { en: "M/s Kovai Agro Farms", ta: "கோவை அக்ரோ ஃபார்ம்ஸ்", f_en: "Managing Director: K. Marimuthu", f_ta: "மேலாண் இயக்குநர்: கே. மாரிமுத்து" },
  { en: "Texmo Foundations", ta: "டெக்ஸ்மோ ஃபவுண்டேஷன்ஸ்", f_en: "Authorised Trustee: R. Ramasamy", f_ta: "அங்கீகரிக்கப்பட்ட அறங்காவலர்" },
  { en: "LMW Spinning Mills", ta: "எல்.எம்.டபிள்யூ நூற்பாலை", f_en: "Corporate Entity", f_ta: "கார்ப்பரேட் நிறுவனம்" },
  { en: "Roots Industries India", ta: "ரூட்ஸ் இண்டஸ்ட்ரீஸ்", f_en: "Director: K. Ramasamy", f_ta: "இயக்குநர்: கே. ராமசாமி" },
  { en: "Tata Tea & Coffee Estate", ta: "டாடா காபி எஸ்டேட்", f_en: "General Manager: S. Chandran", f_ta: "பொது மேலாளர்: எஸ். சந்திரன்" }
];

function generate108Parcels(): CoimbatoreParcel[] {
  const parcels: CoimbatoreParcel[] = [];
  let globalIndex = 1;

  TALUK_CONFIGS.forEach((tConfig) => {
    for (let i = 0; i < tConfig.count; i++) {
      const nameObj = TAMIL_NAMES[(globalIndex - 1) % TAMIL_NAMES.length];
      const village = tConfig.villages[i % tConfig.villages.length];
      const category = tConfig.categories[i % tConfig.categories.length] as any;
      const soilType = tConfig.soilTypes[i % tConfig.soilTypes.length];
      
      const surveyMain = 50 + (globalIndex * 7) % 450;
      const subDivLetters = ["1A", "2B", "3C", "1B", "4A", "2", "3", "5B", "1", "2A"];
      const subDiv = subDivLetters[i % subDivLetters.length];
      const surveyNo = `${surveyMain}/${subDiv}`;
      const pattaNo = `${1000 + (globalIndex * 73) % 8900}`;
      
      // Calculate realistic area based on category
      let areaAcres = 0;
      let guidelineSqft = 0;
      let landType = "";
      
      if (category === "Agriculture") {
        areaAcres = Number((1.5 + (globalIndex % 8) * 0.85).toFixed(2));
        guidelineSqft = 950 + (globalIndex % 5) * 250;
        landType = i % 2 === 0 ? "தோட்டக்கால் (Coconut Plantation / தோட்டம்)" : "நஞ்சை (Wetland / Paddy & Sugarcane)";
      } else if (category === "Commercial") {
        areaAcres = Number((0.8 + (globalIndex % 4) * 0.75).toFixed(2));
        guidelineSqft = 4500 + (globalIndex % 6) * 600;
        landType = "வணிக வளாகம் / IT SEZ (Commercial & IT Park)";
      } else if (category === "Industrial") {
        areaAcres = Number((3.0 + (globalIndex % 6) * 1.5).toFixed(2));
        guidelineSqft = 2200 + (globalIndex % 4) * 350;
        landType = "தொழில் பேட்டை மனை / Foundry & Mills";
      } else {
        areaAcres = Number((0.25 + (globalIndex % 5) * 0.35).toFixed(2));
        guidelineSqft = 3200 + (globalIndex % 5) * 450;
        landType = "அங்கீகரிக்கப்பட்ட வீட்டு மனை (Approved Residential Layout)";
      }

      const areaCents = Math.round(areaAcres * 100);
      const areaSqm = Number((areaAcres * 4046.86).toFixed(1));
      const marketValue = Math.round(areaAcres * 43560 * guidelineSqft * 1.35);

      // Realistic Organic Irregular FMB Cadastral Polygon Generation
      const [lngCenter, latCenter] = tConfig.center;
      const angleStep = (i / tConfig.count) * 2 * Math.PI;
      const dist = 0.001 + ((i % 15) * 0.0012);
      const cLng = lngCenter + Math.cos(angleStep) * dist;
      const cLat = latCenter + Math.sin(angleStep) * dist;
      
      const numSides = 6;
      const polygon: [number, number][] = [];
      for (let s = 0; s < numSides; s++) {
        const a = (s / numSides) * 2 * Math.PI + ((i * 17 + s * 3) % 10) * 0.05;
        const r = 0.0022 * (0.7 + ((i * 13 + s * 7) % 10) * 0.06);
        const dLng = (r * Math.cos(a)) / Math.cos(cLat * (Math.PI / 180));
        const dLat = r * Math.sin(a);
        polygon.push([Number((cLng + dLng).toFixed(5)), Number((cLat + dLat).toFixed(5))]);
      }
      polygon.push(polygon[0]);

      const hashBytes = `0x${((globalIndex * 192837465) % 0xffffffff).toString(16).padStart(8, "0")}` +
        `a9b8c7d6e5f41029384756${((globalIndex * 837461) % 0xffffffff).toString(16).padStart(8, "0")}` +
        `1234567890abcdef1234567890abcdef`;

      const encumbrance = i % 6 === 0
        ? "Hypothecated to Canara Bank / SBI (Secured Agri/MSME Loan)"
        : "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)";

      const parcel: CoimbatoreParcel = {
        id: `cbe-plot-${String(globalIndex).padStart(3, "0")}`,
        survey_no: surveyNo,
        subdivision: subDiv,
        patta_no: pattaNo,
        owner_name: `${nameObj.en} / ${nameObj.ta}`,
        father_name: `${nameObj.f_en} / ${nameObj.f_ta}`,
        co_owners: i % 3 === 0 ? [`${nameObj.en.split(" ")[0]}. Karpagam (Wife)`, `${nameObj.en.split(" ")[0]}. Senthil (Son)`] : [],
        village: village,
        taluk: tConfig.taluk,
        district: "Coimbatore",
        state: "Tamil Nadu",
        village_lgd_code: `6410${String((globalIndex % 90) + 10)}`,
        land_type: landType,
        land_category: category,
        soil_type: soilType,
        area_acres: areaAcres,
        area_cents: areaCents,
        area_sqm: areaSqm,
        guideline_value_sqft: guidelineSqft,
        market_value_inr: marketValue,
        encumbrance_status: encumbrance,
        blockchain_hash: hashBytes,
        polygon: polygon,
        mutation_history: [
          {
            step: 1,
            date: "1994-06-12",
            deed_type: "Ancestral Partition / Settlement (குடும்ப பாகப்பிரிவினை)",
            doc_no: `Doc ${1200 + globalIndex}/1994, SRO ${tConfig.taluk}`,
            transferor: `${nameObj.f_en} (Ancestor)`,
            transferee: nameObj.en,
            extent: `${areaAcres} Acres`,
            status: "Verified on Revenue Register"
          },
          {
            step: 2,
            date: "2023-11-20",
            deed_type: "Digital RoR Patta Conversion & Blockchain Anchor",
            doc_no: `TV-2023-TN-CBE-${surveyMain}`,
            transferor: "Revenue Dept / e-Pattadar Portal",
            transferee: nameObj.en,
            extent: `${areaAcres} Acres`,
            status: "Anchored to Polygon Amoy Testnet (RecordRegistry.sol)"
          }
        ],
        inheritance_tree: {
          root: {
            name: `${nameObj.f_en} (${nameObj.f_ta})`,
            relation: "Patriarch / Ancestral Origin (1930 - 2002)",
            generation: "Gen 1",
            children: [
              {
                name: `${nameObj.en} (${nameObj.ta})`,
                relation: "Current Primary Title Holder (Age 54)",
                generation: "Gen 2",
                heirs: [
                  { name: "S. Karthi / கார்த்தி", relation: "Elder Son / Co-parcener" },
                  { name: "S. Divya / திவ்யா", relation: "Daughter" }
                ]
              }
            ]
          }
        }
      };

      parcels.push(parcel);
      globalIndex++;
    }
  });

  return parcels;
}

export const MOCK_COIMBATORE_PARCELS: CoimbatoreParcel[] = generate108Parcels();

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
      p.village.toLowerCase().includes(query) ||
      p.taluk.toLowerCase().includes(query)
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

export const MOCK_RECORDS = MOCK_COIMBATORE_PARCELS.slice(0, 25).map((p, idx) => ({
  id: `rec-cbe-${String(idx + 1).padStart(3, "0")}`,
  owner_name: p.owner_name,
  father_name: p.father_name,
  khasra_no: p.survey_no,
  khata_no: p.patta_no,
  survey_no: p.survey_no,
  state: p.state,
  district: p.district,
  tehsil: p.taluk,
  village: p.village,
  area_value: String(p.area_acres),
  area_unit: "Acres",
  land_type: p.land_type,
  status: "verified",
  verification_status: "VERIFIED_ON_CHAIN",
  blockchain_hash: p.blockchain_hash,
  overall_confidence: 0.94 + (idx % 6) * 0.01,
  doc_sha256: `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b${String(idx).padStart(2, "0")}`,
  created_at: `2026-08-${String(20 + (idx % 10)).padStart(2, "0")}T10:15:00Z`
}));

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
  overall_score: 91.2,
  total_records: 108,
  verified_records: 108,
  pending_review: 2,
  dispute_count: 3,
  taluk_breakdown: TALUK_CONFIGS.map(tc => ({
    taluk: tc.taluk,
    score: 85.0 + (tc.count % 10) * 1.2,
    records: tc.count,
    verified: tc.count
  }))
};
