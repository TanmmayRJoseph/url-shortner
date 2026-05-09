export interface IAuth {
  _id: string;
  name: string;
  email: string;
  password: string;
  refreshTokens: {
    token: string;
    createdAt: Date;
  }[];
  role: "USER" | "ADMIN";
  isVerified: boolean;
  lastLoginAt: Date;
}