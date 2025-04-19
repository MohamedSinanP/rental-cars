export enum Role {
  ADMIN = "admin",
  USER = "user",
  OWNER = "owner"
}

export interface IJwtToken {
  accessToken: string;
};


export interface LoginResponse {
  accessToken: string;
  user: {
    userName: string;
    email: string;
    isBlocked: boolean;
    password?: string;
    role: string;
    isVerified: boolean;
  }
}
export interface LoginGoogleResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    userName: string;
    email: string;
    isBlocked: boolean;
    password?: string;
    role: string;
    isVerified: boolean;
  };
};