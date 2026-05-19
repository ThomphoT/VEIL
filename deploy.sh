#!/bin/bash
set -e

echo "🚀 Deploying VEIL backend to Vultr..."

VULTR_HOST=${1:-"your-vultr-ip"}
VULTR_USER=${2:-"root"}
SSH_KEY=${3:-"~/.ssh/id_rsa"}

if [ "$VULTR_HOST" = "your-vultr-ip" ]; then
    echo "⚠️  Usage: ./deploy.sh <vultr-ip> [user] [ssh-key]"
    echo "   Example: ./deploy.sh 123.123.123.123 root ~/.ssh/mykey"
    exit 1
fi

echo "→ Syncing backend code to $VULTR_HOST..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    --exclude='__pycache__' \
    --exclude='venv' \
    --exclude='.env' \
    --exclude='node_modules' \
    --exclude='.git' \
    ./backend/ \
    "$VULTR_USER@$VULTR_HOST:/opt/veil/backend/"

echo "→ Syncing deployment configs..."
rsync -avz --delete \
    -e "ssh -i $SSH_KEY" \
    ./deployment/ \
    "$VULTR_USER@$VULTR_HOST:/opt/veil/deployment/"

echo "→ Restarting VEIL service..."
ssh -i "$SSH_KEY" "$VULTR_USER@$VULTR_HOST" << 'EOF'
    source /opt/veil/backend/venv/bin/activate
    pip install -r /opt/veil/backend/requirements.txt --quiet
    deactivate

    sudo cp /opt/veil/deployment/systemd/veil.service /etc/systemd/system/veil.service
    sudo systemctl daemon-reload
    sudo systemctl restart veil

    sudo cp /opt/veil/deployment/nginx/veil.conf /etc/nginx/sites-available/veil
    sudo nginx -t && sudo systemctl reload nginx

    echo "✅ VEIL service status:"
    sudo systemctl status veil --no-pager | head -5
EOF

echo ""
echo "✅ Deployment complete!"
echo "→ API running at: http://$VULTR_HOST"
echo "→ Health check: http://$VULTR_HOST/health"
