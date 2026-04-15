"""
MediGuard AI — User Profile API Routes
========================================

GET    /api/profile              → Get full profile (with BMI + allergy validation)
POST   /api/profile              → Create profile (first-time setup)
PUT    /api/profile              → Update profile (partial or full)

GET    /api/profile/bmi          → Calculate BMI from height+weight params
GET    /api/profile/allergies/validate → Validate declared allergies vs medicine DB

GET    /api/profile/medications       → List current medications
POST   /api/profile/medications       → Add a medication
DELETE /api/profile/medications/<id>  → Remove a medication
"""

from flask import Blueprint, jsonify, request
from app.database import query_db, execute_db
from app.services.profile_service import (
    build_profile_from_db,
    calculate_bmi,
    validate_allergies,
    sanitize_list,
    validate_age,
    validate_height,
    validate_weight,
    validate_phone,
    validate_email,
    ProfileValidationError,
    diff_profile,
)

profile_bp = Blueprint('profile', __name__)
USER_ID = 1  # Single-user offline mode


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _fetch_profile() -> tuple | None:
    user = query_db('SELECT * FROM users WHERE id = ?', [USER_ID], one=True)
    meds = query_db('SELECT id, name FROM medicines WHERE user_id = ?', [USER_ID])
    return user, meds


def _profile_not_found():
    return jsonify({"error": "User profile not found. Please create a profile first."}), 404


# ---------------------------------------------------------------------------
# GET /api/profile
# ---------------------------------------------------------------------------

@profile_bp.route('/profile', methods=['GET'])
def get_profile():
    """
    Return full user profile including:
      - All fields
      - Auto-calculated BMI + BMI category
      - Current medications list
      - Allergy validation summary (matched medicines)
    """
    user, meds = _fetch_profile()
    if not user:
        return _profile_not_found()

    profile = build_profile_from_db(user, meds)
    data = profile.to_dict()

    # Attach allergy validation inline
    if profile.allergies:
        validation = validate_allergies(profile.allergies)
        data['allergy_validation'] = [v.to_dict() for v in validation]
        data['allergy_warnings'] = [v.warning for v in validation if v.warning]
    else:
        data['allergy_validation'] = []
        data['allergy_warnings'] = []

    return jsonify(data)


# ---------------------------------------------------------------------------
# POST /api/profile   — Create (first-time setup)
# ---------------------------------------------------------------------------

@profile_bp.route('/profile', methods=['POST'])
def create_profile():
    """
    Create the user profile. If a profile already exists, returns 409.

    Request body (JSON) — all fields optional:
        {
          "name": "Sarah Johnson",
          "age": 28,
          "height": 165,         ← cm
          "weight": 62,          ← kg
          "allergies": ["Penicillin", "Peanuts"],
          "conditions": ["Hypertension", "Mild Asthma"],
          "emergency_phone": "+91-9876543210",
          "emergency_email": "guardian@example.com"
        }
    """
    existing = query_db('SELECT id FROM users WHERE id = ?', [USER_ID], one=True)
    if existing:
        return jsonify({
            "error": "Profile already exists.",
            "hint": "Use PUT /api/profile to update the existing profile."
        }), 409

    data = request.get_json(silent=True) or {}
    errors = {}

    # Validate fields
    age = height = weight = None
    try:
        if data.get('age') is not None:
            age = validate_age(data['age'])
    except ProfileValidationError as e:
        errors['age'] = str(e)

    try:
        if data.get('height') is not None:
            height = validate_height(data['height'])
    except ProfileValidationError as e:
        errors['height'] = str(e)

    try:
        if data.get('weight') is not None:
            weight = validate_weight(data['weight'])
    except ProfileValidationError as e:
        errors['weight'] = str(e)

    phone = email = ""
    try:
        phone = validate_phone(data.get('emergency_phone', ''))
    except ProfileValidationError as e:
        errors['emergency_phone'] = str(e)

    try:
        email = validate_email(data.get('emergency_email', ''))
    except ProfileValidationError as e:
        errors['emergency_email'] = str(e)

    if errors:
        return jsonify({"error": "Validation failed.", "fields": errors}), 400

    allergies = ', '.join(sanitize_list(data.get('allergies', [])))
    conditions = ', '.join(sanitize_list(data.get('conditions', [])))

    execute_db('''
        INSERT INTO users (id, name, age, height, weight, allergies, conditions,
                           emergency_phone, emergency_email)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', [
        USER_ID,
        (data.get('name') or 'User').strip(),
        age, height, weight,
        allergies, conditions,
        phone, email,
    ])

    return get_profile()


# ---------------------------------------------------------------------------
# PUT /api/profile   — Update (partial or full)
# ---------------------------------------------------------------------------

@profile_bp.route('/profile', methods=['PUT'])
def update_profile():
    """
    Update user profile. Accepts partial updates — omit fields to keep them unchanged.
    Auto-recalculates BMI when height or weight changes.

    Returns updated profile + list of changed fields.
    """
    user, meds = _fetch_profile()
    if not user:
        return _profile_not_found()

    data = request.get_json(silent=True) or {}
    errors = {}
    changes = {}

    # --- Resolve each updatable field ---
    name = (data.get('name') or user['name'] or 'User').strip()

    age = user['age']
    if 'age' in data and data['age'] is not None:
        try:
            age = validate_age(data['age'])
        except ProfileValidationError as e:
            errors['age'] = str(e)

    height = user['height']
    if 'height' in data and data['height'] is not None:
        try:
            height = validate_height(data['height'])
        except ProfileValidationError as e:
            errors['height'] = str(e)

    weight = user['weight']
    if 'weight' in data and data['weight'] is not None:
        try:
            weight = validate_weight(data['weight'])
        except ProfileValidationError as e:
            errors['weight'] = str(e)

    phone = user['emergency_phone'] or ''
    if 'emergency_phone' in data:
        try:
            phone = validate_phone(data['emergency_phone'])
        except ProfileValidationError as e:
            errors['emergency_phone'] = str(e)

    email = user['emergency_email'] or ''
    if 'emergency_email' in data:
        try:
            email = validate_email(data['emergency_email'])
        except ProfileValidationError as e:
            errors['emergency_email'] = str(e)

    if errors:
        return jsonify({"error": "Validation failed.", "fields": errors}), 400

    # Allergies / conditions
    if 'allergies' in data:
        allergies = ', '.join(sanitize_list(data['allergies']))
    else:
        allergies = user['allergies'] or ''

    if 'conditions' in data:
        conditions = ', '.join(sanitize_list(data['conditions']))
    else:
        conditions = user['conditions'] or ''

    # Compute BMI
    bmi, bmi_category = calculate_bmi(height or 0, weight or 0)

    # Detect changes for diff reporting
    old_data = {
        'name': user['name'], 'age': user['age'],
        'height': user['height'], 'weight': user['weight'],
        'allergies': user['allergies'], 'conditions': user['conditions'],
        'emergency_phone': user['emergency_phone'],
        'emergency_email': user['emergency_email'],
    }
    new_data = {
        'name': name, 'age': age, 'height': height, 'weight': weight,
        'allergies': allergies, 'conditions': conditions,
        'emergency_phone': phone, 'emergency_email': email,
    }
    changes = diff_profile(old_data, new_data)

    execute_db('''
        UPDATE users SET
            name = ?, age = ?, height = ?, weight = ?,
            allergies = ?, conditions = ?,
            emergency_phone = ?, emergency_email = ?,
            updated_at = datetime('now')
        WHERE id = ?
    ''', [name, age, height, weight, allergies, conditions, phone, email, USER_ID])

    # Refresh and return full profile
    updated_user, updated_meds = _fetch_profile()
    profile = build_profile_from_db(updated_user, updated_meds)
    response = profile.to_dict()
    response['changes'] = changes
    response['bmi'] = bmi if bmi > 0 else None
    response['bmi_category'] = bmi_category if bmi > 0 else ""

    return jsonify({"success": True, "profile": response})


# ---------------------------------------------------------------------------
# GET /api/profile/bmi  — Standalone BMI calculator
# ---------------------------------------------------------------------------

@profile_bp.route('/profile/bmi', methods=['GET'])
def calculate_bmi_endpoint():
    """
    Calculate BMI on the fly.
    Query params: ?height=165&weight=62

    Example: GET /api/profile/bmi?height=165&weight=62
    """
    try:
        height = validate_height(request.args.get('height', 0))
        weight = validate_weight(request.args.get('weight', 0))
    except ProfileValidationError as e:
        return jsonify({"error": str(e)}), 400

    bmi, category = calculate_bmi(height, weight)
    return jsonify({
        "height_cm": height,
        "weight_kg": weight,
        "bmi": bmi,
        "category": category,
        "healthy_range": "18.5 – 24.9",
    })


# ---------------------------------------------------------------------------
# GET /api/profile/allergies/validate
# ---------------------------------------------------------------------------

@profile_bp.route('/profile/allergies/validate', methods=['GET'])
def validate_allergies_endpoint():
    """
    Validate allergies against the medicine database.
    Query param: ?allergies=Penicillin,Peanuts,Sulfa

    Returns matched medicines/classes for each allergy.
    """
    raw = request.args.get('allergies', '')
    allergies = sanitize_list(raw)

    if not allergies:
        user, _ = _fetch_profile()
        if user:
            allergies = sanitize_list(user['allergies'])

    if not allergies:
        return jsonify({"allergies": [], "total": 0, "matched": 0})

    results = validate_allergies(allergies)
    matched = sum(1 for r in results if r.is_known)

    return jsonify({
        "total": len(results),
        "matched": matched,
        "unrecognised": len(results) - matched,
        "allergies": [r.to_dict() for r in results],
    })


# ---------------------------------------------------------------------------
# Medications sub-routes
# ---------------------------------------------------------------------------

@profile_bp.route('/profile/medications', methods=['GET'])
def list_medications():
    """Return all current medications for the user."""
    meds = query_db('SELECT id, name, created_at FROM medicines WHERE user_id = ?', [USER_ID])
    return jsonify([{"id": m['id'], "name": m['name'], "added": m['created_at']} for m in meds])


@profile_bp.route('/profile/medications', methods=['POST'])
def add_medication():
    """
    Add a medication to the current medications list.
    Body: { "name": "Lisinopril 10mg" }
    """
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    if not name:
        return jsonify({"error": "Medication name is required."}), 400
    if len(name) > 200:
        return jsonify({"error": "Medication name is too long (max 200 chars)."}), 400

    # Check for duplicate
    existing = query_db(
        'SELECT id FROM medicines WHERE user_id = ? AND LOWER(name) = LOWER(?)',
        [USER_ID, name], one=True
    )
    if existing:
        return jsonify({"error": f"'{name}' is already in your medications list.", "id": existing['id']}), 409

    med_id = execute_db(
        'INSERT INTO medicines (user_id, name) VALUES (?, ?)',
        [USER_ID, name]
    )
    return jsonify({"success": True, "id": med_id, "name": name}), 201


@profile_bp.route('/profile/medications/<int:med_id>', methods=['DELETE'])
def remove_medication(med_id: int):
    """Remove a medication by ID."""
    existing = query_db(
        'SELECT id, name FROM medicines WHERE id = ? AND user_id = ?',
        [med_id, USER_ID], one=True
    )
    if not existing:
        return jsonify({"error": f"Medication ID {med_id} not found."}), 404

    execute_db('DELETE FROM medicines WHERE id = ? AND user_id = ?', [med_id, USER_ID])
    return jsonify({"success": True, "message": f"'{existing['name']}' removed from medications."})
