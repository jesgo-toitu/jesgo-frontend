# 婦人科悪性腫瘍総合入力システム JESGO
婦人科悪性腫瘍総合入力システムの開発環境（フロントエンド）です。
以下の制限事項があります。

## 制限事項
※2022/04/08現在
- 画面はログイン、リスト、症例登録
   - ログイン
    - デザインは要求仕様のもの。ログインができる。
  - リスト
    - ヘッダの患者リスト表示、腫瘍登録管理表示を押下でそれぞれの表示に切替が可能。
    - 検索等の表示項目は頂いた仕様書をベースに作成。実際に使用できる検索は登録年次、がん種のみ。
      - 現在スキーマ定義はDB値ではない関係で検索の使用は不可。
    - 虫眼鏡ボタンで検索、目ボタンで詳細表示、検索フォームの×ボタンで通常表示に戻る。
    - 詳細表示時の経過・再発情報を表示するチェックボックス切替で「腫瘍登録管理表示」同情報の表示切替が可能。
    - 新規作成ボタン、各項目の編集ボタンで症例登録ページへ遷移。
    - 各項目の削除ボタンで症例の削除が可能。
    - ステータスアイコン類はスキーマ定義の関係で非表示。
    - 3年予後、5年予後の表示に関してはすべてのレコードで有効。
  - 症例登録
    - バックエンドと通信し、症例情報の読込・保存に対応
        - ヘッダの保存ボタンによる保存に対応
        - タブ切り替えによる保存は未対応
    - 症例情報(患者IDなど)の入力チェックは暫定対応
        - アラートによる警告表示
    - スキーマ定義はDB値ではなく仮に配置したjsonファイルから取得
        - src/temp/schema
    - ライブラリに合わせて一部スキーマの書き換えあり
    - コントロールボタンは以下対応
        - ルートドキュメント、およびchildschemaのドキュメント追加・削除・初期化
        - ルートドキュメント、およびchildschemaの順序の入れ替え
    - "jesgo:ui:subschemastyle": "tab"によるサブスキーマ・子スキーマのタブ化対応(v0.0.9)

## 動作環境
Wiki参照。

## 変更履歴
- 2022-02-03 プロトタイプ初版を公開 v0.0.1
- 2022-02-18 プロトタイプ第2版を公開 v0.0.2
- 2022-02-22 プロトタイプ第3版を公開 v0.0.3
- 2022-02-24 プロトタイプ第4版を公開 v0.0.4
- 2022-02-24 プロトタイプ第5版を公開 v0.0.5
- 2022-02-28 プロトタイプ第6版を公開 v0.0.6
- 2022-04-01 アルファ初版を公開 v0.0.7
- 2022-04-08 アルファ第2版を公開 v0.0.8
- 2022-04-12 アルファ第3版を公開 v0.0.9
