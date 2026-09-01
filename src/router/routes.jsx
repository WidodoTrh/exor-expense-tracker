// src/router/routes.js
import { Navigate } from "react-router-dom";
import Home from "../views/Home";
import Library from "../views/Library";
import MyDocument from "../views/MyDocument";
import ArticleManagement from "../views/ArticleManagement";

import CreateArticle from "../views/CreateArticle"
import UpdateArticle from "../views/UpdateArticle"

export const routes = [
  { path: "/", element: <Navigate to="/home" replace /> },
  { path: "/home", title: "Home", element: <Home /> },
  { path: "/library", title: "Library", element: <Library /> },
  { path: "/manage", title: "Manage", element: <ArticleManagement /> },
  { path: "/mydocument", title: "My Document", element: <MyDocument /> },
  { path: "/mydocument/update", title: "Update", element: <UpdateArticle /> },
  { path: "/mydocument/create", title: "Create Article", element: <CreateArticle /> },
];