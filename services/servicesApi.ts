// src/redux/services/servicesApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper to get token (only client-side)
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

// Base URL for services API
const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/services`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

// Interface for a single service
interface Service {
  _id?: string;
  slug: string;
  title: string;
  desc: string;
  longDesc: string;
  tags: string[];
  icon?: string;
  category?: string;
  featured?: boolean;
  duration?: string;
  pricing?: string;
  cta?: string;
  tools: string[];
  points: string[];
  valueProvide: string[];
  targetAudience?: string;
  keywords: string[];
  image?: string;
  serviceImage?: string;
}

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Services"],
  endpoints: (builder) => ({
    // GET all services
    getServices: builder.query<Service[], void>({
      query: () => `/`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ slug }) => ({
                type: "Services" as const,
                id: slug,
              })),
              { type: "Services" as const, id: "LIST" },
            ]
          : [{ type: "Services" as const, id: "LIST" }],
      transformResponse: (response: any) => response.services,
    }),

    // GET single service by slug
    getServiceBySlug: builder.query<Service, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result, error, slug) => [
        { type: "Services" as const, id: slug },
      ],
      transformResponse: (response: any) => response.service,
    }),

    // CREATE new service
    addService: builder.mutation<Service, FormData>({
      query: (formData) => ({
        url: `/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Services", id: "LIST" }],
    }),

    // UPDATE service by ID
    updateService: builder.mutation<
      Service,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/${id}`, // Use the ID in the URL
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Services", id: "LIST" },
        { type: "Services", id: id },
      ],
    }),

    // DELETE service by ID
    deleteService: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/${id}`, // Use the ID in the URL
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Services", id: "LIST" }],
    }),
  }),
});

// Export hooks
export const {
  useGetServicesQuery,
  useGetServiceBySlugQuery,
  useAddServiceMutation,
  useUpdateServiceMutation,
  useDeleteServiceMutation,
} = servicesApi;
