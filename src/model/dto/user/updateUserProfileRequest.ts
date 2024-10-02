import { z } from "zod";

export interface UpdateUserProfileRequestDto {
  bio?: string;
  link?: string;
  avatar?: string;
}

export const UpdateUserProfileRequestDtoSchema = z.object({
  bio: z.string().min(3).optional(),
  link: z.string().url().optional(),
  avatar: z.string().url().optional(),
});
