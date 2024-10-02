import { Hono } from "hono";
import userController from "../controllers/user";
import { RegisterRequestDtoSchema } from "../model/dto/user/register";
import { zValidator } from "@hono/zod-validator";
import { SignInRequestDtoSchema } from "../model/dto/user/signin";
import { UpdateUserProfileRequestDtoSchema } from "../model/dto/user/updateUserProfileRequest";

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

userApp.post(
  "/profile/update",
  zValidator("json", UpdateUserProfileRequestDtoSchema),
  userController.updateProfile
);

userApp.get("/profile", userController.getProfile);
