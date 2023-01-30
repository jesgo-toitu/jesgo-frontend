/* eslint-disable no-await-in-loop */
/* eslint-disable no-lonely-if */
import { Buffer } from 'buffer';
import { jesgoCaseDefine } from '../store/formDataReducer';
import apiAccess, { METHOD_TYPE, RESULT } from './ApiAccess';
import { toUTF8 } from './CommonUtility';
import { GetPackagedDocument } from './DBUtility';

window.Buffer = Buffer;

export type jesgoPluginColumns = {
  plugin_id: number;
  plugin_name: string;
  plugin_version?: string;
  script_text: string;
  target_schema_id?: number[];
  target_schema_id_string?: string;
  all_patient: boolean;
  update_db: boolean;
  attach_patient_info: boolean;
  show_upload_dialog: boolean;
  filter_schema_query?: string;
  explain?: string;
};

type argDoc = {
  caseList: jesgoCaseDefine[];
  targetSchemas?: number[] | undefined;
  targetDocument?: number | undefined;
  filterQuery: string | undefined;
};

type updateObject = {
  isConfirmed?: boolean;
  document_id?: number;
  case_id?: number;
  hash?: string;
  case_no?: string;
  schema_id?: string;
  target: Record<string, string | number>;
};

let pluginData: jesgoPluginColumns;
let targetCaseId: number;

// モジュールのFunc定義インターフェース
interface IPluginModule {
  init: () => Promise<string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  main: (doc: any, func: (args: any[]) => Promise<any>) => Promise<unknown>;
  finalize?: () => Promise<void>;
}

const GetModule: (scriptText: string) => Promise<IPluginModule> = async (
  scriptText: string
) => {
  // バックエンドから読み込み予定のスクリプト文字列
  const readScriptText = Buffer.from(scriptText).toString('base64');
  const script = `data:text/javascript;base64,${readScriptText}`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const pluginmodule: Promise<IPluginModule> = await import(
    /* webpackIgnore: true */ script
  ); // webpackIgnoreコメント必要
  return pluginmodule;
};

export const moduleInit = (scriptText: string) => {
  // モジュール読み込みからのinit実行

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  GetModule(scriptText).then((module) => {
    // eslint-disable-next-line no-void
    void module.init().then();
  });
};

const getPatientsDocument = async (doc: argDoc) => {
  const schemaIds =
    doc.targetSchemas && doc.targetSchemas.length > 0
      ? doc.targetSchemas
      : undefined;
  const ret = await GetPackagedDocument(
    doc.caseList,
    schemaIds,
    undefined,
    doc.filterQuery,
    true
  );
  if (ret.resCode === RESULT.NORMAL_TERMINATION) {
    return ret;
  }
  return undefined;
};

const getTargetDocument = async (doc: argDoc) => {
  const ret = await GetPackagedDocument(
    doc.caseList,
    undefined,
    doc.targetDocument,
    doc.filterQuery,
    true
  );
  if (ret.resCode === RESULT.NORMAL_TERMINATION) {
    return ret;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updatePatientsDocument = async (doc: updateObject | updateObject[] | undefined) => {
  if(!doc){
    // 処理を中止
    // eslint-disable-next-line no-alert
    alert('更新用オブジェクトが不足しています');
    return;
  }

  // 改修用スキップフラグ
  const isSkip = false;

  // 引数を配列でなければ配列にする
  const localUpdateTarget = Array.isArray(doc)? doc : [doc];
  if (pluginData) {
    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < localUpdateTarget.length; index++) {
      if(targetCaseId){
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      localUpdateTarget[index].case_id = targetCaseId;
      }
      if(!localUpdateTarget[index].schema_id && pluginData.target_schema_id_string){
        localUpdateTarget[index].schema_id = pluginData.target_schema_id_string;
      }

      let confirmMessage:string[] = [];
      if(!isSkip) {
        const ret = await apiAccess(
          METHOD_TYPE.POST,
          `plugin-update`,
          localUpdateTarget[index]
        );
        if (ret.statusNum === RESULT.NORMAL_TERMINATION) {
          confirmMessage = ret.body as string[];
        }
      }

      // eslint-disable-next-line
      if(isSkip || confirmMessage.length > 0 && confirm(confirmMessage.join("\n"))) {
        localUpdateTarget[index].isConfirmed = true;
        const ret = await apiAccess(
          METHOD_TYPE.POST,
          `plugin-update`,
          localUpdateTarget[index]
        );
        if (ret.statusNum !== RESULT.NORMAL_TERMINATION) {
          // eslint-disable-next-line no-alert
          alert('更新に失敗しました');
        }
      }
    }
  }
};

export const moduleMain = async (
  scriptText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (doc: any) => Promise<any>,
  doc?: { caseList?: jesgoCaseDefine[]; targetSchemas?: number[] }
): Promise<unknown> => {
  // モジュール読み込みからのmain実行
  const module = await GetModule(scriptText);
  const retValue = await module.main(doc, func);
  if (module.finalize) {
    await module.finalize();
  }

  return retValue;
};

type formDocument = {
  document_id?: number,
  case_id?: number,
  schema_id?: string,
  document: JSON,
}

export const moduleMainUpdate = async (
  scriptText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  func: (doc: any) => Promise<any>,
  doc?: string | formDocument[]
): Promise<unknown> => {
  // モジュール読み込みからのmain実行、引数にCSVファイルを利用することあり
  const module = await GetModule(scriptText);
  const retValue = await module.main(doc, func);
  if (module.finalize) {
    await module.finalize();
  }

  return retValue;
};

const getDocuments = async (caseId:number|undefined, schemaIds:number[]|undefined) => {
  let param = '';
  if(caseId){
    param += `?caseId=${caseId}`;
  }
  if(schemaIds){
    if(param.length > 0){
      param += '&';
    }else{
      param += '?';
    }
    param += `schemaIds=${schemaIds.join(',')}`;
  }
  const ret = await apiAccess(
    METHOD_TYPE.GET,
    `getPatientDocuments${param}`
  );
  if (ret.statusNum === RESULT.NORMAL_TERMINATION) {
    return ret.body as formDocument[];
  }
  return [];
}

export const executePlugin = async (
  plugin: jesgoPluginColumns,
  patientList: jesgoCaseDefine[] | undefined,
  targetDocumentId: number | undefined = undefined,
  setReload:
    | ((value: React.SetStateAction<boolean>) => void)
    | undefined = undefined
) => {
  pluginData = plugin;
  if (plugin.update_db) {
    // データ更新系
    if (patientList && patientList.length === 1) {
      // 対象患者が指定されている場合
      targetCaseId = Number(patientList[0].case_id);
    }
    if (plugin.show_upload_dialog) {
      // ファイルアップロードあり
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.onchange = () => {
        const files = fileInput.files;
        const file = files ? files[0] : undefined;
        let csvText = '';
        if (file) {
          const reader = new FileReader();
          reader.onload = async () => {
            const data = reader.result;
            if (typeof data === 'string') {
              csvText = new TextDecoder().decode(toUTF8(data));
            }
            const retValue = await moduleMainUpdate(
              plugin.script_text,
              updatePatientsDocument,
              csvText
            );
            if (setReload) {
              setReload(true);
            }
            return retValue;
          };
          reader.readAsBinaryString(file);
        }
      };
      fileInput.click();
    } else {
      // ファイルアップロードなし
      const documentList:formDocument[] = await getDocuments(targetCaseId, pluginData.target_schema_id);
      const retValue = await moduleMainUpdate(
        plugin.script_text,
        updatePatientsDocument,
        documentList
      );
      return retValue;
    }
  } else {
    if (
      plugin.attach_patient_info &&
      // eslint-disable-next-line no-restricted-globals, no-alert
      !confirm('出力結果に患者情報が含まれています、実行しますか？')
    ) {
      return undefined;
    }
    // データ出力系)
    if (patientList) {
      if (targetDocumentId) {
        // ドキュメント指定あり
        const doc: argDoc = {
          caseList: patientList,
          targetDocument: targetDocumentId,
          filterQuery: plugin.filter_schema_query,
        };
        const retValue = await moduleMain(
          plugin.script_text,
          getTargetDocument,
          doc
        );
        return retValue;
      }
      if (plugin.target_schema_id && plugin.target_schema_id.length > 0) {
        // スキーマ指定あり
        const doc: argDoc = {
          caseList: patientList,
          targetSchemas: plugin.target_schema_id,
          filterQuery: plugin.filter_schema_query,
        };
        const retValue = await moduleMain(
          plugin.script_text,
          getPatientsDocument,
          doc
        );
        return retValue;
      }
      // ドキュメント、スキーマ指定なし
      const doc: argDoc = {
        caseList: patientList,
        targetSchemas: undefined,
        filterQuery: plugin.filter_schema_query,
      };
      const retValue = await moduleMain(
        plugin.script_text,
        getPatientsDocument,
        doc
      );
      return retValue;
    }
    // eslint-disable-next-line no-alert
    alert('対象患者がいません');
  }
  return undefined;
};
