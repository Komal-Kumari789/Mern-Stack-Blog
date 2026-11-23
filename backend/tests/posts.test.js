const request = require("supertest");
const createApp = require("../src/app");

describe("blog post API", () => {
  const posts = [
    { _id: "post-1", title: "First post", content: "Hello blog", author: "A", createdAt: new Date() },
  ];
  const PostModel = {
    find: jest.fn(() => ({
      sort: jest.fn(() => ({
        lean: jest.fn().mockResolvedValue(posts),
      })),
    })),
    create: jest.fn(async (post) => ({ _id: "post-2", ...post })),
  };
  const app = createApp({ PostModel });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("lists blog posts", async () => {
    const response = await request(app).get("/api/posts");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: "First post", content: "Hello blog" }),
    ]));
  });

  test("creates a post and rejects missing required fields", async () => {
    const response = await request(app)
      .post("/api/posts")
      .send({ title: " New post ", content: " Write something ", author: " Sam " });

    expect(response.status).toBe(201);
    expect(PostModel.create).toHaveBeenCalledWith({
      title: "New post",
      content: "Write something",
      author: "Sam",
    });

    const invalidResponse = await request(app).post("/api/posts").send({ title: "Title" });
    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body.error).toMatch(/required/);
  });

  test("serves a health check without a database", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
