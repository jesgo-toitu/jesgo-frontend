// Message
export const StaffErrorMessage = {
    LOGINID_NOT_ENTERED  : 'ログインIDを入力してください',
    LOGINID_POLICY_ERROR : 'ログインIDは6文字以上8文字以内の半角英数字で入力してください',
    DISPLAYNAME_LENGTH_ERROR : '表示名は20文字以内で入力してください',
    DISPLAYNAME_NOT_ENTERED  : '表示名を入力してください',
    PASSWORD_NOT_ENTERED : 'パスワードを入力してください',
    PASSWORD_POLICY_ERROR : 'パスワードは半角英数字をそれぞれ1種類以上含む8文字以上20文字以内で入力してください',
    PASSWORD_COMPARE_ERROR : '確認用のパスワードが一致しません。',
    ROLL_ERROR : '権限を選択してください。',
  } as const;
  
export const Roll = {
  ROLL_ID_SYSTEM : 0
} as const;


  // 6文字以上8文字以内の半角英数字
  export const LOGINID_PATTERN = /^([a-zA-Z0-9]{6,8})$/
  // 半角英数字を含む6文字以上10文字以内
  export const PASSWORD_PATTERN = /^(?=.*?[a-z])(?=.*?\d)[a-z\d]{6,20}$/i;
  export const DISPLAYNAME_MAX_LENGTH = 20;
  
  export const rollList = [0, 1, 100, 101, 1000];
  
  export const loginIdCheck = (
    value:string
  ): boolean => {
    var regex = new RegExp(LOGINID_PATTERN);
    if (regex.test(value)) {
      console.log("正規表現パターンに一致しています。");
    }else{
      console.log("正規表現パターンに一致していません。");
      return false;
    }
    return true;
  };
  
  export const passwordCheck = (
    value:string
  ): boolean => {
    var regex = new RegExp(PASSWORD_PATTERN);
      if (regex.test(value)) {
        console.log("正規表現パターンに一致しています。");
      }else{
        console.log("正規表現パターンに一致していません。");
        return false;
      }
      return true;
  };

  export const isStaffEditEnable = (
    rool_id: string | null
  ): boolean => {

    let ret = false;

    if( rool_id != null){
      const roll = Number(rool_id);
      if( roll == Roll.ROLL_ID_SYSTEM )
        ret = true;
    }
    return ret;
  };

  
  