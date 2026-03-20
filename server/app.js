require("dotenv").config({ path: "database/.env" });
const express = require("express");

const app = express();

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
app.use("/", userRouter);
