import { JSONSchema7 } from "json-schema";

// TODO プロトタイプ用jsonSchemaクラス。本来はDBから取得
export namespace DevSchema {

    //#region CC_root
    export const CC_root_id : number = 1;
    export const CC_root_subschema: number[] = [10, 11, 12, 13, 14, 15];
    
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
                ]
            },
            // TODO 一旦非表示
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

    //#region CC_findigns
    export const CC_findigns_id : number = 11;
    export const CC_findigns_subschema: number[] = [];
    
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
    export const CC_pathology_id : number = 12;
    export const CC_pathology_subschema: number[] = [];
    
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
    // TODO 仮の値。本来はDBから取得
    export const treatment_operation_id : number = 13;
    export const treatment_operation_subschema: number[] = [131, 132];
    
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

    //#region treatment_operation_procedures
    // TODO 仮の値。本来はDBから取得
    export const treatment_operation_procedures_id : number = 131;
    export const treatment_operation_procedures_subschema: number[] = [];
    
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
                        "type": "string",
                        "anyOf": [
                            {
                                "title": "開腹手術",
                                "anyOf": [
                                    {
                                        "title": "子宮摘出・子宮頸部摘出術式",
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
                                        "enum": [
                                            "骨盤リンパ節選択的郭清 (生検)",
                                            "骨盤リンパ節系統的郭清",
                                            "骨盤リンパ節センチネルリンパ節生検"
                                        ]
                                    },
                                    {
                                        "title": "傍大動脈リンパ節摘出",
                                        "enum": [
                                            "傍大動脈リンパ節選択的郭清 (生検)",
                                            "傍大動脈リンパ節系統的郭清",
                                            "傍大動脈リンパ節センチネルリンパ節生検"
                                        ]
                                    },
                                    {
                                        "title": "大網摘出",
                                        "enum": [
                                            "大網生検",
                                            "大網部分切除",
                                            "大網亜全摘"
                                        ]
                                    },
                                    {
                                        "title": "合併切除",
                                        "enum": [
                                            "腹膜播種切除",
                                            "その他の臓器の切除"
                                        ]
                                    },
                                    {
                                        "const": "その他の開腹手術"
                                    }
                                ]
                            },
                            {
                                "title": "腟式手術",
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
                                        "enum": [
                                            "腹腔鏡下センチネルリンパ節生検",
                                            "腹腔鏡下骨盤内リンパ節郭清",
                                            "腹腔鏡下傍大動脈リンパ節郭清"
                                        ]
                                    },
                                    {
                                        "title": "大網摘出",
                                        "enum": [
                                            "腹腔鏡下に大網生検",
                                            "腹腔鏡下に大網部分切除",
                                            "腹腔鏡下に大網亜全摘"
                                        ]
                                    },
                                    {
                                        "title": "その他",
                                        "enum": [
                                            "腹腔鏡下に再発病巣の摘出術",
                                            "腹腔鏡下に他の診療科との合同手術",
                                            "腹腔鏡下に術後合併症の修復術"
                                        ]
                                    },
                                    {
                                        "const": "その他の腹腔鏡手術"
                                    }
                                ]
                            },
                            {
                                "title": "ロボット支援下手術",
                                "anyOf": [
                                    {
                                        "title": "子宮摘出術式",
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
                                        "enum": [
                                            "ロボット支援下センチネルリンパ節生検",
                                            "ロボット支援下骨盤内リンパ節郭清",
                                            "ロボット支援下傍大動脈リンパ節郭清"
                                        ]
                                    },
                                    {
                                        "title": "その他",
                                        "enum": [
                                            "治療のために開腹手術へ移行(合併症を除く)",
                                            "ロボット支援下に術後合併症の修復術"
                                        ]
                                    },
                                    {
                                        "const": "その他のロボット支援下手術"
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
    export const treatment_operation_adverse_events_id : number = 132;
    export const treatment_operation_adverse_events_subschema: number[] = [];
    
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
            },
            "発生した合併症": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ"            
            },
            "関連する機器": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Causeにマップ"
            },
            "発生部位": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Locationにマップ"
            },
            "関連する薬剤": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Causeにマップ"
            },
            "遺残したもの": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ",
                "enum": [
                    "検体", "器械", "ガーゼなど衛生材料", "針",
                    "上記にないもの"
                ]
            },
            "合併症の内容": {
                "type": "array",
                "$comment": "JSGOEではAE.*.Titleにマップ",
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
            },
            "Grade": {
                "type": "string",
                "title": "合併症のGrade",
                "enum": [
                    {
                        "const": "1",
                        "title": "Grade 1: 正常な術後経過からの逸脱"
                    },
                    {
                        "const": "2",
                        "title": "Grade 2: 中等症 輸血および中心静脈栄養を要する場合を含む"
                    },
                    {
                        "const": "3a",
                        "title": "Grade 3a: 全身麻酔を要さない治療介入を要する"
                    },
                    {
                        "const": "3b",
                        "title": "Grade 3b: 全身麻酔下での治療介入を要する"
                    },
                    {
                        "const": "4",
                        "title": "Grade 4: ICU管理を要する、合併症により生命を脅かす状態"
                    },
                    {
                        "const": "5",
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
            "additionalProperties": false
        },
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


    export const temp_record = [
        { "id": CC_root_id, "subschema": CC_root_subschema, "schema": CC_root, "title": "患者台帳 子宮頸がん" },
        { "id": CC_findigns_id, "subschema": CC_findigns_subschema, "schema": CC_findigns, "title": "診断所見" },
        { "id": CC_pathology_id, "subschema": CC_pathology_subschema, "schema": CC_pathology, "title": "組織診断" },
        { "id": treatment_operation_id, "subschema": treatment_operation_subschema, "schema": treatment_operation, "title": "手術療法" },
        { "id": treatment_operation_procedures_id, "subschema": treatment_operation_procedures_subschema, "schema": treatment_operation_procedures, "title": "実施手術" },
        { "id": treatment_operation_adverse_events_id, "subschema": treatment_operation_adverse_events_subschema, "schema": treatment_operation_adverse_events, "title": "実施手術" },
    ]
}


