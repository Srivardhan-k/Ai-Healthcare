"""
MediGuard AI — User Profile Service
=====================================
Handles all profile business logic:
  - BMI auto-calculation
  - Allergy validation against medicine database
  - Data validation and sanitization
  - Profile CRUD operations
"""

from __future__ import annotations
from dataclasses import dataclass, asdict, field
from typing import Optional
import re


# ---------------------------------------------------------------------------
# Data Model
# ---------------------------------------------------------------------------

@dataclass
class UserProfile:
    id: int = 1
    name: str = ""
    age: Optional[int] = None
    height: Optional[float] = None        # cm
    weight: Optional[float] = None        # kg
    bmi: Optional[float] = None           # auto-calculated
    bmi_category: str = ""                # Underweight / Normal / Overweight / Obese
    allergies: list[str] = field(default_factory=list)
    conditions: list[str] = field(default_factory=list)
    medicines: list[dict] = field(default_factory=list)   # [{id, name}]
    emergency_phone: str = ""
    emergency_email: str = ""
    updated_at: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AllergyValidationResult:
    allergy: str
    is_known: bool
    matched_medicines: list[str] = field(default_factory=list)
    matched_classes: list[str] = field(default_factory=list)
    warning: str = ""

    def to_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------------------
# BMI Calculator
# ---------------------------------------------------------------------------

def calculate_bmi(height_cm: float, weight_kg: float) -> tuple[float, str]:
    """
    Calculate BMI from height (cm) and weight (kg).
    Returns (bmi_value, bmi_category).
    """
    if not height_cm or not weight_kg or height_cm <= 0 or weight_kg <= 0:
        return 0.0, "Unknown"

    height_m = height_cm / 100.0
    bmi = round(weight_kg / (height_m ** 2), 1)

    if bmi < 18.5:
        category = "Underweight"
    elif bmi < 25.0:
        category = "Normal weight"
    elif bmi < 30.0:
        category = "Overweight"
    elif bmi < 35.0:
        category = "Obese (Class I)"
    elif bmi < 40.0:
        category = "Obese (Class II)"
    else:
        category = "Obese (Class III)"

    return bmi, category


# ---------------------------------------------------------------------------
# Input Validators
# ---------------------------------------------------------------------------

class ProfileValidationError(ValueError):
    """Raised when profile input fails validation."""
    pass


def validate_age(age) -> int:
    """Validate age is a reasonable integer."""
    try:
        age = int(age)
    except (TypeError, ValueError):
        raise ProfileValidationError("Age must be a whole number.")
    if not (0 < age < 130):
        raise ProfileValidationError("Age must be between 1 and 129.")
    return age


def validate_height(height) -> float:
    """Validate height in centimetres."""
    try:
        height = float(height)
    except (TypeError, ValueError):
        raise ProfileValidationError("Height must be a number (in cm).")
    if not (50 <= height <= 300):
        raise ProfileValidationError("Height must be between 50 cm and 300 cm.")
    return round(height, 1)


def validate_weight(weight) -> float:
    """Validate weight in kg."""
    try:
        weight = float(weight)
    except (TypeError, ValueError):
        raise ProfileValidationError("Weight must be a number (in kg).")
    if not (1 <= weight <= 700):
        raise ProfileValidationError("Weight must be between 1 kg and 700 kg.")
    return round(weight, 1)


def validate_phone(phone: str) -> str:
    """Allow empty or a rough phone number pattern."""
    if not phone:
        return ""
    cleaned = re.sub(r"[\s\-\(\)\+]", "", phone)
    if cleaned and not re.match(r"^\d{7,15}$", cleaned):
        raise ProfileValidationError(f"Emergency phone '{phone}' does not look like a valid number.")
    return phone.strip()


def validate_email(email: str) -> str:
    """Basic email format validation."""
    if not email:
        return ""
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email.strip()):
        raise ProfileValidationError(f"Emergency email '{email}' is not a valid email address.")
    return email.strip().lower()


def sanitize_list(raw) -> list[str]:
    """Convert comma string or list to a clean deduplicated list."""
    if raw is None:
        return []
    if isinstance(raw, str):
        items = [x.strip() for x in raw.split(",") if x.strip()]
    elif isinstance(raw, list):
        items = [str(x).strip() for x in raw if str(x).strip()]
    else:
        return []
    # Deduplicate preserving order
    seen = set()
    result = []
    for item in items:
        key = item.lower()
        if key not in seen:
            seen.add(key)
            result.append(item)
    return result


# ---------------------------------------------------------------------------
# Allergy Validator — cross-checks against medicine database
# ---------------------------------------------------------------------------

def validate_allergies(allergies: list[str]) -> list[AllergyValidationResult]:
    """
    Cross-reference declared allergies against the medicine safety database.
    Returns a list of AllergyValidationResult for each allergy.
    """
    from app.services.medicine_checker import MEDICINE_DB

    results = []
    for allergy in allergies:
        if not allergy.strip():
            continue
        a_norm = allergy.lower().strip()
        matched_meds = []
        matched_classes = []

        for med_key, entry in MEDICINE_DB.items():
            med_class = entry.get("class", "")
            aliases = [al.lower() for al in entry.get("aliases", [])]

            # Direct name or alias match
            if a_norm in med_key or med_key in a_norm:
                matched_meds.append(med_key)
            elif any(a_norm in alias or alias in a_norm for alias in aliases):
                matched_meds.append(med_key)

            # Class-based match (e.g. "penicillin allergy" → blocks all penicillin_antibiotic)
            if a_norm in med_class.replace("_", " "):
                matched_classes.append(med_class)

        is_known = bool(matched_meds or matched_classes)

        warning = ""
        if is_known and matched_meds:
            warning = (
                f"Allergy to '{allergy}' will block: "
                f"{', '.join(matched_meds[:5])}."
                + (" (and more)" if len(matched_meds) > 5 else "")
            )
        elif matched_classes:
            warning = f"Allergy to '{allergy}' restricts the entire '{matched_classes[0]}' drug class."

        results.append(AllergyValidationResult(
            allergy=allergy,
            is_known=is_known,
            matched_medicines=matched_meds[:10],
            matched_classes=list(set(matched_classes)),
            warning=warning,
        ))

    return results


# ---------------------------------------------------------------------------
# Profile Builder — constructs from DB rows
# ---------------------------------------------------------------------------

def build_profile_from_db(user_row, med_rows) -> UserProfile:
    """Build a UserProfile dataclass from SQLite row objects."""
    allergies = sanitize_list(user_row['allergies'])
    conditions = sanitize_list(user_row['conditions'])

    bmi, bmi_category = calculate_bmi(
        user_row['height'] or 0,
        user_row['weight'] or 0,
    )

    return UserProfile(
        id=user_row['id'],
        name=user_row['name'] or "",
        age=user_row['age'],
        height=user_row['height'],
        weight=user_row['weight'],
        bmi=bmi if bmi > 0 else None,
        bmi_category=bmi_category if bmi > 0 else "",
        allergies=allergies,
        conditions=conditions,
        medicines=[{"id": m['id'], "name": m['name']} for m in med_rows],
        emergency_phone=user_row['emergency_phone'] or "",
        emergency_email=user_row['emergency_email'] or "",
        updated_at=user_row['updated_at'] or "",
    )


# ---------------------------------------------------------------------------
# Profile Diff — detect what changed
# ---------------------------------------------------------------------------

def diff_profile(existing: dict, updated: dict) -> dict:
    """Return dict of changed keys for audit / changelog."""
    changes = {}
    for key in updated:
        if key in existing and existing[key] != updated[key]:
            changes[key] = {"from": existing[key], "to": updated[key]}
    return changes
