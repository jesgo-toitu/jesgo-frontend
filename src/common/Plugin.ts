/* eslint-disable no-lonely-if */
import { Buffer } from 'buffer';
import { jesgoCaseDefine } from '../store/formDataReducer';
import { RESULT } from './ApiAccess';
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
  caseList:jesgoCaseDefine[];
  targetSchemas?:number[]|undefined;
  targetDocument?:number|undefined
  filterQuery:string|undefined;
}

// モジュールのFunc定義インターフェース
interface IPluginModule {
    init: () => Promise<string>;
    main: ( doc:any, func:(args:any[])=>Promise<any> ) => Promise<unknown>;
}

const GetModule: (scriptText:string) => Promise<IPluginModule> = async (scriptText:string) => {
    // バックエンドから読み込み予定のスクリプト文字列
    const readScriptText = Buffer.from(scriptText).toString('base64');
    const script = `data:text/javascript;base64,${readScriptText}`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const pluginmodule: Promise<IPluginModule> = await import(
      /* webpackIgnore: true */ script
    ); // webpackIgnoreコメント必要
    return pluginmodule;
};

export const moduleInit = (scriptText:string) => {

  // モジュール読み込みからのinit実行

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  GetModule(scriptText).then((module) => {
    // eslint-disable-next-line no-void
    void module.init().then((res) => {
      console.log("init")
      console.log(res)
    });
  });
};

const getPatientsDocument = async (doc:argDoc) => {
  const schemaIds = doc.targetSchemas && doc.targetSchemas.length > 0 ? doc.targetSchemas : undefined;
  const ret = await GetPackagedDocument(doc.caseList, schemaIds, undefined, doc.filterQuery, true);
  if(ret.resCode === RESULT.NORMAL_TERMINATION){
    return ret;
  }
  return undefined;
}

const getTargetDocument = async (doc:argDoc) => {
  const ret = await GetPackagedDocument(doc.caseList, undefined, doc.targetDocument, doc.filterQuery, true);
  if(ret.resCode === RESULT.NORMAL_TERMINATION){
    return ret;
  }
  return undefined;
}

export const moduleMain = async (scriptText:string, func:(doc:any)=>Promise<any>, doc?:{caseList?:jesgoCaseDefine[], targetSchemas?:number[]}):Promise<unknown> => {
  // モジュール読み込みからのmain実行
  const module = await GetModule(scriptText);
  const retValue = await module.main(doc, func);

  return retValue;
}

export const executePlugin = async (plugin:jesgoPluginColumns, patientList:(jesgoCaseDefine[]|undefined), targetDocumentId:number|undefined = undefined) => {
  if(plugin.update_db){
    // データ更新系
  }else{
    // データ出力系)
    if(patientList){
      if(targetDocumentId) {
        // ドキュメント指定あり
        const doc:argDoc = {caseList:patientList, targetDocument:targetDocumentId, filterQuery:plugin.filter_schema_query};
        const retValue = await moduleMain(plugin.script_text, getTargetDocument, doc);
        return retValue;
      }
      if(plugin.target_schema_id && plugin.target_schema_id.length > 0){
        // スキーマ指定あり
        const doc:argDoc = {caseList:patientList, targetSchemas:plugin.target_schema_id, filterQuery:plugin.filter_schema_query};
        const retValue = await moduleMain(plugin.script_text, getPatientsDocument, doc);
        return retValue;
      }
        // ドキュメント、スキーマ指定なし
        const doc:argDoc = {caseList:patientList, targetSchemas:undefined, filterQuery:plugin.filter_schema_query};
        const retValue = await moduleMain(plugin.script_text, getPatientsDocument, doc);
        return retValue;
    }
    alert('対象患者がいません');
  }
  return undefined;
}
