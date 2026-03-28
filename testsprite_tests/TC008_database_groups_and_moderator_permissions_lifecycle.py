import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30
MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"
MASTER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJwdWN6YXJhcyIsInJvbGUiOiJtYXN0ZXIiLCJpZCI6MSwiZXhwIjoxNzc1MTczMjE2fQ.D-ndmBBzrwDgTxzn6n-s9Y6EFNUa0DLyjhWvPFEqWdo"  # Provided token


def test_database_groups_and_moderator_permissions_lifecycle():
    # Headers for master user (provided token)
    master_headers = {
        "Authorization": f"Bearer {MASTER_TOKEN}",
        "Content-Type": "application/json"
    }

    # Step 1: Master creates admin with unique username
    admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    admin_password = "AdminPass123!"
    create_admin_payload = {
        "username": admin_username,
        "password": admin_password
    }
    try:
        resp = requests.post(
            f"{BASE_URL}/api/admins",
            headers=master_headers,
            json=create_admin_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Master create admin failed: {resp.text}"
        admin = resp.json()
        assert "id" in admin and admin["id"] is not None
        admin_id = admin["id"]

        # Step 2: Login as created admin to get admin token
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Admin login failed: {resp.text}"
        admin_login_data = resp.json()
        admin_token = admin_login_data.get("access_token")
        assert admin_token, "Admin access_token missing"
        admin_headers = {
            "Authorization": f"Bearer {admin_token}",
            "Content-Type": "application/json",
        }

        # Step 3: Admin creates database group
        group_name = f"Group_{uuid.uuid4().hex[:6]}"
        group_description = "Test group for TC008"
        create_group_payload = {
            "name": group_name,
            "description": group_description
        }
        resp = requests.post(
            f"{BASE_URL}/api/database-groups",
            headers=admin_headers,
            json=create_group_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Admin create database group failed: {resp.text}"
        group = resp.json()
        assert "id" in group and group["id"] is not None
        group_id = group["id"]

        # Step 4: Admin creates moderator
        moderator_username = f"mod_{uuid.uuid4().hex[:8]}"
        moderator_password = "ModPass123!"
        create_moderator_payload = {
            "username": moderator_username,
            "password": moderator_password,
        }
        resp = requests.post(
            f"{BASE_URL}/api/moderators",
            headers=admin_headers,
            json=create_moderator_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Admin create moderator failed: {resp.text}"
        moderator = resp.json()
        assert "id" in moderator and moderator["id"] is not None
        moderator_id = moderator["id"]

        # Step 5: Admin grants moderator access to group
        grant_permission_payload = {"moderator_id": moderator_id}
        resp = requests.post(
            f"{BASE_URL}/api/database-groups/{group_id}/permissions",
            headers=admin_headers,
            json=grant_permission_payload,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Grant moderator permission failed: {resp.text}"
        permission = resp.json()
        assert "id" in permission, "Permission response missing id"
        assert permission.get("moderator_id") == moderator_id, "Permission response moderator_id mismatch"
        # According to instructions field is "group_id" (string), NOT "database_group_id"
        assert "group_id" in permission and isinstance(permission["group_id"], (int, str)), "Permission response missing or invalid group_id"

        # Step 6: Verify moderator can list the group via GET /api/database-groups
        # Login as moderator to get token
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"username": moderator_username, "password": moderator_password},
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Moderator login failed: {resp.text}"
        moderator_token = resp.json().get("access_token")
        assert moderator_token, "Moderator access_token missing"
        moderator_headers = {
            "Authorization": f"Bearer {moderator_token}",
            "Content-Type": "application/json",
        }
        resp = requests.get(
            f"{BASE_URL}/api/database-groups",
            headers=moderator_headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Moderator list groups failed: {resp.text}"
        groups_list = resp.json()
        # Verify the group is in the list for moderator
        assert any(str(g.get("id")) == str(group_id) for g in groups_list), "Group not listed for moderator"

        # Step 7: Admin revokes access (DELETE /api/database-groups/{id}/permissions/{mod_id})
        resp = requests.delete(
            f"{BASE_URL}/api/database-groups/{group_id}/permissions/{moderator_id}",
            headers=admin_headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Revoke moderator permission failed: {resp.text}"
        resp_json = resp.json()
        assert "message" in resp_json, "Revoke permission response missing message"

    finally:
        # Step 8: Cleanup
        # Delete moderator if exists
        try:
            if 'moderator_id' in locals() and 'admin_headers' in locals():
                requests.delete(
                    f"{BASE_URL}/api/moderators/{moderator_id}",
                    headers=admin_headers,
                    timeout=TIMEOUT,
                )
        except Exception:
            pass
        # Delete database group if exists
        try:
            if 'group_id' in locals() and 'admin_headers' in locals():
                requests.delete(
                    f"{BASE_URL}/api/database-groups/{group_id}",
                    headers=admin_headers,
                    timeout=TIMEOUT,
                )
        except Exception:
            pass
        # Delete admin if exists
        try:
            if 'admin_id' in locals() and 'master_headers' in locals():
                requests.delete(
                    f"{BASE_URL}/api/admins/{admin_id}",
                    headers=master_headers,
                    timeout=TIMEOUT,
                )
        except Exception:
            pass


test_database_groups_and_moderator_permissions_lifecycle()