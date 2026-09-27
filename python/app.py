import os
import sys
from datetime import datetime
from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
import pymysql

from db import init_db, get_connection
from dob_facts import get_dob_fact, get_dob_details

env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

app = Flask(__name__)

# Run database setup and seeding when starting
try:
    init_db()
except Exception as e:
    print(f"\n[WARNING] Could not initialize MySQL database automatically:\n  {e}\n", file=sys.stderr)
    print("Please check your MySQL credentials in the '.env' file.\n", file=sys.stderr)


@app.route("/")
def index():
    """Renders the main phone book page."""
    contacts = []
    error = None
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM contacts ORDER BY last_name ASC, first_name ASC;")
                contacts = cursor.fetchall()
    except Exception as e:
        error = str(e)
    
    return render_template("index.html", contacts=contacts, db_error=error)


@app.route("/api/contacts", methods=["GET"])
def get_contacts():
    """Returns all contacts as JSON for DataTables / AJAX consumers."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM contacts ORDER BY last_name ASC, first_name ASC;")
                rows = cursor.fetchall()
                # Format timestamps and dates for JSON serialization
                for row in rows:
                    if "created_at" in row and row["created_at"]:
                        row["created_at"] = row["created_at"].strftime("%Y-%m-%d %H:%M")
                    if "date_of_birth" in row and row["date_of_birth"]:
                        row["date_of_birth"] = str(row["date_of_birth"])
                return jsonify({"data": rows, "status": "success"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/dob-facts", methods=["GET"])
def get_dob_facts_api():
    """Returns star sign and live web facts for a given date of birth (?dob=YYYY-MM-DD)."""
    dob_str = request.args.get("dob", "").strip()
    if not dob_str:
        return jsonify({"status": "error", "message": "Query parameter 'dob' is required (YYYY-MM-DD)."}), 400
    details = get_dob_details(dob_str)
    if not details:
        return jsonify({"status": "error", "message": "Invalid date format. Expected YYYY-MM-DD."}), 400
    return jsonify({"status": "success", "data": details})


@app.route("/api/contacts", methods=["POST"])
def add_contact():
    """Adds a new contact to the database."""
    payload = request.get_json(silent=True) or request.form
    
    first_name = payload.get("first_name", "").strip()
    last_name = payload.get("last_name", "").strip()
    phone_number = payload.get("phone_number", "").strip()
    email = payload.get("email", "").strip()
    date_of_birth = payload.get("date_of_birth", "").strip() or None
    category = payload.get("category", "General").strip() or "General"
    notes = payload.get("notes", "").strip()

    if not first_name or not last_name or not phone_number:
        return jsonify({"status": "error", "message": "First name, last name, and phone number are required."}), 400

    if len(first_name) > 100 or len(last_name) > 100:
        return jsonify({"status": "error", "message": "First and last names cannot exceed 100 characters."}), 400

    if len(phone_number) > 50:
        return jsonify({"status": "error", "message": "Phone number cannot exceed 50 characters."}), 400

    if date_of_birth:
        try:
            datetime.strptime(date_of_birth, "%Y-%m-%d")
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid date of birth format. Expected YYYY-MM-DD."}), 400

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO contacts (first_name, last_name, phone_number, email, date_of_birth, category, notes)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                cursor.execute(sql, (first_name, last_name, phone_number, email, date_of_birth, category, notes))
                new_id = cursor.lastrowid
        res_data = {"status": "success", "id": new_id, "message": "Contact added successfully!"}
        dob_details = get_dob_details(date_of_birth)
        if dob_details:
            res_data["dob_details"] = dob_details
            res_data["dob_fact"] = f"🎉 Fun Date Fact: {dob_details['primary_fact']}"
        return jsonify(res_data), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/contacts/<int:contact_id>", methods=["PUT", "POST"])
def update_contact(contact_id):
    """Updates an existing contact in the database."""
    payload = request.get_json(silent=True) or request.form
    
    first_name = payload.get("first_name", "").strip()
    last_name = payload.get("last_name", "").strip()
    phone_number = payload.get("phone_number", "").strip()
    email = payload.get("email", "").strip()
    date_of_birth = payload.get("date_of_birth", "").strip() or None
    category = payload.get("category", "General").strip() or "General"
    notes = payload.get("notes", "").strip()

    if not first_name or not last_name or not phone_number:
        return jsonify({"status": "error", "message": "First name, last name, and phone number are required."}), 400

    if len(first_name) > 100 or len(last_name) > 100:
        return jsonify({"status": "error", "message": "First and last names cannot exceed 100 characters."}), 400

    if len(phone_number) > 50:
        return jsonify({"status": "error", "message": "Phone number cannot exceed 50 characters."}), 400

    if date_of_birth:
        try:
            datetime.strptime(date_of_birth, "%Y-%m-%d")
        except ValueError:
            return jsonify({"status": "error", "message": "Invalid date of birth format. Expected YYYY-MM-DD."}), 400

    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    UPDATE contacts
                    SET first_name = %s, last_name = %s, phone_number = %s, email = %s, date_of_birth = %s, category = %s, notes = %s
                    WHERE id = %s
                """
                cursor.execute(sql, (first_name, last_name, phone_number, email, date_of_birth, category, notes, contact_id))
                if cursor.rowcount == 0:
                    cursor.execute("SELECT id FROM contacts WHERE id = %s;", (contact_id,))
                    if not cursor.fetchone():
                        return jsonify({"status": "error", "message": "Contact not found"}), 404
        res_data = {"status": "success", "message": "Contact updated successfully!"}
        dob_details = get_dob_details(date_of_birth)
        if dob_details:
            res_data["dob_details"] = dob_details
            res_data["dob_fact"] = f"🎉 Fun Date Fact: {dob_details['primary_fact']}"
        return jsonify(res_data)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@app.route("/api/contacts/<int:contact_id>", methods=["DELETE"])
def delete_contact(contact_id):
    """Deletes a contact from the database."""
    try:
        with get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM contacts WHERE id = %s;", (contact_id,))
                if cursor.rowcount == 0:
                    return jsonify({"status": "error", "message": "Contact not found"}), 404
        return jsonify({"status": "success", "message": "Contact deleted successfully."})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "1") == "1"
    print(f"\n=======================================================")
    print(f"  Phone Book App is running on http://127.0.0.1:{port}")
    print(f"=======================================================\n")
    app.run(host="0.0.0.0", port=port, debug=debug)
