import { RetrieveAllPostResponseDto } from "./retrieveAllPostResponseDto";

export interface getAllCommentResponseDto {
  post: RetrieveAllPostResponseDto;
  comments: CommentDto[];
}

export interface CommentDto {
  id: string;
  content: string;
  createdAt: Date;
  user: UserCommentDto;
}

export interface UserCommentDto {
  id: string;
  username: string;
}
