#!/bin/bash
# 大千迷境 XR Server - ECS 一键部署脚本
# 系统：Ubuntu 22.04 | IP: 8.153.73.225
# 运行：sudo bash deploy.sh

set -e

echo "===== 1. 系统更新 ====="
apt update && apt upgrade -y

echo "===== 2. 安装 Node.js 20 ====="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git
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

echo "===== 7. 克隆代码（只拉 server 目录） ====="
cd /opt
git clone --depth 1 --filter=blob:none --sparse https://github.com/GeeMee/daqian-xr-hub.git
cd daqian-xr-hub
git sparse-checkout set server
cd server

echo "===== 8. 安装依赖 ====="
npm install

echo "===== 9. 配置环境变量 ====="
echo "请手动编辑 .env 文件填入密钥："
cp .env.example .env
echo "  nano /opt/daqian-xr-hub/server/.env"
echo "  填入 DATABASE_URL, ALIYUN_OSS_ACCESS_KEY_ID, ALIYUN_OSS_ACCESS_KEY_SECRET"
echo ""
read -p "编辑完成后按 Enter 继续..."

echo "===== 10. 初始化数据库 ====="
npx prisma db push
npx tsx src/seed.ts

echo "===== 11. 启动服务 ====="
pm2 start "npx tsx src/index.ts" --name daqian-xr
pm2 save
pm2 startup

echo "===== 12. 配置 Nginx ====="
cat > /etc/nginx/sites-available/daqian-xr << 'NGINX'
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
        root /opt/daqian-xr-hub/admin-dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/daqian-xr /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "===== 部署完成！ ====="
echo "API 地址：http://8.153.73.225/api/health"
echo ""
echo "后续更新代码："
echo "  cd /opt/daqian-xr-hub && git pull && cd server && npm install && pm2 restart daqian-xr"
