"""
MediGuard AI — Medicine Safety Engine
======================================
Rule-based safety checker, fully extensible for ML integration.

Architecture:
  MedicineSafetyChecker
    ├── _check_allergies()          → allergy conflict detection
    ├── _check_drug_interactions()  → cross-medication interaction rules
    ├── _check_condition_restrictions() → condition-specific contraindications
    ├── _check_fitness_context()    → fitness data adjustments
    ├── _build_recommendation()     → timing + food advice
    └── check()                     → unified entry point → SafetyResult

To plug in ML later:
    Override check() with an ML model that returns the same SafetyResult dict.
"""

from __future__ import annotations
from dataclasses import dataclass, field, asdict
from typing import Optional
import re
import os
import json


# ---------------------------------------------------------------------------
# Data Classes
# ---------------------------------------------------------------------------

@dataclass
class SafetyResult:
    status: str                        # "SAFE" | "WARNING" | "UNSAFE"
    medicine: str
    reasons: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)
    timing: str = ""
    food_advice: str = ""
    advisory: str = ""
    severity_score: int = 0            # 0 (safe) → 100 (critical), for ML transitioning
    checks_performed: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# Medicine Knowledge Base  (rule engine — extensible for ML)
# ---------------------------------------------------------------------------

MEDICINE_DB: dict[str, dict] = {
    # -------- Analgesics / Antipyretics --------
    "paracetamol": {
        "aliases": ["acetaminophen", "tylenol", "calpol", "panadol", "dolo"],
        "class": "analgesic",
        "interactions": ["warfarin", "alcohol", "isoniazid"],
        "contraindications": ["liver disease", "alcohol dependency", "hepatitis"],
        "food": "after",
        "timing_note": "Can be taken with or without food. Take with water.",
        "advisory": "Do not exceed 4 g/day. Avoid alcohol completely.",
        "safe_with_fitness": True,
    },
    "ibuprofen": {
        "aliases": ["advil", "nurofen", "brufen", "motrin"],
        "class": "nsaid",
        "interactions": ["warfarin", "aspirin", "lisinopril", "enalapril",
                         "metformin", "lithium", "diuretics", "ssri"],
        "contraindications": ["peptic ulcer", "kidney disease", "hypertension",
                              "heart failure", "pregnancy", "asthma", "renal impairment"],
        "food": "after",
        "timing_note": "Always take immediately AFTER a full meal to protect stomach lining.",
        "advisory": "NSAIDs raise blood pressure. High-intensity exercise should be avoided while on NSAIDs.",
        "safe_with_fitness": False,  # not recommended with vigorous exercise
        "fitness_warning": "Avoid strenuous exercise while taking NSAIDs — risk of kidney stress and cardiovascular strain.",
    },
    "aspirin": {
        "aliases": ["disprin", "ecotrin", "acetylsalicylic acid", "asa"],
        "class": "nsaid",
        "interactions": ["warfarin", "ibuprofen", "clopidogrel", "heparin",
                         "ssri", "methotrexate", "lisinopril"],
        "contraindications": ["peptic ulcer", "bleeding disorder", "gout",
                              "renal impairment", "children under 16"],
        "food": "after",
        "timing_note": "Take after food or with a full glass of milk to protect stomach.",
        "advisory": "Low-dose aspirin for cardiac use requires medical supervision. Do not self-medicate.",
        "safe_with_fitness": False,
        "fitness_warning": "Aspirin impairs platelet function. Avoid contact sports while on high doses.",
    },
    "diclofenac": {
        "aliases": ["voltaren", "voveran", "diclo"],
        "class": "nsaid",
        "interactions": ["warfarin", "lithium", "diuretics", "methotrexate"],
        "contraindications": ["heart failure", "kidney disease", "peptic ulcer"],
        "food": "after",
        "timing_note": "Take during or immediately after meals.",
        "advisory": "Increases cardiovascular risk with long-term use.",
        "safe_with_fitness": False,
    },
    "naproxen": {
        "aliases": ["aleve", "naprosyn"],
        "class": "nsaid",
        "interactions": ["warfarin", "aspirin", "lithium", "ssri"],
        "contraindications": ["kidney disease", "peptic ulcer", "heart failure"],
        "food": "after",
        "timing_note": "Take after food.",
        "advisory": "Long-term use carries GI and cardiovascular risks.",
        "safe_with_fitness": False,
    },
    # -------- Antibiotics --------
    "amoxicillin": {
        "aliases": ["amox", "amoxil", "trimox"],
        "class": "penicillin_antibiotic",
        "interactions": ["warfarin", "methotrexate", "allopurinol", "oral_contraceptives"],
        "contraindications": ["penicillin allergy", "mononucleosis"],
        "food": "any",
        "timing_note": "Can be taken with or without food. Complete the full course.",
        "advisory": "Never stop early — completing the full antibiotic course is critical.",
        "safe_with_fitness": True,
    },
    "azithromycin": {
        "aliases": ["zithromax", "z-pack", "azee"],
        "class": "macrolide_antibiotic",
        "interactions": ["warfarin", "digoxin", "antacids", "ergot"],
        "contraindications": ["liver disease", "prolonged qt interval"],
        "food": "before",
        "timing_note": "Take 1 hour BEFORE or 2 hours AFTER food for best absorption.",
        "advisory": "May cause heart rhythm changes. Report palpitations or chest pain immediately.",
        "safe_with_fitness": True,
    },
    "ciprofloxacin": {
        "aliases": ["cipro", "ciprolet"],
        "class": "fluoroquinolone_antibiotic",
        "interactions": ["antacids", "warfarin", "theophylline", "tizanidine"],
        "contraindications": ["tendon problems", "epilepsy", "myasthenia gravis"],
        "food": "any",
        "timing_note": "Take 2 hours before or 6 hours after antacids/dairy/calcium.",
        "advisory": "Avoid sun exposure. Stay well-hydrated. Avoid in athletes — tendon rupture risk.",
        "safe_with_fitness": False,
        "fitness_warning": "Fluoroquinolones significantly increase tendon injury risk. Avoid sport during and 1 week after course.",
    },
    # -------- Cardiovascular --------
    "lisinopril": {
        "aliases": ["zestril", "prinivil"],
        "class": "ace_inhibitor",
        "interactions": ["ibuprofen", "naproxen", "aspirin", "potassium", "spironolactone", "nsaid"],
        "contraindications": ["pregnancy", "history of angioedema", "bilateral renal artery stenosis"],
        "food": "any",
        "timing_note": "Take at the same time each day, with or without food.",
        "advisory": "May cause dry cough and dizziness on standing. Do not stop without medical advice.",
        "safe_with_fitness": True,
    },
    "atorvastatin": {
        "aliases": ["lipitor", "atorva"],
        "class": "statin",
        "interactions": ["clarithromycin", "erythromycin", "cyclosporine", "amiodarone", "grapefruit_juice"],
        "contraindications": ["active liver disease", "pregnancy", "breastfeeding"],
        "food": "any",
        "timing_note": "Best taken in the EVENING with water.",
        "advisory": "Report unexplained muscle pain (myopathy warning). Avoid grapefruit juice.",
        "safe_with_fitness": True,
    },
    "warfarin": {
        "aliases": ["coumadin"],
        "class": "anticoagulant",
        "interactions": ["aspirin", "ibuprofen", "paracetamol", "amoxicillin", "azithromycin",
                         "vitamin_k", "nsaid", "ssri", "metronidazole", "fluconazole"],
        "contraindications": ["active bleeding", "pregnancy", "recent surgery", "severe liver disease"],
        "food": "any",
        "timing_note": "Take at the SAME time every day. Avoid drastic dietary changes.",
        "advisory": "Strictly avoid NSAIDs. Requires regular INR monitoring. Consistent vitamin K intake is important.",
        "safe_with_fitness": False,
        "fitness_warning": "Avoid contact sports — bleeding risk is significantly elevated on anticoagulants.",
    },
    "metoprolol": {
        "aliases": ["lopressor", "toprol", "betaloc"],
        "class": "beta_blocker",
        "interactions": ["verapamil", "diltiazem", "clonidine", "epinephrine"],
        "contraindications": ["severe bradycardia", "asthma", "copd", "heart block"],
        "food": "after",
        "timing_note": "Take with or just after food.",
        "advisory": "Never stop abruptly. Taper dose under medical supervision.",
        "safe_with_fitness": True,
    },
    # -------- Diabetes --------
    "metformin": {
        "aliases": ["glucophage", "glycomet"],
        "class": "biguanide",
        "interactions": ["alcohol", "contrast_dye", "ibuprofen", "furosemide"],
        "contraindications": ["kidney disease", "liver disease", "heart failure", "heavy alcohol use"],
        "food": "after",
        "timing_note": "Take WITH meals to minimize stomach upset.",
        "advisory": "Stop before radiological scans with contrast dye. Stay well-hydrated.",
        "safe_with_fitness": True,
    },
    # -------- Mental Health --------
    "sertraline": {
        "aliases": ["zoloft", "lustral"],
        "class": "ssri",
        "interactions": ["maoi", "tramadol", "warfarin", "triptans", "lithium", "nsaid"],
        "contraindications": ["maoi_therapy_within_14_days", "pimozide"],
        "food": "any",
        "timing_note": "Take at the same time each day, with or without food.",
        "advisory": "May take 4–6 weeks for full effect. Do not stop abruptly.",
        "safe_with_fitness": True,
    },
    # -------- Respiratory --------
    "salbutamol": {
        "aliases": ["albuterol", "ventolin", "asthalin"],
        "class": "bronchodilator",
        "interactions": ["beta_blockers", "diuretics", "digoxin"],
        "contraindications": ["hypertrophic cardiomyopathy", "tachyarrhythmia"],
        "food": "any",
        "timing_note": "Inhaler: use as directed when needed.",
        "advisory": "Overuse reduces effectiveness. Always carry rescue inhaler.",
        "safe_with_fitness": True,
    },
    # -------- Gastric --------
    "omeprazole": {
        "aliases": ["prilosec", "losec", "omez"],
        "class": "ppi",
        "interactions": ["clopidogrel", "methotrexate", "warfarin"],
        "contraindications": [],
        "food": "before",
        "timing_note": "Take 30–60 minutes BEFORE the first meal of the day.",
        "advisory": "Long-term use may lower magnesium and B12. Consider supplements.",
        "safe_with_fitness": True,
    },
    # -------- Vitamins / Supplements --------
    "vitamin_d": {
        "aliases": ["vitamin d3", "cholecalciferol", "calciferol", "d3"],
        "class": "supplement",
        "interactions": ["digoxin", "thiazide_diuretics", "calcium_supplements"],
        "contraindications": ["hypercalcemia"],
        "food": "after",
        "timing_note": "Best absorbed when taken WITH a fatty meal.",
        "advisory": "Excess causes toxicity. Annual blood-level check recommended.",
        "safe_with_fitness": True,
    },
    "iron": {
        "aliases": ["ferrous sulfate", "ferrous gluconate", "feosol", "fer-in-sol"],
        "class": "supplement",
        "interactions": ["antacids", "tetracycline", "levothyroxine", "calcium"],
        "contraindications": ["hemochromatosis", "thalassemia"],
        "food": "before",
        "timing_note": "Best absorbed on an EMPTY stomach with a vitamin C source. Avoid with dairy.",
        "advisory": "May cause dark stools (normal) and constipation. Drink plenty of water.",
        "safe_with_fitness": True,
    },
    "levothyroxine": {
        "aliases": ["synthroid", "eltroxin", "thyrox"],
        "class": "thyroid_hormone",
        "interactions": ["calcium", "iron", "antacids", "warfarin", "sucralfate"],
        "contraindications": ["untreated adrenal insufficiency", "thyrotoxicosis"],
        "food": "before",
        "timing_note": "Take on EMPTY stomach, 30–60 min before breakfast. No coffee.",
        "advisory": "Separate from calcium and iron by at least 4 hours.",
        "safe_with_fitness": True,
    },
    "penicillin": {
        "aliases": ["pen vk", "phenoxymethylpenicillin"],
        "class": "penicillin_antibiotic",
        "interactions": ["warfarin", "methotrexate"],
        "contraindications": ["penicillin allergy"],
        "food": "before",
        "timing_note": "Take 30 min before food for better absorption.",
        "advisory": "Complete the full course. Ensure no allergy before administration.",
        "safe_with_fitness": True,
    },
}

# Condition → blocked drug classes
CONDITION_DRUG_RESTRICTIONS: dict[str, list[str]] = {
    "hypertension":        ["nsaid"],
    "kidney disease":      ["nsaid", "metformin", "aminoglycoside"],
    "renal impairment":    ["nsaid", "metformin"],
    "liver disease":       ["paracetamol_high_dose", "statin", "warfarin"],
    "peptic ulcer":        ["nsaid"],
    "asthma":              ["nsaid", "beta_blocker"],
    "heart failure":       ["nsaid", "beta_blocker"],
    "pregnancy":           ["nsaid", "warfarin", "statin"],
    "epilepsy":            ["fluoroquinolone_antibiotic"],
    "penicillin allergy":  ["penicillin_antibiotic"],
    "bleeding disorder":   ["nsaid", "anticoagulant"],
}

# Fitness context thresholds
FITNESS_HIGH_INTENSITY_STEPS = 12000
FITNESS_HIGH_INTENSITY_SLEEP_DEBT = 5.5  # < this = sleep deprivation


# ---------------------------------------------------------------------------
# Core Safety Engine
# ---------------------------------------------------------------------------

class MedicineSafetyChecker:
    """
    Rule-based safety checker. To extend with ML:
    1. Subclass and override `check()`.
    2. Or wrap the returned SafetyResult with model probabilities.
    """

    def __init__(self, medicine_db: dict = None):
        self.db = medicine_db or MEDICINE_DB

    def _normalize(self, text: str) -> str:
        """Lowercase, strip punctuation for loose matching."""
        return re.sub(r"[^a-z0-9 ]", "", text.lower().strip())

    def _find_medicine(self, name: str) -> tuple[str | None, dict | None]:
        """Return (canonical_name, entry) or (None, None). Fallbacks to SQLite dynamic query."""
        n = self._normalize(name)
        
        # 1. Check in-memory fast caching heuristics (Legacy hardcoded dictionary mappings)
        for key, entry in self.db.items():
            if n == key or n in [self._normalize(a) for a in entry.get("aliases", [])]:
                return key, entry
            if key in n or any(self._normalize(a) in n for a in entry.get("aliases", [])):
                return key, entry
                
        # 2. Query persistent SQLite storage registry if not found manually
        try:
            from app.database import get_db
            db_cursor = get_db()
            med_row = db_cursor.execute("SELECT * FROM medicine_knowledge_base WHERE name LIKE ?", (f"%{n}%",)).fetchone()
            if med_row:
                key = med_row['name'].lower()
                entry = {
                    "aliases": [key],
                    "class": med_row['type'],
                    "interactions": [x.strip() for x in (med_row['avoid_with'] or '').split(',') if x.strip()],
                    "contraindications": [x.strip() for x in (med_row['conditions_not_allowed'] or '').split(',') if x.strip()],
                    "food": "before" if "before" in (med_row['timing'] or '').lower() else ("any" if "any" in (med_row['timing'] or '').lower() else "after"),
                    "timing_note": med_row['timing'] or '',
                    "safe_with_fitness": True, 
                }
                # Load persistent SQL into rapid DB array for subsequent heuristic calls
                self.db[key] = entry
                return key, entry
        except Exception:
            pass # Fails cleanly offline if app_context is dropped

        return None, None

    # ------------------------------------------------------------------
    # Individual Check Methods (override in subclass for ML variants)
    # ------------------------------------------------------------------

    def _check_allergies(
        self,
        med_key: str,
        med_entry: dict,
        allergies: list[str],
        result: SafetyResult,
    ) -> None:
        result.checks_performed.append("allergy_check")
        for allergy in allergies:
            a = self._normalize(allergy)
            if not a:
                continue
            # Direct name match
            if a in med_key or med_key in a:
                result.status = "UNSAFE"
                result.severity_score = max(result.severity_score, 95)
                result.reasons.append(
                    f"CRITICAL: You have a documented allergy to '{allergy}'. "
                    f"This medicine ({med_entry.get('class', 'unknown class')}) matches your allergy profile."
                )
                result.warnings.append("This is a life-threatening allergy conflict.")
            # Class-level match (e.g. "penicillin allergy" → blocks amoxicillin)
            med_class = med_entry.get("class", "")
            if a in med_class.replace("_", " ") or med_class.replace("_", " ") in a:
                result.status = "UNSAFE"
                result.severity_score = max(result.severity_score, 90)
                result.reasons.append(
                    f"CRITICAL: Your allergy to '{allergy}' covers the "
                    f"'{med_class}' drug class — this medicine belongs to that class."
                )
                result.warnings.append("Cross-class allergy conflict detected.")
            # Alias match
            for alias in med_entry.get("aliases", []):
                if a in self._normalize(alias) or self._normalize(alias) in a:
                    result.status = "UNSAFE"
                    result.severity_score = max(result.severity_score, 92)
                    result.reasons.append(
                        f"CRITICAL: This medicine is known as '{alias}' — "
                        f"you have a documented allergy to it."
                    )

    def _check_drug_interactions(
        self,
        med_entry: dict,
        medicines: list[str],
        result: SafetyResult,
    ) -> None:
        result.checks_performed.append("interaction_check")
        for user_med in medicines:
            user_med_n = self._normalize(user_med)
            if not user_med_n:
                continue
            for interaction in med_entry.get("interactions", []):
                inter_n = self._normalize(interaction)
                if inter_n in user_med_n or user_med_n in inter_n:
                    if result.status != "UNSAFE":
                        result.status = "WARNING"
                    result.severity_score = max(result.severity_score, 55)
                    result.warnings.append(
                        f"Drug interaction: '{med_entry.get('name', '')}' may interact with "
                        f"your current medication '{user_med}'. Clinical review advised."
                    )

    def _check_condition_restrictions(
        self,
        med_key: str,
        med_entry: dict,
        conditions: list[str],
        result: SafetyResult,
    ) -> None:
        result.checks_performed.append("condition_check")
        for condition in conditions:
            cond_n = self._normalize(condition)
            if not cond_n:
                continue
            # Direct contraindication match
            for contra in med_entry.get("contraindications", []):
                if cond_n in self._normalize(contra) or self._normalize(contra) in cond_n:
                    if result.status != "UNSAFE":
                        result.status = "WARNING"
                    result.severity_score = max(result.severity_score, 70)
                    result.reasons.append(
                        f"Contraindicated: '{condition}' is listed as a contraindication "
                        f"for this medicine."
                    )
            # Class-based restriction lookup
            drug_class = med_entry.get("class", "")
            restricted_classes = CONDITION_DRUG_RESTRICTIONS.get(cond_n, [])
            for cls in restricted_classes:
                if cls in drug_class:
                    if result.status != "UNSAFE":
                        result.status = "WARNING"
                    result.severity_score = max(result.severity_score, 65)
                    result.reasons.append(
                        f"Condition restriction: '{condition}' restricts use of "
                        f"'{drug_class}' class medications."
                    )

    def _check_fitness_context(
        self,
        med_entry: dict,
        fitness: dict,
        result: SafetyResult,
    ) -> None:
        if not fitness:
            return
        result.checks_performed.append("fitness_check")

        steps = fitness.get("steps", 0)
        sleep = fitness.get("sleep", 8)
        water = fitness.get("water", 2)

        # High-intensity exercise + unsafe-fitness medicine
        if not med_entry.get("safe_with_fitness", True) and steps >= FITNESS_HIGH_INTENSITY_STEPS:
            if result.status == "SAFE":
                result.status = "WARNING"
            result.severity_score = max(result.severity_score, 45)
            fw = med_entry.get("fitness_warning", "Exercise caution during high-intensity activity while on this medication.")
            result.warnings.append(f"Fitness alert ({steps:,} steps today): {fw}")

        # Sleep deprivation + CNS-affecting medications
        if sleep < FITNESS_HIGH_INTENSITY_SLEEP_DEBT:
            med_class = med_entry.get("class", "")
            if any(c in med_class for c in ["ssri", "beta_blocker", "benzodiazepine", "analgesic"]):
                result.warnings.append(
                    f"Sleep deprivation noted ({sleep}h). This medicine class may amplify "
                    f"fatigue or cognitive effects. Avoid driving."
                )

        # Dehydration + NSAIDs or antibiotics
        if water < 1.5 and med_entry.get("class", "") in ["nsaid", "fluoroquinolone_antibiotic"]:
            result.warnings.append(
                f"Low water intake today ({water}L). "
                f"This medication requires adequate hydration to prevent kidney stress. "
                f"Drink at least 2.5L today."
            )

    def _build_recommendation(
        self,
        med_entry: dict,
        result: SafetyResult,
    ) -> None:
        food_pref = med_entry.get("food", "any")
        result.timing = med_entry.get("timing_note", "Follow prescribed schedule.")
        result.advisory = med_entry.get("advisory", "Consult your healthcare provider with any concerns.")

        if food_pref == "before":
            result.food_advice = "Take BEFORE food (on empty stomach) for best absorption."
        elif food_pref == "after":
            result.food_advice = "Take AFTER food to protect the stomach and improve tolerance."
        else:
            result.food_advice = "Can be taken with or without food."

        # Status-specific suggestions
        if result.status == "UNSAFE":
            result.suggestions = [
                "⛔ DO NOT take this medication.",
                "Seek immediate medical guidance or emergency care if already taken.",
                "Carry your allergy/medical card and inform all healthcare providers.",
                "Request an alternative from your doctor.",
            ]
        elif result.status == "WARNING":
            result.suggestions = [
                "⚠️ Consult your doctor before taking this medication.",
                "Do not combine with listed interacting drugs without medical clearance.",
                "Monitor yourself closely for unexpected side effects.",
                result.food_advice,
                "Report any new symptoms to your healthcare provider immediately.",
            ]
        else:
            result.suggestions = [
                "✅ No significant risks detected for your profile.",
                result.food_advice,
                "Take exactly as directed on the label or as prescribed.",
                "Contact your pharmacist if you experience unexpected side effects.",
            ]

    def _unknown_medicine_result(self, name: str) -> SafetyResult:
        return SafetyResult(
            status="WARNING",
            medicine=name.title(),
            reasons=["Medicine not found in local safety database."],
            warnings=["Limited safety data available. This does not mean it is safe."],
            suggestions=[
                "Verify medicine name spelling.",
                "Consult a licensed pharmacist or physician before use.",
                "Check for interactions manually.",
            ],
            timing="Follow label or physician instructions.",
            food_advice="Follow label or physician instructions.",
            advisory="Always verify with a healthcare professional when data is unavailable.",
            severity_score=30,
            checks_performed=["database_lookup"],
        )

    # ------------------------------------------------------------------
    # Main Entry Point — override this for ML
    # ------------------------------------------------------------------

    def check(
        self,
        medicine: str,
        allergies: list[str] | None = None,
        conditions: list[str] | None = None,
        medicines: list[str] | None = None,
        fitness: dict | None = None,
    ) -> SafetyResult:
        """
        Run full rule-based safety check.

        ML Extension Point:
            Replace or augment the rule logic below with a model.predict()
            call. Return the same SafetyResult structure.
        """
        allergies = [a for a in (allergies or []) if a and a.strip()]
        conditions = [c for c in (conditions or []) if c and c.strip()]
        medicines = [m for m in (medicines or []) if m and m.strip()]

        canon_name, entry = self._find_medicine(medicine)

        if not entry:
            r = self._unknown_medicine_result(medicine)
            # Still run allergy check on raw name even if not in DB
            for allergy in allergies:
                if self._normalize(allergy) in self._normalize(medicine):
                    r.status = "UNSAFE"
                    r.severity_score = 90
                    r.reasons.insert(0, f"CRITICAL: Medicine name matches your allergy to '{allergy}'.")
            return r

        result = SafetyResult(
            status="SAFE",
            medicine=entry.get("aliases", [canon_name])[0] if False else medicine.title(),
            severity_score=0,
        )

        # Override name if we found canonical
        result.medicine = medicine.title()

        # Run all checks
        self._check_allergies(canon_name, entry, allergies, result)
        self._check_condition_restrictions(canon_name, entry, conditions, result)
        self._check_drug_interactions(entry, medicines, result)
        self._check_fitness_context(entry, fitness or {}, result)
        self._build_recommendation(entry, result)

        # Deduplicate
        result.reasons = list(dict.fromkeys(result.reasons))
        result.warnings = list(dict.fromkeys(result.warnings))

        if not result.reasons and result.status == "SAFE":
            result.reasons = [f"No known risks detected for '{medicine.title()}' against your health profile."]

        return result


# ---------------------------------------------------------------------------
# Module-level convenience function
# ---------------------------------------------------------------------------

_checker = MedicineSafetyChecker()


def check_medicine(
    medicine: str,
    allergies: list[str] | None = None,
    conditions: list[str] | None = None,
    medicines: list[str] | None = None,
    fitness: dict | None = None,
) -> dict:
    """Top-level function. Returns a plain dict for Flask jsonify()."""
    result = _checker.check(
        medicine=medicine,
        allergies=allergies,
        conditions=conditions,
        medicines=medicines,
        fitness=fitness,
    )
    return result.to_dict()


def list_medicines() -> list[dict]:
    """Return all known medicines for autocomplete."""
    return [
        {
            "name": key,
            "class": v.get("class"),
            "aliases": v.get("aliases", []),
        }
        for key, v in MEDICINE_DB.items()
    ]
