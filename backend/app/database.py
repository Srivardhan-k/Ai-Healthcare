import sqlite3
import os
from flask import g

DATABASE_PATH = os.environ.get('DATABASE_PATH', 'mediguard.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'models', 'schema.sql')


def get_db():
    """Get database connection, creating one if needed for this request."""
    if 'db' not in g:
        g.db = sqlite3.connect(
            DATABASE_PATH,
            detect_types=sqlite3.PARSE_DECLTYPES
        )
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA journal_mode=WAL")
        g.db.execute("PRAGMA foreign_keys=ON")
    return g.db


def close_db(e=None):
    """Close database connection at end of request."""
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db(app):
    """Initialize the database with schema and seed data."""
    with app.app_context():
        db = sqlite3.connect(DATABASE_PATH)
        db.row_factory = sqlite3.Row
        with open(SCHEMA_PATH, 'r') as f:
            db.executescript(f.read())
        db.commit()
        db.close()
    app.logger.info("✅ Database initialized successfully.")


def query_db(query, args=(), one=False):
    """Helper: run a SELECT query and return results."""
    cur = get_db().execute(query, args)
    rv = cur.fetchall()
    cur.close()
    return (rv[0] if rv else None) if one else rv


def execute_db(query, args=()):
    """Helper: run an INSERT/UPDATE/DELETE and return lastrowid."""
    db = get_db()
    cur = db.execute(query, args)
    db.commit()
    return cur.lastrowid
