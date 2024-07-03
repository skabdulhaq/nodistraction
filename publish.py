import os
import requests
from dotenv import load_dotenv
import logging
from datetime import datetime
import zipfile
import time

now = datetime.now()
formatted_now = now.strftime("%A-%B-%d-%Y-%I-%M-%S-%p")

if not os.path.exists('logs'):
    os.makedirs('logs')

if not os.path.exists('releases'):
    os.makedirs('releases')

logging.basicConfig(
    filename=f'logs/{formatted_now}.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

load_dotenv()

client_id = os.getenv("MICROSOFT_EDGE_STORE_CLIENT_ID")
client_secret = os.getenv("MICROSOFT_EDGE_STORE_SECRET")
product_id = os.getenv("MICROSOFT_EDGE_STORE_PRODUCT_ID")

api_url = "https://api.addons.microsoftedge.microsoft.com"
src_folder = f"./releases/nodistractions-{formatted_now}.zip"

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
        logging.error(f"Login failed: {response.status_code} - {response.text}")
        return None
    access_token = response.json()["access_token"]
    if access_token:
        logging.info("Login successful")
        return access_token 

def zip_folder(folder_path, output_path):
    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(folder_path):
            for file in files:
                file_path = os.path.join(root, file)
                arcname = os.path.relpath(file_path, folder_path)
                zipf.write(file_path, arcname)


def get_review_status(token, operation_id):
    if not token:
        return False
    url = f"{api_url}/v1/products/{product_id}/submissions/draft/package/operations/{operation_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 202:
        return response.json()
    elif response.status_code == 200:
        return response.json()
    elif response.status_code == 429:
        print(f"Get review status failed: {response.status_code} - {response.text}")
        time.sleep(10)
        return None
    else:
        print(f"Get review status failed: {response.status_code} - {response.text}")
        logging.error(f"Get review status failed: {response.status_code} - {response.text}")
        return None

def upload_file(token, file_name):
    url = f"{api_url}/v1/products/{product_id}/submissions/draft/package"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/zip"
    }
    with open(file_name, 'rb') as file:
        response = requests.post(url, headers=headers, data=file)
    if response.status_code == 202:
        logging.info("File upload initiated")
        return response.headers["Location"]
    else:
        logging.error(f"File upload failed: {response.status_code} - {response.text}")
        return None

def send_submission(token):
    url = f"{api_url}/v1/products/{product_id}/submissions"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    payload = {
        "notes": ""
    }
    response = requests.post(url, headers=headers, json=payload)
    if response.status_code == 202:
        logging.info("Submission sent")
        return response.headers["Location"]
    else:
        logging.error(f"Submission failed: {response.status_code} - {response.text}")
        return None

def get_submission_details(token, operation_id):
    url = f"{api_url}/v1/products/{product_id}/submissions/operations/{operation_id}"
    headers = {
        "Authorization": f"Bearer {token}"
    }
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        time.sleep(10)
        print(f"Get submission details failed: {response.status_code} - {response.text}")
        return None 

zip_folder("./dist", src_folder)
login_token = login()
if login_token:
    logging.info("Login successful")
else:
    logging.error("Login failed")
    exit(-1)
operation_id = upload_file(login_token, src_folder)
if operation_id is None:
    logging.error("File upload failed")
    exit(-1)

# file_upload_status = get_review_status(login_token, operation_id)

# while file_upload_status["message"] is None:
#     file_upload_status = get_review_status(login_token, operation_id)
#     print(file_upload_status)
#     # if file_upload_status["message"]:
#     #     print(file_upload_status["message"])

# if "errors" in list(file_upload_status.keys()) or "errorCode" in list(file_upload_status.keys()):
#     if file_upload_status['errors'] or file_upload_status['errorCode']:
#         logging.error(f"{file_upload_status['status']}::{file_upload_status['errors']}{file_upload_status['errorCode']}\n{file_upload_status['message']}")
#         exit(-1)
#     logging.info(f"{file_upload_status['id']}::{file_upload_status['status']}\n{file_upload_status['message']}")
# admin_review_operation_id = send_submission(login_token)
# if admin_review_operation_id is None:
#     logging.error("Submission failed")
#     exit(-1)

# logging.info("Admin review operation id: ", admin_review_operation_id)
# current_submission_details = get_submission_details(login_token, admin_review_operation_id)
# if current_submission_details["errorCode"] or current_submission_details["errors"]:
#     logging.error(f"{current_submission_details['status']}::{current_submission_details['errors']}::{current_submission_details['errorCode']}\n{current_submission_details['message']}")
file_upload_status = get_review_status(login_token, operation_id)

while file_upload_status["message"] is None:
    file_upload_status = get_review_status(login_token, operation_id)
    print(f"Uploading {file_upload_status}...")
    time.sleep(2)

if file_upload_status['errors'] or file_upload_status['errorCode']:
    print(f"{file_upload_status['status']}::{file_upload_status['errors']}{file_upload_status['errorCode']}\n{file_upload_status['message']}")
    exit(-1)

print(f"{file_upload_status['id']}::{file_upload_status['status']}\n{file_upload_status['message']}")
print(f"{file_upload_status['status']}\n{file_upload_status['message']}")
admin_review_operation_id = send_submission(login_token)

if admin_review_operation_id is None:
    exit(-1)

print("Admin review operation id: ", admin_review_operation_id)
current_submission_details = get_submission_details(login_token, admin_review_operation_id)
while current_submission_details is None:
    print(current_submission_details)
    # if current_submission_details["errorCode"] or current_submission_details["errors"]:
    #     print(f"{current_submission_details['status']}::{current_submission_details['errors']}::{current_submission_details['errorCode']}\n{current_submission_details['message']}")
