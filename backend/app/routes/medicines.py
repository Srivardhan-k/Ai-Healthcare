"""
MediGuard AI — Medicine Safety API Routes
==========================================

POST /api/medicines/check
    Full safety check with all profile inputs

GET  /api/medicines/database
    Autocomplete — all known medicines

POST /api/medicines/batch-check
    Check multiple medicines at once (interaction matrix)
"""

from flask import Blueprint, jsonify, request
from app.database import query_db
from app.services.medicine_checker import check_medicine, list_medicines, MedicineSafetyChecker

medicines_bp = Blueprint('medicines', __name__)
USER_ID = 1
_checker = MedicineSafetyChecker()


def _get_user_profile() -> dict:
    """Fetch user profile from DB and return structured dict."""
    user = query_db('SELECT * FROM users WHERE id = ?', [USER_ID], one=True)
    meds = query_db('SELECT name FROM medicines WHERE user_id = ?', [USER_ID])
    return {
        "allergies": [a.strip() for a in (user['allergies'] or '').split(',') if a.strip()],
        "conditions": [c.strip() for c in (user['conditions'] or '').split(',') if c.strip()],
        "medicines": [m['name'].split()[0].lower() for m in meds if m['name']],
    }


def _parse_fitness(data: dict) -> dict | None:
    """Extract fitness context from request body if provided."""
    fitness_raw = data.get('fitness')
    if fitness_raw and isinstance(fitness_raw, dict):
        return {
            "steps": int(fitness_raw.get('steps', 0)),
            "sleep": float(fitness_raw.get('sleep', 8.0)),
            "water": float(fitness_raw.get('water', 2.0)),
        }
    # Try to load today's fitness from DB if not supplied
    from datetime import date
    today = date.today().isoformat()
    log = query_db(
        'SELECT steps, sleep, water FROM fitness_logs WHERE user_id = ? AND date = ?',
        [USER_ID, today], one=True
    )
    if log:
        return {"steps": log['steps'], "sleep": log['sleep'], "water": log['water']}
    return None


# ---------------------------------------------------------------------------
# POST /api/medicines/check
# ---------------------------------------------------------------------------

@medicines_bp.route('/medicines/check', methods=['POST'])
def check_medicine_endpoint():
    """
    Full medicine safety check.

    Request body (JSON):
        {
          "medicine": "ibuprofen",               ← required
          "allergies": ["penicillin"],            ← optional override
          "conditions": ["hypertension"],         ← optional override
          "medicines": ["lisinopril"],  ← optional override
          "fitness": {                            ← optional override
            "steps": 12000,
            "sleep": 7.5,
            "water": 2.0
          },
          "use_profile": true                     ← default: true — load from DB
        }

    Response (JSON):
        {
          "status": "UNSAFE",
          "medicine": "Ibuprofen",
          "reasons": [...],
          "warnings": [...],
          "suggestions": [...],
          "timing": "Always take after food...",
          "food_advice": "Take AFTER food...",
          "advisory": "...",
          "severity_score": 70,
          "checks_performed": ["allergy_check", "condition_check", ...]
        }
    """
    data = request.get_json(silent=True) or {}
    medicine = (data.get('medicine') or '').strip()

    if not medicine:
        return jsonify({
            "error": "Medicine name is required.",
            "hint": "POST body must contain: { \"medicine\": \"<name>\" }"
        }), 400

    use_profile = data.get('use_profile', True)

    # Load from DB profile (default) or accept overrides from request body
    profile = _get_user_profile() if use_profile else {}

    allergies = data.get('allergies') or profile.get('allergies', [])
    conditions = data.get('conditions') or profile.get('conditions', [])
    medicines = data.get('medicines') or profile.get('medicines', [])
    fitness = _parse_fitness(data)

    result = check_medicine(
        medicine=medicine,
        allergies=allergies,
        conditions=conditions,
        medicines=medicines,
        fitness=fitness,
    )

    # Attach HTTP status hint
    http_status = 200
    if result['status'] == 'UNSAFE':
        http_status = 200  # always 200 — frontend handles rendering

    return jsonify(result), http_status


# ---------------------------------------------------------------------------
# GET /api/medicines/database
# ---------------------------------------------------------------------------

@medicines_bp.route('/medicines/database', methods=['GET'])
def get_medicine_database():
    """Return autocomplete list of all known medicines."""
    query = request.args.get('q', '').lower().strip()
    meds = list_medicines()
    if query:
        meds = [
            m for m in meds
            if query in m['name'] or any(query in a.lower() for a in m.get('aliases', []))
        ]
    return jsonify(meds)


# ---------------------------------------------------------------------------
# POST /api/medicines/batch-check
# ---------------------------------------------------------------------------

@medicines_bp.route('/medicines/batch-check', methods=['POST'])
def batch_check():
    """
    Check a list of medicines at once and return an interaction matrix.

    Request body:
        { "medicines": ["ibuprofen", "warfarin", "aspirin"] }

    Response:
        {
          "individual": [ { "medicine": "Ibuprofen", "status": "UNSAFE", ... }, ... ],
          "interaction_pairs": [
            {
              "pair": ["ibuprofen", "warfarin"],
              "note": "ibuprofen may interact with warfarin"
            },
            ...
          ],
          "summary": { "safe": 0, "warning": 1, "unsafe": 2 }
        }
    """
    data = request.get_json(silent=True) or {}
    medicines = data.get('medicines', [])

    if not medicines or len(medicines) < 1:
        return jsonify({"error": "Provide at least 1 medicine in 'medicines' list."}), 400

    profile = _get_user_profile()
    fitness = _parse_fitness(data)

    individual = []
    for med in medicines:
        r = check_medicine(
            medicine=med,
            allergies=profile.get('allergies', []),
            conditions=profile.get('conditions', []),
            medicines=[m for m in medicines if m.lower() != med.lower()]
                                 + profile.get('medicines', []),
            fitness=fitness,
        )
        individual.append(r)

    # Build interaction matrix between checked medicines
    interaction_pairs = []
    from app.services.medicine_checker import MEDICINE_DB
    chk = _checker  # module-level MedicineSafetyChecker instance
    for i, med_a in enumerate(medicines):
        _, entry_a = chk._find_medicine(med_a)
        if not entry_a:
            continue
        for j, med_b in enumerate(medicines):
            if j <= i:
                continue
            _, entry_b = chk._find_medicine(med_b)
            if not entry_b:
                continue
            a_interactions = [chk._normalize(x) for x in entry_a.get('interactions', [])]
            b_key = chk._normalize(med_b)
            if any(b_key in x or x in b_key for x in a_interactions):
                interaction_pairs.append({
                    "pair": [med_a, med_b],
                    "note": f"'{med_a.title()}' has a known interaction with '{med_b.title()}'."
                })

    summary = {
        "safe":    sum(1 for r in individual if r['status'] == 'SAFE'),
        "warning": sum(1 for r in individual if r['status'] == 'WARNING'),
        "unsafe":  sum(1 for r in individual if r['status'] == 'UNSAFE'),
    }

    return jsonify({
        "individual": individual,
        "interaction_pairs": interaction_pairs,
        "summary": summary,
    })
