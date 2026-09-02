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
    count: 16,
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

      // Clean non-overlapping FMB grid coordinates across villages
      const [lngCenter, latCenter] = tConfig.center;
      const cols = 4;
      const row = Math.floor(i / cols);
      const col = i % cols;
      const spacingLng = 0.0075;
      const spacingLat = 0.0065;
      const cLng = lngCenter + (col - (cols - 1) / 2) * spacingLng + ((row * 7) % 3) * 0.0006;
      const cLat = latCenter + (row - (Math.ceil(tConfig.count / cols) - 1) / 2) * spacingLat + ((col * 5) % 3) * 0.0006;

      const numSides = 5;
      const polygon: [number, number][] = [];
      const baseRadius = 0.0022;
      for (let s = 0; s < numSides; s++) {
        const a = (s / numSides) * 2 * Math.PI;
        const jitter = 0.85 + (((i * 11 + s * 7) % 10) * 0.03);
        const r = baseRadius * jitter;
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
            transferor: `${nameObj.f_en} / ${nameObj.f_ta} (Ancestor)`,
            transferor_role: "மூதாதையர் / முந்தைய பட்டாதாரர் (Patriarch / Ancestor)",
            transferor_patta: `${1000 + (globalIndex % 400)}`,
            transferee: `${nameObj.en} / ${nameObj.ta}`,
            transferee_role: "பாகஸ்தர் / வாரிசுதாரர் (Legal Heir / Co-parcener)",
            transferee_patta: pattaNo,
            extent: `${areaAcres} Acres`,
            consideration: "குடும்ப பாகப்பிரிவினை உரிமை / Family Coparcenary Share",
            stamp_duty: `ரூ. ${(Math.round(marketValue * 0.02)).toLocaleString('en-IN')}`,
            boundaries: {
              north: `SF.${Math.max(1, surveyMain - 1)} வாய்க்கால் & பொதுப்பாதை`,
              south: `SF.${surveyMain + 1} ராமசாமி கவுண்டர் நிலம்`,
              east: `SF.${surveyMain + 2} விவசாய நிலம்`,
              west: `SF.${surveyMain} எல்லைக்கோடு`
            },
            mutation_order: `RO/1994/PTR-${400 + globalIndex}`,
            status: "Certified & Registered (பதிவு செய்யப்பட்டது)",
            blockchain_status: "Legacy Land Register Verified",
            verified: true
          },
          {
            step: 2,
            date: "2015-09-18",
            deed_type: "வருவாய் உட்பிரிவு & பட்டா மாறுதல் (Sub-division & Patta Transfer)",
            doc_no: `SD-${2015000 + globalIndex}, வட்டாட்சியர் அலுவலகம் ${tConfig.taluk}`,
            transferor: `${nameObj.en} / ${nameObj.ta}`,
            transferor_role: "கூட்டுப் பட்டாதாரர் (Joint Pattadar)",
            transferor_patta: pattaNo,
            transferee: `${nameObj.en} / ${nameObj.ta}`,
            transferee_role: "தனிப் பட்டாதாரர் (Sole Registered Pattadar)",
            transferee_patta: pattaNo,
            extent: `${areaAcres} Acres (${areaCents} Cents)`,
            consideration: "அரசு நில அளவை உட்பிரிவு (Govt Cadastral Survey Demarcation)",
            stamp_duty: "அரசு நிர்ணய கட்டணம்",
            boundaries: {
              north: `SF.${Math.max(1, surveyMain - 1)} பொது வாய்க்கால்`,
              south: `SF.${surveyMain + 1} விவசாய நஞ்சை நிலம்`,
              east: `SF.${surveyMain + 2} தோட்டம்`,
              west: `கிராம எல்லை வண்டிப்பாதை`
            },
            mutation_order: `SD/2015/CBE-${100 + globalIndex}`,
            status: "FMB Demarcation Sealed",
            blockchain_status: "Revenue Ledger Synchronized",
            verified: true
          },
          {
            step: 3,
            date: "2023-11-20",
            deed_type: "Digital RoR Patta Conversion & Blockchain Anchor (டிஜிட்டல் பட்டா பதிவேடு)",
            doc_no: `TV-2023-TN-CBE-${surveyMain}`,
            transferor: "Revenue Dept / e-Pattadar Portal (வருவாய்த்துறை)",
            transferor_role: "அரசு அங்கீகாரம் (State Revenue Authority)",
            transferor_patta: pattaNo,
            transferee: `${nameObj.en} / ${nameObj.ta}`,
            transferee_role: "உரிமையாளர் / பட்டாதாரர் (Absolute Title Holder)",
            transferee_patta: pattaNo,
            extent: `${areaAcres} Acres (${areaSqm} sq.m)`,
            consideration: `வழிகாட்டி மதிப்பு: ரூ. ${marketValue.toLocaleString('en-IN')}`,
            stamp_duty: "டிஜிட்டல் நில ஆவண முறை",
            boundaries: {
              north: `SF.${Math.max(1, surveyMain - 1)} பொது வாய்க்கால்`,
              south: `SF.${surveyMain + 1} நஞ்சை நிலம்`,
              east: `SF.${surveyMain + 2} தோட்டம்`,
              west: `வண்டிப்பாதை`
            },
            mutation_order: `DILRMP-2023-${globalIndex + 1000}`,
            status: "Anchored to Polygon Amoy Testnet (RecordRegistry.sol)",
            blockchain_status: "Verified On-Chain (Block #14920000)",
            verified: true
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
    priority: 0.85,
    status: "pending",
    assigned_at: "2026-08-31T07:30:00Z",
    created_at: "2026-08-31T07:30:00Z",
    doc_url: "/data/static/enhanced/9598661f-c633-42e9-96bf-8f7b12f29325.png",
    flags: [
      { field: "owner_name", severity: "error", message: "Faded Tamil script in Pattadar name field (வள்ளி அ. / Muthulakshmi)" },
      { field: "area_acres", severity: "warning", message: "Extent boundary requires verification (4.46 Acres vs 4.45 Acres)" }
    ],
    record: {
      id: "rec-cbe-005",
      survey_no: "245/3B-2",
      patta_no: "7947",
      owner_name: "வள்ளி அ. / Muthulakshmi K.",
      father_name: "பெருமாள்செட்டியார் (Perumal Chettiar)",
      village: "Puduppalayam (புதுப்பாளையம்)",
      taluk: "Kinathukadavu",
      district: "Coimbatore",
      area_acres: 4.46,
      land_type: "நன்செய் (Wetland Agriculture)",
      enhanced_doc_url: "http://127.0.0.1:8000/static/enhanced/9598661f-c633-42e9-96bf-8f7b12f29325.png",
      raw_doc_url: "http://127.0.0.1:8000/static/enhanced/9598661f-c633-42e9-96bf-8f7b12f29325.png"
    },
    field_confidences: [
      { field_name: "owner_name", raw_ocr_value: "வள்ளி அ.", corrected_value: "வள்ளி அ. / Muthulakshmi K.", confidence: 0.62, bounding_box: [40, 110, 260, 40] },
      { field_name: "father_name", raw_ocr_value: "பெருமாள்செட்டியார்", corrected_value: "பெருமாள்செட்டியார்", confidence: 0.88, bounding_box: [40, 160, 240, 35] },
      { field_name: "survey_no", raw_ocr_value: "245/3B-2", corrected_value: "245/3B-2", confidence: 0.91, bounding_box: [40, 205, 140, 30] },
      { field_name: "patta_no", raw_ocr_value: "7947", corrected_value: "7947", confidence: 0.94, bounding_box: [200, 205, 100, 30] },
      { field_name: "area_acres", raw_ocr_value: "4.46", corrected_value: "4.46", confidence: 0.58, bounding_box: [40, 245, 120, 30] },
      { field_name: "village", raw_ocr_value: "புதுப்பாளையம்", corrected_value: "புதுப்பாளையம் (Puduppalayam)", confidence: 0.95, bounding_box: [180, 245, 180, 30] }
    ]
  },
  {
    id: "task-002",
    record_id: "rec-cbe-006",
    priority: 0.72,
    status: "pending",
    assigned_at: "2026-08-31T08:15:00Z",
    created_at: "2026-08-31T08:15:00Z",
    doc_url: "/data/static/enhanced/077abcac-44cd-4d8f-a441-25710f56edb3.png",
    flags: [
      { field: "survey_no", severity: "warning", message: "Revenue stamp seal partially overlaps Survey No SF 77/1A" }
    ],
    record: {
      id: "rec-cbe-006",
      survey_no: "77/1A",
      patta_no: "4921",
      owner_name: "S. K. முருகேசன் / S. K. Murugesan",
      father_name: "Kandhasamy Gounder / கந்தசாமி கவுண்டர்",
      village: "Madukkarai (மதுக்கரை)",
      taluk: "Coimbatore South",
      district: "Coimbatore",
      area_acres: 2.10,
      land_type: "தோட்டம் (Coconut Garden)",
      enhanced_doc_url: "http://127.0.0.1:8000/static/enhanced/077abcac-44cd-4d8f-a441-25710f56edb3.png",
      raw_doc_url: "http://127.0.0.1:8000/static/enhanced/077abcac-44cd-4d8f-a441-25710f56edb3.png"
    },
    field_confidences: [
      { field_name: "owner_name", raw_ocr_value: "S. K. முருகேசன்", corrected_value: "S. K. முருகேசன் / S. K. Murugesan", confidence: 0.92, bounding_box: [40, 110, 260, 40] },
      { field_name: "father_name", raw_ocr_value: "Kandhasamy", corrected_value: "Kandhasamy Gounder", confidence: 0.90, bounding_box: [40, 160, 220, 35] },
      { field_name: "survey_no", raw_ocr_value: "77/1A", corrected_value: "77/1A", confidence: 0.64, bounding_box: [40, 205, 130, 30] },
      { field_name: "patta_no", raw_ocr_value: "4921", corrected_value: "4921", confidence: 0.89, bounding_box: [200, 205, 100, 30] },
      { field_name: "area_acres", raw_ocr_value: "2.10", corrected_value: "2.10", confidence: 0.89, bounding_box: [40, 245, 120, 30] },
      { field_name: "village", raw_ocr_value: "மதுக்கரை", corrected_value: "மதுக்கரை (Madukkarai)", confidence: 0.93, bounding_box: [180, 245, 180, 30] }
    ]
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

export function addUploadedParcel(rec: Partial<CoimbatoreParcel>): CoimbatoreParcel {
  const newIndex = MOCK_COIMBATORE_PARCELS.length + 1;
  const newId = `cbe-plot-${String(newIndex).padStart(3, "0")}`;

  const newParcel: CoimbatoreParcel = {
    id: newId,
    survey_no: rec.survey_no || `${100 + newIndex}/1A`,
    subdivision: rec.subdivision || "1A",
    patta_no: rec.patta_no || `${5000 + newIndex}`,
    owner_name: rec.owner_name || "K. Rajendran / K. ராஜேந்திரன்",
    father_name: rec.father_name || "Karuppusamy / கருப்புசாமி",
    co_owners: rec.co_owners || [],
    village: rec.village || "Kinathukadavu Town",
    taluk: rec.taluk || "Kinathukadavu",
    district: rec.district || "Coimbatore",
    state: rec.state || "Tamil Nadu",
    village_lgd_code: "632101",
    land_type: rec.land_type || "தோட்டக்கால் (Coconut Plantation / தோட்டம்)",
    land_category: (rec.land_category as any) || "Agriculture",
    soil_type: "Black Cotton Soil (கரிசல்)",
    area_acres: rec.area_acres || 2.45,
    area_cents: Math.round((rec.area_acres || 2.45) * 100),
    area_sqm: Math.round((rec.area_acres || 2.45) * 4046.86),
    guideline_value_sqft: 1850,
    market_value_inr: Math.round((rec.area_acres || 2.45) * 43560 * 1850 * 1.35),
    encumbrance_status: "Clean / Nil Encumbrance (வில்லங்கம் இல்லை)",
    blockchain_hash: rec.blockchain_hash || `0x9f83a24b1029384756${newIndex}a9b8c7d6e5f4`,
    polygon: rec.polygon || [
      [76.9610, 10.9850],
      [76.9625, 10.9855],
      [76.9630, 10.9840],
      [76.9615, 10.9835],
      [76.9610, 10.9850]
    ],
    mutation_history: [
      {
        step: 1,
        date: "2026-09-02",
        deed_type: "OCR Ingestion & Title Registration",
        doc_no: `DOC-2026-${8800 + newIndex}`,
        transferor: "State Government Registry",
        transferee: rec.owner_name || "K. Rajendran",
        extent: `${rec.area_acres || 2.45} Acres`,
        status: "Verified & Sealed"
      }
    ],
    inheritance_tree: {
      root: {
        name: rec.owner_name ? rec.owner_name.split("/")[0] : "K. Rajendran",
        relation: "Current Owner",
        generation: "Gen 1",
        children: []
      }
    }
  };

  // Unshift so it appears at top of lists
  MOCK_COIMBATORE_PARCELS.unshift(newParcel);
  return newParcel;
}

export interface CollectorCourtCase {
  id: string;
  case_no: string;
  appeal_type: string;
  petitioner: string;
  petitioner_ta: string;
  respondent: string;
  respondent_ta: string;
  survey_no: string;
  village: string;
  taluk: string;
  extent_acres: number;
  filed_date: string;
  hearing_date: string;
  stage: "HEARING" | "STAY_ORDER_ACTIVE" | "SURVEY_PENDING" | "RESERVED" | "DECREE_ISSUED";
  dispute_summary: string;
  dispute_summary_ta: string;
  petitioner_claim: string;
  respondent_claim: string;
  ai_fraud_risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  ai_findings: string[];
  stay_order_issued?: boolean;
  survey_summons_issued?: boolean;
  decree_order?: string;
  blockchain_decree_hash?: string;
}

export const MOCK_COLLECTOR_COURT_CASES: CollectorCourtCase[] = [
  {
    id: "CASE-2026-001",
    case_no: "REV-APL-2026/0412",
    appeal_type: "இரண்டாம் மேல்முறையீடு (Second Appeal - Disputed Patta Transfer)",
    petitioner: "M. Palanisamy Gounder / எம். பழனிசாமி கவுண்டர்",
    petitioner_ta: "எம். பழனிசாமி கவுண்டர்",
    respondent: "K. Subramaniam & Sons / கே. சுப்பிரமணியம்",
    respondent_ta: "கே. சுப்பிரமணியம்",
    survey_no: "SF 245/3B-2",
    village: "Kinathukadavu Town",
    taluk: "Kinathukadavu",
    extent_acres: 2.15,
    filed_date: "2026-01-14",
    hearing_date: "2026-09-08 (11:30 AM)",
    stage: "HEARING",
    dispute_summary: "Appeal against RDO Pollachi order allowing mutation based on contested 1998 ancestral partition deed without petitioner's consent.",
    dispute_summary_ta: "1998 பாகப்பிரிவினை பத்திரத்தில் மனுதாரர் கையொப்பம் இன்றி போலியாக உருவாக்கப்பட்டதாக தொடரப்பட்ட மேல்முறையீடு.",
    petitioner_claim: "Registered Ancestral Partition Deed Doc 1104/1998 entitles petitioner to 2.15 acres full possession.",
    respondent_claim: "Subsequent unregistered family settlement deed of 2004 transferred 1.10 acres to respondent.",
    ai_fraud_risk: "CRITICAL",
    ai_findings: [
      "Rapid mutation attempt flagged: 2 rival transfer applications filed within 21 days",
      "Signature discrepancy: 78% mismatch on 2004 unregistered settlement document",
      "FMB boundary collision: 0.18 acre physical overlap detected on Cadastral Digital Twin"
    ]
  },
  {
    id: "CASE-2026-002",
    case_no: "REV-APL-2026/0388",
    appeal_type: "மோசடி பட்டா ரத்து கோரிக்கை (Fraudulent Patta Cancellation Under Sec 13)",
    petitioner: "Valli A. / வள்ளி அ.",
    petitioner_ta: "வள்ளி அ.",
    respondent: "S. K. Murugesan / எஸ். கே. முருகேசன்",
    respondent_ta: "எஸ். கே. முருகேசன்",
    survey_no: "SF 62/1A",
    village: "Solavampalayam",
    taluk: "Kinathukadavu",
    extent_acres: 3.40,
    filed_date: "2025-11-20",
    hearing_date: "2026-09-09 (02:00 PM)",
    stage: "STAY_ORDER_ACTIVE",
    stay_order_issued: true,
    dispute_summary: "Fraudulent creation of parallel Patta #4102 by suppressing legal heir certificates after demise of original pattadar Arumugam.",
    dispute_summary_ta: "அசல் பட்டாதாரர் மறைவுக்குப் பின் வாரிசுச் சான்றிதழை மறைத்து போலி பட்டா #4102 பெற்றதற்கு எதிரான வழக்கு.",
    petitioner_claim: "Sole surviving direct legal heir with Tahsildar Legal Heirship Certificate #LHC-2025-9912.",
    respondent_claim: "Claims title via General Power of Attorney purportedly executed in 2012.",
    ai_fraud_risk: "HIGH",
    ai_findings: [
      "Power of Attorney principal deceased prior to registered conveyance deed execution",
      "Duplicate Patta #4102 flagged with zero prior parent deed trail in SRO Index-II"
    ]
  },
  {
    id: "CASE-2026-003",
    case_no: "REV-APL-2026/0295",
    appeal_type: "நீர்வழி புறம்போக்கு ஆக்கிரமிப்பு மேல்முறையீடு (Waterbody Poramboke Restoration)",
    petitioner: "Kinathukadavu Farmers Welfare Association",
    petitioner_ta: "கிணத்துக்கடவு விவசாயிகள் நலச் சங்கம்",
    respondent: "Sri Balaji Brick Industries / ஸ்ரீ பாலாஜி செங்கல் சூளை",
    respondent_ta: "ஸ்ரீ பாலாஜி செங்கல் சூளை",
    survey_no: "SF 18/4 (Kulam Poramboke)",
    village: "Kondampatti",
    taluk: "Kinathukadavu",
    extent_acres: 4.85,
    filed_date: "2025-10-05",
    hearing_date: "2026-09-12 (10:30 AM)",
    stage: "SURVEY_PENDING",
    survey_summons_issued: true,
    dispute_summary: "Commercial brick kiln encroachment inside supply channel feeding Kondampatti irrigation tank.",
    dispute_summary_ta: "கொண்டம்பட்டி பாசனக் குளத்திற்கு நீர் வரும் ஓடை மற்றும் புறம்போக்கு நிலத்தில் செங்கல் சூளை ஆக்கிரமிப்பு.",
    petitioner_claim: "Kondampatti Tank Resurvey 1984 classifies SF 18/4 as Water Channel (நீர்வழி புறம்போக்கு).",
    respondent_claim: "Operating under 2005 Natham Assignment order issued by then Special Tahsildar.",
    ai_fraud_risk: "CRITICAL",
    ai_findings: [
      "Satellite Drone Twin confirms 1.45 acres permanent brick kiln structures inside water catchment boundary",
      "Supreme Court Hinch Lal Tiwari mandate violation: Waterbody Poramboke land assignment is legally void"
    ]
  },
  {
    id: "CASE-2026-004",
    case_no: "REV-APL-2026/0501",
    appeal_type: "உட்பிரிவு எல்லைத் தகராறு (FMB Sub-Division Boundary Correction)",
    petitioner: "Dr. K. Swaminathan / டாக்டர் கே. சுவாமிநாதன்",
    petitioner_ta: "டாக்டர் கே. சுவாமிநாதன்",
    respondent: "Texmo Foundations / டெக்ஸ்மோ ஃபவுண்டேஷன்ஸ்",
    respondent_ta: "டெக்ஸ்மோ ஃபவுண்டேஷன்ஸ்",
    survey_no: "SF 104/1B",
    village: "Singayanputhur",
    taluk: "Kinathukadavu",
    extent_acres: 1.80,
    filed_date: "2026-02-02",
    hearing_date: "2026-09-15 (03:30 PM)",
    stage: "HEARING",
    dispute_summary: "Sub-division stone alignment dispute between SF 104/1B and SF 104/1C resulting in 12-foot cart track blockage.",
    dispute_summary_ta: "உட்பிரிவு எல்லைக் கற்கள் தவறாக நடப்பட்டு 12 அடி பொது வண்டிப்பாதை அடைக்கப்பட்டதாக தொடரப்பட்ட வழக்கு.",
    petitioner_claim: "FMB Ladder diagram of 1972 proves 12ft easement cart track along Western boundary.",
    respondent_claim: "Latest DGPS survey of 2024 revised boundary line based on perimeter wall construction.",
    ai_fraud_risk: "MEDIUM",
    ai_findings: [
      "Cart track width narrowed from 3.65m (1994 baseline) to 1.10m (2026 Drone Twin)",
      "Boundary ladder coordinates require ETS re-calibration against village tri-junction pillar"
    ]
  }
];

export const MOCK_PORAMBOKE_ASSIGNMENTS = [
  {
    id: "POR-2026-081",
    village: "Nallattipalayam",
    taluk: "Kinathukadavu",
    survey_no: "SF 88/2",
    land_class: "Grama Natham Poramboke (கிராம நத்தம்)",
    extent_acres: 0.03, // 3 cents
    extent_cents: 3,
    beneficiary: "K. Mariyammal / கே. மாரியம்மாள் (Landless Agricultural Laborer)",
    scheme: "CM Free House-Site Patta Scheme (முதலமைச்சரின் இலவச வீட்டுமனைப் பட்டா)",
    eligibility_status: "VERIFIED_ELIGIBLE",
    status: "PENDING_COLLECTOR_APPROVAL"
  },
  {
    id: "POR-2026-082",
    village: "Arasampalayam",
    taluk: "Kinathukadavu",
    survey_no: "SF 142/3",
    land_class: "Meikkal Poramboke (மேய்க்கால் புறம்போக்கு)",
    extent_acres: 0.025,
    extent_cents: 2.5,
    beneficiary: "S. Murugan / எஸ். முருகன் (Scheduled Caste / PMAY-G Beneficiary)",
    scheme: "Pradhan Mantri Awas Yojana (PMAY-G)",
    eligibility_status: "VERIFIED_ELIGIBLE",
    status: "APPROVED_AND_ISSUED"
  },
  {
    id: "POR-2026-083",
    village: "Vadachittor",
    taluk: "Kinathukadavu",
    survey_no: "SF 219/1",
    land_class: "Assessed Waste Dry (அனாதீனம் / தரிசு)",
    extent_acres: 0.04,
    extent_cents: 4,
    beneficiary: "P. Lakshmi / பி. லட்சுமி (Widowed Destitute)",
    scheme: "State Social Welfare Destitute Land Scheme",
    eligibility_status: "VERIFIED_ELIGIBLE",
    status: "PENDING_COLLECTOR_APPROVAL"
  }
];

export const MOCK_TALUK_LEAGUE_TABLE = [
  { rank: 1, taluk: "Kinathukadavu", officer: "P. Subramanian (Tahsildar)", patta_sla_days: 6.2, clearance_rate: "98.4%", grievances_resolved: 412, revenue_cr: 18.4, status: "EXEMPLARY" },
  { rank: 2, taluk: "Annur", officer: "S. Jayanthi (Tahsildar)", patta_sla_days: 8.1, clearance_rate: "95.2%", grievances_resolved: 320, revenue_cr: 14.8, status: "EXEMPLARY" },
  { rank: 3, taluk: "Pollachi", officer: "K. Mohanraj (Tahsildar)", patta_sla_days: 9.4, clearance_rate: "92.8%", grievances_resolved: 580, revenue_cr: 26.2, status: "GOOD" },
  { rank: 4, taluk: "Coimbatore North", officer: "R. Venkatesh (Tahsildar)", patta_sla_days: 11.2, clearance_rate: "89.5%", grievances_resolved: 740, revenue_cr: 64.5, status: "GOOD" },
  { rank: 5, taluk: "Sulur", officer: "M. Nanthakumar (Tahsildar)", patta_sla_days: 12.0, clearance_rate: "88.1%", grievances_resolved: 490, revenue_cr: 32.1, status: "AVERAGE" },
  { rank: 6, taluk: "Coimbatore South", officer: "T. Selvaraj (Tahsildar)", patta_sla_days: 14.5, clearance_rate: "84.3%", grievances_resolved: 810, revenue_cr: 78.9, status: "NEEDS_IMPROVEMENT" },
  { rank: 7, taluk: "Mettupalayam", officer: "A. Chandran (Tahsildar)", patta_sla_days: 15.8, clearance_rate: "81.0%", grievances_resolved: 380, revenue_cr: 19.5, status: "NEEDS_IMPROVEMENT" },
];

export const MOCK_LAND_ACQUISITION_PROJECTS = [
  {
    id: "LA-CBE-01",
    project_name: "Coimbatore Western Ring Road Phase-II (NHAI)",
    project_name_ta: "கோவை மேற்கு புறவழிச்சாலை திட்டம் (கட்டம்-2)",
    authority: "National Highways Authority of India (NHAI)",
    total_extent_acres: 142.5,
    parcels_acquired: 84,
    total_parcels: 112,
    compensation_budget_cr: 284.50,
    disbursed_cr: 218.20,
    multiplier_factor: "2.0x (Rural Section 26 RFCTLARR 2013)",
    status: "DISBURSEMENT_IN_PROGRESS"
  },
  {
    id: "LA-CBE-02",
    project_name: "TIDCO Defence & Aerospace Industrial Corridor (Sulur)",
    project_name_ta: "டிட்கோ பாதுகாப்பு மற்றும் விண்வெளி தொழில் பூங்கா",
    authority: "Tamil Nadu Industrial Development Corp (TIDCO)",
    total_extent_acres: 380.0,
    parcels_acquired: 195,
    total_parcels: 210,
    compensation_budget_cr: 512.00,
    disbursed_cr: 489.40,
    multiplier_factor: "1.5x (Urban-Periphery RFCTLARR)",
    status: "NEARING_COMPLETION"
  }
];

