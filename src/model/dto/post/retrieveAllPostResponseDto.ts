import { User } from "@prisma/client";

export interface RetrieveAllPostResponseDto {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  commentsCount: number;
  user: UserPostDto;
}

export interface UserPostDto {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}