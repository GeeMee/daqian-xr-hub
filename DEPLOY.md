# 部署指南

## 服务器信息

- IP: 8.153.73.225
- 系统: Ubuntu 22.04
- SSH: `ssh root@8.153.73.225`

## 访问地址

- 管理后台: http://8.153.73.225/
- API: http://8.153.73.225/api/health

## 更新 Admin 前端

```powershell
# 本地构建
cd admin
npm run build

# 上传到服务器
scp -r dist root@8.153.73.225:/opt/daqian-xr-hub/admin-dist
```

上传后如果文件嵌套在 `admin-dist/dist/` 下，SSH 到服务器执行：

```bash
cp -r /opt/daqian-xr-hub/admin-dist/dist/* /opt/daqian-xr-hub/admin-dist/ && rm -rf /opt/daqian-xr-hub/admin-dist/dist
```

## 更新 Server 后端

```bash
ssh root@8.153.73.225
cd /opt/daqian-xr-hub && git pull && cd server && npm install && pm2 restart daqian-xr
```

如有数据库变更：

```bash
cd /opt/daqian-xr-hub/server
npx prisma db push
```

## 常用运维命令

```bash
# 查看服务状态
pm2 list
pm2 logs daqian-xr

# 重启服务
pm2 restart daqian-xr

# 查看 Nginx 配置
cat /etc/nginx/sites-available/daqian-xr

# 修改 Nginx 配置后重载
nginx -t && systemctl reload nginx
```

## 目录结构（服务器）

```
/opt/daqian-xr-hub/
├── server/          # API 代码（git sparse checkout）
└── admin-dist/      # 前端构建产物（scp 上传）
```
