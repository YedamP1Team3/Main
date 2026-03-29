const path = require("path");
require("dotenv").config({ path: "database/.env" });

const mysql = require("mysql2");
const cors = require("cors");
const express = require("express");
const cron = require("node-cron");
const app = express();

const rsvService = require("./service/rsv_service.js");

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

// 매달 1일 01:00, 한국 시간 기준으로 담당자 일정 데이터 생성 (다음 달 한달치)
cron.schedule(
  "0 1 1 * *",
  async () => {
    try {
      console.log("[CRON] manager_schedules 자동 생성 시작");

      const result = await rsvService.generateNextMonthSchedules();

      console.log("[CRON] manager_schedules 자동 생성 결과:", result);
    } catch (err) {
      console.error("[CRON] manager_schedules 자동 생성 실패:", err);
    }
  },
  {
    timezone: "Asia/Seoul",
  },
);

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

// 민규가 매달 데이터 자동생성 (cron) 기능 썼기에, module.exports 추가작성된거로 추정
module.exports = app;
