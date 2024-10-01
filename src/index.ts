import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { BaseResponse } from "./model/dto/BaseResponse.model";
import { userApp } from "./routes/user";

const app = new Hono().basePath("/api");

// middleware
app.use(logger());
app.use(prettyJSON());

// routing
app.route("/user", userApp);

app.notFound((c) => {
  c.status(404);
  const response: BaseResponse<any> = {
    code: 404,
    message: "endpoint not found",
  };
  return c.json(response);
});

app.onError((err, c) => {
  console.error(err);
  c.status = c.status || 500;
  err.message = err.message || "internal server error";
  const response: BaseResponse<any> = {
    code: c.res.status || 500,
    message: err.message || "internal server error",
  };
  return c.json(response);
});

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("api/hello", (c) => {
  return c.json({
    ok: true,
    message: "hello hono!",
  });
});

app.get("/posts/:id", (c) => {
  const page = c.req.query("page");
  const id = c.req.param("id");
  c.header("X-Message", "Hi!");
  return c.text(`You want see ${page} of ${id}`);
});

export default app;
