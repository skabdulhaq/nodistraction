import os
import requests
import time
client_id = os.getenv("MICROSOFT_EDGE_STORE_CLIENT_ID")
client_secret = os.getenv("MICROSOFT_EDGE_STORE_SECRET")
product_id = os.getenv("MICROSOFT_EDGE_STORE_PRODUCT_ID")
api_url = "https://api.addons.microsoftedge.microsoft.com"

def login():
    url = "https://login.microsoftonline.com/5c9eedce-81bc-42f3-8823-48ba6258b391/oauth2/v2.0/token"
    payload = {
        "client_id": client_id,
        "scope": "https://api.addons.microsoftedge.microsoft.com/.default",
        "client_secret": client_secret,
        "grant_type": "client_credentials"
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = requests.post(url, data=payload, headers=headers)

    if response.status_code != 200:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None
    access_token = response.json()["access_token"]
    if access_token:
        print("Login successful")
        return access_token 


def get_submission_details(token, operation_id):
    url = f"{api_url}/v1/products/{product_id}/submissions/operations/{operation_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    elif response.status_code == 202:
        return response.json()
    else:
        time.sleep(10)
        print(f"Get submission details failed: {response.status_code} - {response.text}")
        return None 



with open("./data/admin_operation", "w") as file:
    admin_review_operation_id = file.read()

login_token = login()
get_submission_details(login_token, admin_review_operation_id)

 