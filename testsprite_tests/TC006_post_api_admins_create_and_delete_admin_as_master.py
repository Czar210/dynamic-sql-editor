import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

def test_post_api_admins_create_and_delete_admin_as_master():
    # Step 1: Master login to get token
    login_url = f"{BASE_URL}/api/auth/login"
    master_login_resp = requests.post(
        login_url,
        json={"username": MASTER_USERNAME, "password": MASTER_PASSWORD},
        timeout=TIMEOUT,
    )
    assert master_login_resp.status_code == 200, f"Master login failed: {master_login_resp.text}"
    master_token = master_login_resp.json().get("access_token")
    assert master_token, "Master token missing in login response"
    master_headers = {"Authorization": f"Bearer {master_token}"}

    # Step 1: Master creates admin with unique UUID username
    admin_username = f"testadmin-{uuid.uuid4()}"
    admin_password = "StrongPass123!"
    create_admin_resp = requests.post(
        f"{BASE_URL}/api/admins",
        headers=master_headers,
        json={"username": admin_username, "password": admin_password},
        timeout=TIMEOUT,
    )
    assert create_admin_resp.status_code == 200, f"Failed to create admin: {create_admin_resp.text}"
    admin_data = create_admin_resp.json()
    admin_id = admin_data.get("id")
    assert admin_id, "Created admin ID missing in response"
    assert admin_data.get("username") == admin_username

    try:
        # Step 2: Login as that admin to get admin_token
        admin_login_resp = requests.post(
            login_url,
            json={"username": admin_username, "password": admin_password},
            timeout=TIMEOUT,
        )
        assert admin_login_resp.status_code == 200, f"Admin login failed: {admin_login_resp.text}"
        admin_token = admin_login_resp.json().get("access_token")
        assert admin_token, "Admin token missing in login response"
        admin_headers = {"Authorization": f"Bearer {admin_token}"}

        # Step 3: Attempt to create another admin as non-master (admin) - must return 403
        attempt_create_resp = requests.post(
            f"{BASE_URL}/api/admins",
            headers=admin_headers,
            json={"username": f"another-{uuid.uuid4()}", "password": "SomePass123!"},
            timeout=TIMEOUT,
        )
        assert attempt_create_resp.status_code == 403, f"Non-master admin created admin: {attempt_create_resp.text}"

        # Step 4: Master lists admins - verify new admin is in list
        list_admins_resp = requests.get(
            f"{BASE_URL}/api/admins",
            headers=master_headers,
            timeout=TIMEOUT,
        )
        assert list_admins_resp.status_code == 200, f"Failed to list admins: {list_admins_resp.text}"
        admins_list = list_admins_resp.json()
        usernames = [adm.get("username") for adm in admins_list if adm.get("username")]
        assert admin_username in usernames, "Newly created admin not found in admins list"

    finally:
        # Step 5 & 6: Master deletes the created admin - cleanup
        delete_resp = requests.delete(
            f"{BASE_URL}/api/admins/{admin_id}",
            headers=master_headers,
            timeout=TIMEOUT,
        )
        # Deletion might fail if already deleted or not found, assert 200 or 404 acceptable
        assert delete_resp.status_code in (200, 404), f"Failed to delete admin: {delete_resp.text}"

test_post_api_admins_create_and_delete_admin_as_master()