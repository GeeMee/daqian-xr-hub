#!/bin/bash
# 大千迷境 XR Server - ECS 一键部署脚本
# 系统要求：Ubuntu 22.04
# 运行方式：sudo bash deploy.sh

set -e

echo "===== 1. 系统更新 ====="
apt update && apt upgrade -y

echo "===== 2. 安装 Node.js 20 ====="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v && npm -v

echo "===== 3. 安装 MySQL 8 ====="
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

echo "===== 4. 创建数据库和用户 ====="
mysql -e "CREATE DATABASE IF NOT EXISTS daqian_xr DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'daqian'@'localhost' IDENTIFIED BY 'DaqianXR2024!';"
mysql -e "GRANT ALL PRIVILEGES ON daqian_xr.* TO 'daqian'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "===== 5. 安装 Nginx ====="
apt install -y nginx
systemctl start nginx
systemctl enable nginx

echo "===== 6. 安装 PM2 ====="
npm install -g pm2

echo "===== 7. 创建项目目录 ====="
mkdir -p /opt/daqian-xr-server
chown -R $SUDO_USER:$SUDO_USER /opt/daqian-xr-server

echo "===== 8. 配置 Nginx 反向代理 ====="
cat > /etc/nginx/sites-available/daqian-xr << 'EOF'
server {
    listen 80;
    server_name 8.153.73.225;

    client_max_body_size 200M;

    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 300s;
    }

    location / {
        root /opt/daqian-xr-server/admin-dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
EOF

ln -sf /etc/nginx/sites-available/daqian-xr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "===== 部署环境准备完成 ====="
echo ""
echo "接下来手动操作："
echo "1. 将 server 代码上传到 /opt/daqian-xr-server/"
echo "2. cd /opt/daqian-xr-server && npm install"
echo "3. cp .env.production .env"
echo "4. npx prisma db push"
echo "5. npx tsx src/seed.ts"
echo "6. pm2 start dist/index.js --name daqian-xr"
echo ""
echo "或者用开发模式："
echo "6. pm2 start 'npx tsx src/index.ts' --name daqian-xr"
