import os
import boto3
from dotenv import load_dotenv

tmp_dir = "./tmp"

try:
    os.mkdir(tmp_dir)
except:
    pass

load_dotenv()

session = boto3.Session(
    aws_access_key_id=os.getenv("aws_access_key_id"),
    aws_secret_access_key=os.getenv("aws_secret_access_key"),
)

s3 = session.resource("s3", region_name=os.getenv("aws_region"))


def fetch_image(s3_url):
    bucket_name, file_name = s3_url.split("/")[-2:]
    image_path = "./tmp/" + file_name
    s3.Bucket(bucket_name).download_file(file_name, image_path)
    return image_path


def upload_prediction(s3_url, prediction, image_path):
    _, file_name = s3_url.split("/")[-2:]
    predition_file_path = "./tmp/prediction.txt"
    only_file_name = '_'.join(file_name.split("-")[-1].split("_")[0:2])
    prediction_file = open(predition_file_path, "w")
    prediction_file.write("({0} , {1})".format(only_file_name, prediction))
    prediction_file.close()
    s3.Bucket(os.getenv("aws_output_bucket")).upload_fileobj(
        open(predition_file_path, "rb"), file_name
    )
    os.remove(image_path)
    os.remove(predition_file_path)
