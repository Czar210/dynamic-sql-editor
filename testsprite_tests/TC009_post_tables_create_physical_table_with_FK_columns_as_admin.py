import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

def test_post_tables_create_physical_table_with_fk_columns_as_admin():
    # Step 1: Master login
    master_login_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": MASTER_USERNAME, "password": MASTER_PASSWORD},
        timeout=TIMEOUT
    )
    assert master_login_resp.status_code == 200, f"Master login failed: {master_login_resp.text}"
    master_token = master_login_resp.json()["access_token"]
    master_headers = {"Authorization": f"Bearer {master_token}"}

    admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    admin_password = "StrongPass123!"

    # Step 1: Master creates admin
    create_admin_resp = requests.post(
        f"{BASE_URL}/api/admins",
        json={"username": admin_username, "password": admin_password},
        headers=master_headers,
        timeout=TIMEOUT
    )
    assert create_admin_resp.status_code == 200, f"Master creating admin failed: {create_admin_resp.text}"
    admin_data = create_admin_resp.json()
    admin_id = admin_data.get("id")
    assert admin_id is not None, "Admin id missing in create admin response"

    admin_token = None
    group_id = None
    base_table_id = None
    fk_table_id = None

    try:
        # Step 2: Login as admin
        admin_login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT
        )
        assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
        admin_token = admin_login_resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Step 3: Admin creates database group
        group_name = f"group_{uuid.uuid4().hex[:8]}"
        group_create_resp = requests.post(
            f"{BASE_URL}/api/database-groups",
            json={"name": group_name, "description": "Test group for FK tables"},
            headers=admin_headers,
            timeout=TIMEOUT
        )
        assert group_create_resp.status_code == 200, f"Create group failed: {group_create_resp.text}"
        group_resp_json = group_create_resp.json()
        group_id = group_resp_json.get("id")
        assert group_id is not None, "Group id missing in create group response"

        # Step 4: Admin creates base table
        base_table_name = f"base_table_{uuid.uuid4().hex[:8]}"
        base_table_payload = {
            "name": base_table_name,
            "description": "Base table for FK reference",
            "group_id": group_id,
            "is_public": False,
            "columns": [
                {
                    "name": "id",
                    "data_type": "Integer",
                    "is_nullable": False,
                    "is_unique": True,
                    "is_primary": True
                },
                {
                    "name": "name",
                    "data_type": "String",
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary": False
                }
            ]
        }
        base_table_resp = requests.post(
            f"{BASE_URL}/tables/",
            json=base_table_payload,
            headers=admin_headers,
            timeout=TIMEOUT
        )
        assert base_table_resp.status_code == 200, f"Base table creation failed: {base_table_resp.text}"
        base_table_json = base_table_resp.json()
        base_table_id = base_table_json.get("id")
        assert base_table_id is not None, "Base table id missing"
        columns = base_table_json.get("columns", [])
        # Verify columns returned as expected
        base_ids = [col["name"] for col in columns]
        assert "id" in base_ids and "name" in base_ids, "Base table columns missing"

        # Step 5: Admin creates table with FK column referencing base table
        fk_table_name = f"fk_table_{uuid.uuid4().hex[:8]}"
        fk_column_name = "base_id"
        fk_table_payload = {
            "name": fk_table_name,
            "description": "Table with FK referencing base_table",
            "group_id": group_id,
            "is_public": False,
            "columns": [
                {
                    "name": "id",
                    "data_type": "Integer",
                    "is_nullable": False,
                    "is_unique": True,
                    "is_primary": True
                },
                {
                    "name": fk_column_name,
                    "data_type": "Integer",
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary": False,
                    "fk_table": base_table_name,
                    "fk_column": "id"
                }
            ]
        }
        fk_table_resp = requests.post(
            f"{BASE_URL}/tables/",
            json=fk_table_payload,
            headers=admin_headers,
            timeout=TIMEOUT
        )
        assert fk_table_resp.status_code == 200, f"FK table creation failed: {fk_table_resp.text}"
        fk_table_json = fk_table_resp.json()
        fk_table_id = fk_table_json.get("id")
        assert fk_table_id is not None, "FK table id missing"

        # Step 6: Verify response columns include fk_table and fk_column fields
        fk_columns = fk_table_json.get("columns", [])
        found_fk_column = None
        for col in fk_columns:
            if col.get("name") == fk_column_name:
                found_fk_column = col
                break
        assert found_fk_column is not None, "FK column missing in FK table"
        assert found_fk_column.get("fk_table") == base_table_name, f"fk_table mismatch: expected {base_table_name}"
        assert found_fk_column.get("fk_column") == "id", "fk_column mismatch"

        # Step 7: Toggle visibility PATCH /tables/{id}/visibility
        toggle_resp = requests.patch(
            f"{BASE_URL}/tables/{fk_table_id}/visibility",
            headers=admin_headers,
            timeout=TIMEOUT
        )
        assert toggle_resp.status_code == 200, f"Toggle visibility failed: {toggle_resp.text}"
        toggle_json = toggle_resp.json()
        assert "is_public" in toggle_json and isinstance(toggle_json["is_public"], bool), "Invalid toggle visibility response"

    finally:
        # Step 8: Cleanup tables and admin
        if fk_table_id:
            requests.delete(
                f"{BASE_URL}/tables/{fk_table_id}",
                headers=admin_headers,
                timeout=TIMEOUT
            )
        if base_table_id:
            requests.delete(
                f"{BASE_URL}/tables/{base_table_id}",
                headers=admin_headers,
                timeout=TIMEOUT
            )
        if group_id:
            requests.delete(
                f"{BASE_URL}/api/database-groups/{group_id}",
                headers=admin_headers,
                timeout=TIMEOUT
            )
        if admin_id:
            requests.delete(
                f"{BASE_URL}/api/admins/{admin_id}",
                headers=master_headers,
                timeout=TIMEOUT
            )

test_post_tables_create_physical_table_with_fk_columns_as_admin()