import React, { useEffect, useState } from 'react';
import { Button, Col } from 'react-bootstrap';
import '../../views/Registration.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import store from '../../store/index';
import SaveChanges, { responseResult } from '../../common/DBUtility';
import { RESULT } from '../../common/ApiAccess';
import { SaveDataObjDefine } from '../../store/formDataReducer';

interface ButtonProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const SubmitButton = (props: ButtonProps) => {
  const { setIsLoading } = props;

  // 保存時の応答
  const [saveResponse, setSaveResponse] = useState<responseResult>({
    message: '',
  });

  const dispatch = useDispatch();

  const navigate = useNavigate();

  // 保存時のコールバック
  useEffect(() => {
    if (
      saveResponse.resCode !== RESULT.TOKEN_EXPIRED_ERROR &&
      saveResponse.message
    ) {
      alert(saveResponse.message);
    }

    if (saveResponse.resCode !== undefined) {
      setIsLoading(false);
    }

    // 保存成功時は症例一覧に戻る
    if (saveResponse.resCode === RESULT.NORMAL_TERMINATION) {
      navigate('/Patients');
    } else if (saveResponse.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
      // トークン期限切れはログイン画面に戻る
      navigate('/login');
    }
  }, [saveResponse]);

  // ヘッダのエラーチェック
  // TODO: ここはvalidationにすべき
  const hasJesgoCaseError = (saveData: SaveDataObjDefine) => {
    const messages: string[] = [];

    if (!saveData.jesgo_case.his_id) {
      messages.push('患者IDを入力してください。');
    }
    if (!saveData.jesgo_case.date_of_birth) {
      messages.push('生年月日を入力してください。');
    }

    if (messages.length > 0) {
      messages.unshift('【症例入力エラー】');
      alert(messages.join('\n'));
      return true;
    }

    return false;
  };

  // 保存ボタンクリック
  const clickSubmit = () => {
    const formDatas = store.getState().formDataReducer.formDatas;
    const saveData = store.getState().formDataReducer.saveData;

    // ヘッダのエラーチェック
    // TODO: ここはvalidationにすべき
    if (hasJesgoCaseError(saveData)) {
      return;
    }

    setIsLoading(true);

    // 保存処理実行
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    SaveChanges(dispatch, formDatas, saveData, setSaveResponse);
  };

  return (
    <Col lg={3} md={3} className="user-info-button-col">
      <div className="user-info-button-div">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Button onClick={clickSubmit} bsStyle="primary">
          保存してリストに戻る
        </Button>
      </div>
    </Col>
  );
};

export default SubmitButton;
