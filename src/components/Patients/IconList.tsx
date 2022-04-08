import React from 'react';
import lodash from 'lodash';

const makeIconList = (props: { iconList: string[] }) => {
  const iconCaptions: { [key: string]: string } = {
    death: '死',
    recurrence: '',
    complications: '合',
    completed: '済',
    not_completed: '未',
    surveillance: '経過',
    chemo: '化',
    radio: '放',
    surgery: '手',
  };
  const { iconList } = props;

  return (
    <>
      {lodash.uniq(iconList).map((icon) => (
        <img
          key={icon}
          src={`./image/icon_${icon}.svg`}
          alt={`${iconCaptions[icon]}`}
        />
      ))}
    </>
  );
};

export default makeIconList;
