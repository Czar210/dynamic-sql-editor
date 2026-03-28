import requests

def test_post_api_auth_login_with_valid_credentials():
    base_url = "http://localhost:8000"
    url = f"{base_url}/api/auth/login"
    payload = {
        "username": "puczaras",
        "password": "Zup Paras"
    }
    headers = {
        "Content-Type": "application/json"
    }
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        assert False, f"Request failed: {e}"

    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    data = response.json()

    # Validate presence and type of access_token and token_type
    assert "access_token" in data and isinstance(data["access_token"], str), "Missing or invalid access_token"
    assert "token_type" in data and isinstance(data["token_type"], str), "Missing or invalid token_type"

    # Validate user object
    assert "user" in data and isinstance(data["user"], dict), "Missing or invalid user object"
    user = data["user"]
    assert "id" in user and isinstance(user["id"], int), "User id is missing or not an integer"
    assert "username" in user and user["username"] == "puczaras", f"User username mismatch or missing"
    assert "role" in user and isinstance(user["role"], str), "User role is missing or not a string"

test_post_api_auth_login_with_valid_credentials()