import os
import subprocess
from azure.storage.blob import BlobServiceClient
import argparse

if __name__ == "__main__": 
    parser = argparse.ArgumentParser(description='Upload the value specified to a storage account')
    parser.add_argument('-s', '--storageName', help='Storage Account name', required=True)
    parser.add_argument('-c', '--containername', help='Storage container name', required=True)
    parser.add_argument('-f', '--fileDirName', help='File Directory Name', required=True)
    parser.add_argument('-cs', '--connstr', help='Storage Account Connection String', required=True)
    

    args = parser.parse_args()
    try:
        blob_storage_url = f"https://{args.storageName}.blob.core.windows.net"
    except Exception as ex:
        print('Exception get User:')
        print(ex)
    try:
        blob_service_client = BlobServiceClient.from_connection_string(args.connstr)
        container_name = args.containername
        source_folder = args.fileDirName

        for filename in os.listdir(source_folder):
            blob_client = blob_service_client.get_blob_client(container_name, filename)

            with open(os.path.join(source_folder, filename), "rb") as data:
                blob_client.upload_blob(data, overwrite=True)

    except Exception as ex:
        print('Exception:')
        print(ex)