/* eslint-disable no-alert */
/* eslint-disable no-restricted-globals */
import React, { useEffect, useState } from 'react';
import { Button, Col } from 'react-bootstrap';
import '../../views/Registration.css';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import store from '../../store/index';
import SaveCommand, { responseResult } from '../../common/DBUtility';
import { RESULT } from '../../common/ApiAccess';
import { RemoveBeforeUnloadEvent } from '../../common/CommonUtility';
import { RegistrationErrors,IsNotUpdate } from '../../common/CaseRegistrationUtility';

interface ButtonProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadedJesgoCase: React.Dispatch<React.SetStateAction<responseResult>>;
  setCaseId: React.Dispatch<React.SetStateAction<number | undefined>>;
  setIsReload: React.Dispatch<React.SetStateAction<boolean>>;
  setErrors: React.Dispatch<React.SetStateAction<RegistrationErrors[]>>;
}

const SubmitButton = (props: ButtonProps) => {
  const {
    setIsLoading,
    setLoadedJesgoCase,
    setCaseId,
    setIsReload,
    setErrors,
  } = props;

  // 保存時の応答
  const [saveResponse, setSaveResponse] = useState<responseResult>({
    message: '',
  });

  const dispatch = useDispatch();

  const navigate = useNavigate();

  // 保存時のコールバック
  useEffect(() => {
    // 保存しましたなどのメッセージ表示
    if (
      saveResponse.resCode !== RESULT.TOKEN_EXPIRED_ERROR &&
      saveResponse.message
    ) {
      alert(saveResponse.message);
    }

    if (saveResponse.resCode !== undefined) {
      setIsLoading(false);
    }

    if (saveResponse.resCode === RESULT.NORMAL_TERMINATION) {
      // 保存して戻る場合は症例一覧に戻る
      if (
        saveResponse.anyValue &&
        (saveResponse.anyValue as boolean) === true
      ) {
        RemoveBeforeUnloadEvent();
        navigate('/Patients');
      } else if (saveResponse.caseId) {
        // 保存ボタンの場合は再読み込み
        setIsLoading(true);
        setLoadedJesgoCase({
          message: '',
          resCode: undefined,
          loadedSaveData: undefined,
        });
        setCaseId(saveResponse.caseId);
        setIsReload(true);
      } else {
        // TODO: 読み込み失敗
        setIsLoading(false);
        RemoveBeforeUnloadEvent();
        navigate('/Patients');
      }
    } else if (saveResponse.resCode === RESULT.TOKEN_EXPIRED_ERROR) {
      // トークン期限切れはログイン画面に戻る
      RemoveBeforeUnloadEvent();
      navigate('/login');
    }
  }, [saveResponse]);

  /**
   * 保存ボタンクリック
   * @param isBack 保存して戻る場合はtrue
   */
  const clickSubmit = (isBack: boolean) => {
    const formDatas = store.getState().formDataReducer.formDatas;
    const saveData = store.getState().formDataReducer.saveData;

    // スクロール位置保存
    dispatch({
      type: 'SCROLL_POSITION',
      scrollTop: document.scrollingElement
        ? document.scrollingElement.scrollTop
        : undefined,
    });

    SaveCommand(
      formDatas,
      saveData,
      dispatch,
      setIsLoading,
      setSaveResponse,
      isBack,
      setErrors
    );
  };

  // 保存せずリストに戻る
  const clickCancel = () => {
    if (
      IsNotUpdate() ||
      confirm(
        '画面を閉じて患者リストに戻ります。保存してないデータは失われます。\nよろしいですか？'
      )
    ) {
      RemoveBeforeUnloadEvent();
      navigate('/Patients');
    }
  };

  return (
    <Col lg={3} md={3} className="user-info-button-col">
      <div className="user-info-button-div">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Button
          bsStyle="success"
          className="normal-button"
          onClick={() => {
            clickSubmit(false);
          }}
        >
          保存
        </Button>
        <Button
          onClick={() => {
            clickSubmit(true);
          }}
          bsStyle="success"
          className="normal-button"
        >
          保存してリストに戻る
        </Button>
        <Button
          onClick={clickCancel}
          bsStyle="primary"
          className="normal-button"
        >
          リストに戻る
        </Button>
      </div>
    </Col>
  );
};

export default SubmitButton;
