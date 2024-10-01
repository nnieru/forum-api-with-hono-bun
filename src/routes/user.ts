import { Hono } from "hono";
import userController from "../controllers/user";
import { validator } from "hono/validator";
import { RegisterRequestDtoSchema } from "../model/dto/user/resgiter";
import { BaseResponse } from "../model/dto/BaseResponse.model";

export const userApp = new Hono();

userApp.post(
  "/register",
  validator("json", async (value, c) => {
    const parsed = RegisterRequestDtoSchema.safeParse(await c.req.json());
    if (!parsed.success) {
      const errorResponse: BaseResponse<any> = {
        code: 400,
        data: parsed.error,
        message: "Bad Request",
      };
      c.status(400);
      return c.json(errorResponse);
    }
  }),
  userController.register
);
