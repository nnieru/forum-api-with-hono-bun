import { Hono } from "hono";

export const postApp = new Hono();

postApp.get("/", (c) => {
  return c.json({ message: "Hello World" });
});
