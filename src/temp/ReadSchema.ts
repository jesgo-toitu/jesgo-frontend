// ※本ファイルは仮実装。バックエンドと疎通次第削除する。

import React from 'react';
import { JSONSchema7 } from 'json-schema';
//#region jsonファイルインポート
import jesgo from './schema/jesgo.json';
import recurrence from './schema/recurrence.json';
import surveillance from './schema/surveillance.json';
import CC_findings from './schema/CC/findings.json';
import CC_pathology from './schema/CC/pathology.json';
import CC_root from './schema/CC/root.json';
import CC_staging from './schema/CC/staging.json';
import recurrence_CC from './schema/CC/recurrence.json';
import EM_findings from './schema/EM/findings.json';
import EM_findings_detail from './schema/EM/findings_detail.json';
import EM_pathology from './schema/EM/pathology.json';
import EM_root from './schema/EM/root.json';
import EM_staging from './schema/EM/staging.json';
import recurrence_EM from './schema/EM/recurrence.json';
import evaluation_ascites from './schema/evaluation/ascites.json';
import evaluation_cervix from './schema/evaluation/cervix.json';
import evaluation_colonoscopy from './schema/evaluation/colonoscopy.json';
import evaluation_colposcopy from './schema/evaluation/colposcopy.json';
import evaluation_corpus from './schema/evaluation/corpus.json';
import evaluation_cystoscopy from './schema/evaluation/cystoscopy.json';
import evaluation_exam from './schema/evaluation/exam.json';
import evaluation_gastroscopy from './schema/evaluation/gastroscopy.json';
import evaluation_genes from './schema/evaluation/genes.json';
import evaluation_hysteroscpy from './schema/evaluation/hysteroscpy.json';
import evaluation_imaging from './schema/evaluation/imaging.json';
import evaluation_immunohistochemistry from './schema/evaluation/immunohistochemistry.json';
import evaluation_markers from './schema/evaluation/markers.json';
import evaluation_performance_status from './schema/evaluation/performance_status.json';
import evaluation_physical_status from './schema/evaluation/physica_status.json';
import evaluation_physical_status_and_ps from './schema/evaluation/physica_status_and_ps.json';
import evaluation_pleural_effusion from './schema/evaluation/pleural_effusion.json';
import evaluation_regional_lymph_nodes from './schema/evaluation/regional_lymph_nodes.json';
import evaluation_tumor_assessment from './schema/evaluation/tumor_assessment.json';
import other_root from './schema/other/root.json';
import OV_pathology from './schema/OV/pathology.json';
import OV_root from './schema/OV/root.json';
import OV_staging from './schema/OV/staging.json';
import recurrence_OV from './schema/OV/recurrence.json';
import records_meeting_record from './schema/records/meeting_record.json';
import records_pathlogy_report from './schema/records/pathlogy_report.json';
import records_treatment_summary from './schema/records/summary.json';
import records_summary_detaild from './schema/records/summary_detaild.json';
import treatment_blood_transfusion from './schema/treatment/blood_transfusion.json';
import treatment_chemotherapy from './schema/treatment/chemotherapy.json';
import treatment_operation from './schema/treatment/operation.json';
import treatment_operation_adverse_events from './schema/treatment/operation_adverse_events.json';
import treatment_operation_detailed from './schema/treatment/operation_detailed.json';
import treatment_operation_procedures from './schema/treatment/operation_procedures.json';
import treatment_radiotherapy from './schema/treatment/radiotherapy.json';
import treatment_primary_treatment from './schema/treatment/primary_treatment.json';
import treatment_summary from './schema/treatment/summary.json';
import treatment_relapse_treatment from './schema/treatment/relapse_treatment.json';
import treatment_supportive_care from './schema/treatment/supportive_care.json';

//#endregion

const jsonSchemaObjects: JSONSchema7[] = [
  jesgo as JSONSchema7,
  recurrence as JSONSchema7,
  surveillance as JSONSchema7,
  CC_findings as JSONSchema7,
  CC_pathology as JSONSchema7,
  CC_root as JSONSchema7,
  CC_staging as JSONSchema7,
  recurrence_CC as JSONSchema7,
  EM_findings as JSONSchema7,
  EM_findings_detail as JSONSchema7,
  EM_pathology as JSONSchema7,
  EM_root as JSONSchema7,
  EM_staging as JSONSchema7,
  recurrence_EM as JSONSchema7,
  evaluation_ascites as JSONSchema7,
  evaluation_cervix as JSONSchema7,
  evaluation_colonoscopy as JSONSchema7,
  evaluation_colposcopy as JSONSchema7,
  evaluation_corpus as JSONSchema7,
  evaluation_cystoscopy as JSONSchema7,
  evaluation_exam as JSONSchema7,
  evaluation_gastroscopy as JSONSchema7,
  evaluation_genes as JSONSchema7,
  evaluation_hysteroscpy as JSONSchema7,
  evaluation_imaging as JSONSchema7,
  evaluation_immunohistochemistry as JSONSchema7,
  evaluation_markers as JSONSchema7,
  evaluation_performance_status as JSONSchema7,
  evaluation_physical_status as JSONSchema7,
  evaluation_physical_status_and_ps as JSONSchema7,
  evaluation_pleural_effusion as JSONSchema7,
  evaluation_regional_lymph_nodes as JSONSchema7,
  evaluation_tumor_assessment as JSONSchema7,
  other_root as JSONSchema7,
  OV_pathology as JSONSchema7,
  OV_root as JSONSchema7,
  OV_staging as JSONSchema7,
  recurrence_OV as JSONSchema7,
  records_meeting_record as JSONSchema7,
  records_pathlogy_report as JSONSchema7,
  records_treatment_summary as JSONSchema7,
  records_summary_detaild as JSONSchema7,
  treatment_blood_transfusion as JSONSchema7,
  treatment_chemotherapy as JSONSchema7,
  treatment_operation as JSONSchema7,
  treatment_operation_adverse_events as JSONSchema7,
  treatment_operation_detailed as JSONSchema7,
  treatment_operation_procedures as JSONSchema7,
  treatment_radiotherapy as JSONSchema7,
  treatment_primary_treatment as JSONSchema7,
  treatment_summary as JSONSchema7,
  treatment_relapse_treatment as JSONSchema7,
  treatment_supportive_care as JSONSchema7,
];

export type JesgoDocumentSchema = {
  schema_id: number;
  schema_id_string: string;
  title: string;
  subtitle: string;
  document_schema: JSONSchema7;
  subschema: number[];
  child_schema: number[];
  inherit_schema: number[];
  majorVersion: number;
};

export const ReadSchema = () => {
  let result: JesgoDocumentSchema[] = [];
  jsonSchemaObjects.map((value, index) => {
    const schemaObj = value;

    // const titles = schemaObj.title!.split(" ");

    // subSchemaのID取得
    const subschemaIdStrings: string[] | undefined =
      schemaObj['jesgo:subschema'];
    const subschemaIds: number[] = [];
    subschemaIdStrings?.map((idString: string) => {
      const sub = jsonSchemaObjects.find((value) => value.$id === idString);
      if (sub !== undefined) {
        subschemaIds.push(jsonSchemaObjects.indexOf(sub));
      }
    });

    // ■child_schemaのID取得
    // TODO 処理重いので要見直し
    // jesgo:childschema
    const childschemaIdStrings: string[] | undefined =
      schemaObj['jesgo:childschema'];
    const childschemaIds: number[] = [];
    childschemaIdStrings?.map((idString: string) => {
      const child = jsonSchemaObjects.findIndex(
        (value) => value.$id === idString
      );
      if (child >= 0) {
        childschemaIds.push(child);
      }
    });
    // parentSchemaに自身のidが設定されているスキーマを検索
    jsonSchemaObjects.map((obj, index) => {
      const parentIds = obj['jesgo:parentschema'];
      parentIds?.map((id: string) => {
        // ルート・値なしの場合は何もしない
        if (id === '/' || id === '') return;
        const regex = new RegExp(id.replace('/', '\\/').replace('*', '..*'));
        if (regex.test(value.$id!)) {
          childschemaIds.push(index);
        }
      });
    });

    const version = schemaObj['jesgo:version'];
    let majorVersion = -1;
    if (version) {
      const verSplit = version.split('.');
      if (verSplit.length > 0) {
        majorVersion = parseInt(verSplit[0]);
      }
    }

    const jesgoDocumentSchema: JesgoDocumentSchema = {
      schema_id: index,
      schema_id_string: schemaObj.$id!,
      title: schemaObj.title!,
      subtitle: '',
      // TODO タイトル・サブタイトルの使い分けがわかるまでは仮実装
      // title: titles[0],
      // subtitle: titles.length >= 2 ? titles[1] : "",
      document_schema: schemaObj,
      subschema: subschemaIds,
      child_schema: childschemaIds,
      inherit_schema: [],
      majorVersion: majorVersion,
    };
    result.push(jesgoDocumentSchema);
  });

  return result;
};
