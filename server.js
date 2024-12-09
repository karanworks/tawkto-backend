require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const { v4 } = require("uuid");

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
const visitorRequestRouter = require("./routes/chatRequestsRouter");
const visitorDetailsRouter = require("./routes/visitorDetailsRouter");
const openChatsRouter = require("./routes/openChatsRouter");

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
      "http://192.168.1.222",
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
  "http://192.168.1.222",
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
// app.get("/api/widget/:workspaceId", (req, res) => {
//   res.sendFile(path.join(__dirname, "main.js"));
// });

app.get("/api/widget/:workspaceId", (req, res) => {
  const workspaceId = req.params.workspaceId;

  const CLIENT_URL =
    process.env.NODE_ENV === "production"
      ? process.env.CLIENT_PROD_URL
      : process.env.CLIENT_DEV_URL;

  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    (function (global) {
      global.$_widget_workspaceId = "${workspaceId}";
      document.cookie = "widget_workspaceId=${workspaceId}";
      localStorage.setItem("widget_workspaceId","${workspaceId}");

 

      const iframeElement = document.createElement("iframe");
      iframeElement.classList.add("iframe-target");
      iframeElement.src = "about:blank";

      const style = document.createElement("style");
      style.innerHTML = \`
        .iframe-target {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border: none;
          width: 350px;
          height: 100%;
        }\`;

      document.head.appendChild(style);
      document.body.appendChild(iframeElement);


      const iframeDoc = iframeElement.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(\`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Vite + React</title>
  
          <script type="module" crossorigin src="${CLIENT_URL}:3010/dist/bundle.js"></script>
          <link rel="stylesheet" crossorigin href="${CLIENT_URL}:3010/dist/assets/index-cA65dY9O.css" />
          <link rel="stylesheet" crossorigin href="${CLIENT_URL}:3010/dist/assets/index-4JIOBxZ2.css" />
        </head>
        <body>
          <div id="root"></div>
        </body>
      </html>
      \`);
      iframeDoc.close();

   
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
app.use("/api", visitorRequestRouter);
app.use("/api", visitorDetailsRouter);
app.use("/api", openChatsRouter);

const CLIENT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_PROD_URL
    : process.env.CLIENT_DEV_URL;

console.log("CURRENT ENVIRONMENT ->", CLIENT_URL);

io.on("connection", (socket) => {
  socket.on("visitor-join", async ({ visitorId, name }) => {
    socket.data.visitorId = visitorId;
    socket.data.role = "visitor";

    const visitor = await prisma.visitor.findFirst({
      where: {
        visitorId,
      },
    });

    if (!visitor) {
      await prisma.visitor.create({
        data: {
          visitorId,
          name,
        },
      });
    }

    socket.join(visitorId);

    console.log("VISITOR JOINED", socket.id);
  });

  socket.on("agent-join", ({ agentId, workspaceId }) => {
    socket.data.role = "agent";
    socket.data.agentId = agentId;
    socket.join(workspaceId);
    console.log("WORKSPACE ->", workspaceId);

    console.log("AGENT JOINED", socket.id);
  });

  socket.on(
    "visitor-message-request",
    async ({ workspaceId, visitor }, callback) => {
      try {
        let chat = await prisma.chat.findFirst({
          where: {
            workspaceId,
            visitorId: visitor.visitorId,
          },
        });

        let chatAssign;

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              workspaceId,
              visitorId: visitor.visitorId,
            },
          });
          chatAssign = await prisma.chatAssign.create({
            data: {
              chatId: chat.id,
              userId: visitor.visitorId,
            },
          });
        }

        callback({
          visitor,
          ...chat,
          chatId: chat.id,
        });

        socket.to(workspaceId).emit("visitor-message-request", {
          visitor,
          ...chat,
          chatId: chat.id,
        });

        socket.to(socket.id).emit("visitor-message-request", {
          visitor,
          ...chat,
          chatId: chat.id,
        });
      } catch (error) {
        console.log("Error in Visitor Message Request ->", error);
      }
    }
  );

  socket.on("message", async ({ message, chatId, sender, to }) => {
    const chat = await prisma.chat.findFirst({
      where: {
        id: chatId,
      },
    });

    const newMessage = await prisma.message.create({
      data: {
        chatId,
        content: message.content,
        sender,
      },
    });

    if (socket.data.role === "visitor") {
      console.log("WORKSPACE ->", io.sockets.adapter.rooms);

      io.to(socket.id).emit("message", newMessage);
      io.to(to).emit("message", newMessage);
    } else if (socket.data.role === "agent") {
      io.to(to).emit("message", newMessage);
      io.to(chat.workspaceId).emit("message", newMessage);
    }
  });

  socket.on(
    "join-conversation",
    async ({ agentId, chatId, visitorId, workspaceId }) => {
      await prisma.chat.update({
        where: {
          id: chatId,
        },
        data: {
          accepted: true,
        },
      });

      await prisma.chatAssign.create({
        data: {
          chatId: chatId,
          userId: agentId,
        },
      });

      io.to(workspaceId).emit("joined-conversation", { agentId, chatId });

      console.log("WORKSPACE ID ON JOIN CONVERSATION ->", workspaceId);
    }
  );

  socket.on("disconnect", () => {
    console.log("A User Disconnected ->", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
