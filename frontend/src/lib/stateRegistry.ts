export interface RoleHierarchyItem {
  id: string;
  title: string;
  scope: string;
  desc: string;
  powers: string[];
  href: string;
  cta: string;
}

export interface StateDignitary {
  cmName: string;
  cmTitle: string;
  cmState: string;
  rmName: string;
  rmTitle: string;
  rmDept: string;
}

export interface StateMetadata {
  code: string;
  name: string;
  nativeName: string;
  portalName: string;
  region: "South" | "North" | "West" | "East" | "Central" | "North-East" | "Union Territory";
  dilrmpScore: string;
  dilrmpRank: string;
  motto: string;
  department: string;
  helpline: string;
  emergencyNo: string;
  languages: string[];
  primaryLangCode: string;
  rorName: string;
  mapName: string;
  mutationName: string;
  sampleDistrict: string;
  sampleTaluk: string;
  centerLat: number;
  centerLng: number;
  zoom: number;
  dignitaries: StateDignitary;
  roles: RoleHierarchyItem[];
}

export const ALL_INDIAN_STATES: Record<string, StateMetadata> = {
  // ── 1. Andhra Pradesh ─────────────────────────────────────────────────────
  ap: {
    code: "ap",
    name: "Andhra Pradesh",
    nativeName: "ఆంధ్రప్రదేశ్",
    portalName: "Meebhoomi (మీభూమి)",
    region: "South",
    dilrmpScore: "94.8%",
    dilrmpRank: "Top Tier",
    motto: "సత్యమేవ జయతే (Truth Alone Triumphs)",
    department: "Revenue & Land Administration Department",
    helpline: "1800-425-4440",
    emergencyNo: "1077",
    languages: ["Telugu", "English"],
    primaryLangCode: "te",
    rorName: "Adangal / 1B Record (అడంగల్ / 1B)",
    mapName: "FMB / Village Cadastral Map (గ్రామ పటం)",
    mutationName: "Mutation & Title Passbook (మ్యుటేషన్)",
    sampleDistrict: "Visakhapatnam (విశాఖపట్నం)",
    sampleTaluk: "Anandapuram Mandal",
    centerLat: 17.6868,
    centerLng: 83.2185,
    zoom: 13,
    dignitaries: {
      cmName: "N. Chandrababu Naidu",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Andhra Pradesh",
      rmName: "Anagani Satya Prasad",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Registration"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Holdings", desc: "Download digital Adangal, 1B Records, e-Passbook, and generate ZK title proofs.", powers: ["Adangal / 1B Download", "Apply Passbook Mutation", "SRO Encumbrance Check", "ZK Privacy Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "vro", title: "VRO — Village Revenue Officer", scope: "Anandapuram Village (LGD 584901)", desc: "Village level field inspection, crop cultivation adangal entry, and spot verification.", powers: ["Adangal Crop Entry", "Field Boundary Verification", "Enquiry Scrutiny", "Forward to RI"], href: "/portal/vao", cta: "Open VRO Desk" },
      { id: "ri", title: "RI — Revenue Inspector", scope: "Anandapuram Mandal", desc: "Mandal level mutation cross-verification and field enquiry certificate endorsement.", powers: ["Scrutinize VRO Reports", "Cross-Verify SRO EC", "Boundary Check", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tahsildar", title: "Tahsildar / Mandal Revenue Officer", scope: "Visakhapatnam Rural Mandal", desc: "Statutory authority for Meebhoomi 1B mutation, webland record update, and Polygon blockchain seal.", powers: ["Sanction 1B Mutation", "Webland Database Update", "Passbook Issuance", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "rdo", title: "RDO — Revenue Divisional Officer", scope: "Visakhapatnam Revenue Division", desc: "1st Appellate Tribunal for land title disputes, stay orders, and demarcation revisions.", powers: ["1st Appellate Hearing", "Issue Stay Order", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open RDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Visakhapatnam District", desc: "Apex district revenue administration, DILRMP oversight, and state portal audit logs.", powers: ["Apex Revision Override", "Emergency Fraud Freeze", "Government Land Assign", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 2. Arunachal Pradesh ──────────────────────────────────────────────────
  ar: {
    code: "ar",
    name: "Arunachal Pradesh",
    nativeName: "अरुणाचल प्रदेश",
    portalName: "Arunachal Land Record Management System",
    region: "North-East",
    dilrmpScore: "76.4%",
    dilrmpRank: "Expanding",
    motto: "Truth Alone Triumphs",
    department: "Department of Land Management",
    helpline: "1800-345-3850",
    emergencyNo: "1070",
    languages: ["English", "Hindi"],
    primaryLangCode: "en",
    rorName: "Land Possession Certificate (LPC)",
    mapName: "Cadastral Allotment Sketch",
    mutationName: "LPC Transfer & Recordation",
    sampleDistrict: "Papum Pare (Itanagar)",
    sampleTaluk: "Doimukh Circle",
    centerLat: 27.0844,
    centerLng: 93.6053,
    zoom: 13,
    dignitaries: {
      cmName: "Pema Khandu",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Arunachal Pradesh",
      rmName: "Balo Raja",
      rmTitle: "Hon'ble Land Mgmt Minister",
      rmDept: "Land Management & Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / LPC Holder Desk", scope: "Statewide Holdings", desc: "Download Land Possession Certificates, track allotment requests, and verify title status.", powers: ["LPC Certificate Download", "Apply LPC Renewal", "Cadastral Sketch View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "kanoongo", title: "Land Record Assistant", scope: "Itanagar Circle", desc: "Ground boundary verification, tribal community consent checks, and spot inspection.", powers: ["Field Boundary Check", "Community Consent Scrutiny", "Draft Inspection Report", "Forward to CO"], href: "/portal/vao", cta: "Open Assistant Desk" },
      { id: "co", title: "Circle Officer (CO)", scope: "Doimukh Circle", desc: "Circle level verification of allotment claims and boundary overlap scrutiny.", powers: ["Circle Scrutiny", "Land Valuation", "Overlap Inspection", "Recommend to EAC"], href: "/portal/ri", cta: "Open CO Desk" },
      { id: "eac", title: "Extra Assistant Commissioner (EAC)", scope: "Papum Pare District", desc: "Statutory authority for LPC sanction, record of rights update, and blockchain anchor.", powers: ["Sanction LPC Order", "Update Master Allotment", "Issue LPC Certificate", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open EAC Portal" },
      { id: "adc", title: "ADC — Additional Deputy Commissioner", scope: "Itanagar Division", desc: "Appellate hearing authority for boundary and customary land dispute resolution.", powers: ["Appellate Hearing", "Dispute Injunction", "Freeze Disputed Plot", "Order Re-Delimitation"], href: "/portal/rdo", cta: "Open ADC Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Papum Pare District", desc: "Apex district administrator for tribal land preservation, DILRMP oversight, and revenue logs.", powers: ["Apex District Override", "Customary Land Protection", "Audit Trail Inspector", "State Sync"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 3. Assam ──────────────────────────────────────────────────────────────
  as: {
    code: "as",
    name: "Assam",
    nativeName: "অসম",
    portalName: "Mission Basundhara / Dharitree (ধৰিত্ৰী)",
    region: "North-East",
    dilrmpScore: "91.2%",
    dilrmpRank: "High Progress",
    motto: "জয় আই অসম (Victory to Mother Assam)",
    department: "Revenue & Disaster Management Department",
    helpline: "1800-345-3574",
    emergencyNo: "1077",
    languages: ["Assamese", "English", "Bengali"],
    primaryLangCode: "as",
    rorName: "Jamabandi / Chitha (জমাবন্দী / চিঠা)",
    mapName: "Bhumitrace Cadastral Village Map",
    mutationName: "Namjari / Mutation (নামজাৰী)",
    sampleDistrict: "Kamrup Metropolitan (Guwahati)",
    sampleTaluk: "Dispur Revenue Circle",
    centerLat: 26.1445,
    centerLng: 91.7362,
    zoom: 13,
    dignitaries: {
      cmName: "Himanta Biswa Sarma",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Assam",
      rmName: "Jogen Mohan",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Holdings", desc: "Apply for Mission Basundhara services, download Jamabandi RoR, and track Namjari mutations.", powers: ["Jamabandi Download", "Apply Basundhara 3.0", "Namjari Mutation Request", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "latmandal", title: "Lat Mandal (লাট মণ্ডল)", scope: "Dispur Village (LGD 302801)", desc: "First-mile village inspection, Chitha crop record update, and field verification report.", powers: ["Chitha Record Entry", "Field Trace Inspection", "Local Enquiry", "Forward to SK"], href: "/portal/vao", cta: "Open Lat Mandal Desk" },
      { id: "sk", title: "Supervisor Kanungo (SK)", scope: "Dispur Revenue Circle", desc: "Circle level Namjari scrutiny, boundary overlap check, and recommendation to Circle Officer.", powers: ["Namjari Scrutiny", "Cross-Verify SRO Deed", "Circle Boundary Inspection", "Recommend to CO"], href: "/portal/ri", cta: "Open SK Desk" },
      { id: "co", title: "Circle Officer (CO)", scope: "Kamrup Metro Circle", desc: "Statutory authority for Namjari mutation orders, Dharitree register updates, and blockchain e-seal.", powers: ["Sanction Namjari Order", "Dharitree Database Update", "Issue Jamabandi Copy", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Circle Officer Portal" },
      { id: "adc", title: "ADC — Additional Deputy Commissioner", scope: "Kamrup Metro Division", desc: "1st Appellate Revenue Court for land dispute appeals, stay orders, and partition hearings.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Chitha", "Order Re-Survey"], href: "/portal/rdo", cta: "Open ADC Tribunal" },
      { id: "dc", title: "District Commissioner (DC)", scope: "Kamrup Metropolitan", desc: "Apex district revenue authority, Mission Basundhara monitor, and SHA-256 audit oversight.", powers: ["Apex District Override", "Basundhara System Monitor", "Assign Sarkari Land", "Audit Log Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 4. Bihar ──────────────────────────────────────────────────────────────
  br: {
    code: "br",
    name: "Bihar",
    nativeName: "बिहार",
    portalName: "BiharBhumi (बिहारभूमि / दाखिल खारिज)",
    region: "East",
    dilrmpScore: "87.3%",
    dilrmpRank: "Moderate Progress",
    motto: "सत्यमेव जयते",
    department: "Revenue & Land Reforms Department (राजस्व एवं भूमि सुधार विभाग)",
    helpline: "1800-345-6215",
    emergencyNo: "1077",
    languages: ["Hindi", "English", "Bhojpuri", "Maithili"],
    primaryLangCode: "hi",
    rorName: "Khatian / Jamabandi (खतियान / जमाबंदी पंजी)",
    mapName: "Bhu-Naksha Cadastral Map (भू-नक्शा)",
    mutationName: "Dakhil Kharij (दाखिल खारिज)",
    sampleDistrict: "Patna (पटना)",
    sampleTaluk: "Patna Sadar Anchal",
    centerLat: 25.5941,
    centerLng: 85.1376,
    zoom: 13,
    dignitaries: {
      cmName: "Nitish Kumar",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Bihar",
      rmName: "Dilip Kumar Jaiswal",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Land Reforms"
    },
    roles: [
      { id: "citizen", title: "Citizen / Raiyat Desk", scope: "Statewide Holdings", desc: "Download digital Khatian, view Jamabandi Panji-II, apply for online Dakhil Kharij mutation.", powers: ["Khatian & Jamabandi Download", "Apply Dakhil Kharij", "Bhu-Naksha Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "karamchari", title: "Rajaswa Karamchari (राजस्व कर्मचारी)", scope: "Patna Sadar Halka (LGD 214501)", desc: "First-mile field enquiry, Register-II verification, and spot mutation report submission.", powers: ["Register-II Cross Check", "Field Spot Enquiry", "Draft Verification Report", "Forward to CI"], href: "/portal/vao", cta: "Open Karamchari Desk" },
      { id: "ci", title: "Circle Inspector (CI / कानूनगो)", scope: "Patna Sadar Anchal", desc: "Anchal level scrutiny of Dakhil Kharij claims, registry verification, and recommendation to CO.", powers: ["Dakhil Kharij Scrutiny", "Registry Cross-Verification", "Anchal Inspection", "Recommend to CO"], href: "/portal/ri", cta: "Open Circle Inspector Desk" },
      { id: "co", title: "Circle Officer (CO / अंचलाधिकारी)", scope: "Patna Sadar Anchal", desc: "Statutory judicial authority for Dakhil Kharij court orders, Register-II mutation, and blockchain seal.", powers: ["Pass Dakhil Kharij Order", "Mutate Register-II Master", "Issue Shuddhi Patra", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open CO Portal" },
      { id: "dclr", title: "DCLR — Deputy Collector Land Reforms", scope: "Patna Sadar Sub-Division", desc: "1st Appellate Tribunal under BLDR Act, mutation appeals, stay orders, and dispute adjudication.", powers: ["BLDR Act Appellate Hearing", "Issue Stay Order", "Freeze Disputed Jamabandi", "Order Demarcation"], href: "/portal/rdo", cta: "Open DCLR Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "Patna District", desc: "Apex district revenue oversight, BiharBhumi digitization monitoring, and audit log inspection.", powers: ["Apex District Override", "BiharBhumi Monitor", "Gair Mazarua Land Control", "Audit Inspector"], href: "/portal/collector", cta: "Open DM Center" },
    ]
  },

  // ── 5. Chhattisgarh ───────────────────────────────────────────────────────
  cg: {
    code: "cg",
    name: "Chhattisgarh",
    nativeName: "छत्तीसगढ़",
    portalName: "Bhuiyan (भुइयां - छत्तीसगढ़ भू-अभिलेख)",
    region: "Central",
    dilrmpScore: "93.4%",
    dilrmpRank: "Top Tier",
    motto: "सत्यमेव जयते",
    department: "Revenue & Disaster Management Department",
    helpline: "1800-233-1155",
    emergencyNo: "1077",
    languages: ["Hindi", "Chhattisgarhi", "English"],
    primaryLangCode: "hi",
    rorName: "B1 Khatoni / Khasra P-II (बी-1 खतौनी / खसरा)",
    mapName: "Bhuiyan Bhu-Naksha (भू-नक्शा)",
    mutationName: "Namantaran (नामांतरण)",
    sampleDistrict: "Raipur (रायपुर)",
    sampleTaluk: "Raipur Tehsil",
    centerLat: 21.2514,
    centerLng: 81.6296,
    zoom: 13,
    dignitaries: {
      cmName: "Vishnu Deo Sai",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Chhattisgarh",
      rmName: "Tank Ram Verma",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Sports"
    },
    roles: [
      { id: "citizen", title: "Citizen / Bhumiswami Desk", scope: "Statewide Holdings", desc: "Download B-1 Khatoni, Khasra P-II, digitally signed Naksha, and apply for Namantaran online.", powers: ["B-1 Khatoni Download", "Apply Online Namantaran", "Bhu-Naksha Cadastral View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी हल्का)", scope: "Raipur Halka No. 12 (LGD 412801)", desc: "Field crop girdawari, field boundary measurement, and spot namantaran verification reports.", powers: ["Girdawari Crop Entry", "Spot Measurement", "Draft Enquiry Report", "Forward to RI"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "ri", title: "Revenue Inspector (RI / राजस्व निरीक्षक)", scope: "Raipur Circle", desc: "Circle level Namantaran scrutiny, registry deed cross-verification, and spot recommendation.", powers: ["Namantaran Scrutiny", "Registry Deed Cross-Check", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tehsildar", title: "Tehsildar / Naib Tehsildar", scope: "Raipur Tehsil", desc: "Statutory revenue authority for Namantaran court orders, Bhuiyan master update, and blockchain seal.", powers: ["Pass Namantaran Order", "Update Bhuiyan B-1 Master", "Issue Rin Pustika", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Raipur Sub-Division", desc: "1st Appellate Revenue Court under CG Land Revenue Code, stay orders, and demarcation appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khasra", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Raipur District", desc: "Apex district revenue administrator, Bhuiyan monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Bhuiyan System Monitor", "Nazul Land Administration", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 6. Goa ────────────────────────────────────────────────────────────────
  ga: {
    code: "ga",
    name: "Goa",
    nativeName: "गोंय / गोवा",
    portalName: "Dharnaksh (Directorate of Settlement & Land Records)",
    region: "West",
    dilrmpScore: "95.1%",
    dilrmpRank: "Top Tier",
    motto: "सर्वे भद्राणि पश्यन्तु मा कश्चिद् दुःखभाग् भवेत्",
    department: "Department of Revenue & Land Survey",
    helpline: "1800-233-0419",
    emergencyNo: "1077",
    languages: ["Konkani", "Marathi", "English"],
    primaryLangCode: "kok",
    rorName: "Form I & XIV / Form D (नमुना १ आणि १४)",
    mapName: "Cadastral Cadastre Sheet Map",
    mutationName: "Mutation (नामनोंदणी)",
    sampleDistrict: "North Goa (Panaji)",
    sampleTaluk: "Tiswadi Taluka",
    centerLat: 15.4909,
    centerLng: 73.8278,
    zoom: 13,
    dignitaries: {
      cmName: "Pramod Sawant",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Goa",
      rmName: "Atanasio Monserrate",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Town Planning"
    },
    roles: [
      { id: "citizen", title: "Citizen / Occupant Desk", scope: "Statewide Holdings", desc: "Download Form I & XIV, certified Cadastral Survey Plan, and apply for online Mutation.", powers: ["Form I & XIV Download", "Cadastral Survey Plan View", "Apply Online Mutation", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "talathi", title: "Talathi Desk (तलाठी)", scope: "Panaji Village (LGD 601901)", desc: "Ground verification, tenant and occupant rights check, and field mutation enquiry reports.", powers: ["Occupancy Verification", "Field Boundary Check", "Draft Enquiry Report", "Forward to Mamlatdar"], href: "/portal/vao", cta: "Open Talathi Desk" },
      { id: "inspector", title: "Field Inspector of Land Records", scope: "Tiswadi Taluka", desc: "Taluka level survey sheet cross-verification, partition demarcation, and Mamlatdar report.", powers: ["Cadastral Sheet Scrutiny", "Subdivision Demarcation", "Verify SRO Deed", "Recommend to Mamlatdar"], href: "/portal/ri", cta: "Open Inspector Desk" },
      { id: "mamlatdar", title: "Mamlatdar / Joint Mamlatdar", scope: "Tiswadi Taluka", desc: "Statutory judicial authority for Land Revenue Code mutation orders, Form I & XIV update, and blockchain seal.", powers: ["Pass Mutation Order", "Update Form I & XIV Master", "Issue Title Certificate", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Mamlatdar Portal" },
      { id: "sdo", title: "SDO / Deputy Collector", scope: "North Goa Sub-Division", desc: "1st Appellate Revenue Authority for title dispute appeals, Mundkar / Tenancy hearings, and stay orders.", powers: ["Appellate Hearing", "Mundkar & Tenancy Scrutiny", "Freeze Disputed Survey No", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "North Goa District", desc: "Apex district revenue administration, Comunidade & Government land protection, and audit logs.", powers: ["Apex District Override", "Comunidade Oversight", "Land Acquisition Control", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 7. Gujarat ────────────────────────────────────────────────────────────
  gj: {
    code: "gj",
    name: "Gujarat",
    nativeName: "ગુજરાત",
    portalName: "AnyRoR @ Anywhere (મહેસૂલ વિભાગ ગુજરાત)",
    region: "West",
    dilrmpScore: "95.6%",
    dilrmpRank: "Top Tier",
    motto: "સત્યમેવ જયતે",
    department: "Revenue Department (મહેસૂલ વિભાગ)",
    helpline: "1800-233-5500",
    emergencyNo: "1077",
    languages: ["Gujarati", "English", "Hindi"],
    primaryLangCode: "gu",
    rorName: "VF 7/12 & VF 8A (ગા.ન. ૭/૧૨ અને ૮-અ)",
    mapName: "E-Dhara Village Cadastral Map",
    mutationName: "Hakk Patrak Entry (હક્ક પત્રક નોંધ - ગા.ન. ૬)",
    sampleDistrict: "Ahmedabad (અમદાવાદ)",
    sampleTaluk: "Daskroi Taluka",
    centerLat: 23.0225,
    centerLng: 72.5714,
    zoom: 13,
    dignitaries: {
      cmName: "Bhupendra Patel",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Gujarat",
      rmName: "Kanubhai Desai",
      rmTitle: "Hon'ble Finance & Revenue",
      rmDept: "Revenue & Finance"
    },
    roles: [
      { id: "citizen", title: "Citizen / Khedut Desk", scope: "Statewide Holdings", desc: "Download VF 7/12, VF 8A, Hakka Patrak VF 6, and submit online E-Dhara mutation entries.", powers: ["VF 7/12 & 8A Download", "Apply Hakka Patrak Entry", "E-Dhara Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "talati", title: "Talati-cum-Mantri (તલાટી કમ મંત્રી)", scope: "Daskroi Village (LGD 510401)", desc: "Village level E-Dhara mutation entry, crop register entry, and spot inspection report.", powers: ["VF 6 Entry Generation", "Crop Vistar Entry", "Draft Verification Report", "Forward to Circle Officer"], href: "/portal/vao", cta: "Open Talati Desk" },
      { id: "circle", title: "Circle Officer (સર્કલ ઓફિસર)", scope: "Daskroi Circle", desc: "Circle level Hakka Patrak 135-D notice issuance, 30-day objection scrutiny, and Mamlatdar report.", powers: ["Issue 135-D Notice", "Objection Scrutiny", "Circle Boundary Inspection", "Recommend to Mamlatdar"], href: "/portal/ri", cta: "Open Circle Desk" },
      { id: "mamlatdar", title: "Mamlatdar / E-Dhara In-Charge", scope: "Daskroi Taluka", desc: "Statutory judicial authority for Hakka Patrak certification, VF 7/12 master mutation, and blockchain seal.", powers: ["Certify VF 6 Mutation", "Mutate VF 7/12 & 8A Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Mamlatdar Portal" },
      { id: "prant", title: "Prant Officer / SDO", scope: "Ahmedabad Rural Sub-Division", desc: "1st Appellate Revenue Tribunal under Gujarat Land Revenue Code, stay orders, and Non-Agri (NA) appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Survey No", "Order Re-Measurement"], href: "/portal/rdo", cta: "Open Prant Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Ahmedabad District", desc: "Apex district revenue oversight, AnyRoR system monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "AnyRoR System Monitor", "Sarkari Land Management", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 8. Haryana ────────────────────────────────────────────────────────────
  hr: {
    code: "hr",
    name: "Haryana",
    nativeName: "हरियाणा",
    portalName: "Jamabandi Haryana (वेब-हलरिस हरियाणा)",
    region: "North",
    dilrmpScore: "94.2%",
    dilrmpRank: "Top Tier",
    motto: "सेवा, सुरक्षा, सहयोग",
    department: "Revenue & Disaster Management Department",
    helpline: "1800-180-2117",
    emergencyNo: "1077",
    languages: ["Hindi", "English", "Punjabi"],
    primaryLangCode: "hi",
    rorName: "Nakal Jamabandi / Khasra Girdawari (नकल जमाबंदी)",
    mapName: "Haryana Bhu-Naksha Cadastral Map",
    mutationName: "Intkal (इंतकाल / Mutation)",
    sampleDistrict: "Gurugram (गुरुग्राम)",
    sampleTaluk: "Gurugram Tehsil",
    centerLat: 28.4595,
    centerLng: 77.0266,
    zoom: 13,
    dignitaries: {
      cmName: "Nayab Singh Saini",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Haryana",
      rmName: "Vipul Goel",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download Nakal Jamabandi, track online Intkal mutation, and check registered registry deeds.", powers: ["Jamabandi Nakal Download", "Track Intkal Mutation", "Khasra Girdawari View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी)", scope: "Gurugram Halka (LGD 105801)", desc: "Entering Parat Patwar mutation, Khasra Girdawari crop inspection, and ground measurement reports.", powers: ["Parat Patwar Entry", "Girdawari Inspection", "Draft Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "kanoongo", title: "Field Kanoongo (कानूनगो)", scope: "Gurugram Circle", desc: "Circle level Intkal scrutiny, registry deed cross-verification, and field boundary comparison.", powers: ["Intkal Scrutiny", "Verify Tehsil Registry", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanoongo Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Registrar", scope: "Gurugram Tehsil", desc: "Statutory judicial authority for Intkal sanction, Jamabandi master update, and Polygon blockchain seal.", powers: ["Sanction Intkal Order", "Mutate Jamabandi Master", "Integrated Registry Seal", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Gurugram Sub-Division", desc: "1st Appellate Revenue Court under Punjab Land Revenue Act, stay orders, and partition hearings.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khewat", "Order Re-Partition"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Gurugram District", desc: "Apex district revenue oversight, Web-HALRIS monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Web-HALRIS Monitor", "Shamlat Land Administration", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 9. Himachal Pradesh ───────────────────────────────────────────────────
  hp: {
    code: "hp",
    name: "Himachal Pradesh",
    nativeName: "हिमाचल प्रदेश",
    portalName: "Himbhoomi (हिमभूमि भू-अभिलेख)",
    region: "North",
    dilrmpScore: "91.8%",
    dilrmpRank: "High Progress",
    motto: "सत्यमेव जयते",
    department: "Department of Revenue",
    helpline: "1800-180-8009",
    emergencyNo: "1077",
    languages: ["Hindi", "English"],
    primaryLangCode: "hi",
    rorName: "Jamabandi / Shajra Nasb (जमाबंदी / शजरा नसब)",
    mapName: "Him Bhu-Naksha Cadastral Map",
    mutationName: "Intkal Mutation (इंतकाल)",
    sampleDistrict: "Shimla (शिमला)",
    sampleTaluk: "Shimla Rural Tehsil",
    centerLat: 31.1048,
    centerLng: 77.1734,
    zoom: 13,
    dignitaries: {
      cmName: "Sukhvinder Singh Sukhu",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Himachal Pradesh",
      rmName: "Jagat Singh Negi",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Tribal Dev"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download Himbhoomi Jamabandi, Shajra Nasb pedigree tree, and track online Intkal mutations.", powers: ["Jamabandi Download", "Shajra Nasb View", "Track Intkal Status", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी)", scope: "Shimla Rural Halka (LGD 102401)", desc: "Hill terrain field inspection, crop girdawari entry, and spot mutation verification reports.", powers: ["Field Girdawari Entry", "Spot Terrain Measurement", "Draft Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "kanoongo", title: "Kanungo (कानूनगो)", scope: "Shimla Circle", desc: "Circle level Intkal scrutiny, Section 118 non-farmer land check, and recommendation to Tehsildar.", powers: ["Intkal Scrutiny", "Section 118 Compliance Check", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanungo Desk" },
      { id: "tehsildar", title: "Tehsildar / Naib Tehsildar", scope: "Shimla Rural Tehsil", desc: "Statutory judicial authority for Intkal orders, Himbhoomi master mutation, and blockchain seal.", powers: ["Pass Intkal Order", "Mutate Himbhoomi Master", "Issue Jamabandi Copy", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Shimla Sub-Division", desc: "1st Appellate Revenue Court under HP Land Revenue Act, stay orders, and Section 118 appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khasra", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Shimla District", desc: "Apex district revenue oversight, Himbhoomi monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Himbhoomi System Monitor", "Section 118 Approvals", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 10. Jharkhand ─────────────────────────────────────────────────────────
  jh: {
    code: "jh",
    name: "Jharkhand",
    nativeName: "झारखंड",
    portalName: "Jharbhoomi (झारभूमि - अपना खाता)",
    region: "East",
    dilrmpScore: "86.5%",
    dilrmpRank: "Moderate Progress",
    motto: "सत्यमेव जयते",
    department: "Department of Revenue, Registration & Land Reforms",
    helpline: "1800-345-6527",
    emergencyNo: "1077",
    languages: ["Hindi", "Santhali", "English"],
    primaryLangCode: "hi",
    rorName: "Khatiyan / Register-II (खतियान / पंजी-२)",
    mapName: "Jharbhoomi Bhu-Naksha",
    mutationName: "Dakhil Kharij (दाखिल खारिज)",
    sampleDistrict: "Ranchi (राँची)",
    sampleTaluk: "Ranchi Sadar Anchal",
    centerLat: 23.3441,
    centerLng: 85.3096,
    zoom: 13,
    dignitaries: {
      cmName: "Hemant Soren",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Jharkhand",
      rmName: "Deepak Birua",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Land Reforms"
    },
    roles: [
      { id: "citizen", title: "Citizen / Raiyat Desk", scope: "Statewide Holdings", desc: "Download Jharbhoomi Khatiyan, view Register-II online, and apply for Dakhil Kharij mutation.", powers: ["Khatiyan Download", "Apply Dakhil Kharij", "View Register-II", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "karamchari", title: "Rajaswa Karamchari (राजस्व कर्मचारी)", scope: "Ranchi Sadar Halka (LGD 208401)", desc: "Field spot enquiry, CNT / SPT Act tribal land compliance check, and verification reports.", powers: ["CNT/SPT Compliance Check", "Field Spot Verification", "Draft Enquiry Report", "Forward to CI"], href: "/portal/vao", cta: "Open Karamchari Desk" },
      { id: "ci", title: "Circle Inspector (CI / कानूनगो)", scope: "Ranchi Sadar Anchal", desc: "Anchal level Dakhil Kharij scrutiny, deed cross-verification, and recommendation to CO.", powers: ["Dakhil Kharij Scrutiny", "Verify SRO Registry", "Anchal Boundary Inspection", "Recommend to CO"], href: "/portal/ri", cta: "Open CI Desk" },
      { id: "co", title: "Circle Officer (CO / अंचलाधिकारी)", scope: "Ranchi Sadar Anchal", desc: "Statutory authority for Dakhil Kharij court orders, Register-II update, and blockchain seal.", powers: ["Pass Dakhil Kharij Order", "Mutate Register-II Master", "Issue Shuddhi Patra", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open CO Portal" },
      { id: "dclr", title: "DCLR — Land Reforms Deputy Collector", scope: "Ranchi Sub-Division", desc: "1st Appellate Revenue Tribunal under Jharkhand Land Reforms Act, stay orders, and CNT Act appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open DCLR Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Ranchi District", desc: "Apex district revenue administrator, Jharbhoomi monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Jharbhoomi System Monitor", "Tribal Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 11. Karnataka ─────────────────────────────────────────────────────────
  ka: {
    code: "ka",
    name: "Karnataka",
    nativeName: "ಕರ್ನಾಟಕ",
    portalName: "Bhoomi (ಭೂಮಿ - ಕರ್ನಾಟಕ ಭೂದಾಖಲೆಗಳು)",
    region: "South",
    dilrmpScore: "96.1%",
    dilrmpRank: "Top Tier",
    motto: "ಸತ್ಯಮೇವ ಜಯತೇ",
    department: "Revenue Department (ಕಂದಾಯ ಇಲಾಖೆ)",
    helpline: "1800-425-6677",
    emergencyNo: "1077",
    languages: ["Kannada", "English"],
    primaryLangCode: "kn",
    rorName: "RTC / Pahani (ಆರ್‌ಟಿಸಿ / ಪಹಣಿ)",
    mapName: "Tippani & Mojini Cadastral Sketch (ಮೋಜಣಿ)",
    mutationName: "Mutation MR (ಮ್ಯುಟೇಶನ್ ರಿಜಿಸ್ಟರ್)",
    sampleDistrict: "Bengaluru Urban (ಬೆಂಗಳೂರು)",
    sampleTaluk: "Bengaluru South Taluk",
    centerLat: 12.9716,
    centerLng: 77.5946,
    zoom: 13,
    dignitaries: {
      cmName: "Siddaramaiah",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Karnataka",
      rmName: "Krishna Byre Gowda",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue Department"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download certified RTC Pahani, view Mutation Register (MR), and apply for online Mutation.", powers: ["RTC Pahani Download", "Apply Online Mutation", "Mojini Sketch View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "va", title: "Village Accountant (ಗ್ರಾಮ ಲೆಕ್ಕಿಗ)", scope: "Bengaluru South Village (LGD 598401)", desc: "First-mile RTC crop entry, field measurement inspection, and local enquiry reports.", powers: ["RTC Crop Entry", "Field Inspection", "Local Verification", "Forward to RI"], href: "/portal/vao", cta: "Open VA Desk" },
      { id: "ri", title: "Revenue Inspector (ಕಂದಾಯ ನಿರೀಕ್ಷಕ)", scope: "Bengaluru South Hobli", desc: "Hobli level Mutation scrutiny, SRO registration cross-check, and Tahsildar recommendation.", powers: ["Mutation Scrutiny", "SRO Cross-Check", "Hobli Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tahsildar", title: "Tahsildar / Sub-Tahsildar", scope: "Bengaluru South Taluk", desc: "Statutory sanction for Mutation Orders, Bhoomi database mutation, and Polygon blockchain seal.", powers: ["Sanction Mutation Order", "Bhoomi System Mutate", "Aakarbandh Update", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "ac", title: "Assistant Commissioner (AC)", scope: "Bengaluru Sub-Division", desc: "1st Appellate Tribunal for RTC Pahani disputes, interim stay orders, and survey demarcation orders.", powers: ["1st Appellate Hearing", "Issue Stay Order", "Freeze Bhoomi RTC", "Order Re-Survey"], href: "/portal/rdo", cta: "Open AC Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Bengaluru Urban District", desc: "Apex District Commissioner oversight, Bhoomi monitoring, and emergency land dispute overrides.", powers: ["Apex DC Override", "Bhoomi System Monitor", "Government Land Assign", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 12. Kerala ────────────────────────────────────────────────────────────
  kl: {
    code: "kl",
    name: "Kerala",
    nativeName: "കേരളം",
    portalName: "e-Rekha & Ente Bhoomi (എന്റെ ഭൂമി)",
    region: "South",
    dilrmpScore: "94.5%",
    dilrmpRank: "Top Tier",
    motto: "സത്യമേവ ജയതേ",
    department: "Revenue & Land Survey Department (റവന്യൂ വകുപ്പ്)",
    helpline: "1800-425-5020",
    emergencyNo: "1077",
    languages: ["Malayalam", "English"],
    primaryLangCode: "ml",
    rorName: "Thandaper & RoR (തണ്ടപ്പേര് / ആർ.ഒ.ആർ)",
    mapName: "Survey & Resurvey Field Sketch (എഫ്.എം.ബി)",
    mutationName: "Pokkuvaravu / Mutation (പോക്കുവരവ്)",
    sampleDistrict: "Thiruvananthapuram (തിരുവനന്തപുരം)",
    sampleTaluk: "Thiruvananthapuram Taluk",
    centerLat: 8.5241,
    centerLng: 76.9366,
    zoom: 13,
    dignitaries: {
      cmName: "Pinarayi Vijayan",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Kerala",
      rmName: "K. Rajan",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Housing"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download Thandaper account extract, view Resurvey maps on e-Rekha, and apply for Pokkuvaravu.", powers: ["Thandaper Extract Download", "Apply Online Pokkuvaravu", "e-Rekha FMB View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "vo", title: "Village Officer (വില്ലേജ് ഓഫീസർ)", scope: "Trivandrum Village (LGD 628401)", desc: "First-mile field enquiry, Thandaper verification, land tax assessment, and report generation.", powers: ["Thandaper Verification", "Field Spot Inspection", "Land Tax Assessment", "Forward to Taluk"], href: "/portal/vao", cta: "Open Village Desk" },
      { id: "tso", title: "Taluk Surveyor (താലൂക്ക് സർവേയർ)", scope: "Trivandrum Taluk", desc: "Digital resurvey boundary verification, GPS coordinate cross-check, and subdivision demarcation.", powers: ["Resurvey Verification", "GPS Boundary Check", "Verify SRO Deed", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open Surveyor Desk" },
      { id: "tahsildar", title: "Tahsildar (Land Records)", scope: "Thiruvananthapuram Taluk", desc: "Statutory authority for Pokkuvaravu orders, e-Rekha master record mutation, and blockchain seal.", powers: ["Pass Pokkuvaravu Order", "Mutate e-Rekha Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "rdo", title: "RDO — Revenue Divisional Officer", scope: "Thiruvananthapuram Division", desc: "1st Appellate Revenue Tribunal under Kerala Land Relinquishment & Revenue Code, stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Thandaper", "Order Re-Survey"], href: "/portal/rdo", cta: "Open RDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Thiruvananthapuram District", desc: "Apex district revenue oversight, Ente Bhoomi digital survey monitoring, and SHA-256 audit logs.", powers: ["Apex District Override", "Ente Bhoomi Monitor", "Puramboke Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 13. Madhya Pradesh ────────────────────────────────────────────────────
  mp: {
    code: "mp",
    name: "Madhya Pradesh",
    nativeName: "मध्य प्रदेश",
    portalName: "MP Bhulekh (म.प्र. भूलेख - सारा पोर्टल)",
    region: "Central",
    dilrmpScore: "95.2%",
    dilrmpRank: "Top Tier",
    motto: "सत्यमेव जयते",
    department: "Revenue Department (राजस्व विभाग)",
    helpline: "1800-233-1080",
    emergencyNo: "1077",
    languages: ["Hindi", "English"],
    primaryLangCode: "hi",
    rorName: "Khasra / Khatauni (खसरा / खतौनी नकल)",
    mapName: "MP Bhu-Naksha Cadastral Map",
    mutationName: "Namantaran / Batwara (नामांतरण / बंटवारा)",
    sampleDistrict: "Bhopal (भोपाल)",
    sampleTaluk: "Huzur Tehsil",
    centerLat: 23.2599,
    centerLng: 77.4126,
    zoom: 13,
    dignitaries: {
      cmName: "Mohan Yadav",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Madhya Pradesh",
      rmName: "Karan Singh Verma",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue Department"
    },
    roles: [
      { id: "citizen", title: "Citizen / Krishak Desk", scope: "Statewide Holdings", desc: "Download MP Bhulekh Khasra-Khatauni, view Bhu-Naksha, and apply for automated Namantaran.", powers: ["Khasra-Khatauni Download", "Apply Online Namantaran", "Bhu-Naksha Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी हल्का)", scope: "Huzur Halka No. 8 (LGD 408201)", desc: "SAARA portal girdawari crop entry, field boundary verification, and spot enquiry reports.", powers: ["SAARA Girdawari Entry", "Spot Measurement", "Draft Verification Report", "Forward to RI"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "ri", title: "Revenue Inspector (RI / राजस्व निरीक्षक)", scope: "Huzur Circle", desc: "Circle level Namantaran scrutiny, cyber tehsil deed cross-verification, and spot recommendations.", powers: ["Namantaran Scrutiny", "Cyber Tehsil Cross-Check", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tehsildar", title: "Tehsildar / Cyber Tehsildar", scope: "Huzur Tehsil", desc: "Statutory judicial authority for Namantaran orders, MP Bhulekh master update, and blockchain seal.", powers: ["Pass Namantaran Order", "Mutate MP Bhulekh Master", "Issue Rin Pustika", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Bhopal Sub-Division", desc: "1st Appellate Revenue Court under MP Land Revenue Code 1959, stay orders, and Batwara appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khasra", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Bhopal District", desc: "Apex district revenue oversight, SAARA & Bhulekh monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "MP Bhulekh Monitor", "Nazul Land Administration", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 14. Maharashtra ───────────────────────────────────────────────────────
  mh: {
    code: "mh",
    name: "Maharashtra",
    nativeName: "महाराष्ट्र",
    portalName: "Mahabhulekh / Aapli Chawadi (महाभूलेख - ७/१२)",
    region: "West",
    dilrmpScore: "95.8%",
    dilrmpRank: "Top Tier",
    motto: "प्रतिपच्चन्द्रलेखेव वर्धिष्णुर्विश्ववन्दिता",
    department: "Revenue & Forest Department (महसूल व वन विभाग)",
    helpline: "1800-120-8040",
    emergencyNo: "1077",
    languages: ["Marathi", "English"],
    primaryLangCode: "mr",
    rorName: "7/12 Satbara & 8A (सातबारा उतारा व ८-अ)",
    mapName: "e-Mojani & Cadastral Nakasha (मोजणी नकाशा)",
    mutationName: "Ferfar Mutation (फेरफार नोंद - नमुना ६)",
    sampleDistrict: "Pune (पुणे)",
    sampleTaluk: "Haveli Taluka",
    centerLat: 18.5204,
    centerLng: 73.8567,
    zoom: 13,
    dignitaries: {
      cmName: "Devendra Fadnavis",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Maharashtra",
      rmName: "Radhakrishna Vikhe Patil",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Forest"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download digitally signed 7/12 Satbara & 8A Extracts, apply for Ferfar mutation online.", powers: ["7/12 Satbara Download", "Apply Online Ferfar", "e-Mojani Request", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "talathi", title: "Talathi Desk (तलाठी दप्तर)", scope: "Haveli Village (LGD 528901)", desc: "Village level 7/12 register updates, Crop Goshwara entry, and field verification reports.", powers: ["7/12 Register Update", "Crop Goshwara Entry", "Local Verification", "Forward to Circle Officer"], href: "/portal/vao", cta: "Open Talathi Desk" },
      { id: "circle", title: "Circle Officer (मंडळ अधिकारी)", scope: "Haveli Circle (6 Villages)", desc: "Circle level Ferfar dispute scrutiny, spot inspection, and Mutation approval recommendations.", powers: ["Ferfar Scrutiny", "Spot Inspection", "Certify Mutation", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Circle Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Tehsildar", scope: "Haveli Taluka (Pune)", desc: "Statutory sanction for 7/12 Satbara changes, Non-Agricultural (NA) land orders, and blockchain e-seal.", powers: ["Sanction Satbara Order", "NA Permission Sanction", "e-Mojani Approval", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Desk" },
      { id: "sdo", title: "SDO — Sub-Divisional Officer", scope: "Pune Sub-Division", desc: "1st Appellate Tribunal for 7/12 Satbara appeals, stay orders on disputed land, and re-measurement orders.", powers: ["1st Appellate Hearing", "Issue Stay Order", "Freeze Satbara Record", "Order Re-Measurement"], href: "/portal/rdo", cta: "Open SDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Pune District", desc: "Apex district revenue oversight, Mahabhulekh monitoring, and emergency land dispute overrides.", powers: ["Apex Revision Override", "Mahabhulekh Monitor", "Government Land Assign", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 15. Manipur ───────────────────────────────────────────────────────────
  mn: {
    code: "mn",
    name: "Manipur",
    nativeName: "মণিপুর / লৈপাক",
    portalName: "Loucha Pathap (লৌচা পথাপ)",
    region: "North-East",
    dilrmpScore: "81.4%",
    dilrmpRank: "Progressing",
    motto: "Truth Alone Triumphs",
    department: "Revenue Department",
    helpline: "1800-345-3818",
    emergencyNo: "1070",
    languages: ["Manipuri (Meitei)", "English"],
    primaryLangCode: "mni",
    rorName: "Jamabandi / Patta (জমাবন্দী / পত্তা)",
    mapName: "Dag & Cadastral Chitha Map",
    mutationName: "Mutation / Dakhil Kharij",
    sampleDistrict: "Imphal West (ইম্ফাল)",
    sampleTaluk: "Lamphelpat Sub-Division",
    centerLat: 24.8170,
    centerLng: 93.9368,
    zoom: 13,
    dignitaries: {
      cmName: "N. Biren Singh",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Manipur",
      rmName: "Awangbow Newmai",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Water Resources & Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Holdings", desc: "Download digital Jamabandi, view Dag chitha records, and track online mutation petitions.", powers: ["Jamabandi Download", "Track Mutation Petition", "Dag Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "mandol", title: "Mandol (মণ্ডল)", scope: "Lamphel Halka (LGD 264101)", desc: "Field Dag boundary verification, spot enquiry, and local report submission to Kanungo.", powers: ["Dag Boundary Check", "Spot Enquiry", "Draft Verification Report", "Forward to SK"], href: "/portal/vao", cta: "Open Mandol Desk" },
      { id: "sk", title: "Supervisor Kanungo (SK)", scope: "Lamphelpat Circle", desc: "Circle level mutation scrutiny, SRO deed cross-verification, and SDC recommendation.", powers: ["Mutation Scrutiny", "SRO Registry Cross-Check", "Circle Boundary Inspection", "Recommend to SDC"], href: "/portal/ri", cta: "Open SK Desk" },
      { id: "sdc", title: "Sub-Deputy Collector (SDC)", scope: "Imphal West Tehsil", desc: "Statutory authority for Jamabandi mutation orders, Loucha Pathap master update, and blockchain seal.", powers: ["Sanction Mutation Order", "Update Loucha Pathap", "Issue Certified Patta", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open SDC Portal" },
      { id: "sdm", title: "SDM / SDO", scope: "Imphal West Sub-Division", desc: "1st Appellate Revenue Court under MLR & LR Act, interim stay orders, and boundary appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Dag", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Imphal West District", desc: "Apex district revenue administrator, Loucha Pathap monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Loucha Pathap Monitor", "State Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 16. Meghalaya ─────────────────────────────────────────────────────────
  ml: {
    code: "ml",
    name: "Meghalaya",
    nativeName: "Meghalaya (Ka Ri Khasi)",
    portalName: "Meghalaya Land Records & Revenue Portal",
    region: "North-East",
    dilrmpScore: "78.9%",
    dilrmpRank: "Progressing",
    motto: "Truth Alone Triumphs",
    department: "Revenue & Disaster Management Department",
    helpline: "1800-345-3710",
    emergencyNo: "1077",
    languages: ["Khasi", "Garo", "English"],
    primaryLangCode: "en",
    rorName: "Land Holding Certificate / Patta",
    mapName: "Cadastral Survey Map",
    mutationName: "Transfer of Land Holding",
    sampleDistrict: "East Khasi Hills (Shillong)",
    sampleTaluk: "Mylliem Community Block",
    centerLat: 25.5788,
    centerLng: 91.8933,
    zoom: 13,
    dignitaries: {
      cmName: "Conrad Sangma",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Meghalaya",
      rmName: "Kyrmen Shylla",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download Land Holding Certificates, check tribal land transfer status, and verify title records.", powers: ["Holding Certificate Download", "Apply Land Transfer", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "surveyor", title: "Revenue Surveyor", scope: "Shillong Circle", desc: "Ground boundary demarcation, Autonomous District Council (ADC) NOC verification, and spot enquiry.", powers: ["Ground Demarcation", "ADC NOC Verification", "Draft Inspection Report", "Forward to EAC"], href: "/portal/vao", cta: "Open Surveyor Desk" },
      { id: "co", title: "Circle Officer", scope: "Mylliem Block", desc: "Block level scrutiny of land holding transfers and customary tribal title cross-checks.", powers: ["Transfer Scrutiny", "Verify Customary Title", "Boundary Inspection", "Recommend to EAC"], href: "/portal/ri", cta: "Open CO Desk" },
      { id: "eac", title: "Extra Assistant Commissioner (EAC)", scope: "East Khasi Hills", desc: "Statutory authority for Land Holding Certificate sanction and blockchain seal.", powers: ["Sanction Land Certificate", "Update Revenue Register", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open EAC Portal" },
      { id: "adc", title: "ADC — Additional Deputy Commissioner", scope: "Shillong Sub-Division", desc: "Appellate hearing authority for land boundary disputes and Land Transfer Act appeals.", powers: ["Appellate Hearing", "Dispute Injunction", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open ADC Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "East Khasi Hills District", desc: "Apex district administrator, Land Transfer Act enforcement, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Tribal Land Protection", "Audit Trail Inspector", "State Sync"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 17. Mizoram ───────────────────────────────────────────────────────────
  mz: {
    code: "mz",
    name: "Mizoram",
    nativeName: "Mizoram (Ram)",
    portalName: "Land Revenue & Settlement (LRS Portal)",
    region: "North-East",
    dilrmpScore: "82.1%",
    dilrmpRank: "Progressing",
    motto: "Sem sem dam dam, ei bil thi thi",
    department: "Land Revenue & Settlement Department",
    helpline: "1800-345-3830",
    emergencyNo: "1070",
    languages: ["Mizo", "English"],
    primaryLangCode: "en",
    rorName: "Land Settlement Certificate (LSC) / Periodic Patta",
    mapName: "Cadastral Boundary Plot Sketch",
    mutationName: "Ownership Transfer / Mutation",
    sampleDistrict: "Aizawl (Aizawl)",
    sampleTaluk: "Tlangnuam Block",
    centerLat: 23.7271,
    centerLng: 92.7176,
    zoom: 13,
    dignitaries: {
      cmName: "Lalduhoma",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Mizoram",
      rmName: "B. Lalchhanzova",
      rmTitle: "Hon'ble Land Revenue Minister",
      rmDept: "Land Revenue & Settlement"
    },
    roles: [
      { id: "citizen", title: "Citizen / LSC Holder Desk", scope: "Statewide Holdings", desc: "Download Land Settlement Certificates (LSC), view digital plot maps, and apply for transfers.", powers: ["LSC Certificate Download", "Apply Ownership Transfer", "Plot Sketch View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "surveyor", title: "Field Surveyor", scope: "Aizawl Circle", desc: "Hill slope contour measurement, boundary demarcation, and local village council reports.", powers: ["Slope Demarcation", "Village Council Scrutiny", "Draft Inspection Report", "Forward to ASO"], href: "/portal/vao", cta: "Open Surveyor Desk" },
      { id: "aso2", title: "Assistant Settlement Officer-II", scope: "Tlangnuam Circle", desc: "Circle level LSC mutation scrutiny, deed cross-verification, and recommendation to ASO-I.", powers: ["LSC Scrutiny", "Verify Registry Deed", "Boundary Verification", "Recommend to ASO-I"], href: "/portal/ri", cta: "Open ASO-II Desk" },
      { id: "aso1", title: "Assistant Settlement Officer-I", scope: "Aizawl District", desc: "Statutory authority for LSC sanction, master register mutation, and Polygon blockchain seal.", powers: ["Sanction LSC Transfer", "Update Settlement Master", "Issue Certified LSC", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open ASO-I Portal" },
      { id: "dso", title: "Director / Settlement Officer", scope: "Aizawl Division", desc: "Appellate authority for land settlement appeals, boundary disputes, and stay orders.", powers: ["Appellate Hearing", "Issue Interim Stay", "Freeze Disputed LSC", "Order Re-Survey"], href: "/portal/rdo", cta: "Open DSO Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Aizawl District", desc: "Apex district administrator, Land Revenue monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Revenue System Monitor", "State Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 18. Nagaland ──────────────────────────────────────────────────────────
  nl: {
    code: "nl",
    name: "Nagaland",
    nativeName: "Nagaland",
    portalName: "Nagaland Land Records & Cadastral Portal",
    region: "North-East",
    dilrmpScore: "74.8%",
    dilrmpRank: "Progressing",
    motto: "Unity",
    department: "Department of Land Revenue",
    helpline: "1800-345-3705",
    emergencyNo: "1070",
    languages: ["English", "Nagamese"],
    primaryLangCode: "en",
    rorName: "Land Possession Certificate (LPC) / Jamabandi",
    mapName: "Cadastral Village Boundary Map",
    mutationName: "Land Recordation & Mutation",
    sampleDistrict: "Kohima (Kohima)",
    sampleTaluk: "Kohima Sadar Block",
    centerLat: 25.6751,
    centerLng: 94.1086,
    zoom: 13,
    dignitaries: {
      cmName: "Neiphiu Rio",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Nagaland",
      rmName: "T.R. Zeliang",
      rmTitle: "Hon'ble Dy. Chief Minister",
      rmDept: "Planning & Land Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "Statewide Holdings", desc: "Download Land Possession Certificates, track customary land records, and generate ZK title proofs.", powers: ["LPC Certificate Download", "Track Land Registration", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "surveyor", title: "Land Record Surveyor", scope: "Kohima Circle", desc: "Ground boundary verification, Village Council consent scrutiny, and inspection report.", powers: ["Ground Demarcation", "Village Council Verification", "Draft Enquiry Report", "Forward to SDO"], href: "/portal/vao", cta: "Open Surveyor Desk" },
      { id: "lro", title: "Land Record Officer (LRO)", scope: "Kohima Sadar", desc: "Circle level scrutiny of customary land transfers and Article 371A compliance checks.", powers: ["LRO Scrutiny", "Article 371A Check", "Boundary Inspection", "Recommend to SDO"], href: "/portal/ri", cta: "Open LRO Desk" },
      { id: "sdo", title: "SDO (Civil) / Revenue Officer", scope: "Kohima Sub-Division", desc: "Statutory authority for LPC sanction, land records update, and Polygon blockchain seal.", powers: ["Sanction LPC Order", "Update Master Record", "Issue Certified LPC", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open SDO Portal" },
      { id: "adc", title: "Additional Deputy Commissioner (ADC)", scope: "Kohima Division", desc: "Appellate authority for customary land disputes, boundary injunctions, and stay orders.", powers: ["Appellate Hearing", "Dispute Injunction", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open ADC Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Kohima District", desc: "Apex district administrator, Article 371A land oversight, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Customary Land Protection", "Audit Trail Inspector", "State Sync"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 19. Odisha ────────────────────────────────────────────────────────────
  od: {
    code: "od",
    name: "Odisha",
    nativeName: "ଓଡ଼ିଶା",
    portalName: "Bhulekh Odisha (ଭୂଲେଖ ଓଡ଼ିଶା)",
    region: "East",
    dilrmpScore: "95.0%",
    dilrmpRank: "Top Tier",
    motto: "ସତ୍ୟମେବ ଜୟତେ",
    department: "Revenue & Disaster Management Department",
    helpline: "1800-345-6770",
    emergencyNo: "1077",
    languages: ["Odia", "English"],
    primaryLangCode: "or",
    rorName: "RoR / Khatiyan (ଖତିୟାନ / ସ୍ୱତ୍ତ୍ୱଲିପି)",
    mapName: "Bhunaksha Odisha Cadastral Map (ଭୂନକ୍ସା)",
    mutationName: "Dakhil Kharaj / Mutation (ଦାଖଲ ଖାରଜ)",
    sampleDistrict: "Khordha (Bhubaneswar)",
    sampleTaluk: "Bhubaneswar Tehsil",
    centerLat: 20.2961,
    centerLng: 85.8245,
    zoom: 13,
    dignitaries: {
      cmName: "Mohan Charan Majhi",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Odisha",
      rmName: "Suresh Pujari",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Rayat Desk", scope: "Statewide Holdings", desc: "Download Bhulekh Khatiyan RoR, view high-res Bhunaksha, and apply for online Mutation.", powers: ["Khatiyan RoR Download", "Apply Online Mutation", "Bhunaksha Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "ari", title: "Assistant Revenue Inspector (ARI)", scope: "Bhubaneswar Halka (LGD 324101)", desc: "Village level field inspection, crop cultivation entry, and spot mutation enquiry reports.", powers: ["Field Spot Inspection", "Crop Cultivation Entry", "Draft Verification Report", "Forward to RI"], href: "/portal/vao", cta: "Open ARI Desk" },
      { id: "ri", title: "Revenue Inspector (RI / ରାଜସ୍ୱ ନିରୀକ୍ଷକ)", scope: "Bhubaneswar Circle", desc: "Circle level Mutation scrutiny, e-Registration deed cross-check, and recommendation to Tahsildar.", powers: ["Mutation Scrutiny", "e-Registration Cross-Check", "Circle Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tahsildar", title: "Tahsildar / Additional Tahsildar", scope: "Bhubaneswar Tehsil", desc: "Statutory judicial authority for Mutation Case orders, Bhulekh master update, and blockchain seal.", powers: ["Pass Mutation Order", "Mutate Bhulekh Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "subcollector", title: "Sub-Collector / SDM", scope: "Bhubaneswar Sub-Division", desc: "1st Appellate Revenue Court under Odisha Land Reforms Act, stay orders, and demarcation appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open Sub-Collector Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Khordha District", desc: "Apex district revenue administrator, Bhulekh monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Bhulekh System Monitor", "Sarkari Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 20. Punjab ────────────────────────────────────────────────────────────
  pb: {
    code: "pb",
    name: "Punjab",
    nativeName: "ਪੰਜਾਬ",
    portalName: "PLRS Jamabandi (ਪੰਜਾਬ ਲੈਂਡ ਰਿਕਾਰਡ ਸੁਸਾਇਟੀ)",
    region: "North",
    dilrmpScore: "93.9%",
    dilrmpRank: "Top Tier",
    motto: "ਜੈ ਜਵਾਨ ਜੈ ਕਿਸਾਨ",
    department: "Department of Revenue, Rehabilitation & Disaster Management",
    helpline: "1800-180-2468",
    emergencyNo: "1077",
    languages: ["Punjabi", "English"],
    primaryLangCode: "pa",
    rorName: "Fard Jamabandi (ਫਰਦ ਜਮ੍ਹਾਂਬੰਦੀ)",
    mapName: "Cadastral Mussavi & Shajra Map (ਮੁਸਾਵੀ)",
    mutationName: "Intkal Mutation (ਇੰਤਕਾਲ)",
    sampleDistrict: "Ludhiana (ਲੁਧਿਆਣਾ)",
    sampleTaluk: "Ludhiana East Tehsil",
    centerLat: 30.9010,
    centerLng: 75.8573,
    zoom: 13,
    dignitaries: {
      cmName: "Bhagwant Mann",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Punjab",
      rmName: "Hardeep Singh Mundian",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Water Resources"
    },
    roles: [
      { id: "citizen", title: "Citizen / Zamindar Desk", scope: "Statewide Holdings", desc: "Download official Fard Jamabandi, track online Intkal mutations, and view Mussavi maps.", powers: ["Fard Jamabandi Download", "Track Online Intkal", "Mussavi Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (ਪਟਵਾਰੀ)", scope: "Ludhiana Halka (LGD 104201)", desc: "Entering Parat Patwar mutation, Khasra Girdawari crop inspection, and spot measurement.", powers: ["Parat Patwar Entry", "Girdawari Inspection", "Draft Verification Report", "Forward to Kanungo"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "kanungo", title: "Field Kanungo (ਕਾਨੂੰਨਗੋ)", scope: "Ludhiana East Circle", desc: "Circle level Intkal scrutiny, registry deed cross-verification, and field comparison.", powers: ["Intkal Scrutiny", "Verify Sub-Registrar Deed", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanungo Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Registrar", scope: "Ludhiana East Tehsil", desc: "Statutory judicial authority for Intkal sanction, PLRS Jamabandi master update, and blockchain seal.", powers: ["Sanction Intkal Order", "Mutate PLRS Jamabandi Master", "Issue Certified Fard", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Ludhiana Sub-Division", desc: "1st Appellate Revenue Court under Punjab Land Revenue Act, stay orders, and partition hearings.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khewat", "Order Re-Partition"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Ludhiana District", desc: "Apex district revenue oversight, PLRS monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "PLRS System Monitor", "Shamlat Land Administration", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 21. Rajasthan ─────────────────────────────────────────────────────────
  rj: {
    code: "rj",
    name: "Rajasthan",
    nativeName: "राजस्थान",
    portalName: "Apna Khata / E-Dharti (अपना खाता - ई-धरती)",
    region: "North",
    dilrmpScore: "94.6%",
    dilrmpRank: "Top Tier",
    motto: "पधारो म्हारे देश",
    department: "Revenue Department (राजस्व विभाग)",
    helpline: "1800-180-6127",
    emergencyNo: "1077",
    languages: ["Hindi", "Rajasthani", "English"],
    primaryLangCode: "hi",
    rorName: "Jamabandi Nakal / Khasra (जमाबंदी नकल / खसरा)",
    mapName: "Bhu-Naksha Cadastral Shajra Map (भू-नक्शा)",
    mutationName: "Namantaran (नामांतरण - म्यूटेशन)",
    sampleDistrict: "Jaipur (जयपुर)",
    sampleTaluk: "Jaipur Tehsil",
    centerLat: 26.9124,
    centerLng: 75.7873,
    zoom: 13,
    dignitaries: {
      cmName: "Bhajan Lal Sharma",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Rajasthan",
      rmName: "Hemant Meena",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Colonisation"
    },
    roles: [
      { id: "citizen", title: "Citizen / Kashtkar Desk", scope: "Statewide Holdings", desc: "Download certified Jamabandi Nakal, view Bhu-Naksha maps, and apply for online Namantaran.", powers: ["Jamabandi Nakal Download", "Apply Online Namantaran", "Bhu-Naksha Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी हल्का)", scope: "Jaipur Halka No. 5 (LGD 308101)", desc: "Field crop girdawari entry, boundary measurement, and spot mutation verification reports.", powers: ["Girdawari Crop Entry", "Spot Measurement", "Draft Verification Report", "Forward to ILR"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "ilr", title: "Inspector Land Records (ILR / गिरदावर)", scope: "Jaipur Circle", desc: "Circle level Namantaran scrutiny, registry deed cross-verification, and spot recommendations.", powers: ["Namantaran Scrutiny", "Verify Registry Deed", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open ILR Desk" },
      { id: "tehsildar", title: "Tehsildar / Naib Tehsildar", scope: "Jaipur Tehsil", desc: "Statutory judicial authority for Namantaran orders, Apna Khata master update, and blockchain seal.", powers: ["Pass Namantaran Order", "Mutate Apna Khata Master", "Issue Certified Jamabandi", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Jaipur Sub-Division", desc: "1st Appellate Revenue Court under Rajasthan Tenancy Act & Land Revenue Act, stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khasra", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Jaipur District", desc: "Apex district revenue oversight, Apna Khata monitoring, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Apna Khata System Monitor", "Siway Chak Land Control", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 22. Sikkim ────────────────────────────────────────────────────────────
  sk: {
    code: "sk",
    name: "Sikkim",
    nativeName: "सिक्किम",
    portalName: "Sikkim Land Records Management System",
    region: "East",
    dilrmpScore: "85.7%",
    dilrmpRank: "Progressing",
    motto: "Truth Alone Triumphs",
    department: "Land Revenue & Disaster Management Department",
    helpline: "1800-345-3250",
    emergencyNo: "1077",
    languages: ["Nepali", "Sikkimese", "English", "Hindi"],
    primaryLangCode: "ne",
    rorName: "Parcha Khatiyan / RoR (पर्चा खतियान)",
    mapName: "Cadastral Cadastre Sheet Map",
    mutationName: "Namari / Land Mutation",
    sampleDistrict: "Gangtok (गாங்டாக்)",
    sampleTaluk: "Gangtok Sub-Division",
    centerLat: 27.3389,
    centerLng: 88.6065,
    zoom: 13,
    dignitaries: {
      cmName: "Prem Singh Tamang (Golay)",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Sikkim",
      rmName: "Bhim Prasad Sharma",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Land Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Raiyat Desk", scope: "Statewide Holdings", desc: "Download digital Parcha Khatiyan, check revenue-510 status, and view cadastral map plots.", powers: ["Parcha Khatiyan Download", "Apply Online Namari", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "revenueins", title: "Revenue Inspector (RI)", scope: "Gangtok Circle (LGD 701201)", desc: "Hill boundary verification, Revenue Order 1 compliance check, and spot inspection reports.", powers: ["Hill Boundary Demarcation", "Revenue Order 1 Check", "Draft Verification Report", "Forward to Sub-Div"], href: "/portal/vao", cta: "Open RI Desk" },
      { id: "kanoongo", title: "Kanungo / Circle Officer", scope: "Gangtok Sub-Division", desc: "Circle level Namari scrutiny, deed cross-verification, and recommendation to SDM.", powers: ["Namari Scrutiny", "Verify Registration Deed", "Boundary Inspection", "Recommend to SDM"], href: "/portal/ri", cta: "Open Kanungo Desk" },
      { id: "sdm", title: "SDM / Sub-Divisional Magistrate", scope: "Gangtok Sub-Division", desc: "Statutory authority for Parcha Khatiyan mutation orders, Land Revenue update, and blockchain seal.", powers: ["Pass Namari Order", "Mutate Master Khatiyan", "Issue Certified Parcha", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open SDM Portal" },
      { id: "adc", title: "ADC — Additional District Magistrate", scope: "Gangtok Division", desc: "1st Appellate Authority for land title appeals, indigenous land protection, and stay orders.", powers: ["Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open ADC Tribunal" },
      { id: "dc", title: "District Collector (DC)", scope: "Gangtok District", desc: "Apex district administrator, Revenue Order 1 oversight, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Indigenous Land Protection", "Audit Trail Inspector", "State Sync"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 23. Tamil Nadu ────────────────────────────────────────────────────────
  tn: {
    code: "tn",
    name: "Tamil Nadu",
    nativeName: "தமிழ்நாடு",
    portalName: "AnyPatta / TamilNilam (தமிழ்நிலம் - பட்டா / சிட்டா)",
    region: "South",
    dilrmpScore: "96.4%",
    dilrmpRank: "#1 State",
    motto: "வாய்மையே வெல்லும் (Truth Alone Triumphs)",
    department: "Revenue & Disaster Management Department (வருவாய் மற்றும் பேரிடர் மேலாண்மைத் துறை)",
    helpline: "1800-425-1333",
    emergencyNo: "1077",
    languages: ["Tamil", "English"],
    primaryLangCode: "ta",
    rorName: "Patta / Chitta (பட்டா / சிட்டா சான்று)",
    mapName: "FMB Cadastral Sketch (புலப் படம் - FMB)",
    mutationName: "Patta Transfer (பட்டா மாறுதல்)",
    sampleDistrict: "Tamil Nadu Central (திருச்சிராப்பள்ளி / சென்னை)",
    sampleTaluk: "State Revenue Division",
    centerLat: 10.7905,
    centerLng: 78.7047,
    zoom: 12,
    dignitaries: {
      cmName: "M.K. Stalin",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Tamil Nadu",
      rmName: "K.K.S.S.R. Ramachandran",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Personal Holdings", desc: "Self-service Patta & Chitta PDF downloads, online mutation applications, SRO fee calculator, and ZK-SNARK title privacy proofs.", powers: ["Patta / Chitta Download", "Apply Patta Subdivision", "SRO Guideline Fee Calc", "Generate ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "vao", title: "VAO — Village Administrative Officer", scope: "Kinathukadavu Town (LGD 630401)", desc: "First-mile ground truth verification, geotagged boundary photo uploads, local enquiry reports, and season-wise Adangal crop register updates.", powers: ["Ground Boundary Scrutiny", "Geotag Photo Upload", "Season Adangal Crop Entry", "Forward Report to RI"], href: "/portal/vao", cta: "Open VAO Verification Desk" },
      { id: "ri", title: "RI — Revenue Inspector", scope: "Kinathukadavu Firka (5 Villages)", desc: "Firka-level Field Inspection Report (FIR) scrutiny, SRO Encumbrance Certificate (EC) cross-checks, multi-village boundary overlap inspection.", powers: ["FIR Scrutiny & Remarks", "Cross-Verify SRO EC", "Firka Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Firka Desk" },
      { id: "tahsildar", title: "Tahsildar / Sub-Tahsildar", scope: "Kinathukadavu Revenue Taluk", desc: "Sole statutory authority to sanction Patta Orders, update Master TamilNilam A-Register, execute FMB subdivisions, and seal Polygon blockchain anchors.", powers: ["Statutory Patta Order Sanction", "FMB Subdivision Update", "TamilNilam A-Register Mutate", "Polygon Blockchain E-Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "rdo", title: "RDO — Revenue Divisional Officer", scope: "Pollachi Revenue Division", desc: "1st Appellate Hearing Tribunal for Patta dispute appeals, interim stay order issuance, boundary dispute freezes, and re-survey orders.", powers: ["1st Appellate Hearing Tribunal", "Issue Interim Stay Order", "Freeze Disputed GIS Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open RDO Tribunal Desk" },
      { id: "collector", title: "District Collector Desk", scope: "Coimbatore District", desc: "Apex district revenue oversight, emergency fraud alert overrides, Government Poramboke land assignment, DILRMP metrics, and SHA-256 audit logs.", powers: ["Apex Revision Override", "Emergency Fraud Freeze", "Assign Poramboke Land", "SHA-256 Audit Log Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 24. Telangana ─────────────────────────────────────────────────────────
  ts: {
    code: "ts",
    name: "Telangana",
    nativeName: "తెలంగాణ",
    portalName: "Dharani (ధరణి - సమగ్ర భూ రికార్డుల పోర్టల్)",
    region: "South",
    dilrmpScore: "95.5%",
    dilrmpRank: "Top Tier",
    motto: "సత్యమేవ జయతే",
    department: "Revenue Department (కలెక్టర్ & రెవెన్యూ విభాగం)",
    helpline: "1800-599-8255",
    emergencyNo: "1077",
    languages: ["Telugu", "Urdu", "English"],
    primaryLangCode: "te",
    rorName: "Pattadar Passbook & 1B (పట్టాదారు పాస్‌బుక్ / 1B)",
    mapName: "Tippon & Cadastral Village Map (గ్రామ పటం)",
    mutationName: "Instant Mutation cum Registration",
    sampleDistrict: "Hyderabad (హైదరాబాద్)",
    sampleTaluk: "Serilingampally Mandal",
    centerLat: 17.4849,
    centerLng: 78.3184,
    zoom: 13,
    dignitaries: {
      cmName: "A. Revanth Reddy",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Telangana",
      rmName: "Ponguleti Srinivas Reddy",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue, Housing & IPR"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "Statewide Holdings", desc: "Download Dharani e-Passbook, slot booking for instant registration-cum-mutation, and verify 1B records.", powers: ["e-Passbook 1B Download", "Instant Mutation Slot Booking", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "girs", title: "Village Revenue Assistant (VRA / Girdawar)", scope: "Serilingampally Village (LGD 589201)", desc: "First-mile spot inspection, physical possession check, and ground dispute enquiry reports.", powers: ["Physical Possession Check", "Spot Boundary Inspection", "Draft Verification Report", "Forward to MRO"], href: "/portal/vao", cta: "Open VRA Desk" },
      { id: "mri", title: "Mandal Revenue Inspector (MRI)", scope: "Serilingampally Mandal", desc: "Mandal level slot verification, prohibition list Section 22-A cross-checks, and MRO recommendation.", powers: ["Dharani Slot Scrutiny", "Section 22-A Prohibition Check", "Boundary Verification", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open MRI Desk" },
      { id: "mro", title: "Tahsildar / Joint Sub-Registrar (MRO)", scope: "Serilingampally Mandal", desc: "Statutory authority for integrated registration-cum-mutation, Dharani master update, and blockchain seal.", powers: ["Execute Instant Mutation", "Mutate Dharani Master", "Issue Digital Passbook", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "rdo", title: "RDO — Revenue Divisional Officer", scope: "Rajendranagar Division", desc: "1st Appellate Revenue Court for Dharani grievance redressal, interim stay orders, and demarcation appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Sy No", "Order Re-Survey"], href: "/portal/rdo", cta: "Open RDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Hyderabad District", desc: "Apex district revenue oversight, Dharani special tribunal, and SHA-256 audit log inspection.", powers: ["Apex Collector Override", "Dharani System Monitor", "Section 22-A Governance", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 25. Tripura ───────────────────────────────────────────────────────────
  tr: {
    code: "tr",
    name: "Tripura",
    nativeName: "ত্রিপুরা",
    portalName: "Jami Tripura (জমি ত্রিপুরা - ই-খতিয়ান)",
    region: "North-East",
    dilrmpScore: "91.5%",
    dilrmpRank: "High Progress",
    motto: "Truth Alone Triumphs",
    department: "Revenue Department (রাজস্ব দপ্তর)",
    helpline: "1800-345-3825",
    emergencyNo: "1077",
    languages: ["Bengali", "Kokborok", "English"],
    primaryLangCode: "bn",
    rorName: "Khatian / Jamabandi (খতিয়ান নকল)",
    mapName: "Jami Tripura Cadastral Map",
    mutationName: "Dakhil Kharij / Mutation",
    sampleDistrict: "West Tripura (Agartala)",
    sampleTaluk: "Sadar Revenue Circle",
    centerLat: 23.8315,
    centerLng: 91.2868,
    zoom: 13,
    dignitaries: {
      cmName: "Manik Saha",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Tripura",
      rmName: "Animesh Debbarma",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Tribal Welfare"
    },
    roles: [
      { id: "citizen", title: "Citizen / Raiyat Desk", scope: "Statewide Holdings", desc: "Download Jami Tripura Khatian, view digital plot maps, and apply for online Dakhil Kharij.", powers: ["Khatian Download", "Apply Online Mutation", "Plot Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "amin", title: "Tehsil Amin (আমিন)", scope: "Agartala Tehsil (LGD 204101)", desc: "Ground boundary measurement, spot enquiry, TLR & LR Act compliance check, and verification reports.", powers: ["Field Measurement", "TLR Act Check", "Draft Enquiry Report", "Forward to DCM"], href: "/portal/vao", cta: "Open Amin Desk" },
      { id: "kanoongo", title: "Kanungo (কানুনগো)", scope: "Sadar Circle", desc: "Circle level Mutation scrutiny, deed cross-verification, and recommendation to DCM.", powers: ["Mutation Scrutiny", "Verify Registration Deed", "Circle Boundary Inspection", "Recommend to DCM"], href: "/portal/ri", cta: "Open Kanungo Desk" },
      { id: "dcm", title: "Deputy Collector & Magistrate (DCM)", scope: "Sadar Sub-Division", desc: "Statutory authority for Mutation orders, Jami Tripura master update, and blockchain seal.", powers: ["Pass Mutation Order", "Mutate Jami Tripura Master", "Issue Certified Khatian", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open DCM Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "West Tripura Sub-Division", desc: "1st Appellate Revenue Court under TLR & LR Act 1960, interim stay orders, and boundary appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "West Tripura District", desc: "Apex district administrator, Jami Tripura monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Jami Tripura Monitor", "Tribal Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DM Center" },
    ]
  },

  // ── 26. Uttar Pradesh ─────────────────────────────────────────────────────
  up: {
    code: "up",
    name: "Uttar Pradesh",
    nativeName: "उत्तर प्रदेश",
    portalName: "UP Bhulekh / BorLKO (भूलेख उत्तर प्रदेश)",
    region: "North",
    dilrmpScore: "95.7%",
    dilrmpRank: "Top Tier",
    motto: "सत्यमेव जयते (Truth Alone Triumphs)",
    department: "Revenue Department (राजस्व विभाग उत्तर प्रदेश)",
    helpline: "1800-180-0888",
    emergencyNo: "1077",
    languages: ["Hindi", "Urdu", "English"],
    primaryLangCode: "hi",
    rorName: "Khatauni & Khasra (खतौनी नकल एवं खसरा)",
    mapName: "Shajra Cadastral Map (शजरा नक्शा)",
    mutationName: "Dakhil Kharij / Varashat (दाखिल खारिज / वरासत)",
    sampleDistrict: "Lucknow (लखनऊ)",
    sampleTaluk: "Sadar Tehsil (सदर तहसील)",
    centerLat: 26.8467,
    centerLng: 80.9462,
    zoom: 13,
    dignitaries: {
      cmName: "Yogi Adityanath",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Uttar Pradesh",
      rmName: "Sanjay Gangwar",
      rmTitle: "Hon'ble Minister of State",
      rmDept: "Revenue Department"
    },
    roles: [
      { id: "citizen", title: "Citizen / Account Holder Desk", scope: "Statewide Holdings", desc: "Self-service Khatauni & Khasra downloads, online Dakhil Kharij applications, and legal title checks.", powers: ["Khatauni Download", "Apply Dakhil Kharij", "Shajra Map View", "Generate Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "lekhpal", title: "Lekhpal Desk (लेखपाल दफ्तर)", scope: "Sadar Village (LGD 134201)", desc: "First-mile field scrutiny, Khasra crop girdawari entry, and spot enquiry reports.", powers: ["Khasra Girdawari Entry", "Spot Measurement", "Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Lekhpal Desk" },
      { id: "kanoongo", title: "Kanoongo / Revenue Inspector", scope: "Sadar Circle (5 Villages)", desc: "Circle level Dakhil Kharij scrutiny, Registry cross-check, and recommendation to Tehsildar.", powers: ["Dakhil Kharij Scrutiny", "Cross-Verify Registry", "Circle Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanoongo Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Tehsildar", scope: "Sadar Tehsil (Lucknow)", desc: "Statutory Court Orders for Dakhil Kharij, Master Khatauni mutation, and Polygon blockchain seal.", powers: ["Sanction Dakhil Kharij", "Bhurajashwa Mutate", "Shajra Demarcation", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Desk" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Lucknow Sub-Division", desc: "1st Revenue Court Appellate Tribunal under UP Revenue Code, interim stay orders, and dispute freezes.", powers: ["1st Revenue Court Hearing", "Issue Stay Order", "Freeze Khatauni Record", "Order Re-Demarcation"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "Lucknow District", desc: "Apex District Magistrate oversight, Bhulekh UP monitoring, and emergency fraud overrides.", powers: ["Apex DM Override", "Bhulekh UP Monitor", "Nazul Land Assignment", "Audit Log Inspector"], href: "/portal/collector", cta: "Open DM Command Desk" },
    ]
  },

  // ── 27. Uttarakhand ───────────────────────────────────────────────────────
  uk: {
    code: "uk",
    name: "Uttarakhand",
    nativeName: "उत्तराखंड",
    portalName: "Devbhoomi Bhulekh (देवभूमि भू-अभिलेख उत्तराखंड)",
    region: "North",
    dilrmpScore: "91.6%",
    dilrmpRank: "High Progress",
    motto: "सत्यमेव जयते",
    department: "Board of Revenue (राजस्व परिषद उत्तराखंड)",
    helpline: "1800-180-4100",
    emergencyNo: "1077",
    languages: ["Hindi", "Garhwali", "Kumaoni", "English"],
    primaryLangCode: "hi",
    rorName: "Khatauni / Khasra (खतौनी नकल)",
    mapName: "Devbhoomi Bhu-Naksha Cadastral Map",
    mutationName: "Dakhil Kharij (दाखिल खारिज)",
    sampleDistrict: "Dehradun (देहरादून)",
    sampleTaluk: "Dehradun Sadar Tehsil",
    centerLat: 30.3165,
    centerLng: 78.0322,
    zoom: 13,
    dignitaries: {
      cmName: "Pushkar Singh Dhami",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of Uttarakhand",
      rmName: "Subodh Uniyal",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Forest & Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / Kashtkar Desk", scope: "Statewide Holdings", desc: "Download Devbhoomi Khatauni, view digital Bhu-Naksha maps, and apply for online Dakhil Kharij.", powers: ["Khatauni Download", "Apply Dakhil Kharij", "Bhu-Naksha Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Revenue Police / Patwari (पटवारी)", scope: "Dehradun Halka (LGD 101201)", desc: "Dual policing and revenue field scrutiny, land ceiling check, and spot enquiry reports.", powers: ["Revenue Police Scrutiny", "Land Ceiling Check", "Draft Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "kanoongo", title: "Kanoongo / Registrar Kanoongo", scope: "Dehradun Circle", desc: "Circle level Dakhil Kharij scrutiny, deed cross-verification, and recommendation to Tehsildar.", powers: ["Dakhil Kharij Scrutiny", "Verify SRO Registry", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanoongo Desk" },
      { id: "tehsildar", title: "Tehsildar / Naib Tehsildar", scope: "Dehradun Tehsil", desc: "Statutory judicial authority for Dakhil Kharij orders, Devbhoomi master update, and blockchain seal.", powers: ["Pass Dakhil Kharij Order", "Mutate Devbhoomi Master", "Issue Certified Khatauni", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Dehradun Sub-Division", desc: "1st Appellate Revenue Court under Uttarakhand Land Revenue Act, stay orders, and ceiling appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "Dehradun District", desc: "Apex district administrator, Devbhoomi monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Devbhoomi System Monitor", "Forest Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DM Center" },
    ]
  },

  // ── 28. West Bengal ───────────────────────────────────────────────────────
  wb: {
    code: "wb",
    name: "West Bengal",
    nativeName: "পশ্চিমবঙ্গ",
    portalName: "BanglarBhumi (বাংলারভূমি - খতিয়ান ও প্লট)",
    region: "East",
    dilrmpScore: "95.3%",
    dilrmpRank: "Top Tier",
    motto: "বাংলার মাটি বাংলার জল",
    department: "Land & Land Reforms and Refugee Relief Department",
    helpline: "1800-345-5555",
    emergencyNo: "1077",
    languages: ["Bengali", "English"],
    primaryLangCode: "bn",
    rorName: "Khatian & Plot Information (খতিয়ান ও দাগের তথ্য)",
    mapName: "Cadastral Mouza Map (মৌজা নকশা)",
    mutationName: "Mutation & Conversion (নামপত্তন ও ধর্মান্তর)",
    sampleDistrict: "Kolkata & North 24 Parganas (কলকাতা)",
    sampleTaluk: "Barasat-I Block",
    centerLat: 22.5726,
    centerLng: 88.3639,
    zoom: 13,
    dignitaries: {
      cmName: "Mamata Banerjee",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of West Bengal",
      rmName: "Chandranath Sinha",
      rmTitle: "Hon'ble Minister in Charge",
      rmDept: "Land & Land Reforms"
    },
    roles: [
      { id: "citizen", title: "Citizen / Raiyat Desk", scope: "Statewide Holdings", desc: "Download certified BanglarBhumi Khatian & Plot Info, check conversion status, and submit online mutation.", powers: ["Khatian & Plot Info Download", "Apply Online Mutation", "Mouza Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "amin", title: "Revenue Inspector / Amin (আমিন)", scope: "Barasat Mouza (LGD 304801)", desc: "Mouza level field inspection, character of land check, and spot verification reports.", powers: ["Mouza Inspection", "Land Character Verification", "Draft Enquiry Report", "Forward to BL&LRO"], href: "/portal/vao", cta: "Open Amin Desk" },
      { id: "ri", title: "Revenue Inspector (RI)", scope: "Barasat-I Block", desc: "Block level Mutation scrutiny, e-Deed cross-verification, and recommendation to BL&LRO.", powers: ["Mutation Scrutiny", "Verify Registration e-Deed", "Block Boundary Inspection", "Recommend to BL&LRO"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "bllro", title: "BL&LRO — Block Land & Land Reforms Officer", scope: "Barasat-I Block", desc: "Statutory authority for Mutation orders, BanglarBhumi master update, and Polygon blockchain seal.", powers: ["Pass Mutation Order", "Mutate BanglarBhumi Master", "Issue Certified Khatian", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open BL&LRO Portal" },
      { id: "sdllro", title: "SDL&LRO — Sub-Divisional Land Officer", scope: "Barasat Sub-Division", desc: "1st Appellate Revenue Tribunal under WBLR Act 1955, stay orders, and conversion appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khatian", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDL&LRO Tribunal" },
      { id: "dllro", title: "DL&LRO / District Magistrate", scope: "North 24 Parganas", desc: "Apex district revenue administrator, BanglarBhumi monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "BanglarBhumi System Monitor", "Vested Land Administration", "Audit Inspector"], href: "/portal/collector", cta: "Open DL&LRO Center" },
    ]
  },

  // ── UNION TERRITORIES (8 UTs) ──────────────────────────────────────────────

  // ── 29. Andaman and Nicobar Islands ───────────────────────────────────────
  an: {
    code: "an",
    name: "Andaman and Nicobar Islands",
    nativeName: "अंडमान और निकोबार द्वीप समूह",
    portalName: "e-Land Andaman Records Portal",
    region: "Union Territory",
    dilrmpScore: "89.2%",
    dilrmpRank: "UT Leader",
    motto: "Truth Alone Triumphs",
    department: "Directorate of Revenue & Settlement",
    helpline: "1800-345-3197",
    emergencyNo: "1077",
    languages: ["Hindi", "English", "Tamil", "Bengali"],
    primaryLangCode: "en",
    rorName: "Record of Rights (RoR) / Form F",
    mapName: "Island Cadastral Survey Sketch",
    mutationName: "Land Mutation & Settlement",
    sampleDistrict: "South Andaman (Port Blair)",
    sampleTaluk: "Port Blair Tehsil",
    centerLat: 11.6234,
    centerLng: 92.7265,
    zoom: 13,
    dignitaries: {
      cmName: "Admiral D.K. Joshi (Retd.)",
      cmTitle: "Hon'ble Lieutenant Governor",
      cmState: "UT of Andaman & Nicobar",
      rmName: "Keshav Chandra",
      rmTitle: "Chief Secretary & Secy (Rev)",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Island Resident Desk", scope: "UT-wide Holdings", desc: "Download Island Record of Rights (RoR), apply for Mutation, and verify coastal cadastral boundaries.", powers: ["RoR Form F Download", "Apply Online Mutation", "Cadastral Sketch View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk", scope: "Port Blair Halka", desc: "Ground coastal boundary verification, CRZ compliance checks, and spot inspection reports.", powers: ["CRZ Compliance Check", "Spot Boundary Inspection", "Draft Verification Report", "Forward to RI"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "ri", title: "Revenue Inspector (RI)", scope: "Port Blair Circle", desc: "Circle level Mutation scrutiny, deed cross-verification, and recommendation to Tehsildar.", powers: ["Mutation Scrutiny", "Verify Registration Deed", "Circle Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tehsildar", title: "Tehsildar", scope: "Port Blair Tehsil", desc: "Statutory authority for RoR mutation orders, e-Land master update, and blockchain seal.", powers: ["Pass Mutation Order", "Mutate e-Land Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM / Assistant Commissioner", scope: "South Andaman Sub-Division", desc: "1st Appellate Authority for land title appeals, coastal regulation stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "South Andaman District", desc: "Apex district administrator, Island Land protection, and SHA-256 audit log inspection.", powers: ["Apex District Override", "e-Land System Monitor", "Tribal Reserve Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 30. Chandigarh ────────────────────────────────────────────────────────
  ch: {
    code: "ch",
    name: "Chandigarh",
    nativeName: "ਚੰਡੀਗੜ੍ਹ / चंडीगढ़",
    portalName: "Chandigarh Estate Office & Land Records",
    region: "Union Territory",
    dilrmpScore: "97.0%",
    dilrmpRank: "UT Leader",
    motto: "Open Hand - Give and Receive",
    department: "Estate Office & Revenue Department (UT Chandigarh)",
    helpline: "1800-180-2070",
    emergencyNo: "112",
    languages: ["English", "Hindi", "Punjabi"],
    primaryLangCode: "en",
    rorName: "Allotment Letter / Jamabandi RoR",
    mapName: "Sectoral Architectural & Cadastral Grid",
    mutationName: "Transfer of Property Ownership",
    sampleDistrict: "Chandigarh (UT)",
    sampleTaluk: "Sector 17 Estate Office",
    centerLat: 30.7333,
    centerLng: 76.7794,
    zoom: 14,
    dignitaries: {
      cmName: "Gulab Chand Kataria",
      cmTitle: "Hon'ble Administrator",
      cmState: "UT of Chandigarh",
      rmName: "Mandip Singh Brar",
      rmTitle: "Home Secretary & Secy (Rev)",
      rmDept: "Estate Office & Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / Property Owner Desk", scope: "UT-wide Holdings", desc: "Download property allotment certificates, NDC, track transfer applications, and title verification.", powers: ["Allotment Certificate Download", "Apply Property Transfer", "Sector Grid Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "inspector", title: "Building & Land Inspector", scope: "Sector Grid Circles", desc: "Ground site inspection, building bylaws compliance check, and spot inspection report.", powers: ["Site Demarcation", "Bylaw Compliance Check", "Draft Verification Report", "Forward to Tehsildar"], href: "/portal/vao", cta: "Open Inspector Desk" },
      { id: "supt", title: "Superintendent (Land & Estate)", scope: "Estate Office", desc: "Scrutiny of ownership transfer files, sub-registrar deed verification, and recommendation.", powers: ["Transfer Scrutiny", "Verify Registry Deed", "NOC Cross-Check", "Recommend to AEO"], href: "/portal/ri", cta: "Open Supt Desk" },
      { id: "aeo", title: "Assistant Estate Officer (AEO) / Tehsildar", scope: "Chandigarh UT", desc: "Statutory authority for ownership transfer orders, master register mutation, and blockchain seal.", powers: ["Pass Transfer Order", "Update Estate Master", "Issue Conveyance Deed", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open AEO Portal" },
      { id: "eo", title: "Estate Officer / SDM", scope: "Chandigarh Sub-Division", desc: "1st Appellate Authority for property dispute appeals, building violations, and stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Property", "Order Inspection"], href: "/portal/rdo", cta: "Open EO Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Chandigarh UT", desc: "Apex UT revenue administrator, Estate Office monitor, and SHA-256 audit log inspection.", powers: ["Apex UT Override", "Estate System Monitor", "Heritage Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 31. Dadra & Nagar Haveli and Daman & Diu ───────────────────────────────
  dn: {
    code: "dn",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    nativeName: "दादरा और नगर हवेली और दमन और दीव",
    portalName: "Daman & Diu Land Records Portal (AnyRoR DD)",
    region: "Union Territory",
    dilrmpScore: "92.4%",
    dilrmpRank: "High Progress",
    motto: "Truth Alone Triumphs",
    department: "Department of Revenue",
    helpline: "1800-233-0419",
    emergencyNo: "1077",
    languages: ["Gujarati", "Hindi", "English"],
    primaryLangCode: "gu",
    rorName: "Form 7/12 & Form 8A (નમૂનો ૭/૧૨)",
    mapName: "Cadastral Village Map (નકશો)",
    mutationName: "Hakk Nond / Mutation",
    sampleDistrict: "Daman (દમણ)",
    sampleTaluk: "Daman Mamlatdar Office",
    centerLat: 20.3974,
    centerLng: 72.8328,
    zoom: 13,
    dignitaries: {
      cmName: "Praful Patel",
      cmTitle: "Hon'ble Administrator",
      cmState: "UT of DNH & DD",
      rmName: "Amit Singla",
      rmTitle: "Advisor to Administrator",
      rmDept: "Revenue & Finance"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "UT-wide Holdings", desc: "Download Form 7/12 & 8A, apply for mutation online, and check cadastral boundary maps.", powers: ["Form 7/12 Download", "Apply Online Mutation", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "talati", title: "Talati (તલાટી)", scope: "Daman Halka", desc: "Ground verification, crop register update, and spot mutation enquiry report submission.", powers: ["Field Spot Inspection", "Crop Entry Update", "Draft Verification Report", "Forward to Circle"], href: "/portal/vao", cta: "Open Talati Desk" },
      { id: "circle", title: "Circle Officer", scope: "Daman Circle", desc: "Circle level Mutation scrutiny, deed cross-verification, and recommendation to Mamlatdar.", powers: ["Mutation Scrutiny", "Verify Registry Deed", "Boundary Verification", "Recommend to Mamlatdar"], href: "/portal/ri", cta: "Open Circle Desk" },
      { id: "mamlatdar", title: "Mamlatdar / Joint Mamlatdar", scope: "Daman District", desc: "Statutory authority for Mutation orders, 7/12 master update, and blockchain seal.", powers: ["Pass Mutation Order", "Mutate 7/12 Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Mamlatdar Portal" },
      { id: "sdo", title: "SDO / Deputy Collector", scope: "Daman Sub-Division", desc: "1st Appellate Revenue Authority for land dispute appeals and interim stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Survey No", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDO Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Daman District", desc: "Apex UT district revenue oversight, land monitor, and SHA-256 audit log inspection.", powers: ["Apex UT Override", "Revenue System Monitor", "Coastal Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 32. Delhi ─────────────────────────────────────────────────────────────
  dl: {
    code: "dl",
    name: "Delhi (NCT)",
    nativeName: "दिल्ली",
    portalName: "Delhi Bhulekh / Indraprastha (दिल्ली भूलेख)",
    region: "Union Territory",
    dilrmpScore: "96.5%",
    dilrmpRank: "Top Tier",
    motto: "सत्यमेव जयते",
    department: "Revenue Department (Government of NCT of Delhi)",
    helpline: "1800-11-2555",
    emergencyNo: "1077",
    languages: ["Hindi", "English", "Punjabi", "Urdu"],
    primaryLangCode: "hi",
    rorName: "Khasra-Khatauni (खसरा-खतौनी नकल)",
    mapName: "Delhi GIS Cadastral Map (शजरा)",
    mutationName: "Namantaran / Dakhil Kharij",
    sampleDistrict: "New Delhi (नई दिल्ली)",
    sampleTaluk: "Chanakyapuri Tehsil",
    centerLat: 28.6139,
    centerLng: 77.2090,
    zoom: 14,
    dignitaries: {
      cmName: "Atishi Marlena",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "Govt of NCT of Delhi",
      rmName: "Kailash Gahlot",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Revenue & Transport"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "NCT-wide Holdings", desc: "Download digital Khasra-Khatauni, view GIS cadastral maps, and apply for online Namantaran.", powers: ["Khatauni Download", "Apply Online Namantaran", "Delhi GIS Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (पटवारी)", scope: "Chanakyapuri Halka (LGD 100101)", desc: "Village field inspection, Gaon Sabha land encroachment check, and verification reports.", powers: ["Field Spot Inspection", "Gaon Sabha Land Check", "Draft Verification Report", "Forward to Kanoongo"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "kanoongo", title: "Kanoongo (कानूनगो)", scope: "New Delhi Circle", desc: "Circle level Namantaran scrutiny, DDA / L&DO NOC verification, and recommendation to Tehsildar.", powers: ["Namantaran Scrutiny", "Verify SRO Registry", "DDA/L&DO NOC Cross-Check", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Kanoongo Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Registrar", scope: "Chanakyapuri Tehsil", desc: "Statutory judicial authority for Namantaran orders, Delhi Bhulekh master update, and blockchain seal.", powers: ["Pass Namantaran Order", "Mutate Delhi Bhulekh Master", "Issue Certified Khatauni", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "New Delhi Sub-Division", desc: "1st Appellate Revenue Court under Delhi Land Reforms Act 1954, Section 81/85 hearings, stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khasra", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dm", title: "District Magistrate (DM)", scope: "New Delhi District", desc: "Apex district revenue administrator, Delhi Bhulekh monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Delhi Bhulekh Monitor", "Gaon Sabha Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DM Center" },
    ]
  },

  // ── 33. Jammu and Kashmir ─────────────────────────────────────────────────
  jk: {
    code: "jk",
    name: "Jammu and Kashmir",
    nativeName: "جموں و کشمیر / जम्मू और कश्मीर",
    portalName: "Apki Zameen Apki Nigrani (آپ کی زمین آپ کی نگرانی)",
    region: "Union Territory",
    dilrmpScore: "93.1%",
    dilrmpRank: "High Progress",
    motto: "Truth Alone Triumphs",
    department: "Department of Revenue (محکمہ مال)",
    helpline: "1800-180-7105",
    emergencyNo: "1077",
    languages: ["Urdu", "Kashmiri", "Dogri", "Hindi", "English"],
    primaryLangCode: "ur",
    rorName: "Jamabandi & Girdawari (جما بندی / गिरदावरी)",
    mapName: "Cadastral Mussavi & Shajra Khasra (مسوی)",
    mutationName: "Intiqal / Mutation (انتقال)",
    sampleDistrict: "Srinagar (سرینگر / श्रीनगर)",
    sampleTaluk: "Srinagar Central Tehsil",
    centerLat: 34.0837,
    centerLng: 74.7973,
    zoom: 13,
    dignitaries: {
      cmName: "Omar Abdullah",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "UT of Jammu & Kashmir",
      rmName: "Javed Ahmed Rana",
      rmTitle: "Hon'ble Minister for Jal Shakti & Revenue",
      rmDept: "Revenue & Jal Shakti"
    },
    roles: [
      { id: "citizen", title: "Citizen / Asami Desk", scope: "UT-wide Holdings", desc: "Search & download digital Jamabandi via Apki Zameen Apki Nigrani, and track online Intiqal.", powers: ["Jamabandi Download", "Track Online Intiqal", "Mussavi Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk (پٹواری)", scope: "Srinagar Halka (LGD 109801)", desc: "Field crop Girdawari entry, Kahcharai state land protection check, and verification reports.", powers: ["Girdawari Entry", "Kahcharai Land Check", "Draft Verification Report", "Forward to Girdawar"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "girdawar", title: "Girdawar / Naib Tehsildar (گرداور)", scope: "Srinagar Circle", desc: "Circle level Intiqal scrutiny, registry cross-verification, and recommendation to Tehsildar.", powers: ["Intiqal Scrutiny", "Verify Sub-Registrar Deed", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Girdawar Desk" },
      { id: "tehsildar", title: "Tehsildar / Sub-Registrar", scope: "Srinagar Central Tehsil", desc: "Statutory judicial authority for Intiqal attestation, Jamabandi master update, and blockchain seal.", powers: ["Attest Intiqal Order", "Mutate Jamabandi Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM — Sub-Divisional Magistrate", scope: "Srinagar Sub-Division", desc: "1st Appellate Revenue Court under J&K Land Revenue Act, stay orders, and agrarian reform appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Khewat", "Order Re-Demarcation"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC)", scope: "Srinagar District", desc: "Apex district administrator, Apki Zameen monitor, State & Kahcharai land protection, and audit logs.", powers: ["Apex District Override", "Apki Zameen Monitor", "State Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 34. Ladakh ────────────────────────────────────────────────────────────
  la: {
    code: "la",
    name: "Ladakh",
    nativeName: "ལ་དྭགས / लद्दाख",
    portalName: "Ladakh Revenue & Land Records Portal",
    region: "Union Territory",
    dilrmpScore: "83.6%",
    dilrmpRank: "Progressing",
    motto: "Truth Alone Triumphs",
    department: "Department of Revenue (UT Administration of Ladakh)",
    helpline: "1800-180-7210",
    emergencyNo: "1077",
    languages: ["Ladakhi (Bhoti)", "Urdu", "English", "Hindi"],
    primaryLangCode: "en",
    rorName: "Jamabandi / Record of Rights",
    mapName: "Cadastral Plot Shajra Sheet",
    mutationName: "Intiqal / Mutation",
    sampleDistrict: "Leh (གླེ / लेह)",
    sampleTaluk: "Leh Tehsil",
    centerLat: 34.1526,
    centerLng: 77.5771,
    zoom: 13,
    dignitaries: {
      cmName: "Brig. (Dr.) B.D. Mishra (Retd.)",
      cmTitle: "Hon'ble Lieutenant Governor",
      cmState: "UT of Ladakh",
      rmName: "Sanjeev Khirwar",
      rmTitle: "Principal Secretary (Revenue)",
      rmDept: "Revenue & Disaster Mgmt"
    },
    roles: [
      { id: "citizen", title: "Citizen / Landholder Desk", scope: "UT-wide Holdings", desc: "Download Jamabandi RoR, track tribal land rights, and view high-altitude cadastral maps.", powers: ["Jamabandi Download", "Track Intiqal Mutation", "Shajra Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "patwari", title: "Patwari Desk", scope: "Leh Village", desc: "High-altitude boundary verification, pasture land check, and spot inspection reports.", powers: ["Pasture Land Verification", "Spot Boundary Inspection", "Draft Verification Report", "Forward to Girdawar"], href: "/portal/vao", cta: "Open Patwari Desk" },
      { id: "girdawar", title: "Girdawar (Revenue Inspector)", scope: "Leh Circle", desc: "Circle level Intiqal scrutiny, LAHDC NOC verification, and recommendation to Tehsildar.", powers: ["Intiqal Scrutiny", "LAHDC NOC Check", "Circle Boundary Inspection", "Recommend to Tehsildar"], href: "/portal/ri", cta: "Open Girdawar Desk" },
      { id: "tehsildar", title: "Tehsildar", scope: "Leh Tehsil", desc: "Statutory authority for Intiqal orders, master Jamabandi update, and blockchain seal.", powers: ["Pass Intiqal Order", "Mutate Jamabandi Master", "Issue Certified RoR", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tehsildar Portal" },
      { id: "sdm", title: "SDM / Sub-Divisional Magistrate", scope: "Leh Sub-Division", desc: "1st Appellate Authority for land title appeals and boundary dispute stay orders.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Plot", "Order Re-Survey"], href: "/portal/rdo", cta: "Open SDM Tribunal" },
      { id: "dc", title: "Deputy Commissioner (DC) / CEO LAHDC", scope: "Leh District", desc: "Apex UT district revenue oversight, LAHDC coordination, and SHA-256 audit log inspection.", powers: ["Apex UT Override", "LAHDC Land Governance", "Pasture Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open DC Center" },
    ]
  },

  // ── 35. Lakshadweep ───────────────────────────────────────────────────────
  ld: {
    code: "ld",
    name: "Lakshadweep",
    nativeName: "ലക്ഷദ്വീപ്",
    portalName: "Lakshadweep e-Land & Registry Portal",
    region: "Union Territory",
    dilrmpScore: "84.2%",
    dilrmpRank: "Progressing",
    motto: "Truth Alone Triumphs",
    department: "Directorate of Land Revenue & Settlement",
    helpline: "1800-425-4550",
    emergencyNo: "1077",
    languages: ["Malayalam", "Jassari", "English"],
    primaryLangCode: "ml",
    rorName: "Jenmam / Pandaram Land Holding Record",
    mapName: "Atoll Cadastral Survey Sketch",
    mutationName: "Transfer of Pandaram / Private Holding",
    sampleDistrict: "Kavaratti (കവരത്തി)",
    sampleTaluk: "Kavaratti Island Sub-Division",
    centerLat: 10.5667,
    centerLng: 72.6417,
    zoom: 14,
    dignitaries: {
      cmName: "Praful Patel",
      cmTitle: "Hon'ble Administrator",
      cmState: "UT of Lakshadweep",
      rmName: "S. Asker Ali",
      rmTitle: "Collector & Secretary (Revenue)",
      rmDept: "Revenue & Settlement"
    },
    roles: [
      { id: "citizen", title: "Citizen / Island Resident Desk", scope: "UT-wide Holdings", desc: "Download Island land holding certificates, verify Jenmam / Pandaram tenancy status.", powers: ["Holding Record Download", "Apply Land Transfer", "Atoll Sketch View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "amin", title: "Island Amin / Surveyor", scope: "Kavaratti Island", desc: "Atoll coastal boundary verification, island tree enumeration, and spot inspection reports.", powers: ["Tree Enumeration", "Coastal Boundary Check", "Draft Verification Report", "Forward to SDO"], href: "/portal/vao", cta: "Open Amin Desk" },
      { id: "sdo_office", title: "Revenue Inspector", scope: "Kavaratti Circle", desc: "Circle level holding transfer scrutiny, customary island title checks, and recommendation.", powers: ["Transfer Scrutiny", "Verify Customary Deed", "Atoll Boundary Inspection", "Recommend to SDO"], href: "/portal/ri", cta: "Open Inspector Desk" },
      { id: "sdo", title: "SDO — Sub-Divisional Officer", scope: "Kavaratti Island", desc: "Statutory authority for Pandaram land transfer orders, register mutation, and blockchain seal.", powers: ["Pass Transfer Order", "Update Island Master", "Issue Certified Record", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open SDO Portal" },
      { id: "adm", title: "Additional District Magistrate (ADM)", scope: "Lakshadweep Division", desc: "1st Appellate Authority for island land dispute appeals and stay order issuance.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Holding", "Order Re-Survey"], href: "/portal/rdo", cta: "Open ADM Tribunal" },
      { id: "collector", title: "Collector cum Development Commissioner", scope: "Lakshadweep UT", desc: "Apex UT administrator, Island Eco-Sensitive land protection, and SHA-256 audit logs.", powers: ["Apex UT Override", "Pandaram Land Protection", "Audit Trail Inspector", "State Sync"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  },

  // ── 36. Puducherry ────────────────────────────────────────────────────────
  py: {
    code: "py",
    name: "Puducherry",
    nativeName: "புதுச்சேரி",
    portalName: "Nilamagal (நிலமகள் - நில ஆவணங்கள்)",
    region: "Union Territory",
    dilrmpScore: "95.4%",
    dilrmpRank: "Top Tier",
    motto: "Truth Alone Triumphs",
    department: "Department of Revenue & Disaster Management (வருவாய்த்துறை)",
    helpline: "1800-425-1077",
    emergencyNo: "1077",
    languages: ["Tamil", "French", "English", "Telugu", "Malayalam"],
    primaryLangCode: "ta",
    rorName: "Patta Copy / Settlement Extract (பட்டா நகல்)",
    mapName: "Cadastral Survey Map (புல வரைபடம்)",
    mutationName: "Patta Name Transfer (பட்டா பெயர் மாற்றம்)",
    sampleDistrict: "Puducherry (புதுச்சேரி)",
    sampleTaluk: "Puducherry Taluk",
    centerLat: 11.9416,
    centerLng: 79.8083,
    zoom: 13,
    dignitaries: {
      cmName: "N. Rangasamy",
      cmTitle: "Hon'ble Chief Minister",
      cmState: "UT of Puducherry",
      rmName: "K. Lakshminarayanan",
      rmTitle: "Hon'ble Revenue Minister",
      rmDept: "Public Works & Revenue"
    },
    roles: [
      { id: "citizen", title: "Citizen / Pattadar Desk", scope: "UT-wide Holdings", desc: "Download certified Nilamagal Patta copy, view Cadastral FMB, and apply for online Patta transfer.", powers: ["Nilamagal Patta Download", "Apply Patta Transfer", "Cadastral Map View", "ZK Title Proof"], href: "/citizen", cta: "Enter Citizen Portal" },
      { id: "vao", title: "VAO — Village Administrative Officer", scope: "Puducherry Town (LGD 640101)", desc: "Ground verification, municipal and rural boundary inspection, and spot enquiry reports.", powers: ["Ground Boundary Scrutiny", "Spot Enquiry Upload", "Draft Verification Report", "Forward to RI"], href: "/portal/vao", cta: "Open VAO Desk" },
      { id: "ri", title: "Revenue Inspector (RI / வருவாய் ஆய்வாளர்)", scope: "Puducherry Circle", desc: "Circle level Patta transfer scrutiny, SRO deed cross-verification, and Tahsildar recommendation.", powers: ["Patta Transfer Scrutiny", "Verify SRO Deed", "Circle Boundary Inspection", "Recommend to Tahsildar"], href: "/portal/ri", cta: "Open RI Desk" },
      { id: "tahsildar", title: "Tahsildar (Taluk Office)", scope: "Puducherry Taluk", desc: "Statutory authority for Patta transfer orders, Nilamagal database update, and blockchain seal.", powers: ["Pass Patta Transfer Order", "Mutate Nilamagal Master", "Issue Certified Patta", "Polygon Blockchain Seal"], href: "/portal/tahsildar", cta: "Open Tahsildar Portal" },
      { id: "deputycollector", title: "Deputy Collector (Revenue)", scope: "Puducherry Revenue Division", desc: "1st Appellate Revenue Court under Puducherry Land Grant Rules, stay orders, and appeals.", powers: ["1st Appellate Hearing", "Issue Interim Stay", "Freeze Disputed Patta", "Order Re-Survey"], href: "/portal/rdo", cta: "Open Deputy Collector Tribunal" },
      { id: "collector", title: "District Collector Desk", scope: "Puducherry District", desc: "Apex UT district revenue administrator, Nilamagal monitor, and SHA-256 audit log inspection.", powers: ["Apex District Override", "Nilamagal System Monitor", "Government Land Protection", "Audit Inspector"], href: "/portal/collector", cta: "Open Collector Center" },
    ]
  }
};

export const INDIAN_REGIONS = [
  "All",
  "South",
  "North",
  "West",
  "East",
  "Central",
  "North-East",
  "Union Territory"
] as const;

export function getStateMetadata(code?: string): StateMetadata {
  if (!code) return ALL_INDIAN_STATES.tn;
  const c = code.toLowerCase().trim();
  return ALL_INDIAN_STATES[c] || ALL_INDIAN_STATES.tn;
}

export function getAllStatesList(): StateMetadata[] {
  return Object.values(ALL_INDIAN_STATES);
}
