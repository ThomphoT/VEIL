#!/bin/bash
set -e

echo "========================================="
echo "  VEIL - Vultr Deployment Setup"
echo "  AI-Native Financial Governance"
echo "========================================="

# System updates
echo "[1/8] Updating system packages..."
apt update && apt upgrade -y

# Install dependencies
echo "[2/8] Installing system dependencies..."
apt install -y python3.11 python3.11-venv python3-pip nginx certbot python3-certbot-nginx git curl ufw

# Create veil user
echo "[3/8] Creating veil user..."
useradd -m -s /bin/bash -d /opt/veil veil || true

# Setup backend
echo "[4/8] Setting up backend..."
mkdir -p /opt/veil/backend
cp -r backend/* /opt/veil/backend/
python3.11 -m venv /opt/veil/backend/venv
source /opt/veil/backend/venv/bin/activate
pip install -r /opt/veil/backend/requirements.txt
deactivate

# Setup environment
echo "[5/8] Configuring environment..."
if [ ! -f /opt/veil/backend/.env ]; then
    cp /opt/veil/backend/.env.example /opt/veil/backend/.env
    echo "⚠️  Please edit /opt/veil/backend/.env with your API keys"
fi

# Setup UFW
echo "[6/8] Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Setup systemd service
echo "[7/8] Installing systemd service..."
cp deployment/systemd/veil.service /etc/systemd/system/veil.service
systemctl daemon-reload
systemctl enable veil

# Setup NGINX
echo "[8/8] Configuring NGINX..."
cp deployment/nginx/veil.conf /etc/nginx/sites-available/veil
ln -sf /etc/nginx/sites-available/veil /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "========================================="
echo "  ✅ VEIL deployment setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Edit /opt/veil/backend/.env with your API keys"
echo "  2. Run: systemctl start veil"
echo "  3. Run: certbot --nginx -d your-domain.com"
echo "  4. Check status: systemctl status veil"
echo "========================================="
