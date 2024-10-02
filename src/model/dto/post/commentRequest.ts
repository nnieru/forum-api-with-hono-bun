import { z } from "zod";

export interface CommentRequestDto {
  postId: string;
  content: string;
}

export const CommentRequestDtoSchema = z.object({
  postId: z.string(),
  content: z.string().min(3),
});
