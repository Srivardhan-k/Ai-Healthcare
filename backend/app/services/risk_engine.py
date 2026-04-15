"""
Rule-based AI risk prediction engine.
Factors: Age, BMI, reported symptoms (keyword analysis).
No external ML dependencies — fully offline.
"""

SYMPTOM_RISK_MAP = {
    # Cardiovascular
    "chest pain": 35, "chest tightness": 30, "palpitations": 20,
    "shortness of breath": 25, "breathlessness": 25,
    # Neurological
    "headache": 10, "severe headache": 20, "migraine": 10,
    "dizziness": 15, "fainting": 20, "confusion": 25,
    "numbness": 20, "weakness": 15,
    # Gastrointestinal
    "nausea": 8, "vomiting": 10, "abdomen pain": 12,
    "stomach pain": 12, "diarrhea": 8,
    # General
    "fatigue": 8, "fever": 12, "high fever": 18,
    "swelling": 12, "rapid weight gain": 15, "weight loss": 12,
    "blurred vision": 15, "frequent urination": 10,
    # Respiratory
    "cough": 8, "persistent cough": 15, "wheezing": 15,
}


def calculate_risk(age: int, bmi: float, symptoms_text: str) -> dict:
    """
    Calculate health risk score from demographics + symptoms.
    Returns { risk_score, risk_level, explanation }
    """
    score = 20  # Base score
    factors = []

    # --- Age Factor ---
    if age > 65:
        score += 25
        factors.append("Age over 65 significantly increases baseline health risk.")
    elif age > 50:
        score += 15
        factors.append("Age over 50 raises cardiovascular and metabolic risk.")
    elif age > 40:
        score += 8
        factors.append("Age over 40 warrants regular preventive screenings.")

    # --- BMI Factor ---
    if bmi is not None and bmi > 0:
        if bmi >= 35:
            score += 25
            factors.append(f"BMI of {bmi:.1f} is classified as obese (Class II+). High risk for diabetes and heart disease.")
        elif bmi >= 30:
            score += 18
            factors.append(f"BMI of {bmi:.1f} is classified as obese. Increases risk of hypertension and type 2 diabetes.")
        elif bmi >= 25:
            score += 10
            factors.append(f"BMI of {bmi:.1f} is classified as overweight. Moderate metabolic risk.")
        elif bmi < 18.5:
            score += 10
            factors.append(f"BMI of {bmi:.1f} is below normal. Risk of nutritional deficiencies.")
        else:
            factors.append(f"BMI of {bmi:.1f} is within healthy range.")

    # --- Symptom Analysis ---
    symptoms_lower = symptoms_text.lower() if symptoms_text else ""
    symptom_score = 0
    matched_symptoms = []

    for symptom, risk_val in SYMPTOM_RISK_MAP.items():
        if symptom in symptoms_lower:
            symptom_score += risk_val
            matched_symptoms.append(symptom)

    # Cap symptom contribution at 45
    symptom_contribution = min(symptom_score, 45)
    score += symptom_contribution

    if matched_symptoms:
        factors.append(f"Reported symptoms detected: {', '.join(set(matched_symptoms))}.")

    # Cap total score at 99
    score = min(score, 99)

    # --- Determine Risk Level ---
    if score >= 70:
        risk_level = "High Risk"
        explanation = (
            f"Your profile indicates a HIGH risk level ({score}%). "
            "Multiple risk factors were detected including "
            f"{', '.join(factors[:2]) if factors else 'elevated indicators'}. "
            "Please seek immediate medical evaluation. Do not delay."
        )
    elif score >= 40:
        risk_level = "Moderate Risk"
        explanation = (
            f"Your profile indicates a MODERATE risk level ({score}%). "
            f"Key factors: {', '.join(factors[:2]) if factors else 'elevated indicators'}. "
            "A consultation with a healthcare provider is strongly recommended for a thorough review."
        )
    else:
        risk_level = "Low Risk"
        explanation = (
            f"Your profile indicates a LOW risk level ({score}%). "
            "Your stats appear within manageable ranges. "
            "Continue healthy habits and schedule regular annual checkups."
        )

    return {
        "risk_score": score,
        "risk_level": risk_level,
        "explanation": explanation,
        "factors": factors
    }
