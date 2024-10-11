require("dotenv").config();
const express = require("express");
const app = express();
const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Yup it is working!");
});

app.use("/api", registerRouter);
app.use("/api", loginRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
