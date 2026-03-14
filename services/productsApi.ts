// src/redux/services/productsApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// ✅ Helper to get token (only client-side)
const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const baseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/products`;

const prepareHeaders = (headers: Headers) => {
  const token = getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return headers;
};

// Interface for a single product for type safety
interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  image: string; // Main product image URL
  link: string;
  tagline?: string;
  technologies: string[];
  features: string[];
  specialFeature?: string;
  version?: string;
  status?: "Active" | "Inactive";
  pricingModel?: "Free" | "Subscription" | "One-time";
  license?: string;
  support?: string;
  demoUrl?: string;
  documentationUrl?: string;
  githubRepo?: string;
  launchDate?: string; // Date can be string or Date object
  createdAt: string;
  updatedAt: string;
}

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders,
  }),
  tagTypes: ["Products"],
  endpoints: (builder) => ({
    // ✅ GET all products
    getProducts: builder.query<Product[], { category?: string }>({
      query: ({ category }) => ({
        url: `/`,
        params: category ? { category } : {},
      }),
      // Provide tags for the list and individual products
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Products' as const, id: _id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    // ✅ GET single product by ID
    getProductById: builder.query<Product, string>({
      query: (id) => `/${id}`,
      // Provide a specific tag for this single product
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),

    // ✅ GET single product by SLUG
    getProductBySlug: builder.query<Product, string>({
      query: (slug) => `/slug/${slug}`,
      // Provide a specific tag for this single product by slug
      providesTags: (result, error, slug) => [{ type: "Products", id: slug }],
    }),

    // ✅ CREATE product
    addProduct: builder.mutation<Product, FormData>({
      query: (data) => ({
        url: `/`,
        method: "POST",
        body: data,
      }),
      // Invalidate the 'LIST' tag to re-fetch all products
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    // ✅ UPDATE product
    updateProduct: builder.mutation<Product, { id: string; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/${id}`,
        method: "PUT",
        body: data,
      }),
      // Invalidate both the 'LIST' tag and the specific product's tag
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id: "LIST" },
        { type: "Products", id: id },
      ],
    }),

    // ✅ DELETE product
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      // Invalidate the 'LIST' tag to re-fetch all products
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
  }),
});

// ✅ Export hooks
export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery, // ✅ Export the new hook
  useAddProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productsApi;