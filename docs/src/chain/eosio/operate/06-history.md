# History-Tools

## 编译运行

### 安装基础环境

```sh
apt update && apt install -y wget gnupg

cd ~
wget -O - https://apt.llvm.org/llvm-snapshot.gpg.key | apt-key add -

apt update && apt install -y \
    autoconf2.13        \
    build-essential     \
    bzip2               \
    cargo               \
    clang-8             \
    git                 \
    libgmp-dev          \
    libpq-dev           \
    lld-8               \
    lldb-8              \
    ninja-build         \
    nodejs              \
    npm                 \
    pkg-config          \
    postgresql-server-dev-all \
    python2.7-dev       \
    python3-dev         \
    rustc               \
    zlib1g-dev

update-alternatives --install /usr/bin/clang clang /usr/bin/clang-8 100
update-alternatives --install /usr/bin/clang++ clang++ /usr/bin/clang++-8 100
```

### 安装并构建Boost 1.70

```sh
cd ~
wget https://dl.bintray.com/boostorg/release/1.70.0/source/boost_1_70_0.tar.gz
tar xf boost_1_70_0.tar.gz
cd boost_1_70_0
./bootstrap.sh
./b2 toolset=clang -j10 install
```

### 安装并构建CMake 3.14.5

```sh
cd ~
wget https://github.com/Kitware/CMake/releases/download/v3.14.5/cmake-3.14.5.tar.gz
tar xf cmake-3.14.5.tar.gz
cd cmake-3.14.5
./bootstrap --parallel=10
make -j10
make -j10 install
```

### 构建History Tools

```sh
cd ~
git clone --recursive https://github.com/EOSIO/history-tools.git
cd history-tools
mkdir build
cd build
cmake -GNinja -DCMAKE_CXX_COMPILER=clang++-8 -DCMAKE_C_COMPILER=clang-8 ..
bash -c "cd ../src && npm install node-fetch"
ninja

# 构建完成，目录
taketo@ubuntu:~/history-tools$ tree build -L 1
build
├── build.ninja
├── CMakeCache.txt
├── CMakeFiles
├── cmake_install.cmake
├── compile_commands.json
├── CPackConfig.cmake
├── CPackSourceConfig.cmake
├── CTestTestfile.cmake
├── _deps
├── fill-pg
├── rules.ninja
└── unittests
```

### 搭建PostgreSQL

```tex
version: "3.8"

services:
  postgresql:
    image: postgres:12-alpine
    container_name: postgresql
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: user
      POSTGRES_PASSWORD: 1q2w3e!Q@W#E
    ports:
      - 5432:5432
    volumes:
      - ./data:/var/lib/postgresql/data
```

### 启动 EOSIO 节点

**节点配置说明**

| Option                                 | When to use                |
| -------------------------------------- | -------------------------- |
| `--plugin eosio::state_history_plugin` | 必选                       |
| `--state-history-endpoint`             | 可选，默认`127.0.0.1:8080` |
| `--trace-history`                      | 允许收集事务和操作跟踪     |
| `--chain-state-history`                | 启用收集状态表             |

**配置修改**

```sh
# 默认config.ini位置
vi .local/share/eosio/nodeos/config/config.ini

# 新增以下配置
plugin = eosio::state_history_plugin
state-history-endpoint = 0.0.0.0:8080
trace-history = true
chain-state-history = true
```

启动

```sh
nodeos -e -p eosio \
--plugin eosio::producer_plugin \
--plugin eosio::producer_api_plugin \
--plugin eosio::chain_api_plugin \
--plugin eosio::http_plugin \
--filter-on="*" \
--access-control-allow-origin='*' \
--contracts-console \
--http-validate-host=false \
--verbose-http-errors \
--disable-replay-opts \
--http-server-address=127.0.0.1:8888 > nodeos.log 2>&1 &
```

### 启动History Tools

#### fill-pg介绍

`fill-pg`用来自 `NodeOS` 的`State History Plugin`中的数据填充 `PostgreSQL`。它提供了几乎所有监控链的应用程序需要的数据。它提供以下内容：

- 来自每个块的标头信息
- 事务和操作跟踪，包括内联操作和延迟事务
- 区块级别的合约表历史记录
- 跟踪链状态历史记录的表，包括
  - 帐户，包括权限和链接身份验证
  - 帐户资源限制和使用情况
  - 合约代码
  - 合约 ABI
  - 共识参数
  - 激活共识升级

#### 配置pg连接

```sh
export PGUSER=       // PostgreSQL用户名
export PGPASSWORD=   // PostgreSQL密码
export PGDATABASE=   // PostgreSQL数据库名
export PGHOST=       // PostgreSQL访问host
export PGPORT=       // PostgreSQL端口
```

#### 启动fill-pg

```sh
./fill-pg --fill-connect-to 127.0.0.1:8080 --fpg-create
```

#### 日志

```sh
info  2023-08-02T07:28:30.076 fill-pg   fill_pg_plugin.cpp:157        fpg_session          ] connect to postgresql
info  2023-08-02T07:28:30.078 fill-pg   state_history_connecti:62     connect              ] connect to 192.168.10.145:8080
info  2023-08-02T07:28:30.080 fill-pg   fill_pg_plugin.cpp:225        create_tables        ] create schema "chain"
info  2023-08-02T07:28:30.150 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 1
info  2023-08-02T07:28:30.403 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 2
info  2023-08-02T07:28:30.901 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 3
info  2023-08-02T07:28:31.401 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 4
info  2023-08-02T07:28:31.901 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 5
info  2023-08-02T07:28:32.401 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 6
info  2023-08-02T07:28:32.901 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 7
info  2023-08-02T07:28:33.401 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 8
info  2023-08-02T07:28:33.901 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 9
info  2023-08-02T07:28:34.401 fill-pg   fill_pg_plugin.cpp:467        process_blocks_resul ] block 10
```



## 容器运行

### 启动EOS

```sh
nodeos -e -p eosio \
--plugin eosio::producer_plugin \
--plugin eosio::producer_api_plugin \
--plugin eosio::chain_api_plugin \
--plugin eosio::http_plugin \
--plugin eosio::state_history_plugin \
--trace-history \
--chain-state-history \
--state-history-endpoint=0.0.0.0:8080 \
--filter-on="*" \
--access-control-allow-origin='*' \
--contracts-console \
--http-validate-host=false \
--verbose-http-errors \
--disable-replay-opts \
--http-server-address=127.0.0.1:8888 > nodeos.log 2>&1 &
```

### 启动history-tools

```sh
version: "3"

services:
  postgresql:
    image: postgres:12-alpine
    container_name: postgresql
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: user
      POSTGRES_PASSWORD: 1q2w3e!Q@W#E
    ports:
      - 5432:5432
    volumes:
      - ./pgsql/data:/var/lib/postgresql/data

  fill-pg:
    image: eosio/history-tools:latest
    container_name: fill-pg
    command: fill-pg --fpg-create --fill-connect-to=${NODEOS_IP}:8080
    environment:
      - PGUSER=user
      - PGPASSWORD=1q2w3e!Q@W#E
      - PGHOST=postgresql
      - PGPORT=5432
      - PGDATABASE=postgres
    restart: on-failure
    depends_on:
      - postgresql
```
