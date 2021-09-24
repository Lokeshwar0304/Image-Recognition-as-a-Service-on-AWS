#! /bin/bash
rm -r ../web_tier/node_modules
scp -i ../keypair/cse546.pem -r ../web_tier ubuntu@ec2-52-87-252-127.compute-1.amazonaws.com:~/
ssh -i ../keypair/cse546.pem ubuntu@ec2-52-87-252-127.compute-1.amazonaws.com 'bash -s' < ./start_web.sh
