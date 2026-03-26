const path = require("path");
require("dotenv").config({ path: "database/.env" });

const mysql = require("mysql2");
const cors = require("cors");
const express = require("express");
const app = express();

app.use(cors()); // 모든 요청 허용 (개발 단계)

app.use(express.json());

app.listen(process.env.PORT, () => {
  console.log(
    `서버가 http://localhost:${process.env.PORT} 에서 실행 중입니다.`,
  );
});

app.get("/", (req, res) => {
  res.send("Welcom!!");
});

const userRouter = require("./router/user_router.js");
const surveyRouter = require("./router/survey_router.js");

const infoRouter = require("./router/info_router.js");

const adsupportPlan = require("./router/adsupport_router.js");

const recipientRouter = require("./router/recipient_router.js");

app.use("/abc", require("./router/noTouch_router.js"));

app.use("/api", userRouter);

app.use("/info", infoRouter);

app.use("/reserve", require("./router/rsv_router.js"));

app.use("/survey", surveyRouter);

app.use("/adsupport", adsupportPlan);

const resultPlan = require("./router/resultPlan_router.js");
app.use("/resultPlan", resultPlan);
app.use("/recipient", recipientRouter);
