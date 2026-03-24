import requests

BASE_URL = "http://localhost:8000"

def test_dynamic_creation():
    # 1. Create a dynamic table "posts"
    table_payload = {
        "name": "posts",
        "description": "Blog posts data",
        "columns": [
            {"name": "title", "data_type": "String", "is_nullable": False},
            {"name": "content", "data_type": "String", "is_nullable": True},
            {"name": "views", "data_type": "Integer", "is_nullable": True}
        ]
    }
    
    print("Creating table...")
    res = requests.post(f"{BASE_URL}/tables/", json=table_payload)
    print("Table Create Response:", res.status_code, res.json())
    
    # 2. Insert record into "posts"
    if res.status_code == 200:
        print("Inserting record...")
        post_data = {
            "title": "First dynamic post!",
            "content": "This table did not exist before this run.",
            "views": 42
        }
        res2 = requests.post(f"{BASE_URL}/api/posts", json=post_data)
        print("Record Insert Response:", res2.status_code, res2.json())
        
        # 3. Get records
        res3 = requests.get(f"{BASE_URL}/api/posts")
        print("Get Records Response:", res3.status_code, res3.json())

if __name__ == "__main__":
    test_dynamic_creation()
