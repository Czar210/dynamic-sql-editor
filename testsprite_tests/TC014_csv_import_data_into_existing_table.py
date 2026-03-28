import requests
import uuid
import io
import csv

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"
MASTER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwdWN6YXJhcyIsInJvbGUiOiJtYXN0ZXIiLCJpZCI6MSwiZXhwIjoxNzc1MTczMjE2fQ.D-ndmBBzrwDgTxzn6n-s9Y6EFNUa0DLyjhWvPFEqWdo"

def test_csv_import_into_existing_table():
    headers_master = {"Authorization": f"Bearer {MASTER_TOKEN}"}
    admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    admin_password = "AdminPass123!"

    admin_token = None
    admin_id = None
    table_id = None
    table_name = None

    # Step 1: Master creates admin
    try:
        create_admin_resp = requests.post(
            f"{BASE_URL}/api/admins",
            json={"username": admin_username, "password": admin_password},
            headers=headers_master,
            timeout=TIMEOUT,
        )
        assert create_admin_resp.status_code == 200, f"Master admin creation failed: {create_admin_resp.text}"
        admin_data = create_admin_resp.json()
        admin_id = admin_data.get("id")
        assert admin_id is not None, "Admin ID missing in creation response"

        # Step 2: Login as admin
        login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT,
        )
        assert login_resp.status_code == 200, f"Admin login failed: {login_resp.text}"
        login_json = login_resp.json()
        admin_token = login_json.get("access_token")
        assert admin_token is not None, "Admin access_token missing in login response"
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        # Step 2: Admin creates a table with String columns (name, email)
        # Need to get admin's accessible database groups to assign group_id
        groups_resp = requests.get(
            f"{BASE_URL}/api/database-groups",
            headers=headers_admin,
            timeout=TIMEOUT,
        )
        assert groups_resp.status_code == 200, f"Failed to list database groups: {groups_resp.text}"
        groups = groups_resp.json()
        assert isinstance(groups, list), "Database groups response not list"
        # Pick group_id if any, else None
        group_id = groups[0]["id"] if groups else None

        # Generate a unique table name
        table_name = f"tbl_{uuid.uuid4().hex[:8]}"
        table_payload = {
            "name": table_name,
            "description": "Table for CSV import test",
            "group_id": group_id,
            "is_public": False,
            "columns": [
                {
                    "name": "name",
                    "data_type": "String",
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary": False
                },
                {
                    "name": "email",
                    "data_type": "String",
                    "is_nullable": False,
                    "is_unique": True,
                    "is_primary": False
                }
            ]
        }
        create_table_resp = requests.post(
            f"{BASE_URL}/tables/",
            json=table_payload,
            headers=headers_admin,
            timeout=TIMEOUT,
        )
        assert create_table_resp.status_code == 200, f"Table creation failed: {create_table_resp.text}"
        table_data = create_table_resp.json()
        table_id = table_data.get("id")
        assert table_id is not None, "Table ID missing in creation response"

        # Step 3: POST /api/import/data/{table_name} with CSV file multipart (field 'file')
        # Prepare CSV content matching columns
        csv_buffer = io.StringIO()
        csv_writer = csv.DictWriter(csv_buffer, fieldnames=["name", "email"])
        csv_writer.writeheader()
        csv_writer.writerow({"name": "John Doe", "email": "john@example.com"})
        csv_writer.writerow({"name": "Jane Smith", "email": "jane@example.com"})
        csv_content = csv_buffer.getvalue().encode('utf-8')
        csv_buffer.close()

        files = {
            "file": ("import.csv", csv_content, "text/csv")
        }
        import_resp = requests.post(
            f"{BASE_URL}/api/import/data/{table_name}",
            headers=headers_admin,
            files=files,
            timeout=TIMEOUT,
        )
        assert import_resp.status_code == 200, f"CSV import failed: {import_resp.text}"
        import_json = import_resp.json()
        inserted_rows = import_json.get("inserted_rows")
        matched_columns = import_json.get("matched_columns")
        errors = import_json.get("errors")
        assert isinstance(inserted_rows, int) and inserted_rows > 0, "No rows inserted"
        assert isinstance(matched_columns, list), "matched_columns missing or not a list"
        for col in ["name", "email"]:
            assert col in matched_columns, f"Column {col} missing in matched_columns"
        assert isinstance(errors, list), "errors field missing or not list"

        # Step 5: GET /api/{table_name} to confirm data was inserted
        get_records_resp = requests.get(
            f"{BASE_URL}/api/{table_name}",
            headers=headers_admin,
            timeout=TIMEOUT,
        )
        assert get_records_resp.status_code == 200, f"Failed to get table records: {get_records_resp.text}"
        records = get_records_resp.json()
        assert isinstance(records, list), "Records response is not a list"
        assert any(
            r.get("name") == "John Doe" and r.get("email") == "john@example.com"
            for r in records
        ), "Inserted record 'John Doe' not found"
        assert any(
            r.get("name") == "Jane Smith" and r.get("email") == "jane@example.com"
            for r in records
        ), "Inserted record 'Jane Smith' not found"

    finally:
        # Step 6: Cleanup
        # Delete table if created
        if table_id and admin_token:
            try:
                requests.delete(
                    f"{BASE_URL}/tables/{table_id}",
                    headers={"Authorization": f"Bearer {admin_token}"},
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

        # Delete admin if created
        if admin_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/admins/{admin_id}",
                    headers=headers_master,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass

test_csv_import_into_existing_table()