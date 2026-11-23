const cors = require("cors");
const express = require("express");
const Post = require("./models/Post");
const createPostsRouter = require("./routes/posts");

function createApp({ PostModel = Post } = {}) {
  const app = express();
  const allowedOrigins = (process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin is not allowed by CORS"));
    },
  }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });
  app.use("/api/posts", createPostsRouter(PostModel));

  app.use((error, _request, response, _next) => {
    if (error.type === "entity.parse.failed") {
      return response.status(400).json({ error: "Request body must be valid JSON" });
    }
    if (error.message === "Origin is not allowed by CORS") {
      return response.status(403).json({ error: error.message });
    }
    console.error(error);
    return response.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = createApp;
