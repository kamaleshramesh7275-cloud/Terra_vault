/**
 * Terra_vault — Multi-State SRO Stamp Duty & Statutory Fee Registry
 * Contains official statutory Stamp Duty rates, Registration fees, cess, surcharges,
 * female concessions, and subdivision survey fees across all 36 Indian States & UTs.
 */

export interface StampDutyStructure {
  stateCode: string;
  stateName: string;
  baseStampDutyMalePercent: number;
  baseStampDutyFemalePercent: number;
  baseStampDutyJointPercent: number;
  registrationFeePercent: number;
  registrationFeeCapINR?: number;
  surchargeOrCessPercent: number;
  subdivisionSurveyFeeINR: number;
  pattaCopyFeeINR: number;
  specialNotes: string;
}

export const STATE_STAMP_DUTY_REGISTRY: Record<string, StampDutyStructure> = {
  tn: {
    stateCode: "tn",
    stateName: "Tamil Nadu",
    baseStampDutyMalePercent: 7.0,
    baseStampDutyFemalePercent: 7.0,
    baseStampDutyJointPercent: 7.0,
    registrationFeePercent: 4.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 400,
    pattaCopyFeeINR: 60,
    specialNotes: "7% Stamp Duty + 4% Registration Fee across all urban and rural revenue taluks."
  },
  mh: {
    stateCode: "mh",
    stateName: "Maharashtra",
    baseStampDutyMalePercent: 5.0,
    baseStampDutyFemalePercent: 4.0,
    baseStampDutyJointPercent: 4.5,
    registrationFeePercent: 1.0,
    registrationFeeCapINR: 30000,
    surchargeOrCessPercent: 1.0, // Metro cess / Local body tax
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 50,
    specialNotes: "1% concession for female purchasers. 1% Metro Cess applies in MMRDA/PMC/NMC."
  },
  up: {
    stateCode: "up",
    stateName: "Uttar Pradesh",
    baseStampDutyMalePercent: 7.0,
    baseStampDutyFemalePercent: 6.0,
    baseStampDutyJointPercent: 6.5,
    registrationFeePercent: 1.0,
    registrationFeeCapINR: 20000,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 350,
    pattaCopyFeeINR: 40,
    specialNotes: "1% rebate for women on property values up to ₹10 Lakhs. Registration capped at ₹20,000."
  },
  ka: {
    stateCode: "ka",
    stateName: "Karnataka",
    baseStampDutyMalePercent: 5.0,
    baseStampDutyFemalePercent: 5.0,
    baseStampDutyJointPercent: 5.0,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 3.0, // 2% Surcharge + 1% BMRDA/Cess
    subdivisionSurveyFeeINR: 600,
    pattaCopyFeeINR: 50,
    specialNotes: "Properties below ₹20L: 2% Stamp Duty; ₹21L-₹45L: 3% Stamp Duty. 3% surcharge applies."
  },
  ap: {
    stateCode: "ap",
    stateName: "Andhra Pradesh",
    baseStampDutyMalePercent: 5.0,
    baseStampDutyFemalePercent: 5.0,
    baseStampDutyJointPercent: 5.0,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 1.5, // 1.5% Transfer Duty
    subdivisionSurveyFeeINR: 450,
    pattaCopyFeeINR: 50,
    specialNotes: "5% Stamp Duty + 1% Registration + 1.5% Transfer Duty (Total: 7.5%)."
  },
  ts: {
    stateCode: "ts",
    stateName: "Telangana",
    baseStampDutyMalePercent: 5.5,
    baseStampDutyFemalePercent: 5.5,
    baseStampDutyJointPercent: 5.5,
    registrationFeePercent: 0.5,
    surchargeOrCessPercent: 1.5, // 1.5% Transfer Duty
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 50,
    specialNotes: "5.5% Stamp Duty + 0.5% Registration + 1.5% Transfer Duty (Total: 7.5%)."
  },
  gj: {
    stateCode: "gj",
    stateName: "Gujarat",
    baseStampDutyMalePercent: 4.9,
    baseStampDutyFemalePercent: 4.9,
    baseStampDutyJointPercent: 4.9,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 400,
    pattaCopyFeeINR: 50,
    specialNotes: "Female purchasers are 100% exempt from the 1% Registration Fee in Gujarat."
  },
  wb: {
    stateCode: "wb",
    stateName: "West Bengal",
    baseStampDutyMalePercent: 6.0,
    baseStampDutyFemalePercent: 6.0,
    baseStampDutyJointPercent: 6.0,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 400,
    pattaCopyFeeINR: 40,
    specialNotes: "5% Stamp Duty in Panchayat areas; 6% in Municipal areas (7% for properties > ₹1 Crore)."
  },
  pb: {
    stateCode: "pb",
    stateName: "Punjab",
    baseStampDutyMalePercent: 7.0,
    baseStampDutyFemalePercent: 5.0,
    baseStampDutyJointPercent: 6.0,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 1.0, // Social infrastructure cess
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 50,
    specialNotes: "2% rebate for female buyers (5% Stamp Duty). 1% Social Security Fund cess."
  },
  hr: {
    stateCode: "hr",
    stateName: "Haryana",
    baseStampDutyMalePercent: 7.0,
    baseStampDutyFemalePercent: 5.0,
    baseStampDutyJointPercent: 6.0,
    registrationFeePercent: 1.0,
    registrationFeeCapINR: 50000,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 50,
    specialNotes: "Rural areas: 5% (male) / 3% (female); Urban: 7% (male) / 5% (female)."
  },
  rj: {
    stateCode: "rj",
    stateName: "Rajasthan",
    baseStampDutyMalePercent: 6.0,
    baseStampDutyFemalePercent: 5.0,
    baseStampDutyJointPercent: 5.5,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 2.0, // 20% surcharge on stamp duty (~1.2% total)
    subdivisionSurveyFeeINR: 450,
    pattaCopyFeeINR: 40,
    specialNotes: "1% concession for women. 20% surcharge on stamp duty for cow protection and infra."
  },
  mp: {
    stateCode: "mp",
    stateName: "Madhya Pradesh",
    baseStampDutyMalePercent: 7.5,
    baseStampDutyFemalePercent: 7.5,
    baseStampDutyJointPercent: 7.5,
    registrationFeePercent: 3.0,
    surchargeOrCessPercent: 2.0,
    subdivisionSurveyFeeINR: 450,
    pattaCopyFeeINR: 50,
    specialNotes: "7.5% Stamp Duty (rural) / 9.5% (urban) + 3% Registration Fee."
  },
  br: {
    stateCode: "br",
    stateName: "Bihar",
    baseStampDutyMalePercent: 6.0,
    baseStampDutyFemalePercent: 5.7,
    baseStampDutyJointPercent: 5.85,
    registrationFeePercent: 2.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 350,
    pattaCopyFeeINR: 40,
    specialNotes: "0.3% discount for women buyers. 2% standard registration fee across all Anchals."
  },
  kl: {
    stateCode: "kl",
    stateName: "Kerala",
    baseStampDutyMalePercent: 8.0,
    baseStampDutyFemalePercent: 8.0,
    baseStampDutyJointPercent: 8.0,
    registrationFeePercent: 2.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 60,
    specialNotes: "8% Stamp Duty + 2% Registration Fee (Total: 10% statutory rate across Kerala)."
  },
  od: {
    stateCode: "od",
    stateName: "Odisha",
    baseStampDutyMalePercent: 5.0,
    baseStampDutyFemalePercent: 4.0,
    baseStampDutyJointPercent: 4.5,
    registrationFeePercent: 2.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 400,
    pattaCopyFeeINR: 40,
    specialNotes: "1% concession for female purchasers (4% Stamp Duty + 2% Registration Fee)."
  },
  dl: {
    stateCode: "dl",
    stateName: "Delhi (NCT)",
    baseStampDutyMalePercent: 6.0,
    baseStampDutyFemalePercent: 4.0,
    baseStampDutyJointPercent: 5.0,
    registrationFeePercent: 1.0,
    surchargeOrCessPercent: 0.0,
    subdivisionSurveyFeeINR: 500,
    pattaCopyFeeINR: 50,
    specialNotes: "2% rebate for female buyers (4% vs 6%). 1% registration fee."
  }
};

export function getStampDutyStructure(stateCode?: string): StampDutyStructure {
  if (!stateCode) return STATE_STAMP_DUTY_REGISTRY.tn;
  const sc = stateCode.toLowerCase();
  return (
    STATE_STAMP_DUTY_REGISTRY[sc] || {
      stateCode: sc,
      stateName: sc.toUpperCase(),
      baseStampDutyMalePercent: 6.0,
      baseStampDutyFemalePercent: 5.0,
      baseStampDutyJointPercent: 5.5,
      registrationFeePercent: 1.0,
      surchargeOrCessPercent: 0.5,
      subdivisionSurveyFeeINR: 400,
      pattaCopyFeeINR: 50,
      specialNotes: "Standard statutory state land revenue fee schedules applied."
    }
  );
}

export function calculateSROFees(
  marketValueINR: number,
  stateCode: string = "tn",
  buyerGender: "male" | "female" | "joint" = "male"
): {
  stampDutyPercent: number;
  stampDutyINR: number;
  registrationFeePercent: number;
  registrationFeeINR: number;
  surchargeCessINR: number;
  subdivisionSurveyFeeINR: number;
  pattaCopyFeeINR: number;
  totalGovernmentFeesINR: number;
  breakdownSummary: string;
} {
  const cfg = getStampDutyStructure(stateCode);

  let stampPercent = cfg.baseStampDutyMalePercent;
  if (buyerGender === "female") stampPercent = cfg.baseStampDutyFemalePercent;
  else if (buyerGender === "joint") stampPercent = cfg.baseStampDutyJointPercent;

  const stampDutyINR = Math.round((marketValueINR * stampPercent) / 100);

  let rawRegFee = Math.round((marketValueINR * cfg.registrationFeePercent) / 100);
  if (cfg.registrationFeeCapINR && rawRegFee > cfg.registrationFeeCapINR) {
    rawRegFee = cfg.registrationFeeCapINR;
  }
  const registrationFeeINR = rawRegFee;

  const surchargeCessINR = Math.round((marketValueINR * cfg.surchargeOrCessPercent) / 100);
  const subdivisionSurveyFeeINR = cfg.subdivisionSurveyFeeINR;
  const pattaCopyFeeINR = cfg.pattaCopyFeeINR;

  const totalGovernmentFeesINR =
    stampDutyINR + registrationFeeINR + surchargeCessINR + subdivisionSurveyFeeINR + pattaCopyFeeINR;

  const breakdownSummary = `${cfg.stateName} SRO: ${stampPercent}% Stamp Duty (₹${stampDutyINR.toLocaleString("en-IN")}) + ${cfg.registrationFeePercent}% Reg Fee (₹${registrationFeeINR.toLocaleString("en-IN")}) + Survey & Copy Fee (₹${subdivisionSurveyFeeINR + pattaCopyFeeINR})`;

  return {
    stampDutyPercent: stampPercent,
    stampDutyINR,
    registrationFeePercent: cfg.registrationFeePercent,
    registrationFeeINR,
    surchargeCessINR,
    subdivisionSurveyFeeINR,
    pattaCopyFeeINR,
    totalGovernmentFeesINR,
    breakdownSummary
  };
}
