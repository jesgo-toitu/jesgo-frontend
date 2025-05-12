// ライブラリ読み込み
const fs = require("fs");

// package.json読み込み
const _pathJson = fs
  .readFileSync('package.json')
  .toString();
const pathJson = JSON.parse(_pathJson);

// 設定情報パス取得
const configPath = process.env.NODE_ENV === 'production' ?
  pathJson['config']['configPath']['production'] :
  pathJson['config']['configPath']['development'];

// 設定情報取得
const _configJson = fs
  .readFileSync(configPath || './dist/config.json')
  .toString();
const configJson = JSON.parse(_configJson);

// 設定情報
const configValues = () => {
  return {
    webAppPort: configJson['webApp']['webAppPort'],
    endPointUrl: configJson['webApp']['endPointUrl'],
  }
}

exports.default = configValues();
