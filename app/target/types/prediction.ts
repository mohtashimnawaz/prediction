/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/prediction.json`.
 */
export type Prediction = {
  "address": "ocKzKFLEt9dWXtPmD1xQSvGgA7ugaFFkGv4oXnWNa2N",
  "metadata": {
    "name": "prediction",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "battle",
      "discriminator": [
        124,
        60,
        127,
        254,
        179,
        26,
        138,
        20
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "platform",
          "writable": true
        },
        {
          "name": "card"
        },
        {
          "name": "cardTokenAccount"
        },
        {
          "name": "bet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "player",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "claimWinnings",
      "discriminator": [
        161,
        215,
        24,
        59,
        14,
        236,
        242,
        221
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "bet",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "collectPlatformFee",
      "discriminator": [
        151,
        88,
        172,
        250,
        117,
        185,
        59,
        209
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "platform"
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "treasury",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "platform",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "endTime",
          "type": "i64"
        },
        {
          "name": "category",
          "type": {
            "defined": {
              "name": "marketCategory"
            }
          }
        },
        {
          "name": "oracleSource",
          "type": {
            "defined": {
              "name": "oracleSource"
            }
          }
        },
        {
          "name": "oracleDataType",
          "type": {
            "defined": {
              "name": "oracleDataType"
            }
          }
        },
        {
          "name": "priceFeed",
          "type": {
            "option": "pubkey"
          }
        },
        {
          "name": "targetPrice",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "gameId",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "targetSpread",
          "type": {
            "option": "i32"
          }
        },
        {
          "name": "location",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "weatherMetric",
          "type": {
            "option": {
              "defined": {
                "name": "weatherMetric"
              }
            }
          }
        },
        {
          "name": "targetValue",
          "type": {
            "option": "i64"
          }
        },
        {
          "name": "dataIdentifier",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "metricType",
          "type": {
            "option": {
              "defined": {
                "name": "metricType"
              }
            }
          }
        },
        {
          "name": "threshold",
          "type": {
            "option": "u64"
          }
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "mintCard",
      "discriminator": [
        58,
        198,
        225,
        36,
        193,
        210,
        202,
        108
      ],
      "accounts": [
        {
          "name": "card",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  97,
                  114,
                  100
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ]
          }
        },
        {
          "name": "mint",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "owner"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "mint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "signer": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "power",
          "type": "u8"
        },
        {
          "name": "rarity",
          "type": "u8"
        },
        {
          "name": "multiplier",
          "type": "u64"
        }
      ]
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "platform",
          "writable": true
        },
        {
          "name": "bet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              },
              {
                "kind": "account",
                "path": "bettor"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "prediction",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarket",
      "discriminator": [
        155,
        23,
        80,
        173,
        46,
        74,
        23,
        239
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "outcome",
          "type": "bool"
        }
      ]
    },
    {
      "name": "resolveMarketSocial",
      "discriminator": [
        68,
        132,
        41,
        201,
        87,
        167,
        147,
        55
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "actualValue",
          "type": "u64"
        }
      ]
    },
    {
      "name": "resolveMarketSports",
      "discriminator": [
        108,
        111,
        2,
        53,
        246,
        103,
        238,
        253
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "teamAScore",
          "type": "u32"
        },
        {
          "name": "teamBScore",
          "type": "u32"
        }
      ]
    },
    {
      "name": "resolveMarketWeather",
      "discriminator": [
        75,
        64,
        14,
        108,
        248,
        64,
        220,
        93
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "authority",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "recordedValue",
          "type": "i64"
        }
      ]
    },
    {
      "name": "resolveMarketWithOracle",
      "discriminator": [
        47,
        30,
        105,
        74,
        231,
        184,
        219,
        163
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "priceFeed"
        }
      ],
      "args": []
    },
    {
      "name": "updateCardStats",
      "discriminator": [
        111,
        4,
        149,
        130,
        129,
        225,
        81,
        44
      ],
      "accounts": [
        {
          "name": "card",
          "writable": true
        },
        {
          "name": "cardTokenAccount"
        },
        {
          "name": "owner",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "won",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bet",
      "discriminator": [
        147,
        23,
        35,
        59,
        15,
        75,
        155,
        32
      ]
    },
    {
      "name": "card",
      "discriminator": [
        166,
        250,
        46,
        230,
        152,
        63,
        140,
        182
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "questionTooLong",
      "msg": "Question is too long (max 100 characters)"
    },
    {
      "code": 6001,
      "name": "descriptionTooLong",
      "msg": "Description is too long (max 200 characters)"
    },
    {
      "code": 6002,
      "name": "invalidEndTime",
      "msg": "End time must be in the future"
    },
    {
      "code": 6003,
      "name": "invalidAmount",
      "msg": "Invalid bet amount"
    },
    {
      "code": 6004,
      "name": "marketAlreadyResolved",
      "msg": "Market has already been resolved"
    },
    {
      "code": 6005,
      "name": "marketEnded",
      "msg": "Market betting period has ended"
    },
    {
      "code": 6006,
      "name": "marketNotResolved",
      "msg": "Market has not been resolved yet"
    },
    {
      "code": 6007,
      "name": "alreadyClaimed",
      "msg": "Winnings already claimed"
    },
    {
      "code": 6008,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6009,
      "name": "marketNotEnded",
      "msg": "Market betting period has not ended"
    },
    {
      "code": 6010,
      "name": "losingBet",
      "msg": "This is a losing bet"
    },
    {
      "code": 6011,
      "name": "noWinningBets",
      "msg": "No winning bets in this market"
    },
    {
      "code": 6012,
      "name": "notCardOwner",
      "msg": "Not the card owner"
    },
    {
      "code": 6013,
      "name": "requiresOracleResolution",
      "msg": "Market requires oracle resolution"
    },
    {
      "code": 6014,
      "name": "notOracleMarket",
      "msg": "Market is not configured for oracle resolution"
    },
    {
      "code": 6015,
      "name": "oracleConfigRequired",
      "msg": "Oracle configuration (price_feed and target_price) is required"
    },
    {
      "code": 6016,
      "name": "invalidPriceFeed",
      "msg": "Invalid Pyth price feed"
    },
    {
      "code": 6017,
      "name": "priceNotAvailable",
      "msg": "Price data not available"
    },
    {
      "code": 6018,
      "name": "stalePriceData",
      "msg": "Price data is stale (older than 60 seconds)"
    }
  ],
  "types": [
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "bettor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "prediction",
            "type": "bool"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "cardMint",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "cardMultiplier",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "card",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "power",
            "type": "u8"
          },
          {
            "name": "rarity",
            "type": "u8"
          },
          {
            "name": "multiplier",
            "type": "u64"
          },
          {
            "name": "wins",
            "type": "u64"
          },
          {
            "name": "losses",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "resolved",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": {
              "option": "bool"
            }
          },
          {
            "name": "totalYesAmount",
            "type": "u64"
          },
          {
            "name": "totalNoAmount",
            "type": "u64"
          },
          {
            "name": "category",
            "type": {
              "defined": {
                "name": "marketCategory"
              }
            }
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "oracleSource",
            "type": {
              "defined": {
                "name": "oracleSource"
              }
            }
          },
          {
            "name": "oracleDataType",
            "type": {
              "defined": {
                "name": "oracleDataType"
              }
            }
          },
          {
            "name": "priceFeed",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "targetPrice",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "strikePrice",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "gameId",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "teamAScore",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "teamBScore",
            "type": {
              "option": "u32"
            }
          },
          {
            "name": "targetSpread",
            "type": {
              "option": "i32"
            }
          },
          {
            "name": "location",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "weatherMetric",
            "type": {
              "defined": {
                "name": "weatherMetric"
              }
            }
          },
          {
            "name": "targetValue",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "recordedValue",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "dataIdentifier",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "metricType",
            "type": {
              "defined": {
                "name": "metricType"
              }
            }
          },
          {
            "name": "threshold",
            "type": {
              "option": "u64"
            }
          },
          {
            "name": "actualValue",
            "type": {
              "option": "u64"
            }
          }
        ]
      }
    },
    {
      "name": "marketCategory",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "sports"
          },
          {
            "name": "crypto"
          },
          {
            "name": "politics"
          },
          {
            "name": "entertainment"
          },
          {
            "name": "weather"
          },
          {
            "name": "technology"
          },
          {
            "name": "gaming"
          },
          {
            "name": "other"
          }
        ]
      }
    },
    {
      "name": "metricType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "followerCount"
          },
          {
            "name": "likeCount"
          },
          {
            "name": "viewCount"
          },
          {
            "name": "boxOfficeGross"
          },
          {
            "name": "streamRank"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "oracleDataType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "price"
          },
          {
            "name": "sportsScore"
          },
          {
            "name": "sportsWinner"
          },
          {
            "name": "weather"
          },
          {
            "name": "social"
          },
          {
            "name": "boxOffice"
          },
          {
            "name": "custom"
          }
        ]
      }
    },
    {
      "name": "oracleSource",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "manual"
          },
          {
            "name": "pythPrice"
          },
          {
            "name": "chainlinkPrice"
          },
          {
            "name": "chainlinkSports"
          },
          {
            "name": "chainlinkWeather"
          },
          {
            "name": "switchboardPrice"
          },
          {
            "name": "switchboardCustom"
          },
          {
            "name": "customApi"
          }
        ]
      }
    },
    {
      "name": "platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "totalMarkets",
            "type": "u64"
          },
          {
            "name": "totalVolume",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "weatherMetric",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "temperature"
          },
          {
            "name": "precipitation"
          },
          {
            "name": "windSpeed"
          },
          {
            "name": "humidity"
          }
        ]
      }
    }
  ]
};
