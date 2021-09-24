#! /bin/bash
ssh -i ../keypair/cse546.pem ubuntu@$1 'rm -r ~/app_tier'
rm -r ../app_tier/services/__pycache__
scp -i ../keypair/cse546.pem -r ../app_tier  ubuntu@$1:~/
ssh -i ../keypair/cse546.pem ubuntu@$1 'pip3 install -r ~/app_tier/requirements.txt'
ssh -i ../keypair/cse546.pem ubuntu@$1 'chmod 777 ~/app_tier/app.py'
ssh -i ../keypair/cse546.pem ubuntu@$1 'echo "@reboot /home/ubuntu/app_tier/app.py" | crontab'