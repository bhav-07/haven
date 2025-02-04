import { RouterProvider, createBrowserRouter } from "react-router";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
// import { ProtectedRoute } from "./auth/protectedRoute";
// import Game from "./pages/Space";

import Landing from "./pages/Landing";
import { ProtectedRoute } from "./auth/protectedRoute";
import Game from "./pages/Space";
import Unauthozied from "./pages/401";

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
      path: "/401",
      element: <Unauthozied />,
    },
  ];

  const routesForAuthenticatedOnly = [
    {
      path: "/",
      element: <ProtectedRoute />,
      children: [
        {
          path: "/space/:spaceId",
          element: <Game />,
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
