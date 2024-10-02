import { Hono } from "hono";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { BaseResponse } from "./model/dto/BaseResponse.model";
import { userApp } from "./routes/user";
import { authMiddleware } from "./middlewares/autMiddleware";
import { every } from "hono/combine";
import { postApp } from "./routes/post";

const app = new Hono().basePath("/api");

// middleware
app.use(logger());
app.use(prettyJSON());
app.use("/post/*", authMiddleware);
app.use("/user/profile/*", authMiddleware);

// routing
app.route("/user", userApp);
app.route("/post", postApp);

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

export default app;
