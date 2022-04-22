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

export const TabSelectMessage = () => confirm('保存しますか？');
