#!/usr/bin/env bash
set -euo pipefail

sudo apt update
sudo apt install -y python3.11 python3.11-venv python3-pip nginx ufw certbot python3-certbot-nginx git

sudo ufw allow OpenSSH
sudo ufw allow "Nginx Full"
sudo ufw --force enable

sudo useradd --system --create-home --shell /usr/sbin/nologin veil || true
sudo mkdir -p /opt/veil
sudo chown -R "$USER":"$USER" /opt/veil

echo "Copy the repository into /opt/veil, then run:"
echo "cd /opt/veil/apps/veil-backend && python3.11 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
echo "sudo cp /opt/veil/deploy/vultr/veil-api.service /etc/systemd/system/veil-api.service"
echo "sudo systemctl daemon-reload && sudo systemctl enable --now veil-api"
echo "sudo cp /opt/veil/deploy/vultr/nginx.conf /etc/nginx/sites-available/veil-api"
echo "sudo ln -s /etc/nginx/sites-available/veil-api /etc/nginx/sites-enabled/veil-api"
echo "sudo nginx -t && sudo systemctl reload nginx"
echo "sudo certbot --nginx -d your-domain.com"
