import requests
import time

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

MASTER_USERNAME = "puczaras"
MASTER_PASSWORD = "Zup Paras"

def test_post_api_auth_qr_authorize_with_valid_session():
    # Step 1: Login as master to get Bearer token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "username": MASTER_USERNAME,
        "password": MASTER_PASSWORD
    }
    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        login_resp.raise_for_status()
    except Exception as e:
        assert False, f"Master login failed: {e}"
    login_data = login_resp.json()
    assert "access_token" in login_data and "token_type" in login_data and "user" in login_data
    token = login_data["access_token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    # Step 2: Create a new QR session (no auth)
    qr_session_url = f"{BASE_URL}/api/auth/qr/session"
    try:
        session_resp = requests.post(qr_session_url, timeout=TIMEOUT)
        session_resp.raise_for_status()
    except Exception as e:
        assert False, f"QR session creation failed: {e}"
    session_data = session_resp.json()
    assert "session_id" in session_data and "expires_at" in session_data
    session_id = session_data["session_id"]

    # Step 3: POST /api/auth/qr/authorize with valid session_id and Bearer token (master token)
    qr_authorize_url = f"{BASE_URL}/api/auth/qr/authorize"
    authorize_payload = {"session_id": session_id}
    try:
        authz_resp = requests.post(qr_authorize_url, json=authorize_payload, headers=auth_header, timeout=TIMEOUT)
    except Exception as e:
        assert False, f"QR authorize request failed: {e}"

    # Validate response
    assert authz_resp.status_code == 200, f"Expected 200 but got {authz_resp.status_code}"
    resp_json = authz_resp.json()
    assert "message" in resp_json and isinstance(resp_json["message"], str)

test_post_api_auth_qr_authorize_with_valid_session()