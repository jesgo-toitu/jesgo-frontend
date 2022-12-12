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

/**
 * データ出力用View
 * @returns
 */
const OutputView = () => {
  // 表示する文字列
  const [resultStr, setResultStr] = useState<string | null>('');

  const CODE_TYPES = {
    NONE: '',
    JSON: 'language-json',
    JAVA_SCRIPT: 'language-js',
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
        {codeType === CODE_TYPES.JSON && (
          <Button
            bsStyle="success"
            className="normal-button"
            onClick={saveClick}
          >
            ダウンロード
          </Button>
        )}
      </div>
      <pre style={{ margin: '1rem ' }} className="line-numbers">
        <code className={codeType}>
          {resultStr || '表示可能なデータがありません'}
        </code>
      </pre>
    </div>
  );
};

export default OutputView;
