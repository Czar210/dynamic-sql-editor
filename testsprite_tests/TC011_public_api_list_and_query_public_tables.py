import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

def test_public_api_list_and_query_public_tables():
    # Authenticate as master
    login_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={"username": MASTER_USERNAME, "password": MASTER_PASSWORD},
        timeout=TIMEOUT,
    )
    assert login_resp.status_code == 200, f"Master login failed: {login_resp.text}"
    master_token = login_resp.json()["access_token"]
    master_headers = {"Authorization": f"Bearer {master_token}"}

    # Step 1: Master creates admin
    new_admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    new_admin_password = "AdminPass123!"
    create_admin_resp = requests.post(
        f"{BASE_URL}/api/admins",
        headers=master_headers,
        json={"username": new_admin_username, "password": new_admin_password},
        timeout=TIMEOUT,
    )
    assert create_admin_resp.status_code == 200, f"Create admin failed: {create_admin_resp.text}"
    admin_id = create_admin_resp.json()["id"]

    try:
        # Step 2: Admin login
        admin_login_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": new_admin_username, "password": new_admin_password},
            timeout=TIMEOUT,
        )
        assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
        admin_token = admin_login_resp.json()["access_token"]
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Step 2b: Admin creates a database group (required for table)
        group_name = f"group_{uuid.uuid4().hex[:8]}"
        create_group_resp = requests.post(
            f"{BASE_URL}/api/database-groups",
            headers=admin_headers,
            json={"name": group_name, "description": "Test group for public API"},
            timeout=TIMEOUT,
        )
        assert create_group_resp.status_code == 200, f"Create group failed: {create_group_resp.text}"
        group_id = create_group_resp.json()["id"]

        # Step 2c: Admin creates table with columns
        table_name = f"table_{uuid.uuid4().hex[:8]}"
        table_columns = [
            {"name": "id", "data_type": "Integer", "is_nullable": False, "is_unique": True, "is_primary": True},
            {"name": "value", "data_type": "String", "is_nullable": True, "is_unique": False, "is_primary": False},
        ]
        create_table_resp = requests.post(
            f"{BASE_URL}/tables/",
            headers=admin_headers,
            json={
                "name": table_name,
                "description": "Test table for public API",
                "group_id": group_id,
                "is_public": False,
                "columns": table_columns,
            },
            timeout=TIMEOUT,
        )
        assert create_table_resp.status_code == 200, f"Create table failed: {create_table_resp.text}"
        table_data = create_table_resp.json()
        table_id = table_data["id"]

        try:
            # Step 3: Admin inserts 3 records
            records_to_insert = [
                {"value": "record1"},
                {"value": "record2"},
                {"value": "record3"},
            ]
            record_ids = []
            for record in records_to_insert:
                insert_resp = requests.post(
                    f"{BASE_URL}/api/{table_name}",
                    headers=admin_headers,
                    json=record,
                    timeout=TIMEOUT,
                )
                assert insert_resp.status_code == 200, f"Insert record failed: {insert_resp.text}"
                resp_json = insert_resp.json()
                assert "id" in resp_json and "message" in resp_json
                record_ids.append(resp_json["id"])

            # Step 4: Admin toggles table to public
            patch_resp = requests.patch(
                f"{BASE_URL}/tables/{table_id}/visibility",
                headers=admin_headers,
                timeout=TIMEOUT,
            )
            assert patch_resp.status_code == 200, f"Patch visibility failed: {patch_resp.text}"
            visibility_json = patch_resp.json()
            assert visibility_json.get("is_public") is True

            # Step 5: Without auth, GET /public/tables/ must list the table
            public_tables_resp = requests.get(f"{BASE_URL}/public/tables/", timeout=TIMEOUT)
            assert public_tables_resp.status_code == 200, f"Public tables list failed: {public_tables_resp.text}"
            public_tables = public_tables_resp.json()
            table_names = [t["name"] for t in public_tables]
            assert table_name in table_names, f"Public tables listing missing {table_name}"

            # Step 6: GET /public/api/{table_name} (no auth) must return records (all 3)
            public_api_resp = requests.get(f"{BASE_URL}/public/api/{table_name}", timeout=TIMEOUT)
            assert public_api_resp.status_code == 200, f"Public api get records failed: {public_api_resp.text}"
            data = public_api_resp.json()
            assert "data" in data and isinstance(data["data"], list)
            assert len(data["data"]) >= 3
            # Check inserted records values are present
            inserted_values = set(r["value"] for r in data["data"])
            for rec in records_to_insert:
                assert rec["value"] in inserted_values

            # Step 7: GET /public/api/{table_name}?limit=2 (pagination)
            public_api_limit_resp = requests.get(f"{BASE_URL}/public/api/{table_name}?limit=2", timeout=TIMEOUT)
            assert public_api_limit_resp.status_code == 200, f"Public api pagination failed: {public_api_limit_resp.text}"
            limit_data = public_api_limit_resp.json()
            assert "data" in limit_data and len(limit_data["data"]) == 2
            assert limit_data.get("limit") == 2
            assert limit_data.get("offset") == 0
            assert "total" in limit_data and limit_data["total"] >= 3

            # Step 8: GET /public/api/{table_name}/columns returns columns
            public_columns_resp = requests.get(f"{BASE_URL}/public/api/{table_name}/columns", timeout=TIMEOUT)
            assert public_columns_resp.status_code == 200, f"Public api columns failed: {public_columns_resp.text}"
            columns = public_columns_resp.json()
            # Must include columns 'id' and 'value'
            column_names = [col["name"] for col in columns]
            assert "id" in column_names and "value" in column_names

        finally:
            # Cleanup: delete table
            del_table_resp = requests.delete(
                f"{BASE_URL}/tables/{table_id}",
                headers=admin_headers,
                timeout=TIMEOUT,
            )
            # Delete might 404 if cascade deleted or not supported but ignore errors here

        # Cleanup: delete database group
        del_group_resp = requests.delete(
            f"{BASE_URL}/api/database-groups/{group_id}",
            headers=admin_headers,
            timeout=TIMEOUT,
        )
        # Ignore possible errors on group delete for cleanup

    finally:
        # Cleanup: delete admin user as master
        del_admin_resp = requests.delete(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers=master_headers,
            timeout=TIMEOUT,
        )
        # ignore errors in cleanup

test_public_api_list_and_query_public_tables()