import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"


def test_TC010_dynamic_table_crud_tenant_isolation():
    headers_master = {}
    headers_admin_a = {}
    headers_admin_b = {}

    admin_a = {"username": f"admin_a_{uuid.uuid4().hex[:8]}", "password": "AdminAPass123!"}
    admin_b = {"username": f"admin_b_{uuid.uuid4().hex[:8]}", "password": "AdminBPass123!"}
    created_admin_ids = []
    table_id = None
    table_name = None
    inserted_record_id = None

    try:
        # 1) Master login
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": MASTER_USERNAME, "password": MASTER_PASSWORD}, timeout=TIMEOUT)
        assert r.status_code == 200, f"Master login failed: {r.text}"
        master_token = r.json()["access_token"]
        headers_master = {"Authorization": f"Bearer {master_token}"}

        # 1) Master creates two admins (A and B)
        for admin in (admin_a, admin_b):
            r = requests.post(f"{BASE_URL}/api/admins", headers=headers_master, json={"username": admin["username"], "password": admin["password"]}, timeout=TIMEOUT)
            assert r.status_code == 200, f"Failed to create admin {admin['username']}: {r.text}"
            admin_resp = r.json()
            assert "id" in admin_resp and "username" in admin_resp
            created_admin_ids.append(admin_resp["id"])

        # 2) Login as admin A
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": admin_a["username"], "password": admin_a["password"]}, timeout=TIMEOUT)
        assert r.status_code == 200, f"Admin A login failed: {r.text}"
        token_admin_a = r.json()["access_token"]
        headers_admin_a = {"Authorization": f"Bearer {token_admin_a}"}

        # 3) Admin A creates a table with columns id (Integer, primary key) and name (String)
        # Need a group_id to create table - list groups to get one or set to None if possible
        # We'll create a new group first for isolation
        r = requests.post(f"{BASE_URL}/api/database-groups", headers=headers_admin_a, json={"name": f"group_{uuid.uuid4().hex[:8]}", "description": "Test group for TC010"}, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to create database group: {r.text}"
        group_id = r.json().get("id")
        assert group_id is not None

        table_name = f"tbl_{uuid.uuid4().hex[:8]}"

        table_payload = {
            "name": table_name,
            "description": "Test table for TC010",
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
                    "is_nullable": True,
                    "is_unique": False,
                    "is_primary": False
                }
            ]
        }
        r = requests.post(f"{BASE_URL}/tables/", headers=headers_admin_a, json=table_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to create table: {r.text}"
        table_resp = r.json()
        table_id = table_resp.get("id")
        assert table_resp.get("name") == table_name
        assert table_id is not None

        # 4) Admin A inserts a record {"name": "Test Record A"} via POST /api/{table_name}
        insert_payload = {"name": "Test Record A"}
        r = requests.post(f"{BASE_URL}/api/{table_name}", headers=headers_admin_a, json=insert_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Insert record failed: {r.text}"
        insert_resp = r.json()
        inserted_record_id = insert_resp.get("id")
        assert isinstance(inserted_record_id, int), f"Invalid inserted id: {insert_resp}"
        assert "message" in insert_resp

        # 5) Admin A reads records GET /api/{table_name} and verifies inserted record exists
        r = requests.get(f"{BASE_URL}/api/{table_name}", headers=headers_admin_a, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to list records: {r.text}"
        records = r.json()
        assert any(rec.get("id") == inserted_record_id for rec in records), f"Inserted record {inserted_record_id} not found in records"

        # 6) Admin A updates record via PUT /api/{table_name}/{id}
        update_payload = {"name": "Updated Record A"}
        r = requests.put(f"{BASE_URL}/api/{table_name}/{inserted_record_id}", headers=headers_admin_a, json=update_payload, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to update record: {r.text}"
        update_resp = r.json()
        assert "message" in update_resp

        # 7) Admin A deletes record via DELETE /api/{table_name}/{id}
        r = requests.delete(f"{BASE_URL}/api/{table_name}/{inserted_record_id}", headers=headers_admin_a, timeout=TIMEOUT)
        assert r.status_code == 200, f"Failed to delete record: {r.text}"
        delete_resp = r.json()
        assert "message" in delete_resp

        # 8) Login as admin B
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"username": admin_b["username"], "password": admin_b["password"]}, timeout=TIMEOUT)
        assert r.status_code == 200, f"Admin B login failed: {r.text}"
        token_admin_b = r.json()["access_token"]
        headers_admin_b = {"Authorization": f"Bearer {token_admin_b}"}

        # 9) Admin B tries access Admin A's table - must get 404
        r = requests.get(f"{BASE_URL}/api/{table_name}", headers=headers_admin_b, timeout=TIMEOUT)
        assert r.status_code == 404, f"Admin B should not access Admin A's table but got: {r.status_code}"

    finally:
        # 10) Cleanup
        # Delete table
        if table_id and headers_admin_a:
            try:
                requests.delete(f"{BASE_URL}/tables/{table_id}", headers=headers_admin_a, timeout=TIMEOUT)
            except Exception:
                pass
        # Delete created admins
        for admin_id in created_admin_ids:
            try:
                requests.delete(f"{BASE_URL}/api/admins/{admin_id}", headers=headers_master, timeout=TIMEOUT)
            except Exception:
                pass


test_TC010_dynamic_table_crud_tenant_isolation()