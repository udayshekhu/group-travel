import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Financials from "./pages/Financials";
import Favorites from "./pages/Favorites";
import Tasks from "./pages/Tasks";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/financials",
    element: <Financials />,
  },
  {
    path: "/favorites",
    element: <Favorites />,
  },
  {
    path: "/tasks",
    element: <Tasks />,
  },
  {
    path: "*",
    element: <Home />,
  },
]);