import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

headers_master = {}
headers_admin = {}

def test_relations_api_create_and_retrieve_fk_relations():
    # Step 1: Login as master to get master token
    login_master_resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"username": MASTER_USERNAME, "password": MASTER_PASSWORD},
        timeout=TIMEOUT,
    )
    assert login_master_resp.status_code == 200, f"Master login failed: {login_master_resp.text}"
    master_token = login_master_resp.json().get("access_token")
    assert master_token, "No access_token in master login response"
    global headers_master
    headers_master = {"Authorization": f"Bearer {master_token}"}

    # Step 2: Master creates admin
    admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    admin_password = "AdminPass123!"
    create_admin_resp = requests.post(
        f"{BASE_URL}/api/admins",
        headers=headers_master,
        json={"username": admin_username, "password": admin_password},
        timeout=TIMEOUT,
    )
    assert create_admin_resp.status_code == 200, f"Create admin failed: {create_admin_resp.text}"
    admin_data = create_admin_resp.json()
    admin_id = admin_data.get("id")
    assert admin_id, "No admin id in create response"

    try:
        # Step 2: Login as admin
        login_admin_resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT,
        )
        assert login_admin_resp.status_code == 200, f"Admin login failed: {login_admin_resp.text}"
        admin_token = login_admin_resp.json().get("access_token")
        assert admin_token, "No access_token in admin login response"
        global headers_admin
        headers_admin = {"Authorization": f"Bearer {admin_token}"}

        # Step 3: Create a database group as admin to have group_id
        group_name = f"group_{uuid.uuid4().hex[:8]}"
        group_body = {
            "name": group_name,
            "description": "Group for FK test"
        }
        group_create_resp = requests.post(f"{BASE_URL}/api/database-groups", headers=headers_admin, json=group_body, timeout=TIMEOUT)
        assert group_create_resp.status_code == 200, f"Create database group failed: {group_create_resp.text}"
        group = group_create_resp.json()
        group_id = group.get("id")
        assert group_id, "No id in created database group"

        # Step 4: Admin creates parent and child tables
        # Define parent table data
        parent_table_name = f"parent_{uuid.uuid4().hex[:8]}"
        parent_table_body = {
            "name": parent_table_name,
            "description": "Parent table for FK test",
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
                    "name": "value",
                    "data_type": "String",
                    "is_nullable": True,
                    "is_unique": False,
                    "is_primary": False
                }
            ]
        }

        # Create parent table
        parent_create_resp = requests.post(f"{BASE_URL}/tables/", headers=headers_admin, json=parent_table_body, timeout=TIMEOUT)
        assert parent_create_resp.status_code == 200, f"Parent table creation failed: {parent_create_resp.text}"
        parent_table = parent_create_resp.json()
        parent_table_id = parent_table.get("id")
        assert parent_table_id, "No id in parent table create response"

        # Define child table data
        child_table_name = f"child_{uuid.uuid4().hex[:8]}"
        child_table_body = {
            "name": child_table_name,
            "description": "Child table for FK test",
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
                    "name": "parent_id",
                    "data_type": "Integer",
                    "is_nullable": False,
                    "is_unique": False,
                    "is_primary": False,
                    "fk_table": parent_table_name,
                    "fk_column": "id"
                },
                {
                    "name": "description",
                    "data_type": "String",
                    "is_nullable": True,
                    "is_unique": False,
                    "is_primary": False
                }
            ]
        }

        # Create child table
        child_create_resp = requests.post(f"{BASE_URL}/tables/", headers=headers_admin, json=child_table_body, timeout=TIMEOUT)
        assert child_create_resp.status_code == 200, f"Child table creation failed: {child_create_resp.text}"
        child_table = child_create_resp.json()
        child_table_id = child_table.get("id")
        assert child_table_id, "No id in child table create response"

        # Step 5: Admin creates relation via POST /api/relations
        relation_name = f"relation_{uuid.uuid4().hex[:8]}"
        relation_body = {
            "name": relation_name,
            "from_table_id": child_table_id,
            "to_table_id": parent_table_id,
            "from_column_name": "parent_id",
            "to_column_name": "id",
            "relation_type": "fk"
        }

        create_relation_resp = requests.post(f"{BASE_URL}/api/relations", headers=headers_admin, json=relation_body, timeout=TIMEOUT)
        assert create_relation_resp.status_code == 200, f"Relation creation failed: {create_relation_resp.text}"
        relation = create_relation_resp.json()
        relation_id = relation.get("id")
        assert relation_id, "No id in created relation"

        try:
            # Step 6: Retrieve relations via GET /api/relations/table/{child_table_name}
            get_relations_resp = requests.get(f"{BASE_URL}/api/relations/table/{child_table_name}", headers=headers_admin, timeout=TIMEOUT)
            assert get_relations_resp.status_code == 200, f"Get relations failed: {get_relations_resp.text}"
            relations_list = get_relations_resp.json()
            assert isinstance(relations_list, list), "Relations response is not a list"

            # Find created relation in list
            matched_relations = [rel for rel in relations_list if rel.get("id") == relation_id]
            assert len(matched_relations) == 1, "Created relation not found in retrieved list"
            rel = matched_relations[0]

            # Step 6: Verify response fields and types
            # Fields: id, name, from_table, to_table, from_column_name, to_column_name, relation_type
            expected_keys = {
                "id", "name", "from_table", "to_table", "from_column_name", "to_column_name", "relation_type"
            }
            assert expected_keys.issubset(rel.keys()), f"Relation missing expected keys: {expected_keys - rel.keys()}"

            # IMPORTANT: from_table and to_table are strings (table names), NOT dicts/objects
            assert isinstance(rel["from_table"], str), f"from_table is not string: {type(rel['from_table'])}"
            assert isinstance(rel["to_table"], str), f"to_table is not string: {type(rel['to_table'])}"

            # Validate values for from_table and to_table correct table names
            assert rel["from_table"] == child_table_name, f"from_table name mismatch: expected {child_table_name}, got {rel['from_table']}"
            assert rel["to_table"] == parent_table_name, f"to_table name mismatch: expected {parent_table_name}, got {rel['to_table']}"

            # Validate other fields match creation
            assert rel["name"] == relation_name, f"Relation name mismatch: expected {relation_name}, got {rel['name']}"
            assert rel["from_column_name"] == "parent_id", f"from_column_name mismatch"
            assert rel["to_column_name"] == "id", f"to_column_name mismatch"
            assert rel["relation_type"] == "fk", f"relation_type mismatch"

            # Step 7: Delete relation via DELETE /api/relations/{id}
            del_relation_resp = requests.delete(f"{BASE_URL}/api/relations/{relation_id}", headers=headers_admin, timeout=TIMEOUT)
            assert del_relation_resp.status_code == 200, f"Delete relation failed: {del_relation_resp.text}"

        finally:
            # Cleanup Step 8: Cleanup child and parent tables
            requests.delete(f"{BASE_URL}/tables/{child_table_id}", headers=headers_admin, timeout=TIMEOUT)
            requests.delete(f"{BASE_URL}/tables/{parent_table_id}", headers=headers_admin, timeout=TIMEOUT)

    finally:
        # Step 9: Cleanup admin user created by master
        requests.delete(f"{BASE_URL}/api/admins/{admin_id}", headers=headers_master, timeout=TIMEOUT)


test_relations_api_create_and_retrieve_fk_relations()
