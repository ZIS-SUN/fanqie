#!/bin/bash

echo "🧪 番茄待办 - 完整自动化测试"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 测试函数
test_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

test_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

test_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

echo "1️⃣ 检查环境..."
echo "--------------------------------"

# 检查Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    test_pass "Node.js 已安装: $NODE_VERSION"
else
    test_fail "Node.js 未安装"
    exit 1
fi

# 检查npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    test_pass "npm 已安装: $NPM_VERSION"
else
    test_fail "npm 未安装"
    exit 1
fi

# 检查MySQL命令
if command -v mysql &> /dev/null; then
    test_pass "MySQL 命令行工具已安装"
else
    test_warn "MySQL 命令行工具未找到（可能已安装但不在PATH中）"
fi

echo ""
echo "2️⃣ 检查MySQL服务..."
echo "--------------------------------"

# 尝试连接MySQL
if mysql -u root -p1234 -e "SELECT 1" &> /dev/null; then
    test_pass "MySQL 服务运行正常（root/1234可以连接）"
    
    # 检查数据库
    if mysql -u root -p1234 -e "USE pomodoro_db; SELECT 1" &> /dev/null; then
        test_pass "数据库 pomodoro_db 存在"
    else
        test_warn "数据库 pomodoro_db 不存在（需要初始化）"
    fi
else
    test_fail "无法连接到MySQL（root/1234）"
    echo ""
    echo "🔍 诊断信息："
    echo "   请检查："
    echo "   1. MySQL服务是否正在运行？"
    echo "      macOS: brew services list | grep mysql"
    echo "      或: sudo /usr/local/mysql/support-files/mysql.server status"
    echo ""
    echo "   2. 密码是否正确？"
    echo "      当前配置: root/1234"
    echo ""
    echo "   3. 尝试启动MySQL："
    echo "      macOS: brew services start mysql"
    echo "      或: sudo /usr/local/mysql/support-files/mysql.server start"
    echo ""
    
    # 检查MySQL进程
    if ps aux | grep -v grep | grep mysql &> /dev/null; then
        test_warn "检测到MySQL进程正在运行，但无法连接"
        echo "      可能的原因："
        echo "      - 密码不正确"
        echo "      - MySQL只监听了IPv6（::1）而不是IPv4（127.0.0.1）"
        echo "      - 需要配置skip-networking=OFF"
    else
        test_fail "MySQL进程未运行"
        echo "      请启动MySQL服务"
    fi
fi

echo ""
echo "3️⃣ 检查项目文件..."
echo "--------------------------------"

# 检查关键文件
files=(
    "package.json"
    "src/database/config.js"
    "src/database/queries.js"
    "src/database/init-db.js"
    "src/main/main.js"
    "src/App.js"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        test_pass "文件存在: $file"
    else
        test_fail "文件缺失: $file"
    fi
done

echo ""
echo "4️⃣ 检查依赖..."
echo "--------------------------------"

if [ -d "node_modules" ]; then
    test_pass "node_modules 目录存在"
    
    # 检查关键依赖
    if [ -d "node_modules/mysql2" ]; then
        test_pass "mysql2 依赖已安装"
    else
        test_fail "mysql2 依赖未安装"
    fi
    
    if [ -d "node_modules/electron" ]; then
        test_pass "electron 依赖已安装"
    else
        test_fail "electron 依赖未安装"
    fi
    
    if [ -d "node_modules/react" ]; then
        test_pass "react 依赖已安装"
    else
        test_fail "react 依赖未安装"
    fi
else
    test_fail "node_modules 目录不存在（需要运行 npm install）"
fi

echo ""
echo "================================"
echo "测试结果："
echo "  总计: $TOTAL_TESTS"
echo -e "  ${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "  ${RED}失败: $FAILED_TESTS${NC}"
echo "================================"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 所有检查通过！${NC}"
    echo ""
    echo "下一步："
    echo "1. 如果数据库未初始化，运行: npm run db:init"
    echo "2. 启动应用: npm start"
    exit 0
else
    echo -e "\n${RED}⚠️  发现 $FAILED_TESTS 个问题，请先解决这些问题${NC}"
    exit 1
fi

