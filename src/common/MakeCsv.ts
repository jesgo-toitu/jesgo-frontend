export const csvHeader = [
    {label:'患者ID' ,key:'patientId'},
    {label:'患者氏名' ,key:'patinetName'},
    {label:'年齢' ,key:'age'},
    {label:'初回治療開始日' ,key:'startDate'},
    {label:'最終更新日' ,key:'lastUpdate'},
    {label:'診断(子宮頸がん)' ,key:'diagnosisCervical'},
    {label:'診断(子宮体がん)' ,key:'diagnosisEndometrial'},
    {label:'診断(卵巣がん)' ,key:'diagnosisOvarian'},
    {label:'進行期(子宮頸がん)' ,key:'advancedStageCervical'},
    {label:'進行期(子宮体がん)' ,key:'advancedStageEndometrial'},
    {label:'進行期(卵巣がん)' ,key:'advancedStageOvarian'},
    {label:'再発' ,key:'recurrence'},
    {label:'化学療法' ,key:'chemotherapy'},
    {label:'手術療法' ,key:'operation'},
    {label:'放射線療法' ,key:'radiotherapy'},
    {label:'緩和療法' ,key:'supportiveCare'},
    {label:'登録' ,key:'registration'},
    {label:'死亡' ,key:'death'},
    {label:'3年予後' ,key:'threeYearPrognosis'},
    {label:'5年予後' ,key:'fiveYearPrognosis'},
];

export interface patientListCsv {
    patientId: string;
    patinetName: string;
    age: string;
    startDate: string;
    lastUpdate: string;
    diagnosisCervical: string;
    diagnosisEndometrial: string;
    diagnosisOvarian: string;
    advancedStageCervical: string;
    advancedStageEndometrial: string;
    advancedStageOvarian: string;
    recurrence: string;
    chemotherapy: string;
    operation: string;
    radiotherapy: string;
    supportiveCare: string;
    registration: string;
    death: string;
    threeYearPrognosis: string;
    fiveYearPrognosis: string;
};