// src/router/routes.js
import { Navigate } from "react-router-dom";
import Home from "../views/Home";
import LoginPage from "../views/LoginPage";
import RegisterPage from "../views/RegisterPage";
import AppLayout from '../AppLayout';
import TransactionPage from "../views/TransactionPage";
import InvitePage from "../views/SettingsPage";
import PrivacyPolicyPage from "../views/PrivacyPolicyPage";
import TermsOfServicePage from "../views/TermsOfServicePage";
import ForgotPasswordPage from "../views/ForgotPasswordPage";
import ResetPasswordPage from "../views/ResetPasswordPage";
import Profile from "../views/ProfilesPage";
import ChangeLog from "../views/ChangelogPage";

import { ProtectedRoute } from './ProtectedRoute';
import { PublicOnlyRoute } from "./PublicOnlyRoute";

export const routes = [
 {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    )
  },
 {
    path: '/register',
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    )
  },
 {
    path: '/forgot-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    )
  },
 {
    path: '/reset-password',
    element: (
      <PublicOnlyRoute>
        <ForgotPasswordPage />
      </PublicOnlyRoute>
    )
  },
  { path: "/privacy-policy", title: "Settings", element: <PrivacyPolicyPage /> },
  { path: "/terms-of-service", title: "Settings", element: <TermsOfServicePage /> },
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
      { path: "/profile", title: "Profile", element: <Profile /> },
      { path: "/changelog", title: "Change Log", element: <ChangeLog /> },
    ],
  },
];
