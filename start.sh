#!/bin/bash

echo "🍅 番茄待办提醒 - 启动脚本"
echo "================================"
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到Node.js，请先安装Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js版本: $(node --version)"

# 检查MySQL是否运行
if ! command -v mysql &> /dev/null; then
    echo "⚠️  未检测到MySQL命令，请确保MySQL已安装"
else
    echo "✓ MySQL已安装"
    
    # 尝试连接MySQL
    if mysql -u root -p1234 -e "SELECT 1" &> /dev/null; then
        echo "✓ MySQL连接成功"
    else
        echo "⚠️  无法连接到MySQL，请检查："
        echo "   - MySQL服务是否启动"
        echo "   - 用户名密码是否正确（默认：root/1234）"
        echo ""
        read -p "是否继续启动应用？(y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

echo ""
echo "================================"
echo ""

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✓ 依赖安装完成"
    echo ""
    
    # 初始化数据库
    echo "📊 正在初始化数据库..."
    npm run db:init
    if [ $? -ne 0 ]; then
        echo "⚠️  数据库初始化失败，请手动运行: npm run db:init"
    else
        echo "✓ 数据库初始化完成"
    fi
    echo ""
fi

echo "🚀 正在启动应用..."
echo "请稍候，首次启动可能需要较长时间..."
echo ""

npm start

