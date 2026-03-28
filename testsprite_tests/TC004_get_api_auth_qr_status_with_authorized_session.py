import requests
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"


def test_get_api_auth_qr_status_with_authorized_session():
    # Step 1: Login as master to get access token
    login_url = f"{BASE_URL}/api/auth/login"
    login_data = {"username": MASTER_USERNAME, "password": MASTER_PASSWORD}
    login_resp = requests.post(login_url, json=login_data, timeout=TIMEOUT)
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
    login_json = login_resp.json()
    master_token = login_json.get("access_token")
    assert master_token is not None
    headers_auth = {"Authorization": f"Bearer {master_token}"}

    # Step 2: Create a QR session (no auth)
    qr_session_url = f"{BASE_URL}/api/auth/qr/session"
    qr_session_resp = requests.post(qr_session_url, timeout=TIMEOUT)
    assert qr_session_resp.status_code == 200, f"QR session creation failed: {qr_session_resp.text}"
    qr_session_json = qr_session_resp.json()
    session_id = qr_session_json.get("session_id")
    assert isinstance(session_id, str) and session_id.strip() != ""

    # Step 3: Authorize the QR session using master token
    qr_authorize_url = f"{BASE_URL}/api/auth/qr/authorize"
    authorize_body = {"session_id": session_id}
    qr_authorize_resp = requests.post(qr_authorize_url, json=authorize_body, headers=headers_auth, timeout=TIMEOUT)
    assert qr_authorize_resp.status_code == 200, f"QR authorize failed: {qr_authorize_resp.text}"
    qr_authorize_json = qr_authorize_resp.json()
    assert "message" in qr_authorize_json and isinstance(qr_authorize_json["message"], str)

    # Step 4: Poll QR status until it returns is_authorized true (may need short waits)
    qr_status_url = f"{BASE_URL}/api/auth/qr/status/{session_id}"
    max_retries = 5
    last_resp_json = None
    for _ in range(max_retries):
        qr_status_resp = requests.get(qr_status_url, timeout=TIMEOUT)
        if qr_status_resp.status_code == 200:
            last_resp_json = qr_status_resp.json()
            if last_resp_json.get("is_authorized") is True:
                break
        time.sleep(1)
    else:
        # If after retries is_authorized is not true -> fail
        raise AssertionError(f"QR status did not become authorized. Last response: {last_resp_json}")

    # Validate response fields for authorized session
    assert last_resp_json.get("is_authorized") is True
    access_token = last_resp_json.get("access_token")
    user = last_resp_json.get("user")
    assert isinstance(access_token, str) and access_token.strip() != ""
    assert isinstance(user, dict)
    assert "id" in user and "username" in user and "role" in user

    # No resource cleanup needed for QR session (expires automatically)


test_get_api_auth_qr_status_with_authorized_session()