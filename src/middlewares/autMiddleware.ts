import { Context } from "hono";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c: Context, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { code: 401, message: "Authorization header missing or malformed" },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, process.env.SECRET_KEY ?? "");

    if (payload.exp && payload.exp < Date.now()) {
      return c.json({ code: 401, message: "Token expired" }, 401);
    }
    c.set("email", payload.email);
    c.set("id", payload.id);

    await next();
  } catch (error) {
    return c.json({ code: 401, message: "Unauthorized" }, 401);
  }
});
