import { z } from "zod";

export interface SignInRequestDto {
  email: string;
  password: string;
}

export interface SignInResponseDto {
  email: string;
  username: string;
  token: string;
  exp: number;
}

export const SignInRequestDtoSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
