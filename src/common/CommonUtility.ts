/* eslint-disable import/prefer-default-export */

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
