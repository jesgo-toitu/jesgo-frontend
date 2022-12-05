import React, { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import fileDownload from 'js-file-download';
import Prism from 'prismjs';
import 'prismjs/components/prism-jsx.min';
import 'prismjs/components/prism-json.min';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.min';
import 'prismjs/themes/prism-tomorrow.min.css';

/**
 * データ出力用View
 * @returns
 */
const OutputView = () => {
  // 表示する文字列
  const [resultStr, setResultStr] = useState<string>('');

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
      if (e.origin === window.location.origin && e.data) {
        // TODO: 本実装時はここで渡されたデータの種類を判別し、テーブル形式ならテーブルで表示する

        // eslint-disable-next-line no-prototype-builtins
        if ((e.data as object)?.hasOwnProperty('jsonData')) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          const jsonstr = JSON.stringify(e.data.jsonData, null, 2);
          setResultStr(jsonstr);
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
      alert('ダウンロード可能なデータがありません');
    }
  }, [resultStr]);

  return (
    <div>
      <div>
        <Button bsStyle="success" className="normal-button" onClick={saveClick}>
          ダウンロード
        </Button>
      </div>
      <pre style={{ margin: '1rem ' }} className="line-numbers">
        <code className="language-json">
          {resultStr || '表示可能なデータがありません'}
        </code>
      </pre>
    </div>
  );
};

export default OutputView;
