import { z } from "zod";

export interface CreatePostRequest {
  title: string;
  content: string;
}

export const CreatePostRequestDtoSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(3).optional(),
});
