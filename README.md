# 婦人科悪性腫瘍総合入力システム JESGO
婦人科悪性腫瘍総合入力システムの開発環境（フロントエンド）です。
プロトタイプ版のため、以下の制限事項があります。

## 制限事項
※2022/02/18現在
- 画面はログイン、症例登録のみ
  - ログイン
    - デザインは要求仕様のもの。ログインができる。認証については一部仮でスタブを使用。
  - リスト
    - 表示項目DBから取得した体の仮JSONを元に作成。
    - 検索等の表示項目は頂いた仕様書をベースに作成。
    - 虫眼鏡ボタンで検索、目ボタンで詳細表示、検索フォームの×ボタンで通常表示に戻る。
    - 新規作成ボタン、各項目の編集ボタンで症例登録ページへ遷移(編集もプロトタイプ時点だと新規作成に飛ぶ)。
  - 症例登録
    - バックエンドとの通信はなし。スキーマ定義はDB値ではなく仮に配置したjsonファイルから取得。（2022/01/04に受領したもの）
    - ルートドキュメントの指定があるもの、または他スキーマでsubschemaの指定があるスキーマのみ表示（全21ファイル）
      - ただし、以下については条件が複雑で独自に対応が必要なため、今回は表示対象外
        - /schema/EM/staging
        - /schema/OV/staging
        - /schema/treatment/operation_adverse_events
      - デモ用として、以下定義を追加
        - `/schema/evaluations/exam`(内診・超音波)を`/schema/CC/root`(子宮頸癌)のchildschemaとして追加。
          - `/schema/evaluations/exam`(内診・超音波)のchildschemaに以下を追加。
            - `/schema/evaluations/cervix`(子宮頸部検査)
            - `/schema/evaluations/colposcopy`(コルポスコピー)
            - `/schema/records/pathlogy_report`(病理診断レポート)
    - ライブラリに合わせて一部スキーマの書き換えあり。
    - 入力フォームの自動生成部分で未対応箇所多数あり。
    - コントロールボタンは以下のみ対応
      - ルートドキュメント、およびchildschemaのドキュメント追加・削除（初期化は処理未実装）
      - ルートドキュメント、およびchildschemaの順序の入れ替え

## 動作環境
Wiki参照。

## 変更履歴
- 2022-02-03 プロトタイプ初版を公開 v0.0.1
- 2022-02-18 プロトタイプ第2版を公開 v0.0.2
- 2022-02-22 プロトタイプ第3版を公開 v0.0.3
- 2022-02-24 プロトタイプ第4版を公開 v0.0.4
- 2022-02-24 プロトタイプ第5版を公開 v0.0.5