const path = require("path");
const express = require("express");
const router = express.Router();

const app = express();
const port = 3030;

app.use(express.static("dist"));
app.use('/image', express.static('image'));

router.get("*", (req, res, next) => {
  // console.log(`req.path：${req.path}`);
  // TODO 不要？
  if (req.path.startsWith("/sockjs-node/")) {
    // リスエストエラー
    res.status(400).send();
    return;
  }
  res.sendFile(path.join(__dirname, './dist/index.html'));
});

app.use("/", router);

// サーバー起動
app.listen(port, function () {
  console.log(`express: start. port=${port}, mode=${app.settings.env}`)
});

