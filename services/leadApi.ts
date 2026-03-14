// src/redux/services/leadApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token (only client-side)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/leads`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const leadApi = createApi({
  reducerPath: "leadApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Leads"],
  endpoints: (builder) => ({
    // ✅ GET all leads
    getLeads: builder.query<any, void>({
      query: () => `/`,
      providesTags: ["Leads"],
    }),

    // ✅ GET single lead by ID
    getLeadById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: ["Leads"],
    }),

    // ✅ CREATE lead
    addLead: builder.mutation<any, Partial<any>>({
      query: (lead) => ({
        url: `/lead`,
        method: "POST",
        body: lead,
      }),
      invalidatesTags: ["Leads"],
    }),

    // ✅ UPDATE lead
    updateLead: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Leads"],
    }),

    // ✅ DELETE lead
    deleteLead: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leads"],
    }),

    // ✅ UPDATE lead status only
    updateLeadStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetLeadsQuery,
  useGetLeadByIdQuery,
  useAddLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useUpdateLeadStatusMutation,
} = leadApi;
