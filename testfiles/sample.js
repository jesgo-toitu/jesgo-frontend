// JESGO plugin sample - calling Only
const script_info = {
    plugin_name: 'APIテストtype1',
    plugin_version: '0.1',
    all_patient: true,
    attach_patient_info: true,
    update_db: false,
    show_upload_dialog: false,
    // filter_schema_query: '',
    // target_schema_id: 0;
    // target_schema_id_string: '/';
    explain: '呼び出されてダイアログを表示するだけ',
}

export async function init() {
    return script_info
}

export async function main(docData, apifunc) {
    if (docData.caseList) {
        handler(JSON.parse(await apifunc(docData)))
    }
    return []
}

function handler(docData) {
    const numberOfCases = docData.length
    const numberOfDocuments = docData.reduce((max, item) => {
        console.dir(item)
        return Math.max(max, item.documentList.length)
    }
        , 0)
    window.alert(`症例数は ${numberOfCases}, 最大のドキュメント数は ${numberOfDocuments} です.`)
}
export async function finalize() {
    window.alert('おしまい.')
}