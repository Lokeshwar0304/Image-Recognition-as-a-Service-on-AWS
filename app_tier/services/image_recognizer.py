import os
import subprocess
from dotenv import load_dotenv

load_dotenv()


def predict_image(image_path):
    actual_image_path = "." + image_path
    command = "cd {}; python3 image_classification.py {}".format(
        os.getenv("classifier_path"), actual_image_path
    )
    return subprocess.check_output(command, shell=True).decode().strip()
