// src/router/routes.js
import { Navigate } from "react-router-dom";
import Home from "../views/Home";
import LoginPage from "../views/LoginPage";
import AppLayout from '../AppLayout';
import TransactionPage from "../views/TransactionPage";
import InvitePage from "../views/SettingsPage";

import { ProtectedRoute } from './ProtectedRoute';

export const routes = [
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Navigate to="/home" replace /> },
      { path: "/home", title: "Home", element: <Home /> },
      { path: "/trx", title: "Transaction", element: <TransactionPage /> },
      { path: "/settings", title: "Settings", element: <InvitePage /> },
    ],
  },
];