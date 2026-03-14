// services/maldoApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token from localStorage (client-side only)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

// ✅ Set base URL (adjust as needed)
const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1`;

// ✅ Add Authorization header if token exists
const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

// ✅ Create RTK Query API
export const maldoApi = createApi({
  reducerPath: "maldoApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Leads", "Chats"],
  endpoints: (builder) => ({
    // ✅ POST /maldo/chat - Chat with AI assistant
    sendMessageToMaldo: builder.mutation<
      { reply: string },
      { sessionId: string; message: string }
    >({
      query: (body) => ({
        url: `/maldo/chat`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Chats"],
    }),

    // ✅ POST /leads - Create new lead manually
    createLead: builder.mutation<
      any,
      {
        name: string;
        email: string;
        phone?: string;
        projectType?: string;
        requirements?: string;
        budget?: string;
        timeline?: string;
      }
    >({
      query: (body) => ({
        url: `/leads`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),

    // ✅ GET /leads - Get all leads (if needed)
    getAllLeads: builder.query<any[], void>({
      query: () => `/leads`,
      providesTags: ["Leads"],
    }),

    // ✅ DELETE /leads/:id - Delete a lead
    deleteLead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

// ✅ Export auto-generated hooks
export const {
  useSendMessageToMaldoMutation,
  useCreateLeadMutation,
  useGetAllLeadsQuery,
  useDeleteLeadMutation,
} = maldoApi;
