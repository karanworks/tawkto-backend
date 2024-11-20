require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

//Prisma
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Routers
const registerRouter = require("./routes/registerRouter");
const loginRouter = require("./routes/loginRouter");
const workspaceRouter = require("./routes/workspaceRouter");
const workspaceMembersRouter = require("./routes/workspaceMembersRouter");
const logoutRouter = require("./routes/logoutRouter");
const visitorChatRouter = require("./routes/visitorChatRouter");
const path = require("path");
const widgetStylesRouter = require("./routes/widgetStylesRouter");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.use(express.json());

app.use(
  cors({
    // origin: "http://192.168.1.159:3000",
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:5500",
      "http://localhost:5173",
    ],
    // origin: "http://127.0.0.1:5500",
    // origin: "http://192.168.1.74:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  })
);

const allowedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
];

app.use((req, res, next) => {
  const origin = req.headers.referer;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  // res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
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

app.use(express.static(path.join(__dirname, "/")));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Yup it is working!");
});

// Route for serving the widget
// app.get("/api/render/widget", (req, res) => {
//   res.sendFile(path.join(__dirname, "widget.js"));
// });
app.get("/api/render/widget", (req, res) => {
  res.sendFile(path.join(__dirname, "main.js"));
});

app.get("/api/widget/:workspaceId", (req, res) => {
  const { workspaceId } = req.params;

  console.log("GOT WIDGET ID HERE ->", workspaceId);

  // res.setHeader("Content-Type", "application/javascript");

  res.send(`
    (function (global) {
      global.$_widget_workspaceId = ${workspaceId};
      document.cookie = "widget_workspaceId=${workspaceId}";

      const iframeElement = document.createElement("iframe");
      // iframeElement.src = "http://localhost:3010/api/render/widget";
      iframeElement.src = "http://localhost:5173";
      iframeElement.classList.add("iframe-target");

      const style = document.createElement("style");
      style.innerHTML = \`
        .iframe-target {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 9999;
         // background-color: red;
          border: none;
          width: 350px;
          height: 100%;
        }\`;

      document.head.appendChild(style);
      document.body.appendChild(iframeElement);


      // let visitorId;
      // const visitorIdFromLocalStorage = localStorage.getItem("widget_visitorId")
      // if(!visitorIdFromLocalStorage){
      //   visitorId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      //   localStorage.setItem("widget_visitorId", visitorId)
      //   }

      iframeElement.onload = () => {
        iframeElement.contentWindow.postMessage({
          type: "SET_WORKSPACE_ID",
          workspaceId: global.$_widget_workspaceId
        }, "http://localhost:3010") 
  }

    })(window);
`);
});

app.use("/api", registerRouter);
app.use("/api", loginRouter);
app.use("/api", logoutRouter);
app.use("/api", workspaceRouter);
app.use("/api", workspaceMembersRouter);
app.use("/api", visitorChatRouter);
app.use("/api", widgetStylesRouter);

io.on("connection", (socket) => {
  socket.on("visitor-join", () => {
    socket.role = "visitor";
    console.log("VISITOR JOINED");
  });
  socket.on("agent-join", ({ agentId, workspaceId }) => {
    socket.role = "agent";
    socket.agentId = agentId;
    socket.join(workspaceId);
    console.log("AGENT JOINED");
  });

  socket.on("visitor-message-request", async ({ message, workspaceId }) => {
    console.log("ROOMS ->", io.sockets.adapter.rooms);

    socket.to(workspaceId).emit("visitor-message-request", {
      visitorId: socket.id,
      messages: message,
      name: "Karan",
    });
  });

  socket.on("disconnect", () => {
    console.log("SOCKET ROLE ->", socket.role);

    console.log("A User Disconnected ->", socket.agentId);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
