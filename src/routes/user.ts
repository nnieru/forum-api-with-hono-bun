import { Hono } from "hono";
import userController from "../controllers/user";
import { validator } from "hono/validator";
import { RegisterRequestDtoSchema } from "../model/dto/user/register";
import { BaseResponse } from "../model/dto/BaseResponse.model";
import { zValidator } from "@hono/zod-validator";
import { SignInRequestDtoSchema } from "../model/dto/user/signin";

export const userApp = new Hono();

userApp.post(
  "/register",
  zValidator("json", RegisterRequestDtoSchema),
  userController.register
);

userApp.post(
  "/signin",
  zValidator("json", SignInRequestDtoSchema),
  userController.signIn
);
