import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Financials from "./pages/Financials";
import Favorites from "./pages/Favorites";
import Tasks from "./pages/Tasks";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/financials",
    Component: Financials,
  },
  {
    path: "/favorites",
    Component: Favorites,
  },
  {
    path: "/tasks",
    Component: Tasks,
  },
  {
    path: "*",
    Component: Home,
  },
]);