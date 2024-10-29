require("dotenv").config();
const express = require("express");
const cors = require("cors");
const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");
const workspaceRouter = require("./routes/workspaceRouter");
const workspaceMembersRouter = require("./routes/workspaceMembersRouter");

const app = express();

app.use(express.json());
app.use(
  cors({
    // origin: "http://192.168.1.159:3000",
    origin: "http://localhost:3000",
    // origin: "http://192.168.1.74:3000",
    credentials: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  // res.setHeader("Access-Control-Allow-Origin", "http://192.168.1.74:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Yup it is working!");
});

app.use("/api", registerRouter);
app.use("/api", loginRouter);
app.use("/api", workspaceRouter);
app.use("/api", workspaceMembersRouter);

app.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
