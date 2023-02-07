import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import fileDownload from 'js-file-download';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/components/prism-javascript.min';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min';
import 'prismjs/themes/prism-tomorrow.min.css';
import CsvTable from './CsvTable';
import { toShiftJIS } from '../../common/CommonUtility';

/**
 * データ出力用View
 * @returns
 */
const OutputView = () => {
  // 表示する文字列
  const [resultStr, setResultStr] = useState<string | null>('');
  const [resultTable, setResultTable] = useState<(string | number)[][]>([[]]);

  const CODE_TYPES = {
    NONE: '',
    JSON: 'language-json',
    JAVA_SCRIPT: 'language-js',
    CSV: 'csv',
  };
  const [codeType, setCodeType] = useState<string>(CODE_TYPES.NONE);

  // メッセージ受信準備が完了したら呼び元に通知する
  useEffect(() => {
    window.addEventListener(
      'DOMContentLoaded',
      (e) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        (e.currentTarget as Window).opener.postMessage(
          'output_ready',
          window.origin
        );
      },
      false
    );

    // データ受信時の処理
    window.addEventListener('message', (e) => {
      setCodeType(CODE_TYPES.NONE);
      if (e.origin === window.location.origin && e.data) {
        // TODO: 本実装時はここで渡されたデータの種類を判別し、テーブル形式ならテーブルで表示する

        // eslint-disable-next-line no-prototype-builtins
        if ((e.data as object)?.hasOwnProperty('jsonData')) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          if (e.data.jsonData) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            const jsonstr = JSON.stringify(e.data.jsonData, null, 2);
            setCodeType(CODE_TYPES.JSON);
            setResultStr(jsonstr);
          } else {
            setResultStr(null);
          }
        } else if (typeof e.data === 'string') {
          setCodeType(CODE_TYPES.JAVA_SCRIPT);
          setResultStr(e.data);
        } else if (Array.isArray(e.data)) {
          if (e.data.length > 0 && Array.isArray(e.data[0])) {
            setCodeType(CODE_TYPES.CSV);
            setResultTable(e.data);
          }
        }
      }
    });
  }, []);

  useEffect(() => {
    Prism.manual = true;
    Prism.highlightAll();
  });

  // ダウンロードボタン押下
  const saveClick = useCallback(() => {
    if (resultStr) {
      fileDownload(resultStr, 'data.json');
    } else {
      // eslint-disable-next-line no-alert
      alert('ダウンロード可能なデータがありません');
    }
  }, [resultStr]);

  const saveClickCsv = useCallback(() => {
    if (resultTable) {
      let csvText = '';
      // eslint-disable-next-line no-plusplus
      for (let index = 0; index < resultTable.length; index++) {
        const row = resultTable[index];
        let columnFirst = true;
        // eslint-disable-next-line no-plusplus
        for (let cIndex = 0; cIndex < row.length; cIndex++) {
          const column = row[cIndex];
          if (columnFirst) {
            columnFirst = false;
          } else {
            csvText += ',';
          }
          csvText +=
            typeof column === 'string' ? `"${column.replace(/"/g, '""')}"` : column.toString();
        }
        csvText += '\n';
      }

      const sjisText = toShiftJIS(csvText);

      fileDownload(sjisText, 'data.csv');
    } else {
      // eslint-disable-next-line no-alert
      alert('ダウンロード可能なデータがありません');
    }
  }, [resultTable]);

  const testTableData = [
    ['患者ID', '患者氏名', 'スキーマ', '項目', '順番', '変更前', '変更後', '上書き'],
    ['1234567890', 'テスト患者', '患者台帳 子宮頸がん > 病期診断', '治療施行状況', '', '治療施行せず', '初回手術施行', '済'],
    ['1234567890', 'テスト患者', '患者台帳 子宮頸がん > 病期診断', 'ypTNM/N/RP', '', 'センチネルリンパ節生検を行った', '骨盤リンパ節を摘出しなかった(病理学的索が行われなかった)', '済'],
    ['1234567890', 'テスト患者', '患者台帳 子宮頸がん > 病期診断', 'ypTNM/N/RPX', '', 'RP1: 骨盤リンパ節の病理学的検索が行われなかったが、明らかな腫大を認めない', 'RP2: 骨盤リンパ節の病理学的検索が行われなかったが、明らかな腫大を認める', 'スキップ'],
    ['20001', 'テスト患者2', '患者台帳 子宮頸がん > 初回治療 > 手術療法 詳細', '術者', '1', `{"名前": "テスト医師", "役割": "術者", "資格": "婦人科腫瘍専門医"}`, `{"名前": "テスト医師2", "役割": "術者", "資格": "婦人科腫瘍専門医"}`, '済'],
    ['20001', 'テスト患者2', '再発', '再発評価/腹腔内の再発箇所', '1', `骨盤内`, `肝転移`, 'スキップ'],
    ['20001', 'テスト患者2', '再発', '再発評価/腹腔内の再発箇所', '2', `腟断端`, `骨盤外`, 'スキップ'],
    ['20001', 'テスト患者2', '再発', '再発評価/腹腔内の再発箇所', '3', `あああ\nいいい`, `あああ\nううう`, 'スキップ'],
  ]

  useEffect(() => {
    setResultTable(testTableData);
    setCodeType(CODE_TYPES.CSV)
  }, [])

  return (
    <div>
      <div>
        {codeType === CODE_TYPES.JSON && (
          <Button
            bsStyle="success"
            className="normal-button"
            onClick={saveClick}
          >
            ダウンロード
          </Button>
        )}
        {codeType === CODE_TYPES.CSV && (
          <Button
            bsStyle="success"
            className="normal-button"
            onClick={saveClickCsv}
          >
            ダウンロード
          </Button>
        )}
      </div>
      {codeType !== CODE_TYPES.CSV && (
        <pre style={{ margin: '1rem ' }} className="line-numbers">
          <code className={codeType}>
            {resultStr || '表示可能なデータがありません'}
          </code>
        </pre>
      )}
      {codeType === CODE_TYPES.CSV && <CsvTable csv={resultTable} />}
    </div>
  );
};

export default OutputView;
