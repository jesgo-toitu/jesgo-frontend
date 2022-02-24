import { JSONSchema7 } from "json-schema";

// TODO プロトタイプ用jsonSchemaクラス。本来はDBから取得
export namespace DevSchema {

    //#region CC_root  
    // "$id": "/schema/CC/root"
    export const CC_root: JSONSchema7 = {
        // TODO $schemaがうまく認識されない
        // "$schema": "../jesgo.json",
        "$id": "/schema/CC/root",
        "type": "object",
        "title": "患者台帳 子宮頸がん",
        "$comment": "患者レコードの最上位に位置する基本情報.",
        "jesgo:parentschema": ["/"],
        "jesgo:unique": true,
        "required": [
            "がん種",
            "診断日"
        ],
        "properties": {
            "がん種": {
                "type": "string",
                "jesgo:required": [
                    "JSOG"
                ],
                // "const": "子宮頸がん",
                // ★以下に書き換え
                "default":"子宮頸がん",
                "readOnly": true
            },
            "診断日": {
                "type": "string",
                "format": "date"
            },
            "治療開始年月日": {
                "type": "string",
                "format": "date",
                "jesgo:required": ["JSOG"],
                "jesgo:set": "eventdate",
                "$comment": "治療開始年月日が同じものは同時性重複癌としてマークされます."
            },
            "腫瘍登録対象": {
                "title": "婦人科腫瘍登録対象症例",
                "description": "***以下の症例は除外されます.***\n- 診断のみ行い、治療を行わなかった場合\n- 試験開腹のみ行い、それ以後に何ら治療が行われていない場合\n- 診断が最終的に細胞診のみによって下された場合\n- 先行治療が他施設の場合\n",
                "type": "string",
                "enum": [
                    "いいえ",
                    "はい"
                ],
                "jesgo:required": [
                    "JSOG"
                ],
            },
            // "腫瘍登録番号": {
            //     "if": {
            //         "properties": {
            //             "腫瘍登録対象": {
            //                 "const": "はい"
            //             }
            //         }
            //     },
            //     "then": {
            //         "type": "string",
            //         "jesgo:required": [
            //             "JSOG"
            //         ],
            //         "pattern": "^CC20[0-9]{2}-[1-9][0-9]*$"
            //     }
            // }
            // ★以下に書き換え
         },
        "dependencies": {
            "腫瘍登録対象": {
                "oneOf": [
                    {
                        "type": "object",
                        "properties": {
                            "腫瘍登録対象": {
                                "enum": [
                                    "はい"
                                ]
                            },
                            "腫瘍登録番号": {
                                "type": "string",
                                "jesgo:required": [
                                    "JSOG"
                                ],
                                // TODO Validationにて要対応
                                "pattern": "^CC20[0-9]{2}-[1-9][0-9]*$"
                            }
                        }                       
                    },
                ]
            }
        },
        "jesgo:subschema": [
            "/schema/CC/staging",
            "/schema/CC/findigns",
            "/schema/CC/pathology",
            "/schema/treatment/operation",
            "/schema/treatment/chemotherapy",
            "/schema/treatment/radiotherapy"
        ]
    }
    //#endregion

    //#region CC_staging
    // "$id": "/schema/CC/staging"
    export const CC_staging: JSONSchema7 = {
        // TODO $schemaがうまく認識されない
        // "$schema": "../jesgo.json",
        "$id": "/schema/CC/staging",
        "type": "object",
        "title": "病期診断",
        "$comment": "子宮頸がんの病期診断.",
        "properties": {
            "進行期分類の選択": {
                "type": "string",
                "oneOf": [
                    {
                        "const": "手術により進行期を決定した症例"
                    },
                    {
                        "const": "治療開始前に進行期を決定した症例",
                        "description": "根治的放射線療法、術前化学療法・術前放射線療法実施例など"
                    }
                ],
                "description": "術前に放射線治療や化学療法を施行した症例は「術前治療施行例」となり、pTNM欄は術後所見、ypTNMとして手術時所見に即してpTNM分類を入力する。"
            },
            "FIGO": {
                "type": "string",
                "title": "FIGO分類(FIGO2018, 日産婦2020)",
                "enum": [
                    "I期(亜分類不明)",
                    "IA1期",
                    "IA2期",
                    "IA期(亜分類不明)",
                    "IB1期",
                    "IB2期",
                    "IB3期",
                    "IB期(亜分類不明)",
                    "II期(亜分類不明)",
                    "IIA1期",
                    "IIA2期",
                    "IIA期(亜分類不明)",
                    "IIB期",
                    "III期(亜分類不明)",
                    "IIIA期",
                    "IIIB期",
                    "IIIC期(亜分類不明)",
                    "IIIC1r期",
                    "IIIC1p期",
                    "IIIC2r期",
                    "IIIC2p期",
                    "IV期(亜分類不明)",
                    "IVA期",
                    "IVB期"
                ]
            },
            "cTNM": {
                "type": "object",
                "title": "cTMN分類(日産婦2020暫定版)",
                "description": "cTNM分類は、治療を開始する前に、内診・直腸診による局所所見に画像所見を加味して総合的に判断し報告する。\n子宮頸部円錐切除術は臨床検査とみなし,これによる組織検査の結果は原則としてcTNM分類に入れる。",
                "properties": {
                    "cT": {
                        // "$ref": "#T" // ★以下に書き換え
                        "$ref": "#/$defs/T"
                    },
                    "cN": {
                        // "$ref": "#cN" // ★以下に書き換え
                        "$ref": "#/$defs/cN"
                    },
                    "cM": {
                        // "$ref": "#cM" // ★以下に書き換え
                        "$ref": "#/$defs/cM"
                    }
                },
                "additionalProperties": false
            },
            "pTNM": {
                "type": "object",
                "title": "pTNM分類(手術を実施した症例のみ)",
                "properties": {
                    "pT": {
                        // "$ref": "#T" // ★以下に書き換え
                        "$ref": "#/$defs/T"
                    },
                    "pN": {
                        // "$ref": "#pN" // ★以下に書き換え
                        "$ref": "#/$defs/pN"
                    },
                    "pM": {
                        // "$ref": "#pM" // ★以下に書き換え
                        "$ref": "#/$defs/pM"
                    }
                },
                "additionalProperties": false
            },
            "ypTNM": {
                "type": "object",
                "title": "ypTNM分類(手術前に放射線治療や化学療法を実施した症例)",
                "properties": {
                    "ypT": {
                        // "$ref": "#T" // ★以下に書き換え
                        "$ref": "#/$defs/T"
                    },
                    "ypN": {
                        // "$ref": "#pN"    // ★以下に書き換え
                        "$ref": "#/$defs/pN"
                    },
                    "ypM": {
                        // "$ref": "#pM"    // ★以下に書き換え
                        "$ref": "#/$defs/pM"
                    }
                },
                "additionalProperties": false
            }
        },
        "additionalProperties": true,
        "$defs": {
            "T": {
                "$id": "#T",
                "type": "object",
                "title": "T分類",
                "properties": {
                    "T": {
                        "type": "string",
                        "title": "T分類",
                        "enum": [
                            "TX",
                            "T0",
                            "Tis",
                            "T1(亜分類不明)",
                            "T1a1:脈管侵襲なし",
                            "T1a1:脈管侵襲あり",
                            "T1a2:脈管侵襲なし",
                            "T1a2:脈管侵襲あり",
                            "T1a(亜分類不明):脈管侵襲なし",
                            "T1a(亜分類不明):脈管侵襲あり",
                            "T1b1",
                            "T1b2",
                            "T1b3",
                            "T1b(亜分類不明)",
                            "T2(亜分類不明)",
                            "T2a1",
                            "T2a2",
                            "T2a(亜分類不明)",
                            "T2b",
                            "T3(亜分類不明)",
                            "T3a",
                            "T3b",
                            "T4"
                        ]
                    },
                    "T1a期の広がり": {
                        // "type": "string",    // ★不要定義の削除
                        "title": "T1a期の腫瘍の水平方向の広がり",
                        // TODO 反映されていない。要実装。
                        "oneOf": [
                            {
                                "type": "number",
                                "minimum": 0,
                                "units": "mm"
                            },
                            {
                                "type": "string",
                                "enum": [
                                    "7mm以下",
                                    "7mmを超える",
                                    "不明"
                                ]
                            }
                        ]
                    }
                },
                // TODO 反映されていない。要実装。
                "if": {
                    "properties": {
                        "T": {
                            "pattern": "^T1a"
                        }
                    }
                },
                "then": {
                    "required": [
                        "T",
                        "T1a期の広がり"
                    ]
                },
                "else": {
                    "required": [
                        "T"
                    ]
                }
            },
            "cN": {
                "$id": "cN",
                "title": "N分類",
                "type": "string",
                "enum": [
                    "領域リンパ節転移なし",
                    "骨盤リンパ節のみに転移を認める",
                    "傍大動脈リンパ節のみに転移を認める",
                    "骨盤および傍大動脈リンパ節転移を認める",
                    "画像診断をしなかった"
                ]
            },
            "pN": {
                "$id": "#pN",
                "title": "N分類",
                "type": "object",
                "$comment": "手術評価としてのN分類",
                "properties": {
                    "RP": {
                        "title": "骨盤リンパ節に対する処置",
                        "type": "string",
                        "enum": [
                            "骨盤リンパ節を摘出しなかった(病理学的索が行われなかった)",
                            "骨盤リンパ節の選択的郭清(生検)を行った",
                            "骨盤リンパ節の系統的郭清(すべての所属リンパ節)を行った",
                            "センチネルリンパ節生検を行った"
                        ]
                    },
                    "RPX": {
                        "title": "骨盤リンパ節の所見",
                        "type": "string",
                        "enum": [
                            "RP1: 骨盤リンパ節の病理学的検索が行われなかったが、明らかな腫大を認めない",
                            "RP2: 骨盤リンパ節の病理学的検索が行われなかったが、明らかな腫大を認める",
                            "RP3: 骨盤リンパ節を摘出し、病理学的に転移を認めない",
                            "RP4: 骨盤リンパ節を摘出し、転移を認める"
                        ]
                    },
                    "RA": {
                        "title": "傍大動脈リンパ節に対する処置",
                        "type": "string",
                        "enum": [
                            "傍大動脈リンパ節を摘出しなかった(病理学的索が行われなかった)",
                            "傍大動脈リンパ節の選択的郭清(生検)を行った",
                            "傍大動脈リンパ節の系統的郭清(すべての所属リンパ節)を行った",
                            "センチネルリンパ節生検を行った"
                        ]
                    },
                    "RAX": {
                        "title": "傍大動脈リンパ節の所見",
                        "type": "string",
                        "enum": [
                            "RA1: 傍大動脈リンパ節の病理学的検索が行われなかったが、明らかな腫大を認めない",
                            "RA2: 傍大動脈リンパ節の病理学的検索が行われなかったが、明らかな腫大を認める",
                            "RA3: 傍大動脈リンパ節を摘出し、病理学的に転移を認めない",
                            "RA4: 傍大動脈リンパ節を摘出し、転移を認める"
                        ]
                    }
                }
            },
            "cM": {
                "$id": "#M",
                "type": "object",
                "properties": {
                    "M": {
                        "type": "string",
                        "title": "M分類",
                        "description": "鼠径リンパ節転移や腹腔内病変は遠隔転移に含む。腟,骨盤漿膜,付属器への転移は遠隔転移から除外する。",
                        "enum": [
                            "遠隔転移なし",
                            "遠隔転移あり",
                            "遠隔転移の判定不十分なとき"
                        ]
                    },
                    "L": {
                        "type": "array",
                        "title": "遠隔転移部位",
                        "items": {
                            "type": "string",
                            "enum": [
                                "L1: 縦隔リンパ節",
                                "L2: 鎖骨上(下)リンパ節",
                                "L3: 鼠径リンパ節",
                                "L9: 上記以外のリンパ節",
                                "M1: 肺",
                                "M2: 肝臓",
                                "M3: 腹膜播種",
                                "M4: 脳",
                                "M5: 骨",
                                "M9: 上記以外の実質臓器・組織"
                            ]
                        }
                    }
                }
            },
            "pM": {
                "$id": "#pM",
                "title": "M分類",
                "type": "string",
                "description": "腟、骨盤漿膜、付属器への転移は除外する。",
                "enum": [
                    "M0: 遠隔転移なし",
                    "MA1: 傍大動脈リンパ節の明らかな腫大を認めるが、病理学的検索が行われなかった",
                    "MA2: 傍大動脈リンパ節の明らかな腫大は認めないが、病理学的検索にて転移を認める",
                    "MA3: 傍大動脈リンパ節の明らかな腫大を認め、病理学的検索にて転移を認める",
                    "M1: その他の遠隔転移の存在",
                    "M9: 遠隔転移の判定不十分なとき"
                ]
            }
        }
    }
   //#endregion
   

    //#region CC_findigns   
    // "$id": "/schema/CC/findigns"
    export const CC_findigns:JSONSchema7 = {
        // TODO $schemaがうまく認識されない
        // "$schema": "../jesgo.json",
        "$id": "/schema/CC/findigns",
        "type": "object",
        "title": "診断所見",
        "properties": {
            "腫瘍最大腫瘍径": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "顕微鏡的病変",
                            "～2㎝",
                            "～4㎝",
                            "～6㎝",
                            "6㎝をこえる",
                            "測定不能"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視触診（内診、コルポスコープ診を含む）",
                            "画像診断",
                            "病理診断"
                        ]
                    }
                }
            },
            "基靭帯浸潤": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視触診（内診、コルポスコープ診を含む）",
                            "画像診断",
                            "病理診断"
                        ]
                    }
                }
            },
            "腟壁浸潤": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視触診（内診、コルポスコープ診を含む）",
                            "画像診断",
                            "病理診断"
                        ]
                    }
                }
            },
            "膀胱粘膜浸潤": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "画像診断",
                            "病理診断",
                            "膀胱鏡"
                        ]
                    }
                }
            },
            "直腸粘膜浸潤": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "画像診断",
                            "病理診断",
                            "直腸鏡・大腸鏡"
                        ]
                    }
                }
            },
            "骨盤リンパ節転移": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視診・触診",
                            "画像診断―MRI",
                            "画像診断―CT",
                            "画像診断―PET/CT",
                            "病理診断",
                            "その他"
                        ]
                    }
                }
            },
            "傍大動脈リンパ節": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視診・触診",
                            "画像診断―MRI",
                            "画像診断―CT",
                            "画像診断―PET/CT",
                            "病理診断",
                            "その他"
                        ]
                    }
                }
            },
            "その他のリンパ節転移": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視診・触診",
                            "画像診断―MRI",
                            "画像診断―CT",
                            "画像診断―PET/CT",
                            "病理診断",
                            "その他"
                        ]
                    }
                }
            },
            "リンパ節以外の遠隔転移": {
                "type": "object",
                "properties": {
                    "所見": {
                        "type": "string",
                        "enum": [
                            "あり",
                            "なし",
                            "不明・未評価"
                        ]
                    },
                    "診断方法": {
                        "type": "string",
                        "enum": [
                            "視診・触診",
                            "画像診断",
                            "病理診断"
                        ]
                    }
                }
            }
        },
        "$defs": {}
    }
    //#endregion
    
    //#region CC_findigns
    // "$id": "/schema/CC/pathology"
    export const CC_pathology:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/CC/pathology",
        "type": "object",
        "title": "組織診断",
        "description": "WHO分類2014年",
        "properties": {
            "組織型": {
                // "type": "string",
                "type": "object",   // ★書き換え
                "oneOf": [
                    {
                        "title": "上皮性腫瘍 (扁平上皮癌)",
                        "type": "string",
                        "enum": [
                            "角化型扁平上皮癌",
                            "非角化型扁平上皮癌",
                            "乳頭状扁平上皮癌",
                            "類基底細胞癌",
                            "コンジローマ様癌",
                            "疣（いぼ）状癌",
                            "扁平移行上皮癌",
                            "リンパ上皮腫様癌",
                            "扁平上皮癌（分類不能）"
                        ]
                    },
                    {
                        "title": "上皮性腫瘍 (腺癌)",
                        "type": "string",
                        "enum": [
                            "通常型内頸部腺癌",
                            "粘液性癌",
                            "胃型粘液性癌",
                            "腸型粘液性癌",
                            "印環細胞型粘液性癌",
                            "絨毛腺管癌",
                            "類内膜癌",
                            "明細胞癌",
                            "漿液性癌",
                            "中腎癌",
                            "神経内分泌癌を伴う腺癌",
                            "腺癌（分類不能）"
                        ]
                    },
                    {
                        "title": "上皮性腫瘍(その他)",
                        "type": "string",
                        "enum": [
                            "腺扁平上皮癌",
                            "すりガラス細胞癌",
                            "腺様基底細胞癌",
                            "腺様嚢胞癌",
                            "未分化癌",
                            "カルチノイド腫瘍",
                            "非定型的カルチノイド腫瘍",
                            "小細胞神経内分泌癌",
                            "大細胞神経内分泌癌",
                            "その他"
                        ]
                    },
                    {
                        "title": "間葉性腫瘍および腫瘍類似病変",
                        "type": "string",
                        "enum": [
                            "平滑筋肉腫",
                            "横紋筋肉腫",
                            "胞巣状軟部肉腫",
                            "血管肉腫",
                            "悪性末梢神経鞘腫瘍",
                            "脂肪肉腫",
                            "未分化頸管肉腫",
                            "ユーイング肉腫"
                        ]
                    },
                    {
                        "title": "上皮性・間葉性混合腫瘍",
                        "type": "string",
                        "enum": [
                            "腺肉腫",
                            "癌肉腫"
                        ]
                    },
                    {
                        "title": "メラノサイト腫瘍",
                        "type": "string",
                        "enum": [
                            "悪性黒色腫"
                        ]
                    }
                ]
            },
            "組織学的異型度": {
                "type": "string",
                "enum": [
                    "Grade 1",
                    "Grade 2",
                    "Grade 3",
                    "異型度評価の対象に含まれない",
                    "不明"
                ]
            }
        }
    }
    //#endregion

    //#region treatment_operation   
    // "$id": "/schema/CC/pathology"
    export const treatment_operation:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/treatment/operation",
        "type": "object",
        "title": "手術療法",
        "properties": {
            "手術日": {
                "type": "string",
                "format": "date",
                "jesgo:set": "eventdate"
            },
            "手術時間": {
                "description": "加刀~終刀までの時間(分)",
                // TODO：integer、もしくはstringの99:59みたいな書き方を許可している
                // UIではどう表現すべき？
                "oneOf": [
                    {
                        "type": "integer",
                        "units": "分",
                        "minimum": 0
                    },
                    {
                        "type": "string",
                        "pattern": "^([1-9][0-9]?:)?[0-5]?[0-9]$"
                    }
                ]
            },
            "出血量": {
                "description": "加刀~終刀までの出血量(g)",
                "oneOf": [
                    {
                        "type": "integer",
                        "units": "g",
                        "minimum": 0
                    },
                    {
                        "type": "string",
                        "const": "不明"
                    }
                ]
            },
            "術者": {
                "type": "array",
                "description": "筆頭に執刀医、以下を助手として入力",
                "items": {
                    "oneOf": [
                        {
                            "title":"通常入力",
                            "type": "object",
                            "properties": {
                                "name": {
                                    "title": "名前",
                                    "type": "string"
                                },
                                "property": {
                                    "title": "資格",
                                    "type": "string",
                                    "enum": [
                                        "婦人科腫瘍専門医",
                                        "産婦人科内視鏡技術認定医",
                                        "婦人科腫瘍専門医+産婦人科内視鏡技術認定医",
                                        "産婦人科専門医",
                                        "その他",
                                        "不明"
                                    ]
                                }
                            }        
                        },
                        {
                            "title":"自由入力",
                            "type": "string"
                        }
                    ]
                }
            }
    
        },
        "jesgo:subschema": [
            "/schema/treatment/operation_procedures",
            "/schema/treatment/operation_adverse_events"
        ]
    }
    
    //#endregion

    //#region treatment_chemotharapy
    // "$id": "/schema/treatment/chemotharapy"
    export const treatment_chemotharapy:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/treatment/chemotharapy",
        "title": "化学療法",
        "type": "object",
        "required": [
            "投与開始日"
        ],
        "properties": {
            "投与開始日": {
                "type": "string",
                "format": "date",
                "jesgo:set": "eventdate"
            },
            "投与終了日": {
                "type": "string",
                "format": "date"
            },
            "治療区分": {
                "type": "string",
                "enum": [
                    "化学療法",
                    "分子標的薬",
                    "化学療法+分子標的治療",
                    "その他の治療"
                ]
            },
            "レジメン名称": {
                "type": "string"
            },
            "治療情報": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "薬剤名": {
                            // "$ref": "#drugs" // ★以下に書き換え
                            "$ref": "#/$defs/drugs"
                        },
                        "投与量": {
                            "type": "number",
                            "minimum": 0
                        },
                        "投与量の単位": {
                            "type": "string",
                            "enum": [
                                "AUC",
                                "mg/m<SUP>2</SUP>",
                                "mg/kg",
                                "mg/日"
                            ]
                        }
                    },
                    // TODO 要求仕様に"column"の定義はない。要確認
                    "jesgo:ui:subschemastyle": "column"
                }
            }
        },
        "$defs": {
            "drugs": {
                "$id": "#drugs",
                // "type": "string",    // ★以下に書きかえ
                "oneOf": [
                    {
                        "title": "白金製剤",
                        "type": "string",   // ★追記
                        "enum": [
                            "シスプラチン",
                            "カルボプラチン",
                            "ネダプラチン",
                            "オキサリプラチン"
                        ]
                    },
                    {
                        "title": "アルキル化薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "シクロホスファミド",
                            "イホスファミド",
                            "メルファラン",
                            "ニムスチン",
                            "テモゾロミド",
                            "ブレオマイシン",
                            ",マイトマイシンC",
                            "アクチノマイシンD"
                        ]
                    },
                    {
                        "title": "微小管阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "パクリタキセル",
                            "ドセタキセル",
                            "ビンクリスチン",
                            "ビンデシン",
                            "ビノレルビン"
                        ]
                    },
                    {
                        "title": "トポイソメラーぜ阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "イリノテカン",
                            "ノギテカン",
                            "エトポシド",
                            "ゾブゾキサシン"
                        ]
                    },
                    {
                        "title": "代謝拮抗薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ゲムシタビン",
                            "メトトレキサート",
                            "ペメトレキセド",
                            "フルオロウラシル",
                            "テガフール・ウラシル(UFT)",
                            "テガフール・ギメラシル・オテラシル(TS-1)",
                            "カペシタビン",
                            "シタラビン(Ara-C)",
                            "メルカプトプリン(6-MP)"
                        ]
                    },
                    {
                        "title": "抗がん性抗生物質",
                        "type": "string",   // ★追記
                        "enum": [
                            "ドキソルビシン",
                            "リポソーマルドキソルビシン",
                            "ダウノルビシン",
                            "ピラルビシン",
                            "エピルビシン",
                            "イダルビシン",
                            "アクラルビシン",
                            "アムルビシン",
                            "ミトキサトロン",
                            "マイトマイシンC",
                            "アクチノマイシンD",
                            "ブレオマイシン"
                        ]
                    },
                    {
                        "title": "分子標的治療",
                        "type": "string",   // ★追記
                        "enum": [
                            "血管新生阻害薬",
                            "免疫チェックポイント阻害薬",
                            "PARP阻害薬",
                            "チロシンキナーゼ阻害薬"
                        ]
                    },
                    {
                        "title": "血管新生阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ベバシズマブ"
                        ]
                    },
                    {
                        "title": "免疫チェックポイント阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ニボルブマブ",
                            "ペムブロリズマブ",
                            "アテゾリズマブ"
                        ]
                    },
                    {
                        "title": "PARP阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "オラパリブ",
                            "ニラパリブ",
                            "ルカパリブ"
                        ]
                    },
                    {
                        "title": "チロシンキナーゼ阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "パゾパニブ",
                            "ゲフィチニブ",
                            "エルロチニブ",
                            "アファチニブ",
                            "オシメルチニブ",
                            "ダコミチニブ",
                            "ラパチニブ",
                            "アキシチニブ",
                            "スニチニブ",
                            "パゾパニブ",
                            "パンデタニブ",
                            "レゴラフェニブ",
                            "カボザンチニブ",
                            "レンバチニブ",
                            "ラロトレクチニブ",
                            "ギルテリチニブ",
                            "カプマチニブ",
                            "ペミガチニブ",
                            "テポチニブ",
                            "イブルチニブ",
                            "アカラブルチニブ",
                            "チラブルチニブ",
                            "イマチニブ",
                            "ダサチニブ",
                            "ニロチニブ",
                            "ポナチニブ",
                            "クリゾチニブ",
                            "セリチニブ",
                            "ブリグチニブ",
                            "ロルラチニブ",
                            "ソラフェニブ"
                        ]
                    },
                    {
                        "title": "ホルモン治療",
                        "type": "string",   // ★追記
                        "enum": [
                            "メドロキシプロゲステロン酢酸エステル(MPA)",
                            "アナストロゾール",
                            "タモキシフェン"
                        ]
                    }
                ]
            }
        }
    }       
    //#endregion

    //#region treatment_radiotherapy
    // "$id": "/schema/treatment/radiotherapy"
    export const treatment_radiotherapy:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/treatment/radiotherapy",
        "title": "放射線療法",
        "type": "object",
        "required": [
            "治療開始日"
        ],
        "properties": {
            "治療開始日": {
                "type": "string",
                "format": "date",
                "jesgo:set": "eventdate"
            },
            "治療終了日": {
                "type": "string",
                "format": "date"
            },
            "治療区分": {
                "type": "string",
                "enum": [
                    "腔内照射",
                    "体外照射",
                    "同時化学放射線治療(腔内照射)",
                    "同時化学放射線治療(体外照射)",
                    "核医学治療"
                ]
            },
            "照射内容": {
                "type": "array",
                "items": {
                    // "$ref": "#radiotherapy"  // ★以下に書き換え
                    "$ref": "#/$defs/radiotherapy"
                }
            },
            "同時化学療法": {
                "type": "object",
                "properties": {
                    "レジメン": {
                        "type": "string"
                    },
                    "治療情報": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "薬剤名": {
                                    // "$ref": "#drugs" // ★以下に書き換え
                                    "$ref": "#/$defs/drugs"
                                },
                                "投与量": {
                                    "type": "number",
                                    "minimum": 0
                                },
                                "投与量の単位": {
                                    "type": "string",
                                    "enum": [
                                        "AUC",
                                        "mg/m<SUP>2</SUP>",
                                        "mg/kg",
                                        "mg/日"
                                    ]
                                }
                            },
                            // TODO columnは要求仕様に記載がない
                            "jesgo:ui:subschemastyle": "column"
                        }
                    }
                }
            }
        },
        "$defs": {
            "radiotherapy": {
                "$id": "#radiotherapy",
                "type": "object",
                "properties": {
                    "照射開始日": {
                        "type": "string",
                        "format": "date"
                    },
                    "照射終了日": {
                        "type": "string",
                        "format": "date"
                    },
                    "照射方法": {
                        "type": "string",
                        "enum": [
                            "全骨盤照射",
                            "全骨盤照射(中央遮蔽あり)",
                            "3DCRT, IMRT, VMRTなど",
                            "組織内照射",
                            "核医学治療"
                        ]
                    },
                    "照射線量": {
                        "type": "number",
                        "units": "Gy"
                    },
                    "核種": {
                        "type": "string",
                        // TODO 要求仕様に記載なし。要確認
                        // "jesgo:when": {
                        //     "properties": {
                        //         "照射方法": {
                        //             "const": "核医学治療"
                        //         }
                        //     }
                        // }
                    }
                }
            },
            "drugs": {
                "$id": "#drugs",
                // "type": "string",    // ★以下に書き換え
                "oneOf": [
                    {
                        "title": "白金製剤",
                        "type": "string",   // ★追記
                        "enum": [
                            "シスプラチン",
                            "カルボプラチン",
                            "ネダプラチン",
                            "オキサリプラチン"
                        ]
                    },
                    {
                        "title": "アルキル化薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "シクロホスファミド",
                            "イホスファミド",
                            "メルファラン",
                            "ニムスチン",
                            "テモゾロミド",
                            "ブレオマイシン",
                            "マイトマイシンC",
                            "アクチノマイシンD"
                        ]
                    },
                    {
                        "title": "微小管阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "パクリタキセル",
                            "ドセタキセル",
                            "ビンクリスチン",
                            "ビンデシン",
                            "ビノレルビン"
                        ]
                    },
                    {
                        "title": "トポイソメラーぜ阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "イリノテカン",
                            "ノギテカン",
                            "エトポシド",
                            "ゾブゾキサシン"
                        ]
                    },
                    {
                        "title": "代謝拮抗薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ゲムシタビン",
                            "メトトレキサート",
                            "ペメトレキセド",
                            "フルオロウラシル",
                            "テガフール・ウラシル(UFT)",
                            "テガフール・ギメラシル・オテラシル(TS-1)",
                            "カペシタビン",
                            "シタラビン(Ara-C)",
                            "メルカプトプリン(6-MP)"
                        ]
                    },
                    {
                        "title": "抗がん性抗生物質",
                        "type": "string",   // ★追記
                        "enum": [
                            "ドキソルビシン",
                            "リポソーマルドキソルビシン",
                            "ダウノルビシン",
                            "ピラルビシン",
                            "エピルビシン",
                            "イダルビシン",
                            "アクラルビシン",
                            "アムルビシン",
                            "ミトキサトロン",
                            "マイトマイシンC",
                            "アクチノマイシンD",
                            "ブレオマイシン"
                        ]
                    },
                    {
                        "title": "分子標的治療",
                        "type": "string",   // ★追記
                        "enum": [
                            "血管新生阻害薬",
                            "免疫チェックポイント阻害薬",
                            "PARP阻害薬",
                            "チロシンキナーゼ阻害薬"
                        ]
                    },
                    {
                        "title": "血管新生阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ベバシズマブ"
                        ]
                    },
                    {
                        "title": "免疫チェックポイント阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "ニボルブマブ",
                            "ペムブロリズマブ",
                            "アテゾリズマブ"
                        ]
                    },
                    {
                        "title": "PARP阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "オラパリブ",
                            "ニラパリブ",
                            "ルカパリブ"
                        ]
                    },
                    {
                        "title": "チロシンキナーゼ阻害薬",
                        "type": "string",   // ★追記
                        "enum": [
                            "パゾパニブ",
                            "ゲフィチニブ",
                            "エルロチニブ",
                            "アファチニブ",
                            "オシメルチニブ",
                            "ダコミチニブ",
                            "ラパチニブ",
                            "アキシチニブ",
                            "スニチニブ",
                            "パゾパニブ",
                            "パンデタニブ",
                            "レゴラフェニブ",
                            "カボザンチニブ",
                            "レンバチニブ",
                            "ラロトレクチニブ",
                            "ギルテリチニブ",
                            "カプマチニブ",
                            "ペミガチニブ",
                            "テポチニブ",
                            "イブルチニブ",
                            "アカラブルチニブ",
                            "チラブルチニブ",
                            "イマチニブ",
                            "ダサチニブ",
                            "ニロチニブ",
                            "ポナチニブ",
                            "クリゾチニブ",
                            "セリチニブ",
                            "ブリグチニブ",
                            "ロルラチニブ",
                            "ソラフェニブ"
                        ]
                    },
                    {
                        "title": "ホルモン治療",
                        "type": "string",   // ★追記
                        "enum": [
                            "メドロキシプロゲステロン酢酸エステル(MPA)",
                            "アナストロゾール",
                            "タモキシフェン"
                        ]
                    }
                ]
            }
        }
    } 
    //#endregion

    //#region treatment_operation_procedures   
    // "$id": "/schema/treatment/operation_procedures/"
    export const treatment_operation_procedures:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/treatment/operation_procedures",
        "type": "array",
        "title": "実施手術",
        "items": {
            // "$ref": "#procedure"
            "$ref": "#/$defs/procedure"
        },
        "$defs": {
            "procedure": {
                "$id": "#procedure",
                "type": "object",
                "required": [
                    "術式"
                ],
                "properties": {
                    "術式": {
                        // "type": "string",    // ★削除
                        "anyOf": [
                            {
                                "title": "開腹手術",
                                "anyOf": [
                                    {
                                        "title": "子宮摘出・子宮頸部摘出術式",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腟上部切断術",
                                            "単純子宮全摘出術(筋膜内)",
                                            "単純子宮全摘出術(筋膜外)",
                                            "拡大子宮全摘術",
                                            "準広汎子宮全摘出術",
                                            "準広汎子宮頸部摘出術",
                                            "広汎子宮全摘出術",
                                            "広汎子宮全摘出術(神経温存術式)",
                                            "広汎子宮頸部摘出術"
                                        ]
                                    },
                                    {
                                        "title": "卵巣摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "右側付属器摘出術(嚢腫摘出術含む)",
                                            "左側付属器摘出術(嚢腫摘出術含む)",
                                            "両側付属器摘出術",
                                            "卵巣移動 (片側)",
                                            "卵巣移動 (両側)"
                                        ]
                                    },
                                    {
                                        "title": "骨盤リンパ節摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "骨盤リンパ節選択的郭清 (生検)",
                                            "骨盤リンパ節系統的郭清",
                                            "骨盤リンパ節センチネルリンパ節生検"
                                        ]
                                    },
                                    {
                                        "title": "傍大動脈リンパ節摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "傍大動脈リンパ節選択的郭清 (生検)",
                                            "傍大動脈リンパ節系統的郭清",
                                            "傍大動脈リンパ節センチネルリンパ節生検"
                                        ]
                                    },
                                    {
                                        "title": "大網摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "大網生検",
                                            "大網部分切除",
                                            "大網亜全摘"
                                        ]
                                    },
                                    {
                                        "title": "合併切除",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹膜播種切除",
                                            "その他の臓器の切除"
                                        ]
                                    },
                                    {
                                        // "const": "その他の開腹手術", // ★以下に書き換え
                                        "title": "その他の開腹手術",
                                        "type": "string",   // ★追記
                                    }
                                ]
                            },
                            {
                                "title": "腟式手術",
                                "type": "string",   // ★追記
                                "enum": [
                                    "子宮頸部円錐切除術(本術式のみで治療終了した場合)",
                                    "腟式単純子宮全摘術(筋膜内)",
                                    "腟式準広汎子宮全摘術(筋膜外)",
                                    "腟式広汎子宮全摘出術",
                                    "腟式広汎子宮頸部摘出術",
                                    "その他の腟式手術"
                                ]
                            },
                            {
                                "title": "腹腔鏡手術",
                                "anyOf": [
                                    {
                                        "title": "子宮摘出術式",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹腔鏡下単純子宮全摘出術(筋膜内)",
                                            "腹腔鏡下単純子宮全摘出術(筋膜外)",
                                            "腹腔鏡下準広汎子宮全摘出術",
                                            "腹腔鏡下広汎子宮全摘出術",
                                            "腹腔鏡下子宮頸部摘出術",
                                            "婦人科以外の悪性疾患による子宮全摘出術"
                                        ]
                                    },
                                    {
                                        "title": "卵巣摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹腔鏡下右付属器摘出術",
                                            "腹腔鏡下左付属器摘出術",
                                            "腹腔鏡下両付属器摘出術",
                                            "腹腔鏡下病変生検・審査腹腔鏡",
                                            "治療のために開腹手術へ移行(合併症を除く)",
                                            "リスク低減のための内性器摘出術",
                                            "妊孕性温存のための付属器摘出術",
                                            "他の悪性疾患の予防的切除術",
                                            "転移性卵巣癌による付属器摘出術"
                                        ]
                                    },
                                    {
                                        "title": "リンパ節生検・郭清",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹腔鏡下センチネルリンパ節生検",
                                            "腹腔鏡下骨盤内リンパ節郭清",
                                            "腹腔鏡下傍大動脈リンパ節郭清"
                                        ]
                                    },
                                    {
                                        "title": "大網摘出",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹腔鏡下に大網生検",
                                            "腹腔鏡下に大網部分切除",
                                            "腹腔鏡下に大網亜全摘"
                                        ]
                                    },
                                    {
                                        "title": "その他",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "腹腔鏡下に再発病巣の摘出術",
                                            "腹腔鏡下に他の診療科との合同手術",
                                            "腹腔鏡下に術後合併症の修復術"
                                        ]
                                    },
                                    {
                                        // "const": "その他の腹腔鏡手術",   // ★以下に書き換え
                                        "title": "その他の腹腔鏡手術",
                                        "type": "string",   // ★追記
                                    }
                                ]
                            },
                            {
                                "title": "ロボット支援下手術",
                                "anyOf": [
                                    {
                                        "title": "子宮摘出術式",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "ロボット支援下単純子宮全摘出術",
                                            "ロボット支援下準広汎子宮全摘出術",
                                            "ロボット支援下広汎子宮全摘出術",
                                            "ロボット支援下子宮頸部摘出術",
                                            "婦人科以外の悪性疾患によるロボット支援下子宮全摘出術"
                                        ]
                                    },
                                    {
                                        "title": "リンパ節生検・郭清",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "ロボット支援下センチネルリンパ節生検",
                                            "ロボット支援下骨盤内リンパ節郭清",
                                            "ロボット支援下傍大動脈リンパ節郭清"
                                        ]
                                    },
                                    {
                                        "title": "その他",
                                        "type": "string",   // ★追記
                                        "enum": [
                                            "治療のために開腹手術へ移行(合併症を除く)",
                                            "ロボット支援下に術後合併症の修復術"
                                        ]
                                    },
                                    {
                                        // "const": "その他のロボット支援下手術"    // ★以下に書き換え
                                        "title": "その他のロボット支援下手術",
                                        "type": "string",   // ★追記
                                    }
                                ]
                            }
                        ]        
                    },
                    "自由入力": {
                        "type": "string",
                        "jesgo:ui:visibleWhen": {
                            "properties": {
                                "術式": {
                                    "pattern": "^その他の"
                                }
                            }
                        }
                    }        
                } 
            }
        }
    }
    
    
    //#endregion

    //#region treatment_operation_adverse_events   
    // "$id": "/schema/treatment/operation_adverse_events/"
    export const treatment_operation_adverse_events:JSONSchema7 = {
        // "$schema": "../jesgo.json",
        "$id": "/schema/treatment/operation_adverse_events",
        "title": "手術合併症",
        "type": "object",
        "properties": {
            "合併症の種別": {
                "type": "string",
                "$comment": "JSGOEではAE.*.Categoryにマップ",
                "enum": [
                    "出血",
                    "術中手術操作",
                    "気腹・潅流操作",
                    "機器の不具合・破損",
                    "機器の誤操作",
                    "術中使用した薬剤",
                    "体腔内遺残",
                    "術後"
                ]
            },
            "出血量": {
                "type": "string",
                "$comment": "JSGOEではAE.*.BloodCountにマップ",
                "pattern": "(不明|([1-9][0-9]+|[5-9])[0-9][0-9])",
                "jesgo:ref": "../出血量"
                // TODO 上位に"jesgo:ref"と同名の項目がいたら、値を連動させる
            },
            "発生した合併症": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ",
            },
            "関連する機器": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Causeにマップ",
            },
            "発生部位": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Locationにマップ",
            },
            "関連する薬剤": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Causeにマップ",
            },
            // TODO 複数追加可能なselectの要素？要確認
            "遺残したもの": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ",
                // "enum": [
                //     "検体", "器械", "ガーゼなど衛生材料", "針",
                //     "上記にないもの"
                // ]
                // ★以下に書き換え
                "items": {
                    "type": "string",
                    "enum": [
                        "検体", "器械", "ガーゼなど衛生材料", "針",
                        "上記にないもの"
                    ]
                }
            },
            // TODO 複数追加可能なselectの要素？要確認
            "合併症の内容": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ",
                // "enum": [
                //     "出血", "血腫",
                //     "創部感染", "創離開", "腟断端部離開",
                //     "メッシュ露出", "腹膜炎", "子宮感染", "卵管・卵巣感染", "メッシュ感染",
                //     "イレウス", "腸閉塞", "消化管穿孔",
                //     "腹壁瘢痕・ポートサイトヘルニア",
                //     "尿管損傷", "尿路閉塞", "膀胱損傷",
                //     "肺動脈血栓塞栓症", "深部静脈血栓症",
                //     "気胸", "心肺停止",
                //     "コンパートメント症候群", "上肢神経障害", "下肢神経障害",
                //     "リンパ浮腫", "非感染性リンパ嚢胞", "感染性リンパ嚢胞・後腹膜膿瘍",
                //     "子宮腔からの出血持続", "子宮腔の癒着", "卵管閉塞"
                // ]
                // ★以下に書き換え
                "items": {
                    "type": "string",
                    "enum": [
                        "出血", "血腫",
                        "創部感染", "創離開", "腟断端部離開",
                        "メッシュ露出", "腹膜炎", "子宮感染", "卵管・卵巣感染", "メッシュ感染",
                        "イレウス", "腸閉塞", "消化管穿孔",
                        "腹壁瘢痕・ポートサイトヘルニア",
                        "尿管損傷", "尿路閉塞", "膀胱損傷",
                        "肺動脈血栓塞栓症", "深部静脈血栓症",
                        "気胸", "心肺停止",
                        "コンパートメント症候群", "上肢神経障害", "下肢神経障害",
                        "リンパ浮腫", "非感染性リンパ嚢胞", "感染性リンパ嚢胞・後腹膜膿瘍",
                        "子宮腔からの出血持続", "子宮腔の癒着", "卵管閉塞"
                    ]
                }
            },
            "Grade": {
                "type": "string",
                "title": "合併症のGrade",
                // "enum": [
                //     {
                //         "const": "1",
                //         "title": "Grade 1: 正常な術後経過からの逸脱"
                //     },
                //     {
                //         "const": "2",
                //         "title": "Grade 2: 中等症 輸血および中心静脈栄養を要する場合を含む"
                //     },
                //     {
                //         "const": "3a",
                //         "title": "Grade 3a: 全身麻酔を要さない治療介入を要する"
                //     },
                //     {
                //         "const": "3b",
                //         "title": "Grade 3b: 全身麻酔下での治療介入を要する"
                //     },
                //     {
                //         "const": "4",
                //         "title": "Grade 4: ICU管理を要する、合併症により生命を脅かす状態"
                //     },
                //     {
                //         "const": "5",
                //         "title": "Grade 5: 死亡"
                //     }
                // ]
                // ★以下に書き換え
                "anyOf": [
                    {
                        "enum": ["1"],
                        "title": "Grade 1: 正常な術後経過からの逸脱"
                    },
                    {
                        "enum": ["2"],
                        "title": "Grade 2: 中等症 輸血および中心静脈栄養を要する場合を含む"
                    },
                    {
                        "enum": ["3a"],
                        "title": "Grade 3a: 全身麻酔を要さない治療介入を要する"
                    },
                    {
                        "enum": ["3b"],
                        "title": "Grade 3b: 全身麻酔下での治療介入を要する"
                    },
                    {
                        "enum": ["4"],
                        "title": "Grade 4: ICU管理を要する、合併症により生命を脅かす状態"
                    },
                    {
                        "enum": ["5"],
                        "title": "Grade 5: 死亡"
                    }
                ]
            },
            "転帰": {
                "type": "array",
                "title": "合併症の転帰",
                "items": {
                    "type": "string",
                    "enum": [
                        "経過観察", "周術期管理の延長", "入院期間の延長", "再入院",
                        "自己血輸血・術中回収血", "輸血・血液製剤",
                        "術中の追加手術～開腹", "術中の追加手術～腹腔鏡", "術中の追加手術～子宮鏡",
                        "術中の追加手術～経腟", "術中の追加手術～その他", 
                        "術後の再手術～開腹", "術後の再手術～腹腔鏡", "術後の再手術～子宮鏡",
                        "術後の再手術～経腟", "術後の再手術～その他",
                        {
                            "const": "ICU管理",
                            "title": "合併症管理のためICU入室"
                        },
                        "死亡"
                    ]
                }
            },
            // TODO 自由入力を想定している？要確認。
            "additionalProperties": false
        },
        // TODO 独自にプログラムを組む必要があるかもしれない
        "allOf": [
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "出血"
                        }            
                    }
                },
                "then": {
                    "properties": {
                        "出血量": {
                            "type": "string",
                            "$comment": "JSGOEではAE.*.BloodCountにマップ",
                            "pattern": "(不明|([1-9][0-9]+|[5-9])[0-9][0-9])",
                            "jesgo:ref": "../出血量"
                        }
                    },
                    "required": [
                        "合併症の種別", "出血量", "Grade", "転帰"
                    ]
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "術中手術操作"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "発生した合併症": {
                            "type": "string",
                            "enum": [
                                "臓器損傷",
                                "出血"
                            ],
                            "minItems": 1
                        },
                        "発生部位": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "子宮", "卵管", "卵巣", "腟",
                                    "膀胱", "尿管",
                                    "後腹膜", "直腸", "結腸", "消化管",
                                    "腹壁", "腹壁血管", "皮下",
                                    "動脈", "静脈", "大血管動脈", "大血管静脈",
                                    "神経", "骨格系",
                                    "上記にない部位"
                                ]
                            },
                            "minItems": 1
                        }
                    },
                    "required": [
                        "合併症の種別", "発生した合併症", "発生部位", "Grade", "転帰"
                    ]
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "気腹・潅流操作"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "発生した合併症": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "皮下気腫",
                                    "ガス塞栓(炭酸ガス)", "ガス塞栓(空気)",
                                    "水中毒",
                                    "そのほか心臓障害", "そのほか呼吸器障害", "そのほか神経系障害",
                                    "上記以外"
                                ],
                                "minItems": 1
                            }
                        }
                    },
                    "required": [
                        "合併症の種別", "発生した合併症", "Grade", "転帰"
                    ]    
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "enum": [
                                "機器の不具合・破損",
                                "機器の誤操作"
                            ]
                        }
                    }
                },
                "then": {
                    "properties": {
                        "発生した合併症": {
                            "type": "string",
                            "$comment": "JSGOEではAE.*.Titleにマップ",
                            "enum": [
                                "臓器損傷",
                                "出血"
                            ]
                        },
                        "関連する機器": {
                            "type": "array",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "鉗子", "内視鏡", "カテーテル",
                                    "内視鏡関連装置", "潅流気腹装置",
                                    "トロッカー", "子宮操作器具", "組織回収器具",
                                    "止血材料", "ステープラー",
                                    "電気メス",
                                    {
                                        "const": "SUS",
                                        "title": "超音波凝固切開装置"
                                    },
                                    {
                                        "const": "VSS",
                                        "title": "ベッセルシーリングシステム"
                                    },
                                    "レーザー", "マイクロ波",
                                    "上記にないもの"
                                ],
                                "minItems": 1
                            }
                        },
                        "発生部位": {
                            "type": "array",
                            "$comment": "JSGOEではAE.*.Locationにマップ",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "子宮", "卵管", "卵巣", "腟",
                                    "膀胱", "尿管",
                                    "後腹膜", "直腸", "結腸", "消化管",
                                    "腹壁", "腹壁血管", "皮下",
                                    "動脈", "静脈", "大血管動脈", "大血管静脈",
                                    "神経", "骨格系",
                                    "上記にない部位"
                                ]
                            }
                        }
                    },
                    "required": [
                        "合併症の種別", "関連する機器", "Grade", "転帰"
                    ]
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "術中使用した薬剤"
                        }
                    }
                },
                "then": {
                    "properties": {
                        "関連する薬剤": {
                            "type": "array",
                            "$comment": "JSGOEではAE.*.Causeにマップ",
                            "enum": [
                                "バソプレッシン", "アドレナリン",
                                "インジゴカルミン",
                                "上記にないもの"
                            ]
                        },        
                        "発生した合併症": {
                            "type": "array",
                            "$comment": "JSGOEではAE.*.Titleにマップ",
                            "items": {
                                "type": "string",
                                "enum": [
                                    "アナフィラキシー",
                                    "心停止", "徐脈", "頻脈",
                                    "それ以外"
                                ]
                            }
                        }
                    },
                    "required": [
                        "関連する薬剤", "発生した合併症", "Grade", "転帰"
                    ]
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "体腔内遺残"
                        }
                    }
                },
                "then": {
                    "properties": {
                    }
                }
            },
            {
                "if": {
                    "properties": {
                        "合併症の種別": {
                            "const": "術後"
                        }
                    }
                },
                "then": {
                    "properties": {
                    }
                }
            }
        ]
    }
    //#endregion

    //#region recurrence   
    // "$id": "/schema/CC/root"
    export const recurrence: JSONSchema7 = {
        // "$schema": "./jesgo.json",
        "$id": "/schema/recurrence",
        "type": "object",
        "title": "再発",
        "description": "再発診断に関わる所見情報も併せて設定して下さい.",
        "jesgo:parentschema": [
            "/",
            "/schema/*/root"
        ],
        "required": [
            "再発確認日", "再発したがん種", "再発回数"
        ],
        "properties": {
            "再発確認日": {
                "type": "string",
                "format": "date",
                "jesgo:set": "eventdate"
            },
            "再発したがん種": {
                "type": "string",
                "enum": [
                    "子宮頸がん",
                    "子宮体がん",
                    "卵巣がん"
                ]
            },
            "再発回数": {
                "type": "string",
                "enum": [
                    "初回",
                    "2回目",
                    "3回目",
                    "4回以上"
                ]
            },
            "腹腔内の再発箇所": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": [
                        "腟断端",
                        "骨盤内",
                        "骨盤外",
                        "肝転移",
                        "骨盤内リンパ節",
                        "傍大動脈リンパ節"
                    ]
                }
            },
            "腹腔外の再発箇所": {
                "type": "array",
                "items": {
                    "type": "string",
                    "enum": [
                        "肺転移",
                        "骨転移",
                        "脳転移",
                        "骨髄転移",
                        "胸膜転移",
                        "皮膚転移",
                        "その他リンパ節転移"
                    ]
                }
            },
            "その他の再発箇所": {
                "type": "string"
            },
            "測定可能病変": {
                "type": "string"
            }
        },
        "jesgo:subschema": [
            "/schema/treatment/chemotharapy",
            "/schema/treatment/radiotherapy",
            "/schema/treatment/operation"
        ]
    }
    //#endregion
    
    export const temp_record: Schema[] = [
        // { "id": 1, "subschema": [10, 11, 12, 13, 14, 15], child_schema: [], "schema": CC_root, "title": "患者台帳 子宮頸がん" },
        { "document_id": 1, "subschema": [10, ], child_schema: [11, 12, 13, 14 ], "document_schema": CC_root, "title": "患者台帳 子宮頸がん" },    // child_Schema検証用
        { "document_id": 10, "subschema": [], child_schema: [], "document_schema": CC_staging, "title": "病期診断" },
        { "document_id": 11, "subschema": [], child_schema: [], "document_schema": CC_findigns, "title": "診断所見" },
        { "document_id": 12, "subschema": [], child_schema: [], "document_schema": CC_pathology, "title": "組織診断" },
        // { "id": 13, "subschema": [131, 132], child_schema: [], "schema": treatment_operation, "title": "手術療法" },
        { "document_id": 13, "subschema": [ ], child_schema: [131,132,15], "document_schema": treatment_operation, "title": "手術療法" },    // child_Schema検証用
        { "document_id": 14, "subschema": [], child_schema: [], "document_schema": treatment_chemotharapy, "title": "化学療法" },
        { "document_id": 15, "subschema": [],child_schema:[], "document_schema": treatment_radiotherapy, "title": "放射線療法" },
        { "document_id": 131, "subschema": [],child_schema:[], "document_schema": treatment_operation_procedures, "title": "実施手術" },
        { "document_id": 132, "subschema": [],child_schema:[], "document_schema": treatment_operation_adverse_events, "title": "手術合併症" },

        { "document_id": 2, "subschema": [14, 15, 13], child_schema: [], "document_schema": recurrence, "title": "再発" },
    ]
}

export type Schema = {
    document_id: number,
    subschema: number[],
    child_schema: number[],
    document_schema: JSONSchema7,
    title: string,
}


