from app import create_app

app = create_app()

if __name__ == '__main__':
    print("MediGuard AI Backend starting on http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
