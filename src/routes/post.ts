import { Hono } from "hono";

export const postApp = new Hono();

postApp.get("/", async (c) => {
  const user = c.get("user") ?? "";
  return c.json({ message: `hello ${user}` });
});

postApp.post("/create", (c) => {
  return c.json({ message: "Post created" });
});
