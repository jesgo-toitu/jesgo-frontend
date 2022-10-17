"use strict";
const path = require('path');  //path モジュールの読み込み

module.exports = {
  mode: 'development',  //モード
  entry: './src/Index.tsx',  //エントリポイント（デフォルトと同じ設定）
  output: {  //出力先（デフォルトと同じ設定）
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    // publicPath: '/public/' // (*)
  },
  resolve: {
    modules: [ "./node_modules" ],
    extensions: [".js", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader"
      },
      {
        // TODO 最終的には不要になるはず
        // Babel のローダーの設定
        //対象のファイルの拡張子
        test: /\.(js|mjs|jsx)$/,
        //対象外とするフォルダ
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
              ]
            }
          }
        ]
      },
      {
        test: /\.css/,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: { url: false }
          }
        ]
      }
    ],
    parser: {
      javascript: { commonjsMagicComments: true },
    },
  },
};