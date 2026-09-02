"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export type LangCode = "en" | "ta" | "mh" | "hi" | "ka";

export interface DignitaryInfo {
  cmName: string;
  cmTitle: string;
  cmState: string;
  rmName: string;
  rmTitle: string;
  rmDept: string;
}

export const DIGNITARY_REGISTRY: Record<string, Record<LangCode, DignitaryInfo>> = {
  national: {
    en: { cmName: "Narendra Modi", cmTitle: "Hon'ble Prime Minister", cmState: "Government of India", rmName: "Shivraj Singh Chouhan", rmTitle: "Hon'ble Union Minister", rmDept: "Rural Dev & Land Resources" },
    ta: { cmName: "நரேந்திர மோடி", cmTitle: "மாண்புமிகு பாரதப் பிரதமர்", cmState: "இந்திய அரசு", rmName: "சிவராஜ் சிங் சௌகான்", rmTitle: "மாண்புமிகு மத்திய அமைச்சர்", rmDept: "ஊரக வளர்ச்சி மற்றும் நில வளம்" },
    mh: { cmName: "नरेंद्र मोदी", cmTitle: "मा. प्रधानमंत्री", cmState: "भारत सरकार", rmName: "शिवराज सिंह चौहान", rmTitle: "मा. केंद्रीय मंत्री", rmDept: "ग्रामीण विकास व भू-संसाधन" },
    hi: { cmName: "नरेन्द्र मोदी", cmTitle: "माननीय प्रधानमंत्री", cmState: "भारत सरकार", rmName: "शिवराज सिंह चौहान", rmTitle: "माननीय केंद्रीय मंत्री", rmDept: "ग्रामीण विकास एवं भू-संसाधन" },
    ka: { cmName: "ನರೇಂದ್ರ ಮೋದಿ", cmTitle: "ಗೌರವಾನ್ವಿತ ಪ್ರಧಾನಮಂತ್ರಿ", cmState: "ಭಾರತ ಸರ್ಕಾರ", rmName: "ಶಿವರಾಜ್ ಸಿಂಗ್ ಚೌಹಾಣ್", rmTitle: "ಗೌರವಾನ್ವಿತ ಕೇಂದ್ರ ಸಚಿವರು", rmDept: "ಗ್ರಾಮೀಣಾಭಿವೃದ್ಧಿ ಮತ್ತು ಭೂ ಕಂದಾಯ" },
  },
  tn: {
    en: { cmName: "Vijay", cmTitle: "Hon'ble Chief Minister", cmState: "Govt of Tamil Nadu", rmName: "N. Anand", rmTitle: "Hon'ble Revenue Minister", rmDept: "Revenue & Disaster Mgmt" },
    ta: { cmName: "விஜய்", cmTitle: "மாண்புமிகு முதலமைச்சர்", cmState: "தமிழ்நாடு அரசு", rmName: "என். ஆனந்த்", rmTitle: "மாண்புமிகு வருவாய்த்துறை அமைச்சர்", rmDept: "வருவாய் மற்றும் பேரிடர் மேலாண்மை" },
    mh: { cmName: "विजय", cmTitle: "मा. मुख्यमंत्री", cmState: "तमिळनाडू शासन", rmName: "एन. आनंद", rmTitle: "मा. महसूल मंत्री", rmDept: "महसूल व आपत्ती व्यवस्थापन" },
    hi: { cmName: "विजय", cmTitle: "माननीय मुख्यमंत्री", cmState: "तमिलनाडु सरकार", rmName: "एन. आनंद", rmTitle: "माननीय राजस्व मंत्री", rmDept: "राजस्व एवं आपदा प्रबंधन" },
    ka: { cmName: "ವಿಜಯ್", cmTitle: "ಗೌರವಾನ್ವಿತ ಮುಖ್ಯಮಂತ್ರಿ", cmState: "ತಮಿಳುನಾಡು ಸರ್ಕಾರ", rmName: "ಎನ್. ಆನಂದ್", rmTitle: "ಗೌರವಾನ್ವಿತ ಕಂದಾಯ ಸಚಿವರು", rmDept: "ಕಂದಾಯ ಮತ್ತು ದುರಂತ ನಿರ್ವಹಣೆ" },
  },
  mh: {
    en: { cmName: "Eknath Shinde", cmTitle: "Hon'ble Chief Minister", cmState: "Govt of Maharashtra", rmName: "Radhakrishna Vikhe Patil", rmTitle: "Hon'ble Revenue Minister", rmDept: "Revenue & Forest Dept" },
    ta: { cmName: "ஏக்நாத் ஷிண்டே", cmTitle: "மாண்புமிகு முதலமைச்சர்", cmState: "மகாராஷ்டிர அரசு", rmName: "ராதாகிருஷ்ண விக்கே பாட்டீல்", rmTitle: "மாண்புமிகு வருவாய்த்துறை அமைச்சர்", rmDept: "வருவாய் மற்றும் வனத்துறை" },
    mh: { cmName: "एकनाथ शिंदे", cmTitle: "मा. मुख्यमंत्री", cmState: "महाराष्ट्र शासन", rmName: "राधाकृष्ण विखे पाटील", rmTitle: "मा. महसूल मंत्री", rmDept: "महसूल व वन विभाग" },
    hi: { cmName: "एकनाथ शिंदे", cmTitle: "माननीय मुख्यमंत्री", cmState: "महाराष्ट्र सरकार", rmName: "राधाकृष्ण विखे पाटिल", rmTitle: "माननीय राजस्व मंत्री", rmDept: "राजस्व एवं वन विभाग" },
    ka: { cmName: "ಏಕನಾಥ ಶಿಂದೆ", cmTitle: "ಗೌರವಾನ್ವಿತ ಮುಖ್ಯಮಂತ್ರಿ", cmState: "ಮಹಾರಾಷ್ಟ್ರ ಸರ್ಕಾರ", rmName: "ರಾಧಾಕೃಷ್ಣ ವಿಖೇ ಪಾಟೀಲ್", rmTitle: "ಗೌರವಾನ್ವಿತ ಕಂದಾಯ ಸಚಿವರು", rmDept: "ಕಂದಾಯ ಮತ್ತು ಅರಣ್ಯ ಇಲಾಖೆ" },
  },
  up: {
    en: { cmName: "Yogi Adityanath", cmTitle: "Hon'ble Chief Minister", cmState: "Govt of Uttar Pradesh", rmName: "Anup Pradhan", rmTitle: "Hon'ble Minister of State", rmDept: "Revenue Department" },
    ta: { cmName: "யோகி ஆதித்யநாத்", cmTitle: "மாண்புமிகு முதலமைச்சர்", cmState: "உத்தரப் பிரதேச அரசு", rmName: "அனுப் பிரதான்", rmTitle: "மாண்புமிகு வருவாய்த்துறை அமைச்சர்", rmDept: "வருவாய்த் துறை" },
    mh: { cmName: "योगी आदित्यनाथ", cmTitle: "मा. मुख्यमंत्री", cmState: "उत्तर प्रदेश शासन", rmName: "अनूप प्रधान", rmTitle: "मा. महसूल राज्यमंत्री", rmDept: "महसूल विभाग" },
    hi: { cmName: "योगी आदित्यनाथ", cmTitle: "माननीय मुख्यमंत्री", cmState: "उत्तर प्रदेश सरकार", rmName: "अनूप प्रधान", rmTitle: "माननीय राज्यमंत्री", rmDept: "राजस्व विभाग" },
    ka: { cmName: "ಯೋಗಿ ಆದಿತ್ಯನಾಥ್", cmTitle: "ಗೌರವಾನ್ವಿತ ಮುಖ್ಯಮಂತ್ರಿ", cmState: "ಉತ್ತರ ಪ್ರದೇಶ ಸರ್ಕಾರ", rmName: "ಅನೂಪ್ ಪ್ರಧಾನ್", rmTitle: "ಗೌರವಾನ್ವಿತ ಕಂದಾಯ ಸಚಿವರು", rmDept: "ಕಂದಾಯ ಇಲಾಖೆ" },
  },
  ka: {
    en: { cmName: "Siddaramaiah", cmTitle: "Hon'ble Chief Minister", cmState: "Govt of Karnataka", rmName: "Krishna Byre Gowda", rmTitle: "Hon'ble Revenue Minister", rmDept: "Revenue Department" },
    ta: { cmName: "சித்தரமையா", cmTitle: "மாண்புமிகு முதலமைச்சர்", cmState: "கர்நாடக அரசு", rmName: "கிருஷ்ண பைரே கவுடா", rmTitle: "மாண்புமிகு வருவாய்த்துறை அமைச்சர்", rmDept: "வருவாய்த் துறை" },
    mh: { cmName: "सिद्धरामय्या", cmTitle: "मा. मुख्यमंत्री", cmState: "कर्नाटक शासन", rmName: "कृष्णा बायरे गौडा", rmTitle: "मा. महसूल मंत्री", rmDept: "महसूल विभाग" },
    hi: { cmName: "सिद्धारमैया", cmTitle: "माननीय मुख्यमंत्री", cmState: "कर्नाटक सरकार", rmName: "कृष्णा बायरे गौड़ा", rmTitle: "माननीय राजस्व मंत्री", rmDept: "राजस्व विभाग" },
    ka: { cmName: "ಸಿದ್ದರಾಮಯ್ಯ", cmTitle: "ಗೌರವಾನ್ವಿತ ಮುಖ್ಯಮಂತ್ರಿ", cmState: "ಕರ್ನಾಟಕ ಸರ್ಕಾರ", rmName: "ಕೃಷ್ಣ ಬೈರೇಗೌಡ", rmTitle: "ಗೌರವಾನ್ವಿತ ಕಂದಾಯ ಸಚಿವರು", rmDept: "ಕಂದಾಯ ಇಲಾಖೆ" },
  }
};

const DICTIONARY: Record<string, Record<LangCode, string>> = {
  header_title: {
    en: "Terra_vault - National Land Administration System",
    ta: "டெர்ரா_வால்ட் - தேசிய நில நிர்வாக அமைப்பு",
    mh: "टेरा_व्हॉल्ट - राष्ट्रीय भू-महसूल प्रणाली",
    hi: "टेरा_वॉल्ट - राष्ट्रीय भू-राजस्व पोर्टल",
    ka: "ಟೆರ್ರಾ_ವಾಲ್ಟ್ - ರಾಷ್ಟ್ರೀಯ ಭೂ ಕಂದಾಯ ವ್ಯವಸ್ಥೆ",
  },
  motto: {
    en: "Digital India Land Records Modernization Programme (DILRMP 2.0)",
    ta: "டிஜிட்டல் இந்தியா நிலப் பதிவேடுகள் நவீனமயமாக்கல் திட்டம் (DILRMP 2.0)",
    mh: "डिजिटल इंडिया भू-अभिलेख आधुनिकीकरण कार्यक्रम (DILRMP 2.0)",
    hi: "डिजिटल इंडिया भू-अभिलेख आधुनिकीकरण कार्यक्रम (DILRMP 2.0)",
    ka: "ಡಿಜಿಟಲ್ ಇಂಡಿಯಾ ಭೂದಾಖಲೆಗಳ ಆಧುನಿಕೀಕರಣ ಯೋಜನೆ (DILRMP 2.0)",
  },
  national_gateway_title: {
    en: "National Land Records & Spatial Cadastral Portal",
    ta: "தேசிய நிலப் பதிவேடுகள் & வரைபடcadastral தளம்",
    mh: "राष्ट्रीय भू-अभिलेख व मोजणी नकाशा पोर्टल",
    hi: "राष्ट्रीय भू-अभिलेख एवं मानचित्र कैडस्ट्रल पोर्टल",
    ka: "ರಾಷ್ಟ್ರೀಯ ಭೂದಾಖಲೆಗಳು ಮತ್ತು ಕೆಡಸ್ಟ್ರಲ್ ಪೋರ್ಟಲ್",
  },
  national_gateway_sub: {
    en: "Select your State Revenue Administration Portal below.",
    ta: "கீழே உள்ள உங்கள் மாநில வருவாய் நிர்வாகத் தளத்தைத் தேர்ந்தெடுக்கவும்.",
    mh: "खालील आपल्या राज्य महसूल प्रशासन पोर्टलची निवड करा.",
    hi: "नीचे अपने राज्य के राजस्व प्रशासन पोर्टल का चयन करें।",
    ka: "ಕೆಳಗೆ ನಿಮ್ಮ ರಾಜ್ಯದ ಕಂದಾಯ ಆಡಳಿತ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ.",
  },
  select_state_heading: {
    en: "Select State Revenue Portal",
    ta: "மாநில வருவாய் தளத்தைத் தேர்ந்தெடுக்கவும்",
    mh: "राज्य महसूल पोर्टल निवडा",
    hi: "राज्य राजस्व पोर्टल चुनें",
    ka: "ರಾಜ್ಯ ಕಂದಾಯ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ",
  },
  enter_portal_btn: {
    en: "Enter State Portal",
    ta: "மாநிலத் தளத்தில் நுழைக",
    mh: "राज्य पोर्टलवर जा",
    hi: "राज्य पोर्टल में प्रवेश करें",
    ka: "ರಾಜ್ಯ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ",
  },
  citizen_services: {
    en: "G2C (Citizen Services)",
    ta: "G2C (பொதுமக்கள் சேவைகள்)",
    mh: "G2C (नागरिक सेवा)",
    hi: "G2C (नागरिक सेवाएं)",
    ka: "G2C (ನಾಗರಿಕ ಸೇವೆಗಳು)",
  },
  officer_desks: {
    en: "G2G (Revenue Officers)",
    ta: "G2G (வருவாய் அலுவலர்கள்)",
    mh: "G2G (महसूल अधिकारी)",
    hi: "G2G (राजस्व अधिकारी)",
    ka: "G2G (ಕಂದಾಯ ಅಧಿಕಾರಿಗಳು)",
  },
  business_sro: {
    en: "G2B (SRO & Bank Valuation)",
    ta: "G2B (சார்பதிவாளர் & வங்கி மதிப்பீடு)",
    mh: "G2B (दुय्यम निबंधक व बँक)",
    hi: "G2B (उप-निबंधक एवं बैंक)",
    ka: "G2B (ಸಬ್-ರೆಜಿಸ್ಟ್ರಾರ್)",
  },
  helpline_label: {
    en: "Toll-Free Helpline",
    ta: "இலவச உதவி எண்",
    mh: "टोल-फ्री हेल्पलाइन",
    hi: "टोल-फ्री हेल्पलाइन",
    ka: "ಉಚಿತ ಸಹಾಯವಾಣಿ",
  }
};

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  toggleLang: () => void;
  t: (key: string) => string;
  getDignitaries: (stateKey: string) => DignitaryInfo;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key,
  getDignitaries: () => DIGNITARY_REGISTRY.national.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_lang", newLang);
    }
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "ta" : "en");
  };

  useEffect(() => {
    const saved = localStorage.getItem("tv_lang") as LangCode;
    if (saved && ["en", "ta", "mh", "hi", "ka"].includes(saved)) {
      setLangState(saved);
    }
  }, []);

  const t = (key: string): string => {
    return DICTIONARY[key]?.[lang] || DICTIONARY[key]?.en || key;
  };

  const getDignitaries = (stateKey: string): DignitaryInfo => {
    const stateRegistry = DIGNITARY_REGISTRY[stateKey] || DIGNITARY_REGISTRY.national;
    return stateRegistry[lang] || stateRegistry.en;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, getDignitaries }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
