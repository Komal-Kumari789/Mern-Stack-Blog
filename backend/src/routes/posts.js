const express = require("express");

function createPostsRouter(PostModel) {
  const router = express.Router();

  router.get("/", async (_request, response, next) => {
    try {
      const posts = await PostModel.find().sort({ createdAt: -1 }).lean();
      return response.json(posts);
    } catch (error) {
      return next(error);
    }
  });

  router.post("/", async (request, response, next) => {
    const { title, content, author } = request.body || {};
    if (typeof title !== "string" || !title.trim() || typeof content !== "string" || !content.trim()) {
      return response.status(400).json({ error: "Title and content are required" });
    }

    try {
      const post = await PostModel.create({
        title: title.trim(),
        content: content.trim(),
        author: typeof author === "string" && author.trim() ? author.trim() : "Anonymous",
      });
      return response.status(201).json(post);
    } catch (error) {
      return next(error);
    }
  });

  return router;
}

module.exports = createPostsRouter;
