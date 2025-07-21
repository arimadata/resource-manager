from src import create_app, db
from init_db import init_database, reset_database

app = create_app()

# flask init-db
@app.cli.command()
def init_db(add_sample_data=True):
    """Initialize the database with tables and optional sample data.
    
    By default, sample data is added to the database.
    To skip adding sample data, use the --no-add-sample-data flag.
    """
    print(f"Initializing database with sample data: {add_sample_data}")
    init_database(app, db, add_sample_data=add_sample_data)

# flask reset-db
@app.cli.command()
def reset_db():
    """Reset the database."""
    print("Resetting database...")
    reset_database(app, db)


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 