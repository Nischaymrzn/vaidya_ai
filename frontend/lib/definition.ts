export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export type TUser = {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: Role;
  number?: string;
  profilePicture?: string;
  isEmailVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
