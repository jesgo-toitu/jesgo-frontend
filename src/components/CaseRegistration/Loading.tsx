import React from 'react';

// ローディング表示
const Loading = () => {
  const style: { [key: string]: string } = {
    position: 'absolute',
    left: '0',
    top: '0',
    width: '100%',
    height: '100%',
    background: 'rgba(100, 100, 100, 0.8)', // 半透明のグレー
    zIndex: '2147483647',
  };

  return <div id="Loading" style={style} />;
};

export default Loading;
