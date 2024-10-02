export interface UpdateUserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  bio?: string | null;
  link?: string | null;
  avatar?: string | null;
}
