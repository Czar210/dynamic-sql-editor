import requests
from uuid import uuid4

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

def test_sql_import_dry_run_and_commit_with_blocked_statements():
    session = requests.Session()

    try:
        # Step 1: Master login to get master token
        login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": MASTER_USERNAME, "password": MASTER_PASSWORD},
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Master login failed: {login_resp.text}"
        master_token = login_resp.json().get("access_token")
        assert master_token, "Master access_token missing"
        master_headers = {"Authorization": f"Bearer {master_token}"}

        # Step 1: Master creates admin user with unique username
        admin_username = f"admin_{uuid4().hex[:8]}"
        admin_password = "AdminPass123!"
        create_admin_resp = session.post(
            f"{BASE_URL}/api/admins",
            headers=master_headers,
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT
        )
        assert create_admin_resp.status_code == 200, f"Admin creation failed: {create_admin_resp.text}"
        admin_data = create_admin_resp.json()
        admin_id = admin_data.get("id")
        assert admin_id is not None, "Admin ID missing in response"

        # Step 2: Login as admin
        admin_login_resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT
        )
        assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
        admin_token = admin_login_resp.json().get("access_token")
        assert admin_token, "Admin access_token missing"
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Step 3: Generate unique table name
        unique_table_name = "imp_" + uuid4().hex[:8]

        # Step 4: Build SQL string with CREATE, INSERT, and DROP statements
        sql_text = (
            f'CREATE TABLE {unique_table_name} (id INTEGER PRIMARY KEY, label TEXT);\n'
            f'INSERT INTO {unique_table_name} (id, label) VALUES (1, "hello");\n'
            f'DROP TABLE other_nonexistent_table;'
        )
        sql_bytes = sql_text.encode('utf-8')

        # Step 5: POST /api/import/sql/dry-run with .sql file upload
        dry_run_resp = session.post(
            f"{BASE_URL}/api/import/sql/dry-run",
            headers=admin_headers,
            files={"file": (f"{unique_table_name}.sql", sql_bytes, "application/sql")},
            timeout=TIMEOUT
        )
        assert dry_run_resp.status_code == 200, f"Dry-run import failed: {dry_run_resp.text}"
        dry_run_json = dry_run_resp.json()

        # Step 6: Verify CREATE + INSERT have status 'ok', DROP has status 'blocked'
        statements = dry_run_json.get("statements")
        assert statements and isinstance(statements, list), "No statements returned in dry-run response"
        # Map statement type to status
        status_map = {stmt.get("type").upper(): stmt.get("status") for stmt in statements}
        assert status_map.get("CREATE") == "ok", f"CREATE statement status not ok: {status_map.get('CREATE')}"
        assert status_map.get("INSERT") == "ok", f"INSERT statement status not ok: {status_map.get('INSERT')}"
        assert status_map.get("DROP") == "blocked", f"DROP statement status not blocked: {status_map.get('DROP')}"

        # Step 7: POST /api/import/sql commit with same file
        commit_resp = session.post(
            f"{BASE_URL}/api/import/sql",
            headers=admin_headers,
            files={"file": (f"{unique_table_name}.sql", sql_bytes, "application/sql")},
            timeout=TIMEOUT
        )
        assert commit_resp.status_code == 200, f"Commit import failed: {commit_resp.text}"
        commit_json = commit_resp.json()

        # Step 8: Verify response contains created_tables with the unique name
        created_tables = commit_json.get("created_tables", [])
        assert isinstance(created_tables, list), "created_tables not a list in commit response"
        assert unique_table_name in created_tables, f"Unique table name '{unique_table_name}' not in created_tables"

    finally:
        # Step 9: Cleanup admin
        if 'master_headers' in locals() and 'admin_id' in locals():
            try:
                del_resp = session.delete(
                    f"{BASE_URL}/api/admins/{admin_id}",
                    headers=master_headers,
                    timeout=TIMEOUT
                )
                # Accept 200 or 404 (already deleted)
                assert del_resp.status_code in (200, 404), f"Failed to delete admin: {del_resp.text}"
            except Exception:
                # Ignore exceptions on cleanup
                pass

test_sql_import_dry_run_and_commit_with_blocked_statements()