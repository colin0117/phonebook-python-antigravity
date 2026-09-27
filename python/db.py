import os
import pymysql
import pymysql.cursors
from dotenv import load_dotenv
from sample_data import SAMPLE_CONTACTS

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "phonebook_db")

def get_server_connection():
    """Connects to MySQL server without binding to a specific database."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def get_connection():
    """Connects to the application's MySQL database."""
    return pymysql.connect(
        host=DB_HOST,
        port=DB_PORT,
        user=DB_USER,
        password=DB_PASSWORD,
        database=DB_NAME,
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True
    )

def init_db():
    """
    Initializes the database schema and seeds initial sample records
    if the database or table is newly created / empty.
    """
    print(f"Connecting to MySQL at {DB_HOST}:{DB_PORT} as '{DB_USER}'...")
    
    # 1. Ensure the database exists (if user has permission to create databases)
    try:
        with get_server_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                    "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
                )
                print(f"Database '{DB_NAME}' ensured.")
    except Exception as e:
        print(f"Note: Could not run server-level CREATE DATABASE (connecting directly to '{DB_NAME}').")

    # 2. Connect to the database and ensure table exists
    with get_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    first_name VARCHAR(100) NOT NULL,
                    last_name VARCHAR(100) NOT NULL,
                    phone_number VARCHAR(50) NOT NULL,
                    email VARCHAR(150),
                    date_of_birth DATE NULL,
                    category VARCHAR(50) DEFAULT 'General',
                    notes TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
            print("Table 'contacts' ensured.")

            # Ensure date_of_birth column exists on existing databases
            cursor.execute("""
                SELECT COUNT(*) AS total
                FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = 'contacts' AND column_name = 'date_of_birth';
            """)
            if cursor.fetchone()["total"] == 0:
                cursor.execute("ALTER TABLE contacts ADD COLUMN date_of_birth DATE NULL AFTER email;")
                print("Column 'date_of_birth' added to 'contacts'.")

            # 3. Check if table is empty
            cursor.execute("SELECT COUNT(*) AS total FROM contacts;")
            count = cursor.fetchone()["total"]

            if count == 0:
                print("Seeding database with sample contacts...")
                insert_sql = """
                    INSERT INTO contacts (first_name, last_name, phone_number, email, date_of_birth, category, notes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                records = [
                    (
                        c["first_name"],
                        c["last_name"],
                        c["phone_number"],
                        c.get("email", ""),
                        c.get("date_of_birth", None),
                        c.get("category", "General"),
                        c.get("notes", "")
                    )
                    for c in SAMPLE_CONTACTS
                ]
                cursor.executemany(insert_sql, records)
                print(f"Successfully seeded {len(records)} sample contacts!")
            else:
                print(f"Database already contains {count} contacts. Skipping seeding.")
