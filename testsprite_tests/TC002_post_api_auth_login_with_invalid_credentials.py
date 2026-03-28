import requests

def test_post_api_auth_login_with_invalid_credentials():
    base_url = "http://localhost:8000"
    url = f"{base_url}/api/auth/login"
    headers = {"Content-Type": "application/json"}
    payload = {
        "username": "puczaras",
        "password": "wrongpassword"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 401, f"Expected 401 Unauthorized but got {response.status_code}"
    # Optionally check response content for error message if exists:
    try:
        error_content = response.json()
        assert isinstance(error_content, dict)
    except Exception:
        pass

test_post_api_auth_login_with_invalid_credentials()