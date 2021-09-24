import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from os import walk
from bs4 import BeautifulSoup

path = "./imagenet-100/"
_, _, filenames = next(walk(path))

images = [path + f for f in filenames][:40]


def upload(image):
    url = "http://ec2-52-3-243-165.compute-1.amazonaws.com/"
    multipart_form_data = {"file": (image, open(image, "rb"))}
    req = requests.post(url, files=multipart_form_data)
    source = BeautifulSoup(req.content, "html.parser")
    return image + " : " + source.select_one("h1").get_text().strip()


processes = []
with ThreadPoolExecutor(max_workers=200) as executor:
    for image in images:
        processes.append(executor.submit(upload, image))

for task in as_completed(processes):
    req = task.result()
    print(req)
