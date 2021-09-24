import os
import boto3
from dotenv import load_dotenv

load_dotenv()

session = boto3.Session(
    aws_access_key_id=os.getenv("aws_access_key_id"),
    aws_secret_access_key=os.getenv("aws_secret_access_key"),
)

sqs = session.resource("sqs", region_name=os.getenv("aws_region"))


def get_message():
    queue = sqs.get_queue_by_name(QueueName=os.getenv("aws_request_queue"))
    for message in queue.receive_messages(WaitTimeSeconds=20):
        s3_url = message.body
        return s3_url, message
    return None, None


def send_message(message):
    queue = sqs.get_queue_by_name(QueueName=os.getenv("aws_response_queue"))
    response = queue.send_message(MessageBody=message, DelaySeconds=0)
    return response["ResponseMetadata"]["HTTPStatusCode"]


def delete_message(message):
    message.delete()
