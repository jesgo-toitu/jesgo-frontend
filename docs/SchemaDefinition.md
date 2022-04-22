# 入力フォームのスキーマ定義仕様

## 制限事項
- `additionalProperties`は使用不可とします。（ライブラリの仕様上、不要なUIが表示されてしまうため）
- `$comment`,`example`の使用はできますが、入力フォーム作成時には除去します。（ライブラリの仕様上、エラー発生や不要なUIが表示されてしまうため）

### stringフィールド 
`type:string`のフィールド。
以下で入力フォームが切り替わる。

- 自由入力
デフォルト
```json
{
    "腫瘍登録番号": {
        "type": "string",
    }
}
```

- ドロップダウン
  - 選択肢を`enum:["XXX","XXX"]`で定義。

  ```json
  "腫瘍登録対象": {
      "type": "string",
      "enum": ["いいえ", "はい"],
  }
  ```

  - 表示値と実際の登録値を変更したい場合は、以下のように定義する。

  ```json
  "Grade": {
    "type": "string",
    "title": "合併症のGrade",
    "anyOf": [
      {
        "type":"string",
        "enum": ["1"],
        "title": "Grade 1: 正常な術後経過からの逸脱"
      },
      {
        "type":"string",
        "enum": ["2"],
        "title": "Grade 2: 中等症 輸血および中心静脈栄養を要する場合を含む"
      }
    ]
  },
  ```
  
- カレンダー入力
`"format": "date"`を指定。
```json
{
    "診断日": {
      "type": "string",
      "format": "date"
    },
}
```


### 読み取り専用
#### 概要
入力ボックスを読み取り専用にしたい場合`"readOnly": true`を設定する。
入力ボックスに表示したい値がある場合、`default`で定義する。

```json
"がん種": {
      "type": "string",
      "jesgo:required": ["JSOG"],
      "default": "子宮頸がん",
      "readOnly": true
    },
```

### 参照
`$ref:"#/$defs/[指定したいフィールドのパス]"`で、$defsのフィールドの指定ができます。

制限事項
- $idでの指定は対応していません。

```json
"properties": {
    "pTNM": {
      "type": "object",
      "title": "pTNM分類(手術を実施した症例のみ)",
      "properties": {
        "pT": {
          "$ref": "#/$defs/T"
        }
      }
    },
"$defs": {
    "T": {
      "type": "object",
      "properties": {
        "T": {
          "type": "string",
          "title": "T分類",
          "enum": [
            "TX",
            "T0",
          ]
        },
      },
    },
}
```
### 複数typeがある場合のフィールド
ドロップダウンとnumber、など、複数の入力タイプがある場合、対象のフィールド内で`oneOf[{type:AAA},{type:BBB}]`で定義する。
- 対象フィールドのtypeを指定すると、複数タイプの入力ができなくなってしまうので、注意。

```json
"T1a期の広がり": { 
    "title": "T1a期の腫瘍の水平方向の広がり", 
    // この階層でtypeは指定しない
    "oneOf": [
    {
        "type": "number",
        "minimum": 0,
        "units": "mm"
    },
    {
        "type": "string",
        "enum": ["7mm以下", "7mmを超える", "不明"]
    }
    ]
}
```


### 条件によりフィールドが切り替わる

#### A.aの入力値によって、A.b、またはAの設定を変更したい
`type:object`のフィールドに限り、直接`if~then~else`を使用できます。

```json
{
    "type": "object",
    "properties": {
        "T": {
            "type": "string",
            "enum": [
            "TX",
            "T1a1",
            "T1a2",
            "T4"
            ]
        },
        "T1a期の広がり": {
            "type": "string",
        },
    "if": {
        "properties": {
            "T": {
            "pattern": "^T1a"
        }
    }
    },
    "then": {
        "required": ["T", "T1a期の広がり"]
    },
    "else": {
        "required": ["T"]
    }
},
```
この場合、"T1a1","T1a2"が選択された場合、"T", "T1a期の広がり"が必須となり、それ以外の選択では"T"のみ必須となります。


#### Aの入力値によってBを変更したい
特定のフィールドの入力値によって、他のフィールドの表示や設定を切り替えたい場合、`allOf[{if~then~else}]`を使用します。
使用にはいくつか制限事項があります。
- 使用はスキーマの最上位のみ。各フィールドの定義内では使用しない。
- `then`,`else`に記載のあるプロパティがもともと定義されていた場合、`then`,`else`の内容が上書きではなくマージされた設定で表示される。
- `if~then`の塊が複数ある場合、`then`で定義するフィールドは全ての塊でそろえる必要がある。
  （以下の例の場合、以降のthenには必ず"腫瘍登録番号","備考"の定義が必要になる）

```json
"allOf":[
      {
        "if": {
          "properties": {
            "腫瘍登録対象": {
              "const": "はい"
            }
          }
        },
        "then": {
          "properties": {
            "腫瘍登録番号": {
              "type": "string",
              "jesgo:required": ["JSOG"],
            },
            "備考": {
              "type": "string",
            },
          }
        }
      },
      {
        "if": {
          "properties": {
            "腫瘍登録対象": {
              "const": "いいえ"
            }
          }
        },
        "then": {
          "properties": {
            "腫瘍登録番号": {}, // 非表示の場合もフィールドの記載は必要
            "備考": {
              "type": "string",
            },
          }
        }
      }
    ],
```
上記の場合、「腫瘍登録対象」で"はい"が選択されているときのみ、「腫瘍登録番号」フィールドを表示する。


## 拡張ボキャブラリー
拡張ボキャブラリーについては、要求仕様参照。
※ただし、現在は以下のみ対応しています。
- "jesgo:parentschema"
- "jesgo:required"
- "jesgo:ui:textarea"
-  jesgo:ui:visiblewhen【制限事項あり】
   -  arrayのitem内のみの使用とする。条件となる値は同階層のitemsのみとする。
   -  値はconst,enum,patternで記載可能


## 入力フォーム以外
### descrption
- `<br>`,`<br/>`は改行に置き換える。
