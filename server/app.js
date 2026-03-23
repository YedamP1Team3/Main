require("dotenv").config({ path: "database/.env" });
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

app.use("/", userRouter);

// app.use("/reserve", require("./router/res_router.js"));
app.use("/survey", surveyRouter);
