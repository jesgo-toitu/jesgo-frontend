/* eslint-disable import/prefer-default-export */

import Encoding from 'encoding-japanese';

/* ここには画面機能に依存しない共通関数などを記述する */

/**
 * ページunloadイベント
 * @param e {BeforeUnloadEvent} - event
 */
const beforeunloadEvent = (e: BeforeUnloadEvent) => {
  e.returnValue = '';
};

/**
 * ページunloadイベント追加
 */
export const AddBeforeUnloadEvent = () => {
  window.addEventListener('beforeunload', beforeunloadEvent);
};

/**
 * ページunloadイベント削除
 */
export const RemoveBeforeUnloadEvent = () => {
  window.removeEventListener('beforeunload', beforeunloadEvent);
};

/**
 * 年齢計算(現在日時点)
 * @param {string} birthday - 生年月日
 * @returns {string} - 年齢
 */
export const calcAge = (birthday: string) => {
  if (!birthday) return '';

  // 生年月日
  const birthdayDateObj = new Date(birthday);
  const birthNum =
    birthdayDateObj.getFullYear() * 10000 +
    (birthdayDateObj.getMonth() + 1) * 100 +
    birthdayDateObj.getDate();

  // 現在日
  const nowDate = new Date();
  const nowNum =
    nowDate.getFullYear() * 10000 +
    (nowDate.getMonth() + 1) * 100 +
    nowDate.getDate();

  return Math.floor((nowNum - birthNum) / 10000).toString();
};

// 日付の妥当性チェック
export const isDate = (v: string) => !Number.isNaN(Date.parse(v));

// 日付(Date形式)をyyyy/MM/ddなどの形式に変換
export const formatDate = (dateObj: Date, separator = ''): string => {
  try {
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}${separator}${m}${separator}${d}`;
  } catch {
    return '';
  }
};

// 日付(Date形式)から時刻を取り出しhh:mm:ssなどの形式に変換
export const formatTime = (dateObj: Date, separator = ''): string => {
  try {
    const h = `00${dateObj.getHours()}`.slice(-2);
    const m = `00${dateObj.getMinutes()}`.slice(-2);
    const s = `00${dateObj.getSeconds()}`.slice(-2);
    return `${h}${separator}${m}${separator}${s}`;
  } catch {
    return '';
  }
};

// 日付文字列をyyyy/MM/ddなどの形式に変換
export const formatDateStr = (dtStr: string, separator: string): string => {
  if (!dtStr) return '';
  try {
    const dateObj = new Date(dtStr);
    const y = dateObj.getFullYear();
    const m = `00${dateObj.getMonth() + 1}`.slice(-2);
    const d = `00${dateObj.getDate()}`.slice(-2);
    return `${y}${separator}${m}${separator}${d}`;
  } catch {
    return '';
  }
};

export const fTimeout = (timeoutSec: number) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('timeout');
    }, timeoutSec * 1000);
  });

/**
 * タイムアウト処理
 * @param promiseFunc 実行するPromise
 * @param timeoutSec タイムアウトの秒数
 * @returns
 */
export const setTimeoutPromise = async (
  promiseFunc: () => Promise<unknown>,
  timeoutSec = 15 * 60 // デフォルト15分
) => Promise.race([fTimeout(timeoutSec), promiseFunc()]);

/**
 * Sjis変換処理
 * @param utf8String UTF8(標準)形式のString
 * @returns SJIS形式のString
 */
export const toShiftJIS = (utf8String: string) => {
  const unicodeList = [];

  for (let i = 0; i < utf8String.length; i += 1) {
    unicodeList.push(utf8String.charCodeAt(i));
  }

  const sjisArray = Encoding.convert(unicodeList, {
    to: 'SJIS',
    from: 'AUTO',
  });
  return new Uint8Array(sjisArray);
};

export const toUTF8 = (sjisString: string) => {
  const unicodeList = [];

  for (let i = 0; i < sjisString.length; i += 1) {
    unicodeList.push(sjisString.charCodeAt(i));
  }
  const sjisArray = Encoding.convert(unicodeList, {
    to: 'UTF8',
    from: 'AUTO',
  });
  return new Uint8Array(sjisArray);
};

// UUID作成
export const generateUuid = () => {
  // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
  // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  const chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  // eslint-disable-next-line no-plusplus
  for (let i = 0, len = chars.length; i < len; i++) {
      switch (chars[i]) {
          case "x":
              chars[i] = Math.floor(Math.random() * 16).toString(16);
              break;
          case "y":
              chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
              break;
          default :
      }
  }
  return chars.join("");
};

// Jsonpointerの末尾に配列指定系の文字列が含まれているかを返す
export const isPointerWithArray = (pointer:string) => {
  if(pointer.endsWith("/-")){
    return true;
  }
  const match = pointer.match(/\/(\d+)$/);
  if(match) {
    return true;
  }
  return false;
};

// Jsonpointerの末尾から配列位置指定を取得する
export const getPointerArrayNum = (pointer:string) => {
  const match = pointer.match(/\/(\d+)$/);
  if(match) {
    return Number(match.slice(1));
  }
  return -1;
};

// Jsonpointerの末尾から配列位置指定を削除する
export const getPointerTrimmed = (pointer:string) => {
  if(pointer.endsWith("/-")){
    return pointer.slice(0, -2);
  }
  const match = pointer.match(/\/(\d+)$/);
  if(match) {
    return pointer.slice(0, -(match.length))
  }
  return pointer;
};

export const getArrayWithSafe = (array:any|undefined, index:number):any|undefined => {
  // 値が空、配列じゃない場合は無条件でundefined
  if(array === null || array === undefined || !Array.isArray(array)) {
    return undefined;
  }
  // 値が配列の場合、添え字の数が配列の長さを超えてないかを見る
  if(array.length <= index) {
    return undefined;
  }
  return array[index];
}