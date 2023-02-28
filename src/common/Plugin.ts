/* eslint-disable no-loop-func */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-lonely-if */
import { Buffer } from 'buffer';
import React from 'react';
import { OverwriteDialogPlop, overwriteInfo, overWriteSchemaInfo } from '../components/common/PluginOverwriteConfirm';
import { jesgoCaseDefine } from '../store/formDataReducer';
import apiAccess, { METHOD_TYPE, RESULT } from './ApiAccess';
import { OpenOutputView } from './CaseRegistrationUtility';
import { generateUuid, getArrayWithSafe, getPointerTrimmed, isPointerWithArray, toUTF8 } from './CommonUtility';
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
  schema_ids?: number[]
  target: Record<string, string | number>;
};

let pluginData: jesgoPluginColumns;
let targetCaseId: number|undefined;
let setOverwriteDialogPlopGlobal: React.Dispatch<React.SetStateAction<OverwriteDialogPlop | undefined>> | undefined;
let setIsLoadingGlobal: React.Dispatch<React.SetStateAction<boolean>> | undefined;

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
    pluginData.attach_patient_info
  );
  if (ret.resCode === RESULT.NORMAL_TERMINATION) {
    return ret.anyValue ? JSON.stringify(ret.anyValue) : undefined;
  }
  return undefined;
};

const getTargetDocument = async (doc: argDoc) => {
  const ret = await GetPackagedDocument(
    doc.caseList,
    undefined,
    doc.targetDocument,
    doc.filterQuery,
    pluginData.attach_patient_info
  );
  if (ret.resCode === RESULT.NORMAL_TERMINATION) {
    return ret;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const updatePatientsDocument = async (doc: updateObject | updateObject[] | undefined) => {
  
  type updateCheckObject = {
    uuid?: string;
    pointer: string;
    record: string | number | any[] | undefined;
    document_id: number;
    schema_title?: string;
    current_value?: string | number | any[] | undefined;
    updated_value?: string | number | any[] | undefined;
  };
  
  type checkApiReturnObject = {
    his_id?:string;
    patient_name?:string;
    checkList:updateCheckObject[];
    updateList:updateCheckObject[];
  };
  
  type overwroteObject = {
    his_id: string, 
    patient_name: string;
    schema_title:string;
    pointer: string;
    current_value?: string | number | any[] | undefined;
    updated_value?: string | number | any[] | undefined;
    isArray: boolean;
    overwrote: boolean;
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const modalHide = () => {}

  if(!doc){
    // 処理を中止
    // eslint-disable-next-line no-alert
    alert('更新用オブジェクトが不足しています');
    return;
  }  

  // スキップフラグ
  let isSkip = false;

  // 引数を配列でなければ配列にする
  const localUpdateTarget = Array.isArray(doc)? doc : [doc];
  
  if (pluginData) {
    // 最初に症例IDとドキュメントIDの組み合わせリストを取得する
    const caseIdAndDocIdListRet = await apiAccess(
      METHOD_TYPE.GET,
      `getCaseIdAndDocIdList`
    );
    
    // ハッシュと症例IDの組み合わせリストも取得する
    const caseIdAndHashListRet = await apiAccess(
      METHOD_TYPE.GET,
      `getCaseIdAndHashList`
    );

    // 腫瘍登録番号と症例IDの組み合わせリストも取得する
    const caseIdAndCaseNoListRet = await apiAccess(
      METHOD_TYPE.GET,
      `getCaseIdAndCaseNoList`
    );
  
    const caseIdAndDocIdList = caseIdAndDocIdListRet.body as {case_id: number; document_id: number;}[];
    const caseIdAndHashList = caseIdAndHashListRet.body as {case_id: number; hash: string;}[];
    const caseIdAndCaseNoList = caseIdAndCaseNoListRet.body as {case_id: number; caseNo: string;}[];

    const updateObjByCase:Map<number, updateObject[]> = new Map();
    const overwroteList: overwroteObject[] = [];
    

    // eslint-disable-next-line no-plusplus
    for (let index = 0; index < localUpdateTarget.length; index++) {
      let tempCaseId:number|undefined;
      if(targetCaseId){
        tempCaseId = targetCaseId;
      } 
      else if(localUpdateTarget[index].case_id) {
        tempCaseId = localUpdateTarget[index].case_id;
      } 
      else if(localUpdateTarget[index].hash) {
        tempCaseId = caseIdAndHashList.find(p => p.hash === localUpdateTarget[index].hash)?.case_id;
      } 
      else if(localUpdateTarget[index].case_no) {
        tempCaseId = caseIdAndCaseNoList.find(p => p.caseNo === localUpdateTarget[index].case_no)?.case_id;
      } 
      else if(localUpdateTarget[index].document_id) {
        tempCaseId = caseIdAndDocIdList.find(p => p.document_id === localUpdateTarget[index].document_id)?.case_id;
      }

      if(tempCaseId){
        if(!updateObjByCase.get(tempCaseId)){
          updateObjByCase.set(tempCaseId, []);
        }
        const oldObj = updateObjByCase.get(tempCaseId);
        if(Array.isArray(oldObj))
        updateObjByCase.set(tempCaseId, oldObj.concat(localUpdateTarget[index]));
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for await (const [key, value] of updateObjByCase.entries()) {
      // 症例毎の処理
      // targetが複数あるものをバラしたものを入れるための配列
      const updateApiObjects:updateObject[] = [];

      for (let index = 0; index < value.length; index++) {
        const obj = value[index];
        // eslint-disable-next-line
        for(const targetKey in obj.target) {
          const newObj:updateObject = {
            document_id: obj.document_id,
            case_id: targetCaseId,
            hash: obj.hash,
            case_no: obj.case_no,
            schema_id: obj.schema_id,
            schema_ids: pluginData.target_schema_id,
            target: {[targetKey]:obj.target[targetKey]},
          }
          updateApiObjects.push(newObj);
        }
      }
      // 全てのアップデート用オブジェクトを分解し終えたら症例毎にAPIに送る

      const ret = await apiAccess(
        METHOD_TYPE.POST,
        `plugin-update`,
        {case_id:key, objects:updateApiObjects}
      );

      // 上書き結果表示用オブジェクト変換用関数
      const getOverwroteObject = (target:updateCheckObject, hisId:string, patientName:string, isOverwrote:boolean) => {
        let tmpPointer = target.pointer.slice(1);
        let isArray = false;
        // 配列用のポインターかをチェックし、そうならポインター末尾を切り取り
        if(isPointerWithArray(tmpPointer)) {
          tmpPointer = getPointerTrimmed(tmpPointer);
          isArray = true;
        } else if(Array.isArray(target.current_value) || Array.isArray(target.updated_value)){
          // 配列用のポインターで無くても中が配列なら配列として処理する
          isArray = true;
        }

        const overwrote:overwroteObject = {
          his_id: hisId,
          patient_name: patientName,
          pointer: tmpPointer,
          schema_title: target.schema_title??"",
          current_value: target.current_value,
          updated_value: target.updated_value,
          isArray,
          overwrote: isOverwrote,
        }
        
        return overwrote;
      }

      // 返ってきたオブジェクトのうちチェック用オブジェクトを処理する
      if(ret.statusNum === RESULT.NORMAL_TERMINATION){
        const retData = ret.body as checkApiReturnObject;
        const data: overwriteInfo = {
          his_id: retData.his_id ?? "",
          patient_name: retData.patient_name ?? "",
          schemaList: [],
        };

        if(isSkip) {
          retData.updateList = retData.updateList.concat(retData.checkList);
          for (let index = 0; index < retData.checkList.length; index++) {
            const target = retData.checkList[index];
            overwroteList.push(getOverwroteObject(target, data.his_id, data.patient_name, true));
          }
        } else {
          for (let index = 0; index < retData.checkList.length; index++) {
            const checkData = retData.checkList[index];
            const existIndex = data.schemaList?.findIndex(p => p.schema_title === checkData.schema_title);
            
            if(existIndex != null && existIndex !== -1){
              checkData.uuid = generateUuid();
              const itemData = {
                isOverwrite: true,
                uuid: checkData.uuid,
                item_name: checkData.pointer.slice(1),
                current_value: checkData.current_value,
                updated_value: checkData.updated_value,
              }
              data.schemaList?.[existIndex].itemList.push(itemData);
            }else{
              checkData.uuid = generateUuid();
              const schemaData = {
                schema_title: checkData.schema_title ?? "",
                itemList: [
                  {
                    isOverwrite: true,
                    uuid: checkData.uuid,
                    item_name: checkData.pointer.slice(1),
                    current_value: checkData.current_value,
                    updated_value: checkData.updated_value,
                  }
                ],
              }
              data.schemaList?.push(schemaData);
            }
          }
        }

        // チェック用ダイアログ表示処理
        if(setOverwriteDialogPlopGlobal && setIsLoadingGlobal && data.schemaList && data.schemaList.length > 0){
          setIsLoadingGlobal(false);
          const modalRet = await new Promise<{result:boolean, skip:boolean, body:overWriteSchemaInfo[]}>((resolve) => {
            setOverwriteDialogPlopGlobal?.({
              show: true,
              onHide: () => modalHide,
              onClose: resolve,
              title:"JESGO",
              type:"Confirm",
              data,
            });
          });
          setOverwriteDialogPlopGlobal?.(undefined);
          setIsLoadingGlobal(true)
          // OKボタンが押されたときのみ処理
          if(modalRet.result) {
            // 以降スキップがONならフラグを立てる
            isSkip = modalRet.skip;

            // 上書きフラグがtrueの物のみアップデートリストに追加する
            modalRet.body.map(schema => {
              schema.itemList.map(item => {
                const processedItem = retData.checkList.find(c => c.uuid === item.uuid);
                if(processedItem){
                  if(item.isOverwrite){
                    retData.updateList.push(processedItem);
                  }
                  overwroteList.push(getOverwroteObject(processedItem, data.his_id, data.patient_name, item.isOverwrite));
                }
              })
            })
          }
        }

        // チェックの有無に関わらず更新リストに書いてある内容をすべて更新する
        await apiAccess(
          METHOD_TYPE.POST,
          `executeUpdate`,
          retData.updateList
        );
      }
    };

    // 全ての症例の処理が終わったあとに上書きリストを出力する
    if(overwroteList.length > 0){
      const csv:string[][] = [
        ["患者ID","患者氏名","スキーマ","項目","順番","変更前","変更後","上書き",]
      ];

      const getCsvRow = (target:overwroteObject, arrayNum:number|undefined = undefined) => {
        let currentValue:string;
        let updatedValue:string;
        if(typeof target.current_value === "string") {
          currentValue = target.current_value;
        }else if(typeof target.current_value === "number" || typeof target.current_value === "boolean"){
          currentValue = target.current_value.toString();
        }else {
          currentValue = JSON.stringify(target.current_value);
        }

        if(typeof target.updated_value === "string") {
          updatedValue = target.updated_value;
        }else if(typeof target.updated_value === "number" || typeof target.updated_value === "boolean"){
          updatedValue = target.updated_value.toString();
        }else {
          updatedValue = JSON.stringify(target.updated_value);
        }
        const csvText = [
          target.his_id,
          target.patient_name,
          target.schema_title,
          target.pointer,
          arrayNum?.toString()??"",
          currentValue,
          updatedValue,
          target.overwrote ? "済" : "スキップ"
        ]
        return csvText;
      };

      for (let index = 0; index < overwroteList.length; index++) {
        const element = overwroteList[index];
        if(element.isArray){
          const rowCount = Math.max(
            ((element.current_value ?? []) as any[]).length,
            ((element.updated_value ?? []) as any[]).length
          );
          for (let arrayIndex = 0; arrayIndex < rowCount; arrayIndex++) {
            const tmpObj:overwroteObject = {
              his_id:element.his_id,
              patient_name: element.patient_name,
              pointer: element.pointer,
              schema_title: element.schema_title,
              // eslint-disable-next-line
              current_value: getArrayWithSafe(element.current_value, arrayIndex)??"",
              // eslint-disable-next-line
              updated_value: getArrayWithSafe(element.updated_value, arrayIndex)??"",
              isArray: false,
              overwrote: element.overwrote,
            }
            csv.push(getCsvRow(tmpObj, arrayIndex+1))
          }
        } else {
          csv.push(getCsvRow(element));
        }
      }
      
      OpenOutputView(window, csv, "overwritelog");
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
  try{
    const retValue = await module.main(doc, func);
    return retValue;
  }catch (e){
    // eslint-disable-next-line no-alert
    alert(`【main関数実行時にエラーが発生しました】\n${(e as Error).message}`);
  }finally{
    if (module.finalize) {
      await module.finalize();
    }
  }
  return undefined;
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
  try{
    const retValue = await module.main(doc, func);
    return retValue;
  }catch (e){
    // eslint-disable-next-line no-alert
    alert(`【main関数実行時にエラーが発生しました】\n${(e as Error).message}`);
  }finally{
    if (module.finalize) {
      await module.finalize();
    }
  }
  return undefined;
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
    | undefined = undefined,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>> | undefined = undefined,
  setOverwriteDialogPlop: React.Dispatch<React.SetStateAction<OverwriteDialogPlop | undefined>> | undefined = undefined,
) => {
  pluginData = plugin;
  setOverwriteDialogPlopGlobal = setOverwriteDialogPlop;
  setIsLoadingGlobal = setIsLoading;

  if (plugin.update_db) {
    // データ更新系
    if (!plugin.all_patient && patientList && patientList.length === 1) {
      // 対象患者が指定されている場合
      targetCaseId = Number(patientList[0].case_id);
    }else {
      targetCaseId = undefined;
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
          if (setIsLoading) {
            setIsLoading(true);
          }
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
            if (setIsLoading) {
              setIsLoading(false);
            }
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
      if (setReload) {
        setReload(true);
      }
      return retValue;
    }
  } else {
    if (
      plugin.attach_patient_info &&
      // eslint-disable-next-line no-restricted-globals, no-alert
      !confirm('出力結果に患者情報が含まれています、実行しますか？')
    ) {
       throw new Error('cancel');
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
