// src/router/routes.js
import { Navigate } from "react-router-dom";
import Home from "../views/Home";
import LoginPage from "../views/LoginPage";
import AppLayout from '../AppLayout';
import TransactionPage from "../views/TransactionPage";
import InvitePage from "../views/SettingsPage";
import PrivacyPolicyPage from "../views/PrivacyPolicyPage";
import TermsOfServicePage from "../views/TermsOfServicePage";

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
      { path: "/privacy-policy", title: "Settings", element: <PrivacyPolicyPage /> },
      { path: "/terms-of-service", title: "Settings", element: <TermsOfServicePage /> },
    ],
  },
];