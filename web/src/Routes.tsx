import { RouterProvider, createBrowserRouter } from "react-router";
import Signin from "./pages/Signin";
import Home from "./pages/Home";

import Landing from "./pages/Landing";
import { ProtectedRoute } from "./auth/protectedRoute";
import Unauthozied from "./pages/401";
import Space from "./pages/Space";
import NotFound from "./pages/404";

const Routes = () => {
  const routesForPublic = [
    {
      path: "/service",
      element: <div>Service Page</div>,
    },
    {
      path: "/about-us",
      element: <div>About Us</div>,
    },
    {
      path: "/",
      element: <Landing />,
    },
    {
      path: "/signin",
      element: <Signin />,
    },
    {
      path: "/unauthorized",
      element: <Unauthozied />,
    },
    {
      path: "/not-found",
      element: <NotFound />,
    },
  ];

  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "/space/:spaceId",
          element: <Space />,
        },
        {
          path: "/home",
          element: <Home />,
        },
        {
          path: "/profile",
          element: <div>User Profile</div>,
        },
      ],
    },
  ];

  const router = createBrowserRouter([
    ...routesForPublic,
    ...routesForAuthenticatedOnly,
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
