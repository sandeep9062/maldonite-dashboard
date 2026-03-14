// src/redux/services/clientApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token (only client-side)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/clients`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers; // ⚡ Don't force Content-Type (important for FormData)
};

export const clientApi = createApi({
  reducerPath: "clientApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Clients"],
  endpoints: (builder) => ({
    // ✅ GET all clients
    getClients: builder.query<any, void>({
      query: () => `/`,
      providesTags: ["Clients"],
    }),

    // ✅ GET single client
    getClientById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: ["Clients"],
    }),

    // ✅ CREATE client (with logo/icon upload via FormData)
    addClient: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: `/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Clients"],
    }),

    // ✅ UPDATE client
    updateClient: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: ["Clients"],
    }),

    // ✅ DELETE client
    deleteClient: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Clients"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetClientsQuery,
  useGetClientByIdQuery,
  useAddClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
} = clientApi;
