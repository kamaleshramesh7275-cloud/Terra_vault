"""
Feature 2: Smart Field Cross-Validator
Cross-checks OCR-extracted deed fields for internal logical consistency,
flagging discrepancies between owner names, area values, stamp duty, and dates.
Fine-tuned: state stamp duty rates, per-name-length fuzzy, per-area deviation, 2 new rules.
"""
from dataclasses import dataclass, asdict
from typing import List, Optional
import re
from core.config import settings

# State-configurable stamp duty rates
STATE_STAMP_DUTY = {
    "TN": settings.CROSSVAL_STAMP_DUTY_TN,   # Tamil Nadu 7%
    "MH": settings.CROSSVAL_STAMP_DUTY_MH,   # Maharashtra 6%
    "UP": settings.CROSSVAL_STAMP_DUTY_UP,   # Uttar Pradesh 5%
    "KA": settings.CROSSVAL_STAMP_DUTY_KA,   # Karnataka 5.6%
}

# State-wise survey number patterns
STATE_SURVEY_PATTERNS = {
    "TN": r"^\d{1,4}(/[A-Z])?$",      # TN: 104/A or 104
    "MH": r"^\d{1,4}(-[A-Z])?$",      # MH: 104-A or 104
    "UP": r"^\d{1,4}(/\d+)?$",         # UP: 104/1 or 104
    "KA": r"^\d{1,4}[A-Z]?$",          # KA: 104A or 104
}


@dataclass
class ValidationResult:
    rule_id: str
    field_a: str
    field_b: str
    description: str
    expected: str
    actual: str
    severity: str       # "ERROR" | "WARNING" | "INFO"
    passed: bool

    def to_dict(self) -> dict:
        return asdict(self)


class SmartFieldCrossValidator:
    """Validates logical consistency across OCR-extracted land record fields."""

    def validate(self, fields: dict) -> List[ValidationResult]:
        """
        Args:
            fields: dict with keys: owner_name, mutation_owner, area_ocr_sqm,
                    gis_area_sqm, stamp_duty_inr, sale_consideration_inr,
                    registration_date, mutation_date, state_code (TN/MH/UP/KA),
                    survey_no, executant_birth_year
        Returns:
            List of ValidationResult per rule.
        """
        results = []
        state = str(fields.get("state_code", "TN")).upper()

        # Rule 1: Owner name fuzzy match — adaptive per name length
        owner = str(fields.get("owner_name", ""))
        mut_owner = str(fields.get("mutation_owner", ""))
        if owner and mut_owner:
            threshold = (
                settings.CROSSVAL_OWNER_FUZZY_SHORT if len(owner) <= 5
                else settings.CROSSVAL_OWNER_FUZZY_LONG
            )
            similarity = self._levenshtein_ratio(owner.lower(), mut_owner.lower())
            results.append(ValidationResult(
                rule_id="RULE_01_OWNER_NAME_MATCH",
                field_a="owner_name", field_b="mutation_owner",
                description=f"Owner name must fuzzy-match mutation register (≥{threshold:.0%} similarity)",
                expected=f"≥{threshold:.0%} match (got {similarity:.0%})",
                actual=f"{owner!r} vs {mut_owner!r}",
                severity="ERROR" if similarity < threshold else "INFO",
                passed=similarity >= threshold,
            ))

        # Rule 2: Area cross-check — per-area-size deviation tolerance
        area_ocr = fields.get("area_ocr_sqm")
        area_gis = fields.get("gis_area_sqm")
        if area_ocr is not None and area_gis is not None:
            try:
                gis_f = float(area_gis)
                ocr_f = float(area_ocr)
                diff_pct = abs(ocr_f - gis_f) / max(gis_f, 1) * 100
                tolerance = (
                    settings.CROSSVAL_AREA_SMALL_DEVIATION * 100 if gis_f <= 1000
                    else settings.CROSSVAL_AREA_LARGE_DEVIATION * 100
                )
                results.append(ValidationResult(
                    rule_id="RULE_02_AREA_GIS_MATCH",
                    field_a="area_ocr_sqm", field_b="gis_area_sqm",
                    description=f"OCR area must be within {tolerance:.0f}% of GIS parcel area",
                    expected=f"≤{tolerance:.0f}% area deviation",
                    actual=f"{diff_pct:.1f}% deviation ({area_ocr} vs {area_gis} sq.m)",
                    severity="WARNING" if diff_pct > tolerance else "INFO",
                    passed=diff_pct <= tolerance,
                ))
            except (ValueError, TypeError):
                pass

        # Rule 3: Stamp Duty vs Sale Consideration — state-configurable rate
        stamp = fields.get("stamp_duty_inr")
        sale = fields.get("sale_consideration_inr")
        if stamp is not None and sale is not None:
            try:
                rate = STATE_STAMP_DUTY.get(state, settings.CROSSVAL_STAMP_DUTY_TN) * 100
                ratio = float(stamp) / max(float(sale), 1) * 100
                results.append(ValidationResult(
                    rule_id="RULE_03_STAMP_DUTY_RATIO",
                    field_a="stamp_duty_inr", field_b="sale_consideration_inr",
                    description=f"Stamp Duty must be ≥{rate:.1f}% of Sale Consideration ({state} rate)",
                    expected=f"≥{rate:.1f}% stamp ratio",
                    actual=f"{ratio:.1f}% (₹{stamp} on ₹{sale})",
                    severity="ERROR" if ratio < rate else "INFO",
                    passed=ratio >= rate,
                ))
            except (ValueError, TypeError):
                pass

        # Rule 4: Mutation date must be after Registration date
        reg_date = fields.get("registration_date", "")
        mut_date = fields.get("mutation_date", "")
        if reg_date and mut_date:
            reg_parsed = self._parse_date(reg_date)
            mut_parsed = self._parse_date(mut_date)
            if reg_parsed and mut_parsed:
                passed = mut_parsed >= reg_parsed
                results.append(ValidationResult(
                    rule_id="RULE_04_DATE_SEQUENCE",
                    field_a="registration_date", field_b="mutation_date",
                    description="Mutation date must be on or after Registration date",
                    expected=f"mutation_date ≥ {reg_date}",
                    actual=f"registration={reg_date}, mutation={mut_date}",
                    severity="ERROR" if not passed else "INFO",
                    passed=passed,
                ))

        # Rule 5 (NEW): Survey number format must match state pattern
        survey = str(fields.get("survey_no", "")).strip()
        if survey and state in STATE_SURVEY_PATTERNS:
            pattern = STATE_SURVEY_PATTERNS[state]
            is_valid = bool(re.match(pattern, survey))
            results.append(ValidationResult(
                rule_id="RULE_05_SURVEY_FORMAT",
                field_a="survey_no", field_b="state_code",
                description=f"Survey/Khasra number must match {state} format pattern",
                expected=f"Pattern: {pattern}",
                actual=f"{survey!r} (state={state})",
                severity="WARNING" if not is_valid else "INFO",
                passed=is_valid,
            ))

        # Rule 6 (NEW): Executant age must be >= 18 years
        birth_year = fields.get("executant_birth_year")
        reg_year_str = fields.get("registration_date", "")
        if birth_year and reg_year_str:
            try:
                reg_year_match = re.search(r"(\d{4})", reg_year_str)
                if reg_year_match:
                    reg_year = int(reg_year_match.group(1))
                    age = reg_year - int(birth_year)
                    is_adult = age >= 18
                    results.append(ValidationResult(
                        rule_id="RULE_06_EXECUTANT_AGE",
                        field_a="executant_birth_year", field_b="registration_date",
                        description="Executant must be ≥ 18 years old at time of registration",
                        expected="Age ≥ 18 at registration",
                        actual=f"Age = {age} (born {birth_year}, registered {reg_year})",
                        severity="ERROR" if not is_adult else "INFO",
                        passed=is_adult,
                    ))
            except (ValueError, TypeError):
                pass

        return results

    def _levenshtein_ratio(self, s1: str, s2: str) -> float:
        if not s1 and not s2:
            return 1.0
        if not s1 or not s2:
            return 0.0
        m, n = len(s1), len(s2)
        dp = list(range(n + 1))
        for i in range(1, m + 1):
            prev = dp[:]
            dp[0] = i
            for j in range(1, n + 1):
                cost = 0 if s1[i-1] == s2[j-1] else 1
                dp[j] = min(dp[j] + 1, dp[j-1] + 1, prev[j-1] + cost)
        distance = dp[n]
        return 1.0 - distance / max(m, n)

    def _parse_date(self, date_str: str) -> Optional[str]:
        date_str = date_str.strip()
        m = re.search(r"(\d{2})[/-](\d{2})[/-](\d{4})", date_str)
        if m:
            return f"{m.group(3)}-{m.group(2)}-{m.group(1)}"
        m2 = re.search(r"(\d{4})[/-](\d{2})[/-](\d{2})", date_str)
        if m2:
            return date_str
        return None
