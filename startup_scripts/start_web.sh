#! /bin/bash
### uncomment the below commented lines for the first time
### web-tier setup
# curl -fsSL https://deb.nodesource.com/setup_15.x | sudo -E bash -
# sudo apt-get install -y nodejs
# sudo npm install -g agentkeepalive
# sudo npm install -g npm@7.6.0
# sudo npm install -g pm2 
sudo pm2 kill
sudo pm2 unstartup systemd
cd web_tier
sudo rm -r node_modules
sudo npm install
sudo pm2 start ./bin/www
sudo pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
sudo pm2 save