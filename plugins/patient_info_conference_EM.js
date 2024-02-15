const script_info = {
    plugin_name: '体癌カンファ',
    plugin_version: '1.0',
    all_patient: false,
    update_db: false,
    attach_patient_info: true,
    show_upload_dialog: false,
    target_schema_id_string: "/schema/EM/root",
    filter_schema_query: '',
    explain: '子宮体がんのカンファをテキスト形式で出力します',
}
export async function init() {
    return script_info;
}

/**
 * 子画面を表示
 * @param {string} dispText 表示テキスト
 */
async function openWindow(dispText) {
    // 子画面のサイズ
    const height = 600;
    const width = 800;
    const subWindowName = "subWindowConferenceEM";  // ※各スクリプトで変える
    const subWindowTitle = "カンファレンス（子宮体がん）";

    // 新しいウィンドウを開く
    // 同名のウィンドウがあればそちらが使われる
    var wTop = window.screenTop + (window.innerHeight / 2) - (height / 2);
    var wLeft = window.screenLeft + (window.innerWidth / 2) - (width / 2);
    var popupWindow = window.open('', subWindowName, 
        `popup,height=${height},width=${width},top=${wTop},left=${wLeft}`);
    popupWindow.name = subWindowName;

    // header
    var newWindowDoc = popupWindow.document;
    newWindowDoc.head.innerHTML = 
        `<meta charset="utf-8">
        <link rel="stylesheet" href="./bootstrap-dist/css/bootstrap.min.css">
        <link rel="stylesheet" href="./bootstrap-dist/css/bootstrap-theme.min.css">
        <title>${subWindowTitle}</title>`;
    
    // body
    newWindowDoc.body.innerHTML =
        `<div id="div_textarea" class="modal-header" style="display: flex; justify-content:  flex-start; height:55px">
            <h3 style="margin:0;">${subWindowTitle}</h3>
            <div style="display: flex; align-items: center; margin:0px 0px 0px 10px;">
                <button onclick="copyText()" type="button" class="btn btn-default">テキストをコピー</button>
            </div>
        </div>
        <div class="modal-body">
            <textarea id="summaryTextarea" rows="10" cols="40" readonly 
            style="height: calc(100vh - 55px - 30px); width: 100%; resize:none">${dispText}</textarea>
        </div>`;

    // script
    var scriptElement = newWindowDoc.createElement(`script`);
    scriptElement.innerHTML=(`
        function copyText() {
            // テキストボックスの値を取得
            var textboxValue = document.getElementById('summaryTextarea').value;

            // テキストボックスの値をクリップボードにコピー
            navigator.clipboard.writeText(textboxValue).then(function() {
                alert('テキストがコピーされました');
            }).catch(function(err) {
                console.error('テキストのコピーに失敗しました', err);
            });
        }
    `)
    newWindowDoc.body.appendChild(scriptElement);
}

/**
 * 年齢計算(現在日時点)
 * @param {string} birthday - 生年月日
 * @returns {string} - 年齢
 */
function calcAge(birthday) {
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

/**
 * 文字列変換
 * @param {string} str - 変換する文字列
 * @returns {string} - paramが空なら空文字を返す。それ以外はそのまま。
 */
function convertString(str) {
    return str ? str : "";
}

export async function main(docObj, func) {
    var output = [];
    var targetData = await func(docObj);
    var caseInfo = {};
    var root = {};
    var operations = {};
    var staging = {};
    var stagingTMN_T = {};
    var stagingTMN_M = {};
    var stagingTMN_N = {};
    var pathology = {};
    var findings = {};
    var genes = {};
    var muscleInvasion = {};
    var vascularIinvasion = {};

    // formDataの中身を掘っていく
    if (targetData) {
        var targetDataJson = JSON.parse(targetData);
        if (targetDataJson && targetDataJson.length > 0) {
            caseInfo = targetDataJson[0];
            if (caseInfo) {
                var docLists = caseInfo.documentList;
                if (docLists && docLists.length > 0) {
                    var docList = docLists[0];
                    if (docList) {
                        // 患者台帳
                        root = docList["患者台帳"];
                        if (root) {
                            // 病期診断
                            staging = root["病期診断"];
                            if (staging) {
                                var stagingTMN = {}
                                if (staging["治療施行状況"] === "初回手術施行例") {
                                    stagingTMN = staging["pTNM"]
                                } else if (staging["治療施行状況"] === "術前治療後に手術施行") {
                                    stagingTMN = staging["ypTNM"]
                                }
                                if (stagingTMN) {
                                    stagingTMN_T = stagingTMN["T"] == null ? {} : stagingTMN["T"];
                                    stagingTMN_M = stagingTMN["M"] == null ? {} : stagingTMN["M"];
                                    stagingTMN_N = stagingTMN["N"] == null ? {} : stagingTMN["N"];
                                }
                            } else {
                                staging = {};
                            }

                            // 初回治療
                            var initialTreatment = root["初回治療"];
                            if (initialTreatment) {
                                operations = initialTreatment["手術療法"] == null ? {} : initialTreatment["手術療法"];
                            }

                            // 組織診断
                            pathology = root["組織診断"] == null ? {} : root["組織診断"];

                            // 診断所見
                            findings = root["診断所見"];
                            if (findings) {
                                // 腫瘍遺伝子検査
                                genes = findings["腫瘍遺伝子検査"] == null ? {} : findings["腫瘍遺伝子検査"];
                                // 筋層浸潤
                                muscleInvasion = findings["筋層浸潤"] == null ? {} : findings["筋層浸潤"];
                                // 脈管侵襲
                                vascularIinvasion = findings["脈管侵襲"] == null ? {} : findings["脈管侵襲"];
                            } else {
                                findings = {};
                            }

                        } else {
                            root = {};
                        }
                    } else {
                        docList = {};
                    }
                }
            } else {
                caseInfo = {};
            }
        }
    } else {
        alert("出力対象のデータがありません")
        return;
    }

    // データが無くても項目名は出したい
    output.push("ーーー基本情報ーーー");
    output.push(`氏名：${caseInfo["name"]}`);
    output.push(`年齢：${await calcAge(caseInfo["date_of_birth"])} 歳`);
    output.push(`外来ID：${caseInfo["his_id"]}`);
    output.push(``);
    output.push("ーーー手術情報ーーー");
    if (Array.isArray(operations) && operations.length > 0) {
        var num = 1;
        operations.forEach(operation => {
            output.push(`＜手術情報 ${num}件目＞`);
            output.push(`　手術年月日：${convertString(operation["手術日"])}`);
            if(operation["実施手術"]){
                var operationMethods = operation["実施手術"]["実施手術"];
                var operationMethodStr = "";
                if (operationMethods && Array.isArray(operationMethods) && operationMethods.length > 0) {
                    var methodsStr = [];
                    operationMethods.forEach(method => {
                        if (method && method["術式"]) {
                            if (method["自由入力"]) {
                                methodsStr.push(`${method["術式"]}(${method["自由入力"]})`)
                            } else {
                                methodsStr.push(`${method["術式"]}`)
                            }
                        }
                    });
                    if (methodsStr.length > 0) {
                        operationMethodStr = methodsStr.join(",");
                    }
                } 
                output.push(`　術式：${convertString(operationMethodStr)}`);
            }
            num++;
        });

    } else {
        output.push(`手術年月日：`);
        output.push(`術式：`);
    }

    output.push(``);
    output.push(`TNM分類（2021）T：${convertString(stagingTMN_T["T"])}`);
    output.push(`TNM分類（2021）N：`);
    // TNM分類のNは複数回使うので一つにまとめておく
    const tnmNList = [];
    tnmNList.push(`　骨盤リンパ節に対する処置：${convertString(stagingTMN_N["RP"])}`);
    tnmNList.push(`　骨盤リンパ節の所見　　　：${convertString(stagingTMN_N["RPX"])}`);
    tnmNList.push(`　傍大動脈リンパ節に対する処置：${convertString(stagingTMN_N["RA"])}`);
    tnmNList.push(`　傍大動脈リンパ節の所見　　　：${convertString(stagingTMN_N["RAX"])}`);

    output.push(...tnmNList);
    output.push(`TNM分類（2021）M：${convertString(stagingTMN_M["M"])}`);

    output.push(``);
    output.push("ーーー組織診・病理ーーー");
    output.push(`組織診断：${convertString(pathology["組織型"])}`);
    output.push(`grede：${convertString(pathology["組織学的異型度"])}`);
    output.push(`g-BRCA BRCA1変異：${convertString(genes["BRCA1変異"])}`);
    output.push(`　　　　BRCA2変異：${convertString(genes["BRCA2変異"])}`);
    output.push(`HRD：${convertString(genes["HRD"])}`);
    output.push(`MSI：${convertString(genes["MSI"])}`);
    output.push(`摘出病理所見 筋層浸潤　　：${convertString(muscleInvasion["所見"])}`);
    output.push(`　　　　　　 筋層浸潤詳細：${convertString(muscleInvasion["詳細"])}`);
    output.push(`　　　　　　 脈管侵襲 リンパ管侵襲：${convertString(vascularIinvasion["リンパ管侵襲"])}`);
    output.push(`　　　　　　 　　　　 静脈侵襲　　：${convertString(vascularIinvasion["静脈侵襲"])}`);
    output.push(`　　　　　　 頸管浸潤　：${convertString(findings["子宮頸部間質浸潤"])}`);
    output.push(`　　　　　　 附属器転移：${convertString(findings["付属器転移"])}`);
    var lymphNodeMetastasis = findings["リンパ節転移"];
    if (Array.isArray(lymphNodeMetastasis) && lymphNodeMetastasis.length > 0) {
        var num = 1;
        lymphNodeMetastasis.forEach(item => {
            output.push(`＜リンパ節転移 ${num}件目＞`);
            output.push(`　部位：${convertString(item["部位"])}`);
            output.push(`　個数 摘出リンパ節　　　：${convertString(item["摘出リンパ節数"])}`);
            output.push(`　　　 転移陽性リンパ節数：${convertString(item["転移陽性リンパ節数"])}`);
            num++;
        });

    } else {
        output.push(`リンパ節転移 部位：`);
        output.push(`　　　　　　 個数 摘出リンパ節：`);
        output.push(`　　　　　　 　　 転移陽性リンパ節数：`);
    }

    output.push(``);
    output.push(`腹水、洗浄腹水細胞診所見：${convertString(findings["腹水細胞診"])}`);
    
    var distantMetastasisStrList = [];
    var distantMetastasis = stagingTMN_M["遠隔転移部位"];
    if (distantMetastasis && Array.isArray(distantMetastasis) && distantMetastasis.length > 0) {
        var num = 1;
        distantMetastasis.forEach((item) => {
            if (item["部位"]) {
                if (item["具体的部位"]) {
                    distantMetastasisStrList.push(`${convertString(item["部位"])}(${convertString(item["具体的部位"])})`)
                } else {
                    distantMetastasisStrList.push(convertString(item["部位"]))
                }
            }
        })
    }
    output.push(`遠隔転移：${distantMetastasisStrList.join(",")}`);
    output.push(`(post)Surgical stage：${convertString(staging["FIGO"])}`);
    output.push(`ベクセルTMN分類 T ：${convertString(stagingTMN_T["T"])}`);
    output.push(`ベクセルTMN分類 NP：`);
    output.push(`　骨盤リンパ節に対する処置：${convertString(stagingTMN_N["RP"])}`);
    output.push(`　骨盤リンパ節の所見　　　：${convertString(stagingTMN_N["RPX"])}`);
    output.push(`　傍大動脈リンパ節に対する処置：${convertString(stagingTMN_N["RA"])}`);
    output.push(`　傍大動脈リンパ節の所見　　　：${convertString(stagingTMN_N["RAX"])}`);
    output.push(`ベクセルTMN分類 A ：`);
    output.push(`　骨盤リンパ節に対する処置：${convertString(stagingTMN_N["RP"])}`);
    output.push(`　骨盤リンパ節の所見　　　：${convertString(stagingTMN_N["RPX"])}`);
    output.push(`　傍大動脈リンパ節に対する処置：${convertString(stagingTMN_N["RA"])}`);
    output.push(`　傍大動脈リンパ節の所見　　　：${convertString(stagingTMN_N["RAX"])}`);
    output.push(`ベクセルTMN分類　M ：${convertString(stagingTMN_M["M"])}`);
    output.push(``);
    output.push("ーーーその他ーーー");
    output.push(`術後方針：${convertString(findings["再発リスク"])}`);
    output.push(``);

    // 子画面表示
    await openWindow(output.join("\r\n"))
}


