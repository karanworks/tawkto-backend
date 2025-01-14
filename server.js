require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const fs = require("fs");

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
const widgetStatusRouter = require("./routes/widgetStatusRouter");
const chatStatus = require("./constants/chatStatus");
const solvedChatsRouter = require("./routes/solvedChatsRouter");

const app = express();

// Load SSL certificate and key
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/ascent-bpo.com-0001/privkey.pem"),
  cert: fs.readFileSync(
    "/etc/letsencrypt/live/ascent-bpo.com-0001/fullchain.pem"
  ),
  hostname: "ascent-bpo.com",
  port: 443,
};

const server = http.createServer(options, app);
// const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
});

app.use(express.json());

// app.use(
//   cors({
//     // origin: "http://192.168.1.159:3000",
//     // origin: [
//     //   "https://ascent-bpo.com",
//     //   "http://localhost:3000",
//     //   "https://asiwallegal.com",
//     //   "http://127.0.0.1:5500",
//     //   "http://localhost:5173",
//     //   "http://192.168.1.222",
//     //   "http://192.168.1.200",
//     // ],
//     // origin: "http://127.0.0.1:5500",
//     // origin: "http://192.168.1.74:3000",
//     origin: "*",
//     credentials: true,
//     methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
//   })
// );
app.use(async (req, res, next) => {
  try {
    const allWorkspaces = await prisma.workspace.findMany({});

    const allowedOrigins = allWorkspaces.map((workspace) => workspace.website);

    cors({
      origin: [
        ...allowedOrigins,
        "http://127.0.0.1:5500",
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ascent-bpo.com",
      ],
      credentials: true,
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    })(req, res, next);
  } catch (error) {
    console.error("Error while fetching workspaces for CORS ->", error);
    next(error);
  }
});

const allowedOrigins = [
  "https://ascent-bpo.com",
  "https://www.ascent-bpo.com",
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5173",
  "http://192.168.1.222",
  "http://192.168.1.200",
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
    "GET, PUT, POST, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  next();
});

app.use(express.static(path.join(__dirname, "/")));
// app.use(express.static(path.join(__dirname)));

// app.use(
//   "/dist",
//   express.static(path.join(__dirname, "/"), {
//     setHeaders: (res) => {
//       res.setHeader("Access-Control-Allow-Origin", "*");
//     },
//   })
// );

app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Yup it is working!");
});

// Route for serving the widget
// app.get("/api/widget/:workspaceId", (req, res) => {
//   res.sendFile(path.join(__dirname, "main.js"));
// });

// localStorage.setItem("workspace","${JSON.stringify(workspace)}");

app.get("/api/widget/:workspaceId", async (req, res) => {
  const workspaceId = req.params.workspaceId;
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
    },
  });

  // const CLIENT_URL =
  //   process.env.NODE_ENV === "production"
  //     ? process.env.CLIENT_PROD_URL
  //     : process.env.CLIENT_DEV_URL;

  const normalizeUrl = (url) => url.replace(/\/+$/, ""); // Remove trailing slashes from the base URL

  const CLIENT_URL =
    process.env.NODE_ENV === "production"
      ? normalizeUrl(process.env.CLIENT_PROD_URL)
      : normalizeUrl(process.env.CLIENT_DEV_URL);

  res.setHeader("Content-Type", "application/javascript");
  res.send(`
    (function (global) {
      global.$_workspace = "${workspace}";
      document.cookie = "workspaceId=${workspaceId}";
      
      localStorage.setItem("workspace", JSON.stringify(${JSON.stringify(
        workspace
      )}));

 

      const iframeElement = document.createElement("iframe");
      iframeElement.classList.add("iframe-target");
      iframeElement.src = "about:blank";

      window.addEventListener("message", (event) => {
  if (event.data?.type === "resizeIframe" && event.data.height) {

  console.log("IFRAME HEIGHT ->", event.data.height, event.data.width)
    iframeElement.style.height = event.data.height;
    iframeElement.style.width = event.data.width;
  }
});

      const style = document.createElement("style");
      style.innerHTML = \`
        .iframe-target {
          position: fixed;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border: none;
          background: none !important;
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
          <title>Webwers</title>
          <script type="module" crossorigin src="${CLIENT_URL}/dist/bundle.js"></script>
           <link rel="stylesheet" crossorigin href="${CLIENT_URL}/dist/assets/index-hhK3uYej.css" />
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
app.use("/api", solvedChatsRouter);
app.use("/api", widgetStatusRouter);

const CLIENT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.CLIENT_PROD_URL
    : process.env.CLIENT_DEV_URL;

console.log("CURRENT ENVIRONMENT ->", CLIENT_URL);

io.on("connection", (socket) => {
  socket.on("visitor-join", async ({ id, name, email, workspaceId }) => {
    try {
      let visitor;

      if (id) {
        visitor = await prisma.visitor.findFirst({
          where: {
            id,
          },
        });
      }

      if (!visitor) {
        visitor = await prisma.visitor.create({
          data: {
            name,
            email,
          },
        });

        socket.emit("visitor-joined", visitor);
      }

      const chat = await prisma.chat.findFirst({
        where: {
          visitorId: visitor.id,
        },
      });

      if (chat) {
        socket.data.chatId = chat.id;
      }

      socket.data.workspaceId = workspaceId;
      socket.data.visitorId = visitor.id;
      socket.data.role = "visitor";

      socket.join(visitor.id);

      console.log("VISITOR JOINED", socket.id);
    } catch (error) {
      console.log("Error inside visitor-join event ->", error);
    }
  });

  socket.on("agent-join", ({ agentId, workspaceId }) => {
    socket.data.role = "agent";
    socket.data.agentId = agentId;
    socket.join(workspaceId);

    console.log("ROOMS WHILE AGENT JOINED ->", io.sockets.adapter.rooms);

    console.log("AGENT JOINED", socket.id, "WORKSPACE ID ->", workspaceId);
  });

  socket.on(
    "visitor-message-request",
    async ({ workspaceId, visitor }, callback) => {
      try {
        let messages;
        let chat = await prisma.chat.findFirst({
          where: {
            workspaceId,
            visitorId: visitor.id,
          },
        });

        if (chat) {
          messages = await prisma.message.findMany({
            where: {
              chatId: chat.id,
            },
          });
          socket.data.chatId = chat.id;
        }

        if (!chat) {
          chat = await prisma.chat.create({
            data: {
              workspaceId,
              visitorId: visitor.id,
            },
          });
          chatAssign = await prisma.chatAssign.create({
            data: {
              chatId: chat.id,
              userId: visitor.id,
            },
          });
          socket.data.chatId = chat.id;

          console.log("CHAT ID WHILE TRYING TO GET MESSAGES ->", chat.id);

          messages = await prisma.message.findMany({
            where: {
              chatId: chat.id,
            },
          });

          console.log("MESSAGES WHEN INITIATING A CHAT ->", messages);
        }

        socket.data.workspaceId = workspaceId;

        callback(chat);

        socket.to(workspaceId).emit("visitor-message-request", {
          visitor,
          ...chat,
          chatId: chat.id,
          messages,
        });

        socket.to(socket.id).emit("visitor-message-request", {
          visitor,
          ...chat,
          chatId: chat.id,
          messages,
        });
      } catch (error) {
        console.log("Error in Visitor Message Request event ->", error);
      }
    }
  );

  socket.on("typing", ({ user }) => {
    console.log("THIS USER IS TYPING", user);

    let targetVisitor = null;

    if (user.type === "agent") {
      io.sockets.sockets.forEach((s) => {
        if (s.data.visitorId === user.visitorId) {
          targetVisitor = s.id;
        }
      });

      io.to(targetVisitor).emit("typing", user);
    }

    if (user.type === "visitor") {
      io.to(user.workspaceId).emit("typing", user);
    }
  });

  socket.on("message", async ({ message, chatId, sender, to }) => {
    try {
      console.log("CHAT ID IN MESSAGE ->", chatId);

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
        io.to(socket.id).emit("message", newMessage);
        io.to(to).emit("message", newMessage);
      } else if (socket.data.role === "agent") {
        io.to(to).emit("message", newMessage);
        io.to(chat.workspaceId).emit("message", newMessage);
      }
    } catch (error) {
      console.log("Error in message event ->", error);
    }
  });

  socket.on(
    "join-conversation",
    async ({ agentId, chatId, visitorId, workspaceId }) => {
      try {
        await prisma.chat.update({
          where: {
            id: chatId,
          },
          data: {
            status: chatStatus.ACCEPTED,
          },
        });

        await prisma.chatAssign.create({
          data: {
            chatId: chatId,
            userId: agentId,
          },
        });

        io.to(workspaceId).emit("joined-conversation", { agentId, chatId });

        socket.emit("joined-conversation", { agentId, chatId });
      } catch (error) {
        console.log("Error in join conversation event ->", error);
      }
    }
  );

  socket.on("chat-widget-state", async (widgetState) => {
    try {
      socket
        .to(widgetState.workspaceId)
        .emit("visitor-chat-widget-state", widgetState);
      socket.to(socket.id).emit("visitor-chat-widget-state", widgetState);
    } catch (error) {
      console.log("Error in chat widget state event ->", error);
    }
  });

  socket.on("widget-connected", (workspace) => {
    console.log("ROOMS WHEN WIDGET CONNECTED ->", io.sockets.adapter.rooms);

    io.to(workspace.id).emit("widget-connected", workspace);
  });

  socket.on("visitor-status", async (status, workspaceId) => {
    try {
      const { chatId } = socket.data;

      const statusAlreadyExist = await prisma.visitorStatus.findFirst({
        where: {
          workspaceId,
          visitorId: status.visitor.id,
          chatId,
        },
      });

      if (!statusAlreadyExist) {
        await prisma.visitorStatus.create({
          data: {
            workspaceId,
            visitorId: status.visitor.id,
            chatId,
            status: status.status,
          },
        });
      } else {
        await prisma.visitorStatus.update({
          where: {
            id: statusAlreadyExist.id,
          },
          data: {
            status: status.status,
          },
        });
      }

      io.to(socket.id).emit("visitor-status-update", status);
      io.to(workspaceId).emit("visitor-status-update", status);

      console.log("A USER IS ONLINE!");
    } catch (error) {
      console.log("error in visitor status event ->", error);
    }
  });

  socket.on("disconnect", async () => {
    try {
      const { visitorId, chatId, workspaceId } = socket.data;

      const visitor = await prisma.visitor.findFirst({
        where: {
          id: visitorId,
        },
      });

      const visitorStatus = await prisma.visitorStatus.findFirst({
        where: {
          visitorId,
          chatId,
          workspaceId,
        },
      });

      if (visitorStatus) {
        await prisma.visitorStatus.update({
          where: {
            id: visitorStatus.id,
          },
          data: {
            status: "offline",
          },
        });
      }

      console.log("VISITOR STATUS ->", {
        visitor: { ...visitor, chatId },
        status: "offline",
      });

      io.to(socket.id).emit("visitor-status-update", {
        visitor: { ...visitor, chatId },
        status: "offline",
      });
      io.to(workspaceId).emit("visitor-status-update", {
        visitor: { ...visitor, chatId },
        status: "offline",
      });
      console.log("A User Disconnected ->", socket.id);
    } catch (error) {
      console.log("error on disconnect event ->", error);
    }
  });
});

io.engine.on("connection_error", (err) => {
  console.log("SOCKET ERROR 1 ->", err.code); // 3
  console.log("SOCKET ERROR 2 ->", err.message); // "Bad request"
  console.log("SOCKET ERROR 3 ->", err.context); // { name: 'TRANSPORT_MISMATCH', transport: 'websocket', previousTransport: 'polling' }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR HANDLER ->", err.stack);
  res.status(500).send("Internal Server Error");
});

server.listen(process.env.PORT, () => {
  console.log(`Server listening on ${process.env.PORT}`);
});
