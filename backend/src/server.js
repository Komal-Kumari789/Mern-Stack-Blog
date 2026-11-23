require("dotenv").config();

const mongoose = require("mongoose");
const createApp = require("./app");

const port = Number(process.env.PORT) || 4000;
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function start() {
  await mongoose.connect(databaseUrl);
  console.log("Connected to MongoDB");

  const server = createApp().listen(port, "0.0.0.0", () => {
    console.log(`Blog API listening on port ${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongoose.disconnect();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

start().catch((error) => {
  console.error("Unable to start the blog API:", error);
  process.exit(1);
});
