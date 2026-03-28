import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_post_api_auth_qr_session_creation():
    url = f"{BASE_URL}/api/auth/qr/session"
    try:
        response = requests.post(url, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    assert response.status_code == 200, f"Expected status 200, got {response.status_code}"
    try:
        data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    assert "session_id" in data, "Response JSON missing 'session_id'"
    assert isinstance(data["session_id"], str) and data["session_id"], "'session_id' must be a non-empty string"

    assert "expires_at" in data, "Response JSON missing 'expires_at'"
    assert isinstance(data["expires_at"], str) and data["expires_at"], "'expires_at' must be a non-empty string"

test_post_api_auth_qr_session_creation()