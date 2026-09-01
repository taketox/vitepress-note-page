# Hyperledger-Caliper

## FISCO BCOS v2 基于Caliper性能测试

### 环境要求

#### 1. nodejs

```sh
#安装wget
yum -y install wget
#下载nodejs安装包
wget https://npm.taobao.org/mirrors/node/v16.15.1/node-v16.15.1-linux-x64.tar.xz

#卸载原有的node
rm -rf /usr/local/node
#压缩，安装，配置环境变量
tar -xvf node-v16.15.1-linux-x64.tar.xz
mv node-v16.15.1-linux-x64/ /usr/local/node
#环境变量
echo "export PATH=$PATH:/usr/local/node/bin" >> /etc/profile
source /etc/profile
#sudo
ln -s /usr/local/node/bin/* /usr/bin/

#查看版本
node -v
npm -v
```

#### 2. caliper CLI

- 使用npm安装

```sh
npm install --only=prod @hyperledger/caliper-cli@0.5.0
```

- 查看是否安装成功

```sh
[root@localhost package]# npx caliper --version
0.5.0
```

#### 3. 绑定sdk

```sh
npx caliper bind --caliper-bind-sut fisco-bcos:latest
```

#### 4. 下载demo

```sh
git clone https://gitee.com/hyperledger/caliper-benchmarks.git
```

#### 5. 执行HelloWorld合约测试

```sh
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/samples/fisco-bcos/helloworld/config.yaml  --caliper-networkconfig networks/fisco-bcos/4nodes1group/fisco-bcos.json
```

### 配置文件

#### 1. Benchmark configuration file

##### 1.1 Hello World

- config.yaml

```yaml
test:
  name: Hello World
  description: This is a helloworld benchmark of FISCO BCOS for caliper
  workers:
    number: 1
  rounds:
    - label: get
      description: Test performance of getting name
      txNumber: 10000
      rateControl:
          type: fixed-rate
          opts:
            tps: 1000
      workload:
        module: benchmarks/get.js
    - label: set
      description: Test performance of setting name
      txNumber: 10000
      rateControl:
          type: fixed-rate
          opts:
            tps: 1000
      workload:
        module: benchmarks/set.js
```

##### 1.2 transfer

- config.yaml

```yaml
test:
  name: Solidity Transfer
  description: This is a solidity transfer benchmark of FISCO BCOS for caliper
  workers:
    number: 4
  rounds:
    - label: addUser
      description: generate users for transfer test later
      txNumber:
        - 1000
      rateControl:
        - type: fixed-rate
          opts:
            tps: 1000
      workload:
        module: benchmarks/samples/fisco-bcos/transfer/solidity/addUser.js
    - label: transfer
      description: transfer money between users
      txNumber:
        - 10000
      rateControl:
        - type: fixed-rate
          opts:
            tps: 1000
      workload:
        module: benchmarks/samples/fisco-bcos/transfer/solidity/transfer.js
        arguments:
          txnPerBatch: 10
```

#### 2. Network configuration file

##### 2.1 Custom

- networkConfig.yaml

```json
{
    "caliper": {
        "blockchain": "fisco-bcos",
    },
    "fisco-bcos": {
        "config": {
            "privateKey": "bcec428d5205abe0f0cc8a734083908d9eb8563e31f943d760786edf42ad67dd",
            "account": "0x64fa644d2a694681bd6addd6c5e36cccd8dcdde3"
        },
        "network": {
            "nodes": [
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8545",
                    "channelPort": "20200"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8546",
                    "channelPort": "20201"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8547",
                    "channelPort": "20202"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8548",
                    "channelPort": "20203"
                }
            ],
            "authentication": {
                "key": "/root/fisco/nodes/127.0.0.1/sdk/sdk.key",
                "cert": "/root/fisco/nodes/127.0.0.1/sdk/sdk.crt",
                "ca": "/root/fisco/nodes/127.0.0.1/sdk/ca.crt"
            },
            "groupID": 1,
            "timeout": 100000
        },
        "smartContracts": [
            {
                "id": "helloworld",
                "path": "benchmarks/HelloWorld.sol",
                "language": "solidity",
                "version": "v0"
            },
        ]
    },
    "info": {
        "Version": "2.0.0",
        "Size": "4 Nodes",
        "Distribution": "Single Host"
    }
}
```

##### 2.2 Samlpe

- networkConfig.yaml

```json
{
    "caliper": {
        "blockchain": "fisco-bcos",
        "command": {
            "start": "docker-compose -f networks/fisco-bcos/4nodes1group/docker-compose.yaml up -d; sleep 3s",
            "end": "docker-compose -f networks/fisco-bcos/4nodes1group/docker-compose.yaml down"
        }
    },
    "fisco-bcos": {
        "config": {
            "privateKey": "bcec428d5205abe0f0cc8a734083908d9eb8563e31f943d760786edf42ad67dd",
            "account": "0x64fa644d2a694681bd6addd6c5e36cccd8dcdde3"
        },
        "network": {
            "nodes": [
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8914",
                    "channelPort": "20914"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8915",
                    "channelPort": "20915"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8916",
                    "channelPort": "20916"
                },
                {
                    "ip": "127.0.0.1",
                    "rpcPort": "8917",
                    "channelPort": "20917"
                }
            ],
            "authentication": {
                "key": "./networks/fisco-bcos/4nodes1group/sdk/node.key",
                "cert": "./networks/fisco-bcos/4nodes1group/sdk/node.crt",
                "ca": "./networks/fisco-bcos/4nodes1group/sdk/ca.crt"
            },
            "groupID": 1,
            "timeout": 100000
        },
        "smartContracts": [
            {
                "id": "helloworld",
                "path": "src/fisco-bcos/helloworld/HelloWorld.sol",
                "language": "solidity",
                "version": "v0"
            },
            {
                "id": "parallelok",
                "path": "src/fisco-bcos/transfer/ParallelOk.sol",
                "language": "solidity",
                "version": "v0"
            },
            {
                "id": "dagtransfer",
                "address": "0x0000000000000000000000000000000000005002",
                "language": "precompiled",
                "version": "v0"
            }
        ]
    },
    "info": {
        "Version": "2.0.0",
        "Size": "4 Nodes",
        "Distribution": "Single Host"
    }
}
```

#### 3. Workload modules

##### 3.1 Hello World

- get.js

```javascript
/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class GetWorkload extends WorkloadModuleBase {
    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        const args = {
            contractId: 'helloworld',
            args: {
                transaction_type: 'get()'
            },
            readOnly: true
        };
        await this.sutAdapter.sendRequests(args);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new GetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

- set.js

```javascript
/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class SetWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        const args = {
            contractId: 'helloworld',
            args: {
                transaction_type: 'set(string)',
                name: 'hello! - from ' + this.workerIndex.toString()
            },
            readOnly: false
        };
        await this.sutAdapter.sendRequests(args);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new SetWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

##### 3.2 transfer

- addUser.js

```javascript
/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

let accountList = [];
const initMoney = 100000000;

/**
 * Workload module for the benchmark round.
 */
class AddUserWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.prefix = '';
    }

    /**
     * Generate unique account key for the transaction
     * @param {Number} index account index
     * @returns {String} account key
     */
    _generateAccount(index) {
        return this.prefix + index.toString();
    }

    /**
     * Generates simple workload
     * @returns {Object} array of json objects
     */
    _generateWorkload() {
        let workload = [];
        let index = accountList.length;
        let accountID = this._generateAccount(index);
        accountList.push({
            'accountID': accountID,
            'balance': initMoney
        });

        workload.push({
            contractId: 'parallelok',
            args: {
                transaction_type: 'set(string,uint256)',
                name: accountID,
                num: initMoney
            }
        });
        return workload;
    }

    /**
     * Initialize the workload module with the given parameters.
     * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
     * @param {number} totalWorkers The total number of workers participating in the round.
     * @param {number} roundIndex The 0-based index of the currently executing round.
     * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
     * @param {ConnectorBase} sutAdapter The adapter of the underlying SUT.
     * @param {Object} sutContext The custom context object provided by the SUT adapter.
     * @async
     */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.prefix = this.workerIndex.toString();

        const args = {
            contractId: 'parallelok',
            args: {
                transaction_type: 'enableParallel()'
            }
        };

        // Enable parallel transaction executor first, this transaction should *NOT* be recorded by context
        await this.sutAdapter.sendRequests(args);
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        const args = this._generateWorkload();
        await this.sutAdapter.sendRequests(args);
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new AddUserWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
module.exports.accountList = accountList;
```

- transfer.js

```javascript
/*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * Workload module for the benchmark round.
 */
class TransferWorkload extends WorkloadModuleBase {
    /**
     * Initializes the workload module instance.
     */
    constructor() {
        super();
        this.index = 0;
        this.accountList = [];
        this.txnPerBatch = 1;
    }

    /**
     * Generates simple workload
     * @return {Object} array of json objects
     */
    _generateWorkload() {
        let workload = [];
        for (let i = 0; i < this.txnPerBatch; i++) {
            let fromIndex = this.index % this.accountList.length;
            let toIndex = (this.index + Math.floor(this.accountList.length / 2)) % this.accountList.length;
            let value = Math.floor(Math.random() * 100);
            let args = {
                contractId: 'parallelok',
                args: {
                    transaction_type: 'transfer(string,string,uint256)',
                    from: this.accountList[fromIndex].accountID,
                    to: this.accountList[toIndex].accountID,
                    num: value
                }
            };
            workload.push(args);

            this.index++;
            this.accountList[fromIndex].balance -= value;
            this.accountList[toIndex].balance += value;
        }
        return workload;
    }

    /**
     * Initialize the workload module with the given parameters.
     * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
     * @param {number} totalWorkers The total number of workers participating in the round.
     * @param {number} roundIndex The 0-based index of the currently executing round.
     * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
     * @param {ConnectorBase} sutAdapter The adapter of the underlying SUT.
     * @param {Object} sutContext The custom context object provided by the SUT adapter.
     * @async
     */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);

        this.txnPerBatch = this.roundArguments.txnPerBatch || 1;

        const addUser = require('./addUser');
        this.accountList = addUser.accountList;
    }

    /**
     * Assemble TXs for the round.
     * @return {Promise<TxStatus[]>}
     */
    async submitTransaction() {
        const workload = this._generateWorkload();
        await this.sutAdapter.sendRequests(workload);
    }

    async cleanupWorkloadModule() {
        console.info('Start balance validation ...');
        let correctAcccountNum = this.accountList.length;
        for (let i = 0; i < this.accountList.length; ++i) {
            let account = this.accountList[i];
            let accountID = account.accountID;
            let balance = account.balance;
            const queryArgs = {
                contractId: 'parallelok',
                args: {
                    transaction_type: 'balanceOf(string)',
                    name: accountID
                },
                readOnly: true
            };
            let state = await this.sutAdapter.sendRequests(queryArgs);
            let remoteBalance = state.status.result.result.output;
            remoteBalance = parseInt(remoteBalance, 16);
            if (remoteBalance !== balance) {
                console.error(`Abnormal account state: AccountID=${accountID}, LocalBalance=${balance}, RemoteBalance=${remoteBalance}`);
                correctAcccountNum--;
            }
        }

        if (correctAcccountNum === this.accountList.length) {
            console.info('Balance validation succeeded');
        }
        else {
            throw new Error(`Balance validation failed: success=${correctAcccountNum}, fail=${this.accountList.length - correctAcccountNum}`);
        }
    }
}

/**
 * Create a new instance of the workload module.
 * @return {WorkloadModuleInterface}
 */
function createWorkloadModule() {
    return new TransferWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
```

### 启动命令

```sh
# bash
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/config.yaml --caliper-networkconfig benchmarks/networkConfig.json
```

### 智能合约

#### 1. HelloWorld

- HelloWorld.sol

```solidity
pragma solidity ^0.4.2;

contract HelloWorld {
    string name;

    constructor() public {
       name = "Hello, World!";
    }

    function get() public view returns(string) {
        return name;
    }

    function  set(string n) public {
    	name = n;
    }
}
```

#### 2. transfer

- ParallelContract.sol

```solidity
pragma solidity ^0.4.25;

contract ParallelConfigPrecompiled
{
    function registerParallelFunctionInternal(address, string, uint256) public returns (int);
    function unregisterParallelFunctionInternal(address, string) public returns (int);
}

contract ParallelContract
{
    ParallelConfigPrecompiled precompiled = ParallelConfigPrecompiled(0x1006);

    function registerParallelFunction(string functionName, uint256 criticalSize) public
    {
        precompiled.registerParallelFunctionInternal(address(this), functionName, criticalSize);
    }

    function unregisterParallelFunction(string functionName) public
    {
        precompiled.unregisterParallelFunctionInternal(address(this), functionName);
    }

    function enableParallel() public;
    function disableParallel() public;
}
```

- ParallelOk.sol

```solidity
pragma solidity ^0.4.25;

import "./ParallelContract.sol";

// A parallel contract example
contract ParallelOk is ParallelContract
{
    mapping (string => uint256) _balance;
    
     // Just an example, overflow is ok, use 'SafeMath' if needed
    function transfer(string from, string to, uint256 num) public
    {
        _balance[from] -= num;
        _balance[to] += num;
    }

    // Just for testing whether the parallel revert function is working well, no practical use
    function transferWithRevert(string from, string to, uint256 num) public
    {
        _balance[from] -= num;
        _balance[to] += num;
        require(num <= 100);
    }

    function set(string name, uint256 num) public
    {
        _balance[name] = num;
    }

    function balanceOf(string name) public view returns (uint256)
    {
        return _balance[name];
    }
    
    // Register parallel function
    function enableParallel() public
    {
        // critical number is to define how many critical params from start
        registerParallelFunction("transfer(string,string,uint256)", 2); // critical: string string
        registerParallelFunction("set(string,uint256)", 1); // critical: string
    } 

    // Disable register parallel function
    function disableParallel() public
    {
        unregisterParallelFunction("transfer(string,string,uint256)"); 
        unregisterParallelFunction("set(string,uint256)");
    } 
}
```

### 报错合集

#### 1.Deploying helloworld 卡死

```sh
# 报错代码
[root@localhost caliper-bcos]# npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/config.yaml --caliper-networkconfig benchmarks/networkConfig.json 
2022.11.16-02:21:37.984 info  [caliper] [cli-launch-manager]    Set workspace path: /root/caliper-bcos
2022.11.16-02:21:37.986 info  [caliper] [cli-launch-manager]    Set benchmark configuration path: /root/caliper-bcos/benchmarks/config.yaml
2022.11.16-02:21:37.986 info  [caliper] [cli-launch-manager]    Set network configuration path: /root/caliper-bcos/benchmarks/networkConfig.json
2022.11.16-02:21:37.986 info  [caliper] [cli-launch-manager]    Set SUT type: fisco-bcos
2022.11.16-02:21:38.906 info  [caliper] [benchmark-validator]   No observer specified, will default to `none`
2022.11.16-02:21:38.906 info  [caliper] [caliper-engine]        Starting benchmark flow
2022.11.16-02:21:38.907 info  [caliper] [caliper-engine]        Network configuration attribute "caliper.command.start" is not present, skipping start command
2022.11.16-02:21:38.931 info  [caliper] [caliper-engine]        Executed "init" step in 0 seconds
2022.11.16-02:21:38.932 info  [caliper] [installSmartContract.js]       Deploying smart contracts ...
2022.11.16-02:21:38.933 info  [caliper] [installSmartContract.js]       Deploying helloworld ...

# 原因
2022.11.16-02:12:28.282 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.223:8545
2022.11.16-02:12:30.287 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.224:8545
2022.11.16-02:12:32.292 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.223:8545
2022.11.16-02:12:34.296 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.223:8545
2022.11.16-02:12:36.301 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.222:8545
2022.11.16-02:12:38.305 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.221:8545
2022.11.16-02:12:40.311 info  [caliper] [fiscoBcosApi.js]       RequestError: Error: connect ECONNREFUSED 192.168.31.221:8545

# 因为nodejs只支持使用jsonrpc连接BCOS，端口为8545。
# 和java不一样，java使用的是rpc，端口20200。

# 解决方案
查看配置文件config.ini 8545端口是否对外开放。

[rpc]
    channel_listen_ip=0.0.0.0
    channel_listen_port=20200
    jsonrpc_listen_ip=0.0.0.0 #修改此处，默认为127.0.0.1
    jsonrpc_listen_port=8545
[p2p]
    listen_ip=0.0.0.0
    listen_port=30300
    ; nodes to connect
    node.0=192.168.31.221:30300
    node.1=192.168.31.222:30300
    node.2=192.168.31.223:30300
    node.3=192.168.31.224:30300
```
