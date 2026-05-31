// store/store.ts
import { configureStore } from "@reduxjs/toolkit";

import { blogsApi } from "@/services/blogsApi";
import { projectApi } from "@/services/projectsApi";
import { websiteImagesApi } from "@/services/websiteImagesApi";
import { siteSettingsApi } from "@/services/siteSettingsApi";
import { contactApi } from "@/services/contactApi";
import { maldoApi } from "@/services/maldoApi";
import { clientApi } from "@/services/clientApi";
import { productsApi } from "./../services/productsApi";
import { testimonialsApi } from "@/services/testimonialsApi";
import { servicesApi } from "@/services/servicesApi";
import { leadApi } from "@/services/leadApi";
import { authApi } from "@/services/authApi";
import { careerApi } from "@/services/careerApi";

const store = configureStore({
  reducer: {
    [projectApi.reducerPath]: projectApi.reducer,
    [websiteImagesApi.reducerPath]: websiteImagesApi.reducer,
    [siteSettingsApi.reducerPath]: siteSettingsApi.reducer,
    [contactApi.reducerPath]: contactApi.reducer,
    [maldoApi.reducerPath]: maldoApi.reducer,
    [blogsApi.reducerPath]: blogsApi.reducer,
    [clientApi.reducerPath]: clientApi.reducer,
    [productsApi.reducerPath]: productsApi.reducer,
    [testimonialsApi.reducerPath]: testimonialsApi.reducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [leadApi.reducerPath]: leadApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [careerApi.reducerPath]: careerApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      projectApi.middleware,
      websiteImagesApi.middleware,
      siteSettingsApi.middleware,
      contactApi.middleware,
      maldoApi.middleware,
      blogsApi.middleware,
      testimonialsApi.middleware,
      clientApi.middleware,
      productsApi.middleware,
      servicesApi.middleware,
      leadApi.middleware,
      authApi.middleware,
      careerApi.middleware,
    ]),
  devTools: process.env.NODE_ENV !== "production", // ✅ enable Redux DevTools in development
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
