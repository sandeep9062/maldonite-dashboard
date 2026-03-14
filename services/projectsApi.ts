import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token from localStorage (only runs client-side)
const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("token") : null);

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/projects`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

// Interface for a single project for type safety
interface Project {
  _id: string;
  title: string;
  slug: string;
  live: string;
  type: string;
  github: string;
  description: string;
  clientName: string;
  place: string;
  timeDuration: string;
  cost: number;
  technologiesUsed: string[];
  deployment: string;
  features: string[];
  specialFeature: string;
  numberOfPages: number;
  image: string[];
  createdAt: string;
  updatedAt: string;
}

export const projectApi = createApi({
  reducerPath: "projectApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Projects"],
  endpoints: (builder) => ({
    // ✅ GET all projects
    getProjects: builder.query<Project[], void>({
      query: () => `/`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Projects' as const, id: _id })),
              { type: 'Projects', id: 'LIST' },
            ]
          : [{ type: 'Projects', id: 'LIST' }],
    }),

    // ✅ GET single project by ID
    getProjectById: builder.query<Project, string>({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Projects", id }],
    }),
    
    // ✅ GET single project by slug
    getProjectBySlug: builder.query<Project, string>({
      query: (slug) => `/slug/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Projects", id: slug }],
    }),

    // ✅ POST new project
    addProject: builder.mutation<Project, FormData>({
      query: (formData) => ({
        url: `/`,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),

    // ✅ UPDATE project
    updateProject: builder.mutation<Project, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Projects", id: "LIST" },
        { type: "Projects", id: id },
      ],
    }),

    // ✅ DELETE project
    deleteProject: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Projects", id: "LIST" }],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetProjectBySlugQuery, // ✅ Export the new hook
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectApi;