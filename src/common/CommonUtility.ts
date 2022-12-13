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
 * @param {string} calcType - 計算の種類。年齢、月齢、週齢、日齢に対応
 * @param {string | null} eventDate - 基準日
 * @returns {string} - 計算の種類に応じた計算結果
 */
export const calcAge = (
  birthday: string,
  calcType: 'age' | 'month' | 'week' | 'day' = 'age',
  eventDate: string | null = null
) => {
  if (!birthday) return '';

  let baseDate = new Date().toDateString();
  if (eventDate) {
    baseDate = eventDate;
  }

  // 生年月日
  const birthdayDateObj = new Date(birthday);
  // 基準日
  const nowDate = new Date(baseDate);

  const birthNum =
    birthdayDateObj.getFullYear() * 10000 +
    (birthdayDateObj.getMonth() + 1) * 100 +
    birthdayDateObj.getDate();

  const nowNum =
    nowDate.getFullYear() * 10000 +
    (nowDate.getMonth() + 1) * 100 +
    nowDate.getDate();

  const age = Math.floor((nowNum - birthNum) / 10000);

  // 年齢
  if (calcType === 'age') {
    return age.toString();
  }

  const dayTime = 86400000; // 1日 = 24h * 60min * 60sec * 1000ms
  const diff = nowDate.getTime() - birthdayDateObj.getTime();

  // 月齢
  if (calcType === 'month') {
    return Math.floor((diff - 365 * age) / dayTime / (365 / 12)).toString();
  }

  // 週齢
  if (calcType === 'week') {
    return Math.floor(diff / dayTime / 7).toString();
  }

  // 日齢
  if (calcType === 'day') {
    return Math.floor(diff / dayTime).toString();
  }

  return '';
};

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

const fTimeout = (timeoutSec: number) =>
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
