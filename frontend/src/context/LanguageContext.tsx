"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ALL_INDIAN_STATES, StateDignitary } from "@/lib/stateRegistry";
import { DICTIONARY, translatePhrase } from "@/lib/translationDictionary";

export type LangCode =
  | "en"
  | "hi"
  | "ta"
  | "te"
  | "kn"
  | "mr"
  | "bn"
  | "gu"
  | "ml"
  | "pa"
  | "or"
  | "as"
  | "ur"
  | "sa"
  | "kok"
  | "ne"
  | "mai"
  | "ks"
  | "sd"
  | "doi"
  | "brx"
  | "sat"
  | "mni";

export interface LanguageInfo {
  code: LangCode;
  name: string;
  nativeName: string;
  script: string;
  region: string;
}

export const INDIAN_LANGUAGES: LanguageInfo[] = [
  { code: "en", name: "English", nativeName: "English", script: "Latin", region: "National / Pan-India" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", script: "Devanagari", region: "North / Central" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்", script: "Tamil", region: "Tamil Nadu, Puducherry" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు", script: "Telugu", region: "Andhra Pradesh, Telangana" },
  { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", script: "Kannada", region: "Karnataka" },
  { code: "mr", name: "Marathi", nativeName: "मराठी", script: "Devanagari", region: "Maharashtra, Goa" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", script: "Bengali", region: "West Bengal, Tripura" },
  { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી", script: "Gujarati", region: "Gujarat, DNH & DD" },
  { code: "ml", name: "Malayalam", nativeName: "മലയാളം", script: "Malayalam", region: "Kerala, Lakshadweep" },
  { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", script: "Gurmukhi", region: "Punjab, Chandigarh, Delhi" },
  { code: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", script: "Odia", region: "Odisha" },
  { code: "as", name: "Assamese", nativeName: "অসমীয়া", script: "Bengali-Assamese", region: "Assam" },
  { code: "ur", name: "Urdu", nativeName: "اردو", script: "Perso-Arabic", region: "Jammu & Kashmir, Telangana, UP" },
  { code: "sa", name: "Sanskrit", nativeName: "संस्कृतम्", script: "Devanagari", region: "Classical / National" },
  { code: "kok", name: "Konkani", nativeName: "कोंकणी", script: "Devanagari", region: "Goa, Coastal Karnataka" },
  { code: "ne", name: "Nepali", nativeName: "नेपाली", script: "Devanagari", region: "Sikkim, North Bengal" },
  { code: "mai", name: "Maithili", nativeName: "मैथिली", script: "Devanagari", region: "Bihar, Jharkhand" },
  { code: "ks", name: "Kashmiri", nativeName: "کٲشُر", script: "Perso-Arabic", region: "Jammu & Kashmir" },
  { code: "sd", name: "Sindhi", nativeName: "سنڌي", script: "Perso-Arabic / Dev", region: "Pan-India" },
  { code: "doi", name: "Dogri", nativeName: "डोगरी", script: "Devanagari", region: "Jammu & Kashmir" },
  { code: "brx", name: "Bodo", nativeName: "बड़ो", script: "Devanagari", region: "Assam (BTR)" },
  { code: "sat", name: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", script: "Ol Chiki", region: "Jharkhand, Odisha, WB" },
  { code: "mni", name: "Manipuri", nativeName: "মৈতৈলোন্", script: "Meitei / Bengali", region: "Manipur" },
];

export const NATIONAL_DIGNITARIES: StateDignitary = {
  cmName: "Narendra Modi",
  cmTitle: "Hon'ble Prime Minister",
  cmState: "Government of India",
  rmName: "Shivraj Singh Chouhan",
  rmTitle: "Hon'ble Union Minister",
  rmDept: "Rural Dev & Land Resources"
};

const CORE_DICTIONARY: Record<string, Record<string, string>> = {
  header_title: {
    en: "Terra_vault - National Land Administration System",
    hi: "टेरा_वॉल्ट - राष्ट्रीय भू-राजस्व एवं भूमि प्रशासन प्रणाली",
    ta: "டெர்ரா_வால்ட் - தேசிய நில நிர்வாக அமைப்பு",
    te: "టెర్రా_వాల్ట్ - జాతీయ భూ పరిపాలన వ్యవస్థ",
    kn: "ಟೆರ್ರಾ_ವಾಲ್ಟ್ - ರಾಷ್ಟ್ರೀಯ ಭೂ ಕಂದಾಯ ವ್ಯವಸ್ಥೆ",
    mr: "टेरा_व्हॉल्ट - राष्ट्रीय भू-महसूल प्रणाली",
    bn: "টেরা_ভল্ট - জাতীয় ভূমি প্রশাসন ব্যবস্থা",
    gu: "ટેરા_વોલ્ટ - રાષ્ટ્રીય જમીન વહીવટ પ્રણાલી",
    ml: "ടെറ_വോൾട്ട് - ദേശീയ ഭൂമി ഭരണ സംവിധാനം",
    pa: "ਟੈਰਾ_ਵਾਲਟ - ਰਾਸ਼ਟਰੀ ਭੂਮੀ ਪ੍ਰਸ਼ਾਸਨ ਪ੍ਰਣਾਲੀ",
    or: "ଟେରା_ଭଲ୍ଟ - ଜାତୀୟ ଭୂମି ପ୍ରଶାସନ ବ୍ୟବସ୍ଥା",
    as: "টেৰা_ভল্ট - ৰাষ্ট্ৰীয় ভূমি প্ৰশাসন ব্যৱস্থা",
    ur: "ٹیرا والٹ - نیشنل لینڈ ایڈمنسٹریشن سسٹم",
  },
  motto: {
    en: "Digital India Land Records Modernization Programme (DILRMP 2.0)",
    hi: "डिजिटल इंडिया भू-अभिलेख आधुनिकीकरण कार्यक्रम (DILRMP 2.0)",
    ta: "டிஜிட்டல் இந்தியா நிலப் பதிவேடுகள் நவீனமயமாக்கல் திட்டம் (DILRMP 2.0)",
    te: "డిజిటల్ ఇండియా భూ రికార్డుల ఆధునికీకరణ కార్యక్రమం (DILRMP 2.0)",
    kn: "ಡಿಜಿಟಲ್ ಇಂಡಿಯಾ ಭೂದಾಖಲೆಗಳ ಆಧುನಿಕೀಕರಣ ಯೋಜನೆ (DILRMP 2.0)",
    mr: "डिजिटल इंडिया भू-अभिलेख आधुनिकीकरण कार्यक्रम (DILRMP 2.0)",
    bn: "ডিজিটাল ইন্ডিয়া ভূমি রেকর্ড আধুনিকীকরণ কর্মসূচি (DILRMP 2.0)",
    gu: "ડિજિટલ ઇન્ડિયા લેન્ડ રેકોર્ડ્સ આધુનિકીકરણ કાર્યક્રમ (DILRMP 2.0)",
    ml: "ഡിജിറ്റൽ ഇന്ത്യ ഭൂമി രേഖ ആധുനികവൽക്കരണ പദ്ധതി (DILRMP 2.0)",
    pa: "ਡਿਜੀਟਲ ਇੰਡੀਆ ਭੂਮੀ ਰਿਕਾਰਡ ਆਧੁਨਿਕੀਕਰਨ ਪ੍ਰੋਗਰਾਮ (DILRMP 2.0)",
    or: "ଡିଜିଟାଲ୍ ଇଣ୍ଡିଆ ଭୂ-ଅଭିଲେଖ ଆଧୁନିକୀକରଣ କାର୍ଯ୍ୟକ୍ରମ (DILRMP 2.0)",
    as: "ডিজিটেল ইণ্ডিয়া ভূমি অভিলেখ আধুনিকীকৰণ কাৰ্যসূচী (DILRMP 2.0)",
    ur: "ڈیجیٹل انڈیا لینڈ ریکارڈز ماڈرنائزیشن پروگرام (DILRMP 2.0)",
  },
  national_gateway_title: {
    en: "National Land Records & Spatial Cadastral Portal",
    hi: "राष्ट्रीय भू-अभिलेख एवं मानचित्र कैडस्ट्रल पोर्टल",
    ta: "தேசிய நிலப் பதிவேடுகள் & வரைபட cadastral தளம்",
    te: "జాతీయ భూ రికార్డులు & ప్రాదేశిక కాడాస్ట్రల్ పోర్టల్",
    kn: "ರಾಷ್ಟ್ರೀಯ ಭೂದಾಖಲೆಗಳು ಮತ್ತು ಕೆಡಸ್ಟ್ರಲ್ ಪೋರ್ಟಲ್",
    mr: "राष्ट्रीय भू-अभिलेख व मोजणी नकाशा पोर्टल",
    bn: "জাতীয় ভূমি রেকর্ড ও স্পেশিয়াল ক্যাডাস্ট্রাল পোর্টাল",
    gu: "રાષ્ટ્રીય જમીન રેકોર્ડ્સ અને કેડેસ્ટ્રલ નકશા પોર્ટલ",
    ml: "ദേശീയ ഭൂമി രേഖകളും കാഡസ്ട്രൽ പോർട്ടലും",
    pa: "ਰਾਸ਼ਟਰੀ ਭੂਮੀ ਰਿਕਾਰਡ ਅਤੇ ਕੈਡਾਸਟ੍ਰਲ ਪੋਰਟਲ",
    or: "ଜାତୀୟ ଭୂ-ଅଭିଲେଖ ଓ କ୍ୟାଡାଷ୍ଟ୍ରାଲ୍ ପୋର୍ଟାଲ୍",
    as: "ৰাষ্ট্ৰীয় ভূমি অভিলেখ আৰু স্থানিক কেডেষ্ট্ৰেল পৰ্টেল",
    ur: "نیشنل لینڈ ریکارڈز اور اسپیشل کیڈسٹرل پورٹل",
  },
  national_gateway_sub: {
    en: "Select your State Revenue Administration Portal below.",
    hi: "नीचे अपने राज्य के राजस्व प्रशासन पोर्टल का चयन करें।",
    ta: "கீழே உள்ள உங்கள் மாநில வருவாய் நிர்வாகத் தளத்தைத் தேர்ந்தெடுக்கவும்.",
    te: "క్రింద మీ రాష్ట్ర రెవెన్యూ పరిపాలన పోర్టల్‌ను ఎంచుకోండి.",
    kn: "ಕೆಳಗೆ ನಿಮ್ಮ ರಾಜ್ಯದ ಕಂದಾಯ ಆಡಳಿತ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ.",
    mr: "खालील आपल्या राज्य महसूल प्रशासन पोर्टलची निवड करा.",
    bn: "নিচে আপনার রাজ্য রাজস্ব প্রশাসন পোর্টাল নির্বাচন করুন।",
    gu: "નીચે તમારા રાજ્ય મહેસૂલ વહીવટ પોર્ટલ પસંદ કરો.",
    ml: "താഴെ നിങ്ങളുടെ സംസ്ഥാന റവന്യൂ ഭരണ പോർട്ടൽ തിരഞ്ഞെടുക്കുക.",
    pa: "ਹੇਠਾਂ ਆਪਣੇ ਰਾਜ ਦੇ ਮਾਲ ਪ੍ਰਸ਼ਾਸਨ ਪੋਰਟਲ ਦੀ ਚੋਣ ਕਰੋ।",
    or: "ତଳେ ଆପଣଙ୍କ ରାଜ୍ୟ ରାଜସ୍ୱ ପ୍ରଶାସନ ପୋର୍ଟାଲ୍ ଚୟନ କରନ୍ତୁ।",
    as: "তলত আপোনাৰ ৰাজ্যিক ৰাজহ প্ৰশাসন পৰ্টেল নিৰ্বাচন কৰক।",
    ur: "نیچے اپنے ریاستی ریونیو ایڈمنسٹریشن پورٹل کا انتخاب کریں۔",
  },
  select_state_heading: {
    en: "Select State Revenue Portal",
    hi: "राज्य राजस्व पोर्टल चुनें",
    ta: "மாநில வருவாய் தளத்தைத் தேர்ந்தெடுக்கவும்",
    te: "రాష్ట్ర రెవెన్యూ పోర్టల్‌ను ఎంచుకోండి",
    kn: "ರಾಜ್ಯ ಕಂದಾಯ ಪೋರ್ಟಲ್ ಆಯ್ಕೆಮಾಡಿ",
    mr: "राज्य महसूल पोर्टल निवडा",
    bn: "রাজ্য রাজস্ব পোর্টাল নির্বাচন করুন",
    gu: "રાજ્ય મહેસૂલ પોર્ટલ પસંદ કરો",
    ml: "സംസ്ഥാന റവന്യൂ പോർട്ടൽ തിരഞ്ഞെടുക്കുക",
    pa: "ਰਾਜ ਮਾਲ ਪੋਰਟਲ ਚੁਣੋ",
    or: "ରାଜ୍ୟ ରାଜସ୍ୱ ପୋର୍ଟାଲ୍ ଚୟନ କରନ୍ତୁ",
    as: "ৰাজ্যিক ৰাজহ পৰ্টেল বাছক",
    ur: "ریاستی ریونیو پورٹل منتخب کریں",
  },
  enter_portal_btn: {
    en: "Enter State Portal",
    hi: "राज्य पोर्टल में प्रवेश करें",
    ta: "மாநிலத் தளத்தில் நுழைக",
    te: "రాష్ట్ర పోర్టల్‌లోకి ప్రవేశించండి",
    kn: "ರಾಜ್ಯ ಪೋರ್ಟಲ್ ಪ್ರವೇಶಿಸಿ",
    mr: "राज्य पोर्टलवर जा",
    bn: "রাজ্য পোর্টালে প্রবেশ করুন",
    gu: "રાજ્ય પોર્ટલમાં પ્રવેશ કરો",
    ml: "സംസ്ഥാന പോർട്ടലിൽ പ്രവേശിക്കുക",
    pa: "ਰਾਜ ਪੋਰਟਲ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ",
    or: "ରାଜ୍ୟ ପୋର୍ଟାଲରେ ପ୍ରବେଶ କରନ୍ତୁ",
    as: "ৰাজ্যিক পৰ্টেলত প্ৰৱেশ কৰক",
    ur: "ریاستی پورٹل میں داخل ہوں",
  },
  citizen_services: {
    en: "G2C (Citizen Services)",
    hi: "G2C (नागरिक सेवाएं)",
    ta: "G2C (பொதுமக்கள் சேவைகள்)",
    te: "G2C (పౌర సేవలు)",
    kn: "G2C (ನಾಗರಿಕ ಸೇವೆಗಳು)",
    mr: "G2C (नागरिक सेवा)",
    bn: "G2C (নাগরিক পরিষেবা)",
    gu: "G2C (નાગરિક સેવાઓ)",
    ml: "G2C (പൗര സേവനങ്ങൾ)",
    pa: "G2C (ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ)",
    or: "G2C (ନାଗରିକ ସେବା)",
    as: "G2C (নাগৰিক সেৱা)",
    ur: "G2C (شہری خدمات)",
  },
  officer_desks: {
    en: "G2G (Revenue Officers)",
    hi: "G2G (राजस्व अधिकारी)",
    ta: "G2G (வருவாய் அலுவலர்கள்)",
    te: "G2G (రెవెన్యూ అధికారులు)",
    kn: "G2G (ಕಂದಾಯ ಅಧಿಕಾರಿಗಳು)",
    mr: "G2G (महसूल अधिकारी)",
    bn: "G2G (রাজস্ব আধিকারিক)",
    gu: "G2G (મહેસૂલ અધિકારીઓ)",
    ml: "G2G (റവന്യൂ ഉദ്യോഗസ്ഥർ)",
    pa: "G2G (ਮਾਲ ਅਧਿਕਾਰੀ)",
    or: "G2G (ରାଜସ୍ୱ ଅଧିକାରୀ)",
    as: "G2G (ৰাজহ বিষয়া)",
    ur: "G2G (ریونیو آفیسرز)",
  },
  business_sro: {
    en: "G2B (SRO & Bank Valuation)",
    hi: "G2B (उप-निबंधक एवं बैंक)",
    ta: "G2B (சார்பதிவாளர் & வங்கி மதிப்பீடு)",
    te: "G2B (సబ్-రిజిస్ట్రార్ & బ్యాంకులు)",
    kn: "G2B (ಸಬ್-ರೆಜಿಸ್ಟ್ರಾರ್ & ಬ್ಯಾಂಕ್)",
    mr: "G2B (दुय्यम निबंधक व बँक)",
    bn: "G2B (সাব-রেজিস্ট্রার ও ব্যাঙ্ক)",
    gu: "G2B (સબ-રજિસ્ટ્રાર અને બેંક)",
    ml: "G2B (സബ്-രജിസ്ട്രാർ & ബാങ്ക്)",
    pa: "G2B (ਸਬ-ਰਜਿਸਟਰਾਰ ਅਤੇ ਬੈਂਕ)",
    or: "G2B (ସବ୍-ରେଜିଷ୍ଟ୍ରାର୍ ଏବଂ ବ୍ୟାଙ୍କ)",
    as: "G2B (উপ-পঞ্জীয়ক আৰু বেংক)",
    ur: "G2B (سب رجسٹرار اور بینک)",
  },
  helpline_label: {
    en: "Toll-Free Helpline",
    hi: "टोल-फ्री हेल्पलाइन",
    ta: "இலவச உதவி எண்",
    te: "టోల్-ఫ్రీ హెల్ప్‌లైన్",
    kn: "ಉಚಿತ ಸಹಾಯವಾಣಿ",
    mr: "टोल-फ्री हेल्पलाइन",
    bn: "টোল-ফ্রি হেল্পলাইন",
    gu: "ટોલ-ફ્રી હેલ્પલાઇન",
    ml: "ടോൾ-ഫ്രീ ഹെൽപ്പ് ലൈൻ",
    pa: "ਟੋਲ-ਫ੍ਰੀ ਹੈਲਪਲਾਈਨ",
    or: "ଟୋଲ୍-ଫ୍ରି ହେଲ୍ପଲାଇନ୍",
    as: "টোল-ফ্ৰী হেল্পলাইন",
    ur: "ٹول فری ہیلپ لائن",
  },
  search_state_placeholder: {
    en: "Search all 36 States & UTs by name, language or land record term (e.g. Satbara, Patta, Khatauni, Adangal)...",
    hi: "नाम, भाषा या भूमि रिकॉर्ड पद (जैसे सातबारा, खतौनी, पट्टा, नकल) द्वारा सभी 36 राज्य और केंद्र शासित प्रदेश खोजें...",
    ta: "பெயர், மொழி அல்லது பட்டா, சிட்டா, அடங்கல் மூலம் 36 மாநிலங்கள் & யூனியன் பிரதேசங்களை தேடுங்கள்...",
    te: "పేరు, భాష లేదా అడంగల్, పట్టా ద్వారా 36 రాష్ట్రాలు & కేంద్రపాలిత ప్రాంతాలను వెతకండి...",
    kn: "ಹೆಸರು, ಭಾಷೆ ಅಥವಾ ಪಹಣಿ, ಆರ್‌ಟಿಸಿ ಮೂಲಕ 36 ರಾಜ್ಯಗಳನ್ನು ಹುಡುಕಿ...",
    mr: "नाव, भाषा किंवा सातबारा, फेरफार द्वारे सर्व ३६ राज्ये व केंद्रशासित प्रदेश शोधा...",
    bn: "নাম, ভাষা বা খতিয়ান, পর্চা দিয়ে ৩৬টি রাজ্য ও কেন্দ্রশাসিত অঞ্চল খুঁজুন...",
    gu: "નામ, ભાષા અથવા ૭/૧૨, હક્ક પત્રક દ્વારા તમામ ૩૬ રાજ્યો શોધો...",
    ml: "പേര്, ഭാഷ അല്ലെങ്കിൽ തണ്ടപ്പേര് വഴി 36 സംസ്ഥാനങ്ങൾ തിരയുക...",
    pa: "ਨਾਮ, ਭਾਸ਼ਾ ਜਾਂ ਜਮ੍ਹਾਂਬੰਦੀ, ਫਰਦ ਦੁਆਰਾ ਸਾਰੇ 36 ਰਾਜ ਖੋਜੋ...",
    or: "ନାମ, ଭାଷା କିମ୍ବା ଖତିୟାନ, ପଟ୍ଟା ଦ୍ୱାରା ସମସ୍ତ ୩୬ ରାଜ୍ୟ ଖୋଜନ୍ତୁ...",
    as: "নাম, ভাষা বা জমাবন্দী, চিঠা দ্বাৰা ৩৬খন ৰাজ্য সন্ধান কৰক...",
    ur: "نام، زبان یا ختونی، پٹہ کے ذریعے تمام 36 ریاستیں تلاش کریں...",
  }
};

// Cache to hold original English text for all text nodes in the DOM
const originalTextMap = new WeakMap<Node, string>();

function translateDOMTree(root: Node, targetLang: string) {
  if (!root) return;

  // If text node
  if (root.nodeType === Node.TEXT_NODE) {
    const currentVal = root.nodeValue || "";
    if (!originalTextMap.has(root)) {
      originalTextMap.set(root, currentVal);
    }
    const orig = originalTextMap.get(root) || currentVal;
    if (!orig || !orig.trim()) return;

    if (targetLang === "en") {
      if (root.nodeValue !== orig) {
        root.nodeValue = orig;
      }
    } else {
      const translated = translatePhrase(orig, targetLang);
      if (translated && translated !== orig && root.nodeValue !== translated) {
        root.nodeValue = translated;
      }
    }
    return;
  }

  // If element node
  if (root.nodeType === Node.ELEMENT_NODE) {
    const el = root as HTMLElement;
    const tag = el.tagName ? el.tagName.toUpperCase() : "";
    if (["SCRIPT", "STYLE", "SVG", "CODE", "PRE", "NOSCRIPT", "TEXTAREA"].includes(tag)) {
      return;
    }
    if (el.getAttribute && el.getAttribute("translate") === "no") {
      return;
    }

    // Translate placeholder if present
    if (el instanceof HTMLInputElement && el.placeholder) {
      if (!el.dataset.origPlaceholder) {
        el.dataset.origPlaceholder = el.placeholder;
      }
      const origP = el.dataset.origPlaceholder;
      if (targetLang === "en") {
        el.placeholder = origP;
      } else {
        el.placeholder = translatePhrase(origP, targetLang);
      }
    }

    // Translate title if present
    if (el.title) {
      if (!el.dataset.origTitle) {
        el.dataset.origTitle = el.title;
      }
      const origT = el.dataset.origTitle;
      if (targetLang === "en") {
        el.title = origT;
      } else {
        el.title = translatePhrase(origT, targetLang);
      }
    }

    // Recurse children
    const childNodes = Array.from(root.childNodes);
    for (const child of childNodes) {
      translateDOMTree(child, targetLang);
    }
  }
}

interface LanguageContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang?: LangCode) => string;
  getDignitaries: (stateKey: string) => StateDignitary;
  isTranslating: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
  translateText: (text) => text,
  getDignitaries: () => NATIONAL_DIGNITARIES,
  isTranslating: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const pathname = usePathname();

  // Initialize and trigger Google/DOM live translation bridge
  const triggerDOMTranslation = useCallback((targetLang: LangCode) => {
    if (typeof window === "undefined") return;

    // 1. Direct Instant Client-side DOM translation across all text nodes
    translateDOMTree(document.body, targetLang);

    // 2. Set cookie for Google translate element bridge as secondary pass
    const googleLangMap: Record<string, string> = {
      en: "en",
      hi: "hi",
      ta: "ta",
      te: "te",
      kn: "kn",
      mr: "mr",
      bn: "bn",
      gu: "gu",
      ml: "ml",
      pa: "pa",
      or: "or",
      as: "as",
      ur: "ur",
      sa: "sa",
      kok: "gom",
      ne: "ne",
      mai: "mai",
      ks: "ks",
      sd: "sd",
      doi: "doi",
      brx: "brx",
      sat: "sat",
      mni: "mni",
    };

    const gCode = googleLangMap[targetLang] || targetLang;

    // Update googtrans cookie
    const cookieVal = `/en/${gCode}`;
    document.cookie = `googtrans=${cookieVal}; path=/;`;

    // Try dispatching translate element change if initialized
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      if (combo.value !== gCode) {
        combo.value = gCode;
        combo.dispatchEvent(new Event("change"));
      }
    } else {
      window.dispatchEvent(new CustomEvent("terra_lang_change", { detail: { lang: targetLang, gCode } }));
    }
  }, []);

  const setLang = (newLang: LangCode) => {
    setLangState(newLang);
    setIsTranslating(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("tv_lang", newLang);
      triggerDOMTranslation(newLang);
      setTimeout(() => setIsTranslating(false), 300);
    }
  };

  // Re-trigger translation automatically whenever Next.js client route changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    const current = (localStorage.getItem("tv_lang") as LangCode) || lang;
    if (current) {
      const timer = setTimeout(() => {
        triggerDOMTranslation(current);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pathname, lang, triggerDOMTranslation]);

  // Dynamic MutationObserver to catch newly mounted React nodes (tables, modals, API data)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let debounceTimer: NodeJS.Timeout;
    const observer = new MutationObserver((mutations) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const currentLang = (localStorage.getItem("tv_lang") as LangCode) || lang;
        if (currentLang && currentLang !== "en") {
          for (const m of mutations) {
            if (m.addedNodes && m.addedNodes.length > 0) {
              m.addedNodes.forEach((node) => translateDOMTree(node, currentLang));
            }
          }
        }
      }, 100);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      clearTimeout(debounceTimer);
    };
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("tv_lang") as LangCode;
    const validCodes = INDIAN_LANGUAGES.map((l) => l.code);
    if (saved && validCodes.includes(saved)) {
      setLangState(saved);
      triggerDOMTranslation(saved);
    }

    // Inject Google Translate script if not already present
    if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);

      (window as any).googleTranslateElementInit = () => {
        if ((window as any).google && (window as any).google.translate) {
          try {
            new (window as any).google.translate.TranslateElement(
              {
                pageLanguage: "en",
                includedLanguages: "en,hi,ta,te,kn,mr,bn,gu,ml,pa,or,as,ur,sa,gom,ne,mai,ks,sd,doi,brx,sat,mni",
                autoDisplay: false,
                layout: (window as any).google.translate.TranslateElement.InlineLayout?.SIMPLE,
              },
              "google_translate_element"
            );
          } catch {}

          const current = (localStorage.getItem("tv_lang") as LangCode) || "en";
          if (current !== "en") {
            setTimeout(() => triggerDOMTranslation(current), 400);
          }
        }
      };
    }
  }, [triggerDOMTranslation]);

  const t = (key: string): string => {
    if (!key) return "";
    if (CORE_DICTIONARY[key]) {
      return CORE_DICTIONARY[key][lang] || CORE_DICTIONARY[key].en || key;
    }
    if (DICTIONARY[key] && DICTIONARY[key][lang]) {
      return DICTIONARY[key][lang];
    }
    return translatePhrase(key, lang);
  };

  const translateText = (text: string, targetLang?: LangCode): string => {
    const effectiveLang = targetLang || lang;
    return translatePhrase(text, effectiveLang);
  };

  const getDignitaries = (stateKey: string): StateDignitary => {
    if (!stateKey || stateKey === "national") {
      return NATIONAL_DIGNITARIES;
    }
    const st = ALL_INDIAN_STATES[stateKey.toLowerCase()];
    return st ? st.dignitaries : NATIONAL_DIGNITARIES;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateText, getDignitaries, isTranslating }}>
      {/* Container for Google Translate element */}
      <div id="google_translate_element" />
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

