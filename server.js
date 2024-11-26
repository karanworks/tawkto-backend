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
const { workerData } = require("worker_threads");
const visitorRequestRouter = require("./routes/chatRequestsRouter");

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
// app.get("/api/widget/:workspaceId", (req, res) => {
//   res.sendFile(path.join(__dirname, "main.js"));
// });

app.get("/api/widget/:workspaceId", (req, res) => {
  const workspaceId = req.params.workspaceId;
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
          <script type="module" crossorigin src="http://localhost:3010/dist/bundle.js"></script>
          <link rel="stylesheet" crossorigin href="http://localhost:3010/dist/assets/index-cA65dY9O.css" />
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

io.on("connection", (socket) => {
  socket.on("visitor-join", async ({ visitorId, name }) => {
    socket.visitorId = visitorId;
    socket.role = "visitor";

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

    console.log("VISITOR JOINED", socket.id);
  });

  socket.on("agent-join", ({ agentId, workspaceId }) => {
    socket.role = "agent";
    socket.agentId = agentId;
    socket.join(workspaceId);
    console.log("AGENT JOINED");
  });

  // Unique id for visitor
  const uuid = v4();

  // socket.on(
  //   "visitor-message-request",
  //   async ({ message, workspaceId, visitor }) => {
  //     const chatAlreadyExist = await prisma.chat.findFirst({
  //       where: {
  //         createdBy: visitor.visitorId,
  //       },
  //     });

  //     if (!chatAlreadyExist) {
  //       const chat = await prisma.chat.create({
  //         data: {
  //           workspaceId,
  //           createdBy: visitor.visitorId,
  //         },
  //       });

  //       await prisma.chatAssign.create({
  //         data: {
  //           chatId: chat.id,
  //           userId: visitor.visitorId,
  //         },
  //       });

  //       socket.to(workspaceId).emit("visitor-message-request", {
  //         messages: message,
  //         chatId: chat.id,
  //         visitor,
  //       });

  //       await prisma.message.create({
  //         data: {
  //           chatId: chat.id,
  //           sender: visitor,
  //           content: message,
  //         },
  //       });
  //     } else {
  //       socket.to(workspaceId).emit("visitor-message-request", {
  //         messages: message,
  //         chatId: chatAlreadyExist.id,
  //         visitor,
  //       });
  //       await prisma.message.create({
  //         data: {
  //           messages: message,
  //           chatId: chatAlreadyExist.id,
  //           sender: visitor,
  //         },
  //       });
  //     }
  //   }
  // );
  socket.on(
    "visitor-message-request",
    async ({ workspaceId, visitor }, callback) => {
      try {
        let chatRequest = await prisma.chat.findFirst({
          where: {
            workspaceId,
            visitorId: visitor.visitorId,
            status: "pending",
          },
        });

        let chat;
        let chatAssign;

        if (!chatRequest) {
          chat = await prisma.chat.create({
            data: {
              workspaceId,
              visitorId: visitor.visitorId,
              status: "pending",
            },
          });
          chatAssign = await prisma.chatAssign.create({
            data: {
              chatId: chat.id,
              userId: visitor.visitorId,
            },
          });
        }

        console.log("CHAT ID ->", chat);

        callback({
          visitor,
          ...chatRequest,
          chatId: chat.id,
        });

        socket.to(workspaceId).emit("visitor-message-request", {
          visitor,
          ...chatRequest,
          chatId: chat.id,
        });

        socket.to(socket.id).emit("visitor-message-request", {
          visitor,
          ...chatRequest,
          chatId: chat.id,
        });
      } catch (error) {
        console.log("Error in Visitor Message Request ->", error);
      }
    }
  );

  socket.on("message", async ({ message, chatId, sender, workspaceId }) => {
    const visitorRequest = await prisma.chat.findFirst({
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

    if (visitorRequest.status === "pending") {
      socket.to(workspaceId).emit("message", {
        message: newMessage,
      });
    } else {
      io.to(socket.id).emit("message", { message: newMessage });
    }
  });

  socket.on(
    "join-conversation",
    async ({ agentId, chatId, visitorId, workspaceId }) => {
      const pendingConversation = await prisma.visitorRequest.findFirst({
        where: {
          workspaceId,
          visitorId,
        },
      });

      await prisma.visitorRequest.update({
        where: {
          id: pendingConversation.id,
        },
        data: {
          status: "accepted",
        },
      });

      const alreadyAssigned = await prisma.chatAssign.findFirst({
        where: {
          chatId: chatId,
          userId: agentId,
        },
      });

      if (!alreadyAssigned) {
        await prisma.chatAssign.create({
          data: {
            chatId: chatId,
            userId: agentId,
          },
        });
      }

      // Join the same room as visitor
      const sockets = Array.from(io.sockets.sockets.values()); // Get all sockets
      const foundSocket = sockets.find((s) => s.visitorId === visitorId);
      socket.join(foundSocket.id);
    }
  );

  socket.on("disconnect", () => {
    console.log("A User Disconnected ->", socket.id);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
