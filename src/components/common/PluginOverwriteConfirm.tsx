import React, { MouseEventHandler, useState } from 'react';
import { Modal, Button, Checkbox } from 'react-bootstrap';
import './PluginOverwriteConfirm.css';

export const PluginOverwriteConfirm = (props: {
  onHide: () => void;
  onOk: () => void;
  onCancel: MouseEventHandler<Button>;
  show: boolean;
  title: string;
  type: string;
}) => {
  const { title, onOk, onCancel, type, onHide, show } = props;

  const buttonControl = () => (
    <>
      <Button bsStyle="default" onClick={onCancel}>
        キャンセル
      </Button>
      <Button bsStyle="primary" onClick={onOk}>
        更新
      </Button>
    </>
  );

  type overwriteInfo = {
    his_id: string;
    patient_name: string;
    schemaList?: {
      schema_title: string;
      itemList: {
        isOverwrite: boolean;
        item_name: string;
        current_value: string | number | any[] | undefined;
        updated_value: string | number | any[] | undefined;
      }[];
    }[];
  };

  // TODO: テストデータ。あとで消すこと
  const data: overwriteInfo = {
    his_id: '1234567890',
    patient_name: 'テスト患者',
  };
  data.schemaList = [
    {
      schema_title: '患者台帳 子宮頸がん > 病期診断',
      // パターン1：string
      itemList: [
        {
          isOverwrite: true,
          item_name: '治療施行状況',
          current_value: '治療施行せず',
          updated_value: '初回手術施行',
        },
        {
          isOverwrite: true,
          item_name: 'ypTNM/N/RP',
          current_value: 'センチネルリンパ節生検',
          updated_value:
            '骨盤リンパ節を摘出しなかった(病理学的索が行われなかった)',
        },
      ],
    },
    {
      schema_title: '患者台帳 子宮頸がん > 初回治療 > 手術療法 詳細',
      // パターン2：objectのarray
      itemList: [
        {
          isOverwrite: true,
          item_name: '術者',
          current_value: [
            { 名前: 'テスト医師A', 役割: '術者', 資格: '婦人科腫瘍専門' },
          ],
          updated_value: [
            { 名前: 'テスト医師B', 役割: '術者', 資格: '婦人科腫瘍専門' },
          ],
        },
      ],
    },
    {
      schema_title: '再発',
      // パターン3：stringのarray
      itemList: [
        {
          isOverwrite: true,
          item_name: '再発評価/腹腔内の再発箇所',
          current_value: [`骨盤内`, '腟断端', 'AAAA'],
          updated_value: [`肝転移`, '骨盤外', 'AAAA', '追加1'],
        },
      ],
    },
  ];

  return (
    <Modal show={show} onHide={onHide} dialogClassName="modal-size">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body-cr">
        <p>
          患者ID:[ {`${data.his_id}`} ] 患者名: [ {`${data.patient_name}`} ]
        </p>
        <p>
          以下の項目は変更後の値に上書きします。
          <span style={{ color: 'red' }}>
            上書きしない場合はチェックを外してください
          </span>
        </p>
        <div className="modal-inner-element">
          {data.schemaList &&
            data.schemaList.length > 0 &&
            data.schemaList.map((schema) => (
              // TODO: この部分をコンポーネント化してチェック状態をuseStateで管理できればベター
              <>
                <p />
                <p className="overwrite-schema-title">
                  {`【 ${schema.schema_title} 】`}
                </p>
                <table className="confirm-table">
                  <tr className="confirm-tr">
                    <th className="confirm-th">
                      <Checkbox className="overwrite-checkbox" checked={true}>
                        上書きする
                      </Checkbox>
                    </th>
                    <th className="confirm-th">項目名</th>
                    <th className="confirm-th">順番</th>
                    <th className="confirm-th">変更前</th>
                    <th className="confirm-th">変更後</th>
                  </tr>
                  {schema.itemList &&
                    schema.itemList.length > 0 &&
                    schema.itemList.map((schemaItem) => {
                      // Arrayの場合
                      if (
                        Array.isArray(schemaItem.current_value) ||
                        Array.isArray(schemaItem.updated_value)
                      ) {
                        // 要素数が多い方に合わせる
                        const rowCount = Math.max(
                          ((schemaItem.current_value ?? []) as any[]).length,
                          ((schemaItem.updated_value ?? []) as any[]).length
                        );
                        const rowList: JSX.Element[] = [];
                        for (let i = 0; i < rowCount; i += 1) {
                          // 変更前と変更後の値がオブジェクトの場合はJSON.stringifyして文字列にする
                          // 変更前の値
                          let currentValue = (
                            schemaItem.current_value as unknown[]
                          )[i];
                          if (typeof currentValue === 'object') {
                            currentValue = JSON.stringify(currentValue);
                          }
                          // 変更後の値
                          let updatedValue = (
                            schemaItem.updated_value as unknown[]
                          )[i];
                          if (typeof updatedValue === 'object') {
                            updatedValue = JSON.stringify(updatedValue);
                          }

                          rowList.push(
                            <tr className="confirm-tr">
                              {/* 上書きチェック 最初の項目以外は非表示 */}
                              <td className="confirm-td aligh-center">
                                {i === 0 && (
                                  <Checkbox
                                    className="overwrite-checkbox"
                                    checked={schemaItem.isOverwrite}
                                  />
                                )}
                              </td>
                              {/* 項目名 最初の項目以外は非表示 */}
                              <td className="confirm-td">
                                {i === 0 && schemaItem.item_name}
                              </td>
                              {/* 順番 */}
                              <td className="confirm-td aligh-center">
                                {i + 1}
                              </td>
                              {/* 変更前 */}
                              <td className="confirm-td">
                                {currentValue as string}
                              </td>
                              {/* 変更後 */}
                              <td className="confirm-td">
                                {updatedValue as string}
                              </td>
                            </tr>
                          );
                        }

                        return rowList;
                      }
                      // Array以外
                      return (
                        <tr className="confirm-tr">
                          {/* 上書きチェック */}
                          <td className="confirm-td aligh-center">
                            <Checkbox
                              className="overwrite-checkbox"
                              checked={schemaItem.isOverwrite}
                            />
                          </td>
                          {/* 項目名 */}
                          <td className="confirm-td">{schemaItem.item_name}</td>
                          {/* 順番 */}
                          <td className="confirm-td aligh-center"> </td>
                          {/* 変更前 */}
                          <td className="confirm-td">
                            {schemaItem.current_value}
                          </td>
                          {/* 変更後 */}
                          <td className="confirm-td">
                            {schemaItem.updated_value}
                          </td>
                        </tr>
                      );
                    })}
                </table>
              </>
            ))}
        </div>
        <div>
          <Checkbox>
            以降、すべての項目を上書きし確認ダイアログを表示しない
          </Checkbox>
        </div>
      </Modal.Body>
      <Modal.Footer>{buttonControl()}</Modal.Footer>
    </Modal>
  );
};

export default PluginOverwriteConfirm;
