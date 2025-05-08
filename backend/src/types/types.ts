export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
};


export enum Role {
  ADMIN = "admin",
  USER = "user",
  OWNER = "owner"
};

export interface IJwtToken {
  accessToken: string;
};


export interface LoginResponse {
  accessToken: string;
  user: {
    _id: string
    userName: string;
    email: string;
    isBlocked: boolean;
    password?: string;
    role: string;
    isVerified: boolean;
  };
};
export interface adminLoginResponse {
  accessToken: string;
  email: string;
  role: string;
};
export interface LoginGoogleResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    _id: string;
    userName: string;
    email: string;
    isBlocked: boolean;
    password?: string;
    role: string;
    isVerified: boolean;
  };
};

export interface AuthCheck {
  userName?: string;
  email: string;
  role: string;
  isVerified?: boolean;
  isBlocked?: boolean;
};

export interface PaginatedData<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

export interface IAdminDashboardData {
  totalUsers: number;
  totalOwners: number;
  totalEarnings: number;
  subscriptionEarnings: number;
  totalCommission: number;
  totalBookings: number
}
export interface IOwnerDashboardData {
  totalEarnings: number;
  totalCars: number;
  totalBookings: number;
  platformCommission: number;
}