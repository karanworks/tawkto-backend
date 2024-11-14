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
const path = require("path");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

app.use(
  cors({
    // origin: "http://192.168.1.159:3000",
    origin: "http://localhost:3000",
    // origin: "http://192.168.1.74:3000",
    credentials: true,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
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
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Yup it is working!");
});

// Route for serving the widget
app.get("/api/render/widget", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/index.html"));
});

app.get("/api/widget/:workspaceId", (req, res) => {
  const { workspaceId } = req.params;

  console.log("GOT WIDGET ID HERE ->", workspaceId);

  res.setHeader("Content-Type", "application/javascript");

  res.send(`
    (function (global) {
      global.$_widget_workspaceId = ${workspaceId};
      document.cookie = "widget_workspaceId=${workspaceId}";

      const iframeElement = document.createElement("iframe");
      iframeElement.src = "http://localhost:3010/api/render/widget";
      iframeElement.classList.add("iframe-target");

      const style = document.createElement("style");
      style.innerHTML = \`
        .iframe-target {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 9999;
          background-color: red;
          border: none;
          width: 350px;
          height: 100%;
        }\`;

      document.head.appendChild(style);
      document.body.appendChild(iframeElement);

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

io.on("connection", (socket) => {
  socket.on("visitor-join", () => {
    socket.role = "visitor";
  });
  socket.on("agent-join", ({ id, workspaceId }) => {
    socket.role = "agent";
    socket.agentId = id;
    socket.join(workspaceId);
    console.log("AGENT JOINED");
  });

  socket.on("visitor-message", async ({ message, workspaceId }) => {
    console.log("ROOMS ->", io.sockets.adapter.rooms);

    socket.to(workspaceId).emit("visitor-message", message);
  });

  socket.on("disconnect", () => {
    console.log("SOCKET ROLE ->", socket.role);

    console.log("A User Disconnected ->", socket.agentId);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
