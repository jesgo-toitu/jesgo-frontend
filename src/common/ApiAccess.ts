import axios, { AxiosRequestConfig } from 'axios';
import { Const } from './Const';

export interface ApiReturnObject {
  statusNum: number;
  body: unknown;
}

export const RESULT = {
  NORMAL_TERMINATION: 0,
  ABNORMAL_TERMINATION: -1,
  ID_DUPLICATION: -2,
  TOKEN_EXPIRED_ERROR: -10,
  FAILED_USER_ALREADY_REGISTERED:-100,
  FAILED_USER_ERROR:-101,
  UNAUTHORIZED_OPERATIONS:-900,  
  
};

export const METHOD_TYPE = {
  GET: 0,
  POST: 1,
  DELETE: 2,
};

const apiAccess = async (
  methodType: number,
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any = null
): Promise<ApiReturnObject> => {
  let returnObj: ApiReturnObject = {
    statusNum: RESULT.ABNORMAL_TERMINATION,
    body: null,
  };
  let token = localStorage.getItem('token');
  if (token == null) {
    token = '';
  }
  let payloadObj: AxiosRequestConfig<Record<string, unknown>> | undefined;
  if (body !== null) {
    payloadObj = {
      headers: { token },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: body,
    };
  } else {
    payloadObj = { headers: { token } };
  }

  switch (methodType) {
    case METHOD_TYPE.GET:
      await axios
        .get(`${Const.END_POINT}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          // ★TODO: ログ出す
          console.log(err);
        });
      break;

    case METHOD_TYPE.POST:
      await axios
        .post(`${Const.END_POINT}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          // ★TODO: ログ出す
          console.log(err);
        });
      break;

    case METHOD_TYPE.DELETE:
      await axios
        .delete(`${Const.END_POINT}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          // ★TODO: ログ出す
          console.log(err);
        });
      break;

    default:
  }

  if (returnObj.statusNum === RESULT.TOKEN_EXPIRED_ERROR) {
    // リフレッシュトークンから取得を行う
    const refleshToken = localStorage.getItem('reflesh_token');
    if (refleshToken !== null) {
      await axios
        .post(`${Const.END_POINT}relogin/`, { reflesh_token: refleshToken })
        .then(async (response) => {
          const refleshResponse = response.data as ApiReturnObject;
          if (refleshResponse.statusNum === RESULT.NORMAL_TERMINATION) {
            const tokens = refleshResponse.body as {
              token: string;
              reflesh_token: string;
            };
            localStorage.setItem('token', tokens.token);
            localStorage.setItem('reflesh_token', tokens.reflesh_token);

            // 再度自身を呼び直す
            returnObj = await apiAccess(methodType, url, body);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('reflesh_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('display_name');
            localStorage.removeItem('roll_id');
            returnObj = { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
          }
        })
        .catch((err) => {
          // ★TODO: ログ出す
          localStorage.removeItem('token');
          localStorage.removeItem('reflesh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('display_name');
          localStorage.removeItem('roll_id');
          console.log(err);
          returnObj = { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
        });
    } else {
      returnObj = { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
    }
  }
  return returnObj;
};

export default apiAccess;
