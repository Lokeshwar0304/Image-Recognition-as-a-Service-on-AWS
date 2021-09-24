import os
import boto3
from dotenv import load_dotenv
from ec2_metadata import ec2_metadata

load_dotenv()

session = boto3.Session(
    aws_access_key_id = os.getenv('aws_access_key_id'),
    aws_secret_access_key = os.getenv('aws_secret_access_key')
)

ec2 = session.resource('ec2', region_name=os.getenv('aws_region'))

def terminate_instance():
    instance_ids = [ec2_metadata.instance_id]
    ec2.instances.filter(InstanceIds = instance_ids).terminate()
    


