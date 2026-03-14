import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base URL for auth API
const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users`;

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    _id: string;
    email: string;
    role: string;
    // Add other user fields as needed
  };
}

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
  }),
  endpoints: (builder) => ({
    // Login
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/login",
        method: "POST",
        body: credentials,
      }),
    }),
  }),
});

// Export hooks
export const { useLoginMutation } = authApi;
