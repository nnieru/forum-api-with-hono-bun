import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  // Return error if Authorization header is missing
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      { code: 401, message: "Authorization header missing or malformed" },
      401
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = await verify(token, process.env.SECRET_KEY ?? "");

    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      return c.json({ code: 401, message: "Token expired" }, 401);
    }

    await next();
  } catch (error) {
    return c.json({ code: 401, message: "Unauthorized" }, 401);
  }
});
