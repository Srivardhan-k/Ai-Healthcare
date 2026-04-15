from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()


def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'mediguard-dev-key')

    # Enable CORS for React frontend (Configurable via ENV)
    frontend_url = os.environ.get('FRONTEND_URL', '*')
    origins = [url.strip() for url in frontend_url.split(',')] if frontend_url != '*' else '*'
    CORS(app, resources={r"/api/*": {"origins": origins}})

    # Initialize database
    from app.database import init_db, close_db
    init_db(app)
    app.teardown_appcontext(close_db)

    # Register blueprints
    from app.routes.profile import profile_bp
    from app.routes.medicines import medicines_bp
    from app.routes.fitness import fitness_bp
    from app.routes.scheduler import scheduler_bp
    from app.routes.alerts import alerts_bp
    from app.routes.risk import risk_bp

    app.register_blueprint(profile_bp, url_prefix='/api')
    app.register_blueprint(medicines_bp, url_prefix='/api')
    app.register_blueprint(fitness_bp, url_prefix='/api')
    app.register_blueprint(scheduler_bp, url_prefix='/api')
    app.register_blueprint(alerts_bp, url_prefix='/api')
    app.register_blueprint(risk_bp, url_prefix='/api')

    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'ok', 'app': 'MediGuard AI', 'version': '1.0.0'})

    # Start background scheduler simulation
    def run_scheduler_sim():
        import time
        from app.services.scheduler_service import scheduler_service
        # Wait a bit for server to start
        time.sleep(5)
        while True:
            try:
                # We need an app context for DB operations
                with app.app_context():
                    scheduler_service.check_for_missed_doses()
            except Exception as e:
                print(f"Scheduler simulation error: {e}")
            time.sleep(60)

    import threading
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true' or not app.debug:
        sim_thread = threading.Thread(target=run_scheduler_sim, daemon=True)
        sim_thread.start()

    return app

