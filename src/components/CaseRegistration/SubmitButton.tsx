import React from 'react';
import { Button, Col } from 'react-bootstrap';
import '../../views/Registration.css';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../store/index';

const SubmitButton = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const formDatas = useSelector(
    (state: RootState) => state.formDataReducer.formDatas
  );
  const navigate = useNavigate();

  const clickSubmit = (props: { formDatas: Map<string, any> }) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    // TODO 確認用コンソール
    console.log('formDatas');
    console.log(props.formDatas);     // eslint-disable-line react/prop-types

    // リスト表示に遷移
    navigate('/Patients');
  };

  return (
    <Col lg={3} md={3} className="user-info-button-col">
      <div className="user-info-button-div">
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
        <Button onClick={() => clickSubmit({ formDatas })} bsStyle="primary">
          保存してリストに戻る
        </Button>
      </div>
    </Col>
  );
};

export default SubmitButton;
