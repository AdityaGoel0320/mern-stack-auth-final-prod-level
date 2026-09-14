import { createBrowserRouter, Navigate } from "react-router-dom";

import AuthLayout from "./layouts/AuthLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import NotFound from "../pages/NotFound";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import HomePage from "../pages/HomePage";
import ProtectedLayout from "./layouts/ProtectedLayout";
import ProfilePage from "../pages/ProfilePage";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <NotFound />,
    children: [

      // PUBLIC ROUTES
      {
        element: <AuthLayout />,
        children: [
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <Register />,
          },
        ],
      },

      // PROTECTED ROUTES
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <ProtectedLayout />,
            children: [
              {
                index: true,
                element: <HomePage />,
              },
              {
                path: "profile",
                element: <ProfilePage />,
              },
            ],
          },
        ],
      },

      // 404
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

export default router;