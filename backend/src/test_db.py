from database.database import DB_URL

def test_database_connection():
    print("Testing database connection...")
    print(f"Database URL: {DB_URL}")

    if DB_URL is None:
        print("ERROR: Could not load DATABASE_URL from .env file")
        return False
    else:
        print("SUCCESS: DATABASE_URL loaded successfully")
        return True

if __name__ == "__main__":
    test_database_connection()
