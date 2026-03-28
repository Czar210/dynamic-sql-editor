import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30
MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"


def test_post_api_moderators_full_lifecycle_as_admin():
    session = requests.Session()
    headers = {"Content-Type": "application/json"}

    # Step 1: Master login
    master_login_payload = {"username": MASTER_USERNAME, "password": MASTER_PASSWORD}
    resp = session.post(
        f"{BASE_URL}/api/auth/login",
        json=master_login_payload,
        timeout=TIMEOUT,
        headers=headers,
    )
    assert resp.status_code == 200, f"Master login failed: {resp.text}"
    master_token = resp.json().get("access_token")
    assert master_token, "Master token not found"
    master_auth_header = {"Authorization": f"Bearer {master_token}", "Content-Type": "application/json"}

    # Step 1: Master creates admin with unique username
    admin_username = f"admin_{uuid.uuid4().hex[:8]}"
    admin_password = "AdminPass123!"
    create_admin_payload = {"username": admin_username, "password": admin_password}
    resp = session.post(
        f"{BASE_URL}/api/admins",
        json=create_admin_payload,
        headers=master_auth_header,
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200, f"Master failed to create admin: {resp.text}"
    admin_user = resp.json()
    admin_id = admin_user.get("id")
    assert admin_id, "Created admin user id missing"

    try:
        # Step 2: Login as admin
        admin_login_payload = {"username": admin_username, "password": admin_password}
        resp = session.post(
            f"{BASE_URL}/api/auth/login",
            json=admin_login_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Admin login failed: {resp.text}"
        admin_token = resp.json().get("access_token")
        assert admin_token, "Admin token not found"
        admin_auth_header = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}

        # Step 3: Admin creates moderator
        mod_username = f"moderator_{uuid.uuid4().hex[:8]}"
        mod_password = "ModPass123!"
        create_mod_payload = {"username": mod_username, "password": mod_password}
        resp = session.post(
            f"{BASE_URL}/api/moderators",
            json=create_mod_payload,
            headers=admin_auth_header,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Admin failed to create moderator: {resp.text}"
        mod_user = resp.json()
        mod_id = mod_user.get("id")
        assert mod_id, "Created moderator user id missing"

        try:
            # Step 4: Admin lists moderators
            resp = session.get(
                f"{BASE_URL}/api/moderators",
                headers=admin_auth_header,
                timeout=TIMEOUT,
            )
            assert resp.status_code == 200, f"Admin failed to list moderators: {resp.text}"
            moderators = resp.json()
            assert any(m.get("id") == mod_id for m in moderators), "Moderator not found in list"

            # Step 5: Admin resets moderator password
            new_password = "NewModPass456!"
            reset_password_payload = {"new_password": new_password}
            resp = session.post(
                f"{BASE_URL}/api/moderators/{mod_id}/reset-password",
                json=reset_password_payload,
                headers=admin_auth_header,
                timeout=TIMEOUT,
            )
            assert resp.status_code == 200, f"Failed to reset moderator password: {resp.text}"
            msg = resp.json().get("message")
            assert isinstance(msg, str) and msg, "Reset password message missing or empty"

        finally:
            # Step 6: Admin deletes moderator
            resp = session.delete(
                f"{BASE_URL}/api/moderators/{mod_id}",
                headers=admin_auth_header,
                timeout=TIMEOUT,
            )
            assert resp.status_code == 200, f"Failed to delete moderator: {resp.text}"
            msg = resp.json().get("message")
            assert isinstance(msg, str) and msg, "Delete moderator message missing or empty"

    finally:
        # Cleanup: Master deletes admin
        resp = session.delete(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers=master_auth_header,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 200, f"Failed to delete admin: {resp.text}"
        msg = resp.json().get("message")
        assert isinstance(msg, str) and msg, "Delete admin message missing or empty"


test_post_api_moderators_full_lifecycle_as_admin()