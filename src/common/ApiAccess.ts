import axios, { AxiosRequestConfig } from 'axios';

const CONFIG_PATH = './config.json' as string;

export type EndPointCOnfig = {
  endPointUrl: string;
};

export type Config = {
  config: EndPointCOnfig;
};

let config: Config;
export interface ApiReturnObject {
  statusNum: number;
  body: unknown;
}

export const RESULT = {
  NORMAL_TERMINATION: 0,
  ABNORMAL_TERMINATION: -1,
  ID_DUPLICATION: -2,
  NOT_FOUND_CASE: -3,
  TOKEN_EXPIRED_ERROR: -10,
  NETWORK_ERROR: -20,
  TOO_LARGE_ERROR: -30,
  FAILED_USER_ALREADY_REGISTERED: -100,
  FAILED_USER_ERROR: -101,
  PLUGIN_ALREADY_UPDATED: -201,
  UNAUTHORIZED_OPERATIONS: -900,
};

export const METHOD_TYPE = {
  GET: 0,
  POST: 1,
  DELETE: 2,
  POST_ZIP: 3,
};

const apiAccess = async (
  methodType: number,
  url: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any = null,
  uploadType = 'schemas'
): Promise<ApiReturnObject> => {
  let returnObj: ApiReturnObject = {
    statusNum: RESULT.ABNORMAL_TERMINATION,
    body: null,
  };

  await axios
    .get(CONFIG_PATH)
    .then((res) => {
      const configJson = JSON.parse(
        JSON.stringify(res.data as object)
      ) as Config;
      config = configJson;
    })
    .catch(() => {
      config.config.endPointUrl = 'http://localhost:3000';
    });

  let token = localStorage.getItem('token');
  if (token == null) {
    token = '';
  }
  // eslint-disable-next-line
  let payloadObj: AxiosRequestConfig<Record<string, any>> | undefined;

  if (body !== null) {
    // ZIPファイル送信時はファイル形式を替える
    if (methodType === METHOD_TYPE.POST_ZIP) {
      const data = new FormData();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      data.append('files', body);
      payloadObj = {
        headers: { token, 'content-type': 'multipart/form-data', uploadType },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data,
      };
    } else {
      payloadObj = {
        headers: { token },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        data: body,
      };
    }
  } else {
    payloadObj = { headers: { token } };
  }

  let errMsg: unknown;

  switch (methodType) {
    case METHOD_TYPE.GET:
      await axios
        .get(`${config.config.endPointUrl}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          errMsg = err;
        });
      break;

    case METHOD_TYPE.POST:
      await axios
        .post(`${config.config.endPointUrl}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          errMsg = err;
        });
      break;

    case METHOD_TYPE.DELETE:
      await axios
        .delete(`${config.config.endPointUrl}${url}`, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          errMsg = err;
        });
      break;

    case METHOD_TYPE.POST_ZIP:
      await axios
        .post(`${config.config.endPointUrl}${url}`, payloadObj.data, payloadObj)
        .then((response) => {
          returnObj = response.data as ApiReturnObject;
        })
        .catch((err) => {
          errMsg = err;
        });
      break;

    default:
  }

  if (errMsg !== null && errMsg !== undefined) {
    // axiosエラーのメッセージがネットワークエラーの場合その旨を返す
    if (axios.isAxiosError(errMsg) && errMsg.message === 'Network Error') {
      return { statusNum: RESULT.NETWORK_ERROR, body: null };
    }

    // axiosエラーのメッセージが転送量エラーの場合その旨を返す
    if (axios.isAxiosError(errMsg) && errMsg.response?.status === 413) {
      return { statusNum: RESULT.TOO_LARGE_ERROR, body: null };
    }
  }

  if (returnObj.statusNum === RESULT.TOKEN_EXPIRED_ERROR) {
    // リフレッシュトークンから取得を行う
    const refleshToken = localStorage.getItem('reflesh_token');
    if (refleshToken !== null) {
      await axios
        .post(`${config.config.endPointUrl}relogin/`, {
          reflesh_token: refleshToken,
        })
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
        .catch(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('reflesh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('display_name');
          localStorage.removeItem('roll_id');
          returnObj = { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
        });
    } else {
      returnObj = { statusNum: RESULT.ABNORMAL_TERMINATION, body: null };
    }
  }
  return returnObj;
};

export default apiAccess;
