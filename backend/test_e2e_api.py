import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(path, method="GET", data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = json.loads(resp.read().decode("utf-8"))
            return status, content
    except urllib.error.HTTPError as e:
        try:
            content = json.loads(e.read().decode("utf-8"))
        except Exception:
            content = str(e)
        return e.code, content
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("=== Testing FastAPI Friends Manager Backend ===")
    
    # 1. Test Login with seeded user
    print("\n1. Testing Login API with valid credentials ('ananya' / '123456')...")
    status, res = make_request("/login", method="POST", data={"username": "ananya", "password": "123456"})
    print(f"Status: {status}, Response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("success") is True, "Login success expected"
    print("[OK] Valid login passed")

    # 2. Test Login with invalid credentials
    print("\n2. Testing Login API with invalid credentials...")
    status, res = make_request("/login", method="POST", data={"username": "ananya", "password": "wrongpassword"})
    print(f"Status: {status}, Response: {res}")
    assert status == 401, f"Expected 401, got {status}"
    print("[OK] Invalid login rejection passed")

    # 3. Test Get Friends
    print("\n3. Testing GET /api/friends...")
    status, friends = make_request("/friends", method="GET")
    print(f"Status: {status}, Found {len(friends)} friends")
    assert status == 200, f"Expected 200, got {status}"
    assert isinstance(friends, list), "Expected list of friends"
    print(f"[OK] Retrieved friends list. Sample: {friends[0]['name'] if friends else 'None'}")

    # 4. Test Create Friend (Empty validation)
    print("\n4. Testing POST /api/friends with empty name (validation check)...")
    status, res = make_request("/friends", method="POST", data={"name": "", "email": "test@example.com"})
    print(f"Status: {status}, Response: {res}")
    assert status == 400, f"Expected 400 validation error, got {status}"
    print("[OK] Validation check passed for empty name")

    # 5. Test Create Friend (Valid)
    print("\n5. Testing POST /api/friends with valid friend data...")
    new_friend_payload = {
        "name": "Dr. Maya Lin",
        "email": "maya.lin@example.com",
        "phone": "+1 (555) 789-0123",
        "role": "Senior AI Scientist",
        "bio": "Leading research scientist working on quantum computing and astrophysics.",
        "hobbies": "Astronomy, Quantum Computing, Hiking",
        "image_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "date_joined": "2026-04-18"
    }
    status, res = make_request("/friends", method="POST", data=new_friend_payload)
    print(f"Status: {status}, Response: {res}")
    assert status == 201 or status == 200, f"Expected 201/200, got {status}"
    created_friend = res.get("friend")
    created_id = created_friend["id"]
    print(f"[OK] Friend created successfully with ID {created_id}")

    # 6. Test GET Friend by ID
    print(f"\n6. Testing GET /api/friends/{created_id}...")
    status, res = make_request(f"/friends/{created_id}", method="GET")
    print(f"Status: {status}, Friend name: {res.get('name')}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("name") == "Dr. Maya Lin", "Name match expected"
    print("[OK] Retrieved specific friend details successfully")

    # 7. Test PUT Friend (Update)
    print(f"\n7. Testing PUT /api/friends/{created_id} (Update friend)...")
    status, res = make_request(f"/friends/{created_id}", method="PUT", data={
        "role": "Principal AI Architect",
        "bio": "Updated biography: Leading research scientist and keynote speaker."
    })
    print(f"Status: {status}, Updated role: {res.get('friend', {}).get('role')}")
    assert status == 200, f"Expected 200, got {status}"
    assert res.get("friend", {}).get("role") == "Principal AI Architect", "Role match expected"
    print("[OK] Friend updated successfully")

    # 8. Test DELETE Friend
    print(f"\n8. Testing DELETE /api/friends/{created_id}...")
    status, res = make_request(f"/friends/{created_id}", method="DELETE")
    print(f"Status: {status}, Response: {res}")
    assert status == 200, f"Expected 200, got {status}"
    print("[OK] Friend deleted successfully")

    print("\n==========================================")
    print("ALL END-TO-END API TESTS PASSED 100%!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
