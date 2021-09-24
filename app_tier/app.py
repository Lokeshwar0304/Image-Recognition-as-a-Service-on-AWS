#! /usr/bin/python3

import os
import time
import sentry_sdk
from dotenv import load_dotenv
import services.s3 as s3
import services.ec2 as ec2
import services.sqs as sqs
import services.image_recognizer as image_recognizer

load_dotenv()

sentry_sdk.init(
    os.getenv("sentry_url"),
    traces_sample_rate=1.0,
)


def process(s3_url, message):
    image_path = s3.fetch_image(s3_url)
    prediction = image_recognizer.predict_image(image_path)
    s3.upload_prediction(s3_url, prediction, image_path)
    message_body = "{}#{}".format(s3_url, prediction)
    sqs.send_message(message_body)
    sqs.delete_message(message)
    start()


def start():
    s3_url, message = sqs.get_message()
    if not s3_url:
        return
    else:
        process(s3_url, message)


start()
ec2.terminate_instance()
