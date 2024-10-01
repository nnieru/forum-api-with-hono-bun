import { z } from "zod";

export interface RegisterRequestDto {
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export const RegisterRequestDtoSchema = z.object({
  firstName: z.string().min(3),
  lastName: z.string().optional(),
  username: z.string(),
  email: z.string().email(),
  dateOfBirth: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
});
