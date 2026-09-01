# RPC接口上链

## get_info

### request

```sh
curl -X POST --url http://127.0.0.1:8888/v1/chain/get_info -d '{}' 
```

### response

```sh
{
  "server_version": "26a4d285",
  "chain_id": "8a34ec7df1b8cd06ff4a8abbaa7cc50300823350cadc59ab296cb00d104d2b8f",
  "head_block_num": 11453,
  "last_irreversible_block_num": 11452,
  "last_irreversible_block_id": "00002cbc58e9479ba414f18146fd5892d83b85a2d32fd01b9358970079109844",
  "head_block_id": "00002cbdccf8c9a046f8e8c4a58b75162cc5211912af9dcb452415586cc24ccc",
  "head_block_time": "2022-09-27T14:00:46.500",
  "head_block_producer": "eosio",
  "virtual_block_cpu_limit": 200000000,
  "virtual_block_net_limit": 1048576000,
  "block_cpu_limit": 199900,
  "block_net_limit": 1048576,
  "server_version_string": "v2.1.0",
  "fork_db_head_block_num": 11453,
  "fork_db_head_block_id": "00002cbdccf8c9a046f8e8c4a58b75162cc5211912af9dcb452415586cc24ccc",
  "server_full_version_string": "v2.1.0-26a4d285d0be1052d962149e431eb81500782991",
  "last_irreversible_block_time": "2022-09-27T14:00:46.000"
}
```

## get_block

### request

```sh
curl -X POST --url http://127.0.0.1:8888/v1/chain/get_block -d '{
 "block_num_or_id": "11453"
} ' 
```

### response

```sh
{
	"timestamp": "2022-09-27T14:00:46.500",
	"producer": "eosio",
	"confirmed": 0,
	"previous": "00002cbc58e9479ba414f18146fd5892d83b85a2d32fd01b9358970079109844",
	"transaction_mroot": "0000000000000000000000000000000000000000000000000000000000000000",
	"action_mroot": "af8011c7df8dfe4679931bf168f63751c878f3ba5a35c40216a404be34b97947",
	"schedule_version": 0,
	"new_producers": null,
	"producer_signature": "SIG_K1_K4nQxirAXLyaYYjMMhMmgacqX63KrYvwgPHXJnmhjh4Wuaa8Mwt4NCnDVNGueVq224YuoQ5FcC3jgMPGCi1o1u96kxftej",
	"transactions": [],
	"id": "00002cbdccf8c9a046f8e8c4a58b75162cc5211912af9dcb452415586cc24ccc",
	"block_num": 11453,
	"ref_block_prefix": 3303602246
}
```

## abi_json_to_bin

### request

```sh
curl -X POST --url http://127.0.0.1:8888/v1/chain/abi_json_to_bin -d '{
 "code":"did",
 "action":"updatedid",
 "args":{"did":"A1","didDocument":"didinfo11"}
} '
```

### response

```sh
{"binargs":"02413109646964696e666f3131"}
```

## sign_transaction

### request

```sh
curl -X POST --url http://127.0.0.1:7777/v1/wallet/sign_transaction -d '[{"ref_block_num": 11453,"ref_block_prefix": 3303602246,"expiration": "2022-09-27T14:00:46.500","actions": [{"account": "did","name": "updatedid","authorization": [{"actor": "did","permission": "active"}],"data": "02413109646964696e666f3131"}],"signatures": []},["EOS7zJSms7mtzL2mW9JRGUcnEfdy4Lxbj3vMSeCzZPskwfYXFXZgr"],""]'
```

### response

```sh
{
	"expiration": "2022-09-27T14:00:46",
	"ref_block_num": 11453,
	"ref_block_prefix": 3303602246,
	"max_net_usage_words": 0,
	"max_cpu_usage_ms": 0,
	"delay_sec": 0,
	"context_free_actions": [],
	"actions": [{
		"account": "did",
		"name": "updatedid",
		"authorization": [{
			"actor": "did",
			"permission": "active"
		}],
		"data": "02413109646964696e666f3131"
	}],
	"transaction_extensions": [],
	"signatures": ["SIG_K1_KVdgWiGRiuv6gWjn5Ws1r6VdPcPyL1aQjwT2j33r5heYNReurQCeqRFyTjAV5YQA45sTZ8bJQaDFbFobsninmYewFxXTog"],
	"context_free_data": []
}
```

## push_transaction

### request

```sh
curl -X POST --url http://127.0.0.1:8888/v1/chain/push_transaction -d '{"compression":"none","transaction":{"maxNetUsageWords":"0","expiration":"2022-09-27T16:25:34","actions":[{"account":"did","name":"updatedid","authorization":[{"actor":"did","permission":"active"}],"data":"03647432086474696e666f3131","hex_data":null}],"signatures":["SIG_K1_KaXrfbRdoKcvQzXmWbYDqM3oyXZcuG3TP8Rw516TjLPV6RKcvwMHbmWtWbT4Sto8Xdpg1Qo5SzhdtKmYJGChHyiQHW6XoN"],"ref_block_prefix":"2163641073","ref_block_num":"3112","max_cpu_usage_ms":0,"context_free_data":[],"transaction_extensions":[],"context_free_actions":[],"delay_sec":0},"signatures":["SIG_K1_KaXrfbRdoKcvQzXmWbYDqM3oyXZcuG3TP8Rw516TjLPV6RKcvwMHbmWtWbT4Sto8Xdpg1Qo5SzhdtKmYJGChHyiQHW6XoN"]}'
```

### response

```sh
{
    "transaction_id": "3276468f7fe78ed073e4f76aa758bd7074882ce72621ed550058c447880035ba",
    "processed": {
        "id": "3276468f7fe78ed073e4f76aa758bd7074882ce72621ed550058c447880035ba",
        "block_num": 3182,
        "block_time": "2022-09-27T16:24:29.500",
        "producer_block_id": null,
        "receipt": {
            "status": "executed",
            "cpu_usage_us": 255,
            "net_usage_words": 14
        },
        "elapsed": 255,
        "net_usage": 112,
        "scheduled": false,
        "action_traces": [
            {
                "action_ordinal": 1,
                "creator_action_ordinal": 0,
                "closest_unnotified_ancestor_action_ordinal": 0,
                "receipt": {
                    "receiver": "did",
                    "act_digest": "4639e80670163b4fa0357e4ff84e687a2b514267d327d6b92411590190d05789",
                    "global_sequence": 3189,
                    "recv_sequence": 5,
                    "auth_sequence": [
                        [
                            "did",
                            7
                        ]
                    ],
                    "code_sequence": 1,
                    "abi_sequence": 1
                },
                "receiver": "did",
                "act": {
                    "account": "did",
                    "name": "updatedid",
                    "authorization": [
                        {
                            "actor": "did",
                            "permission": "active"
                        }
                    ],
                    "data": {
                        "did": "dt2",
                        "didDocument": "dtinfo11"
                    },
                    "hex_data": "03647432086474696e666f3131"
                },
                "context_free": false,
                "elapsed": 29,
                "console": "",
                "trx_id": "3276468f7fe78ed073e4f76aa758bd7074882ce72621ed550058c447880035ba",
                "block_num": 3182,
                "block_time": "2022-09-27T16:24:29.500",
                "producer_block_id": null,
                "account_ram_deltas": [],
                "account_disk_deltas": [],
                "except": null,
                "error_code": null,
                "return_value_hex_data": "",
                "inline_traces": []
            }
        ],
        "account_ram_delta": null,
        "except": null,
        "error_code": null
    }
}
```

## get_transaction

### request

```sh
curl -X POST --url http://127.0.0.1:8888/v1/history/get_transaction -d '{ "id":"87a64f05d775ae1320a57e892d4f43d1cdecaddd68d970c9c143c6d83a2943e7" }'
```

### response

```sh
{
	"id": "87a64f05d775ae1320a57e892d4f43d1cdecaddd68d970c9c143c6d83a2943e7",
	"trx": {
		"receipt": {
			"status": "executed",
			"cpu_usage_us": 171,
			"net_usage_words": 14,
			"trx": [1, {
				"compression": "none",
				"prunable_data": {
					"prunable_data": [0, {
						"signatures": ["SIG_K1_K3WpNaspfjDLevqqcsV4MowBKnSN9r1MGaahLhgp1rNpjQtHBEgJvCnQqzc9foYyBJ8yzfxFsVoJeHPAseDmyjiPxb8j67"],
						"packed_context_free_data": ""
					}]
				},
				"packed_trx": "d0083363f039d2e7419a0000000001000000000000924b0000482ea96c52d501000000000000924b00000000a8ed32320d03647431086474696e666f313100"
			}]
		},
		"trx": {
			"expiration": "2022-09-27T14:29:36",
			"ref_block_num": 14832,
			"ref_block_prefix": 2588010450,
			"max_net_usage_words": 0,
			"max_cpu_usage_ms": 0,
			"delay_sec": 0,
			"context_free_actions": [],
			"actions": [{
				"account": "did",
				"name": "updatedid",
				"authorization": [{
					"actor": "did",
					"permission": "active"
				}],
				"data": {
					"did": "dt1",
					"didDocument": "dtinfo11"
				},
				"hex_data": "03647431086474696e666f3131"
			}],
			"signatures": ["SIG_K1_K3WpNaspfjDLevqqcsV4MowBKnSN9r1MGaahLhgp1rNpjQtHBEgJvCnQqzc9foYyBJ8yzfxFsVoJeHPAseDmyjiPxb8j67"],
			"context_free_data": []
		}
	},
	"block_time": "2022-09-27T14:28:57.000",
	"block_num": 14834,
	"last_irreversible_block": 15280,
	"traces": [{
		"action_ordinal": 1,
		"creator_action_ordinal": 0,
		"closest_unnotified_ancestor_action_ordinal": 0,
		"receipt": {
			"receiver": "did",
			"act_digest": "c24b915f41cfdee09703aceeead0aa4e410d43ef126b9f8d53cfd569e056eee9",
			"global_sequence": 14842,
			"recv_sequence": 5,
			"auth_sequence": [
				["did", 8]
			],
			"code_sequence": 1,
			"abi_sequence": 1
		},
		"receiver": "did",
		"act": {
			"account": "did",
			"name": "updatedid",
			"authorization": [{
				"actor": "did",
				"permission": "active"
			}],
			"data": {
				"did": "dt1",
				"didDocument": "dtinfo11"
			},
			"hex_data": "03647431086474696e666f3131"
		},
		"context_free": false,
		"elapsed": 30,
		"console": "",
		"trx_id": "87a64f05d775ae1320a57e892d4f43d1cdecaddd68d970c9c143c6d83a2943e7",
		"block_num": 14834,
		"block_time": "2022-09-27T14:28:57.000",
		"producer_block_id": null,
		"account_ram_deltas": [],
		"account_disk_deltas": [],
		"except": null,
		"error_code": null,
		"return_value_hex_data": ""
	}]
}
```
