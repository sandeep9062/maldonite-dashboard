import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/careers`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const careerApi = createApi({
  reducerPath: "careerApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Careers"],
  endpoints: (builder) => ({
    // GET all careers (admin - includes inactive)
    getCareersAdmin: builder.query<any, void>({
      query: () => `/admin/all`,
      providesTags: ["Careers"],
    }),

    // GET all active careers (public)
    getCareers: builder.query<any, void>({
      query: () => `/`,
      providesTags: ["Careers"],
    }),

    // GET single career by ID
    getCareerById: builder.query<any, string>({
      query: (id) => `/${id}`,
      providesTags: ["Careers"],
    }),

    // CREATE career
    addCareer: builder.mutation<any, Partial<any>>({
      query: (career) => ({
        url: `/`,
        method: "POST",
        body: career,
      }),
      invalidatesTags: ["Careers"],
    }),

    // UPDATE career
    updateCareer: builder.mutation<any, { id: string; data: Partial<any> }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Careers"],
    }),

    // DELETE career
    deleteCareer: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Careers"],
    }),
  }),
});

export const {
  useGetCareersAdminQuery,
  useGetCareersQuery,
  useGetCareerByIdQuery,
  useAddCareerMutation,
  useUpdateCareerMutation,
  useDeleteCareerMutation,
} = careerApi;
