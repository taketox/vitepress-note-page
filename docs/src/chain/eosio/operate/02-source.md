# 源码编译

## 源码编译

### 1. 拉取依赖

```sh
 git clone https://github.com/eosio/eos --recursive
```

> 如果忘记添加--recursive
>
> 可以进入eos目录执行以下命令

```sh
git submodule update --init --recursive
```

### 2. 执行编译脚本

```sh
# 进入目录
cd eos/script/

# 执行脚本,全选y
bash eosio_build.sh

# 检查依赖
[Ensuring package dependencies]
 - git ok
 - autoconf ok
 - automake ok
 - libtool ok
 - make ok
 - cmake ok
 - bzip2 ok
 - doxygen ok
 - graphviz ok
 - bzip2-devel ok
 - openssl-devel ok
 - gmp-devel ok
 - ocaml ok
 - python ok
 - python3 ok
 - python-devel ok
 - rh-python36 ok
 - gettext-devel ok
 - file ok
 - libusbx-devel ok
 - libcurl-devel ok
 - patch ok
 - llvm-toolset-7.0-llvm-devel ok
 - llvm-toolset-7.0-llvm-static ok
 - epel-release ok
 - jq ok
```

### 3. 编译完成

```sh
[100%] Linking CXX executable nodeos
cd /root/eos/build/programs/nodeos && /root/eosio/2.1/bin/cmake -E cmake_link_script CMakeFiles/nodeos.dir/link.txt --verbose=false
cd /root/eos/build/programs/nodeos && mkdir -p /root/eos/build/bin
cd /root/eos/build/programs/nodeos && /root/eosio/2.1/bin/cmake -E copy /root/eos/build/programs/nodeos/nodeos /root/eos/build/bin/
make[2]: Leaving directory '/root/eos/build'
[100%] Built target nodeos
make[1]: Leaving directory '/root/eos/build'
/root/eosio/2.1/bin/cmake -E cmake_progress_start /root/eos/build/CMakeFiles 0
 _______  _______  _______ _________ _______
(  ____ \(  ___  )(  ____   __   __ (  ___  )
| (    \/| (   ) || (    \/   ) (   | (   ) |
| (__    | |   | || (_____    | |   | |   | |
|  __)   | |   | |(_____  )   | |   | |   | |
| (      | |   | |      ) |   | |   | |   | |
| (____/\| (___) |/\____) |___) (___| (___) |
(_______/(_______)\_______)\_______/(_______)
=============================================
EOSIO has been successfully built. 0:27:52
You can now install using: /root/eos/scripts/eosio_install.sh
Uninstall with: /root/eos/scripts/eosio_uninstall.sh

If you wish to perform tests to ensure functional code:
cd /root/eos/scripts/../build && make test

EOSIO website: https://eos.io
EOSIO Telegram channel: https://t.me/EOSProject
EOSIO resources: https://eos.io/resources/
EOSIO Stack Exchange: https://eosio.stackexchange.com
```

### 4. 运行EOSIO

```sh
# 拷贝build目录
cp -r eos/build /usr/local/eos
# 声明环境变量
echo "export PATH=$PATH:/usr/local/eos/bin" >> /etc/profile
# 刷新环境变量
source /etc/profile
```

### 5. 常见问题

#### 1.钱包无法运行

```sh
# 报错信息
./keosd: error while loading shared libraries: libusb-1.0.so.0: cannot open shared object file: No such file or directory
# 解决方案
yum install libusb
```
