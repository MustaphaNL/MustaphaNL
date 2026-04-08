import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PostListingPage from './pages/PostListingPage';
import EditListingPage from './pages/EditListingPage';
import InboxPage from './pages/InboxPage';
import ThreadPage from './pages/ThreadPage';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminListings from './pages/admin/AdminListings';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './stores/authStore';
import { authApi } from './api/auth';
import CookieBanner from './components/CookieBanner';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const { i18n } = useTranslation();
  const { user, refreshToken, setUser, setAccessToken, logout } = useAuthStore();

  // Bootstrap: restore session on page load
  useEffect(() => {
    if (refreshToken && !useAuthStore.getState().accessToken) {
      authApi.refresh(refreshToken)
        .then((data) => {
          setAccessToken(data.accessToken);
          return authApi.me();
        })
        .then(setUser)
        .catch(logout);
    } else if (user && useAuthStore.getState().accessToken) {
      authApi.me().then(setUser).catch(() => {});
    }
  }, []); // eslint-disable-line

  // Apply RTL for Arabic
  useEffect(() => {
    const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', i18n.language);
  }, [i18n.language]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/:id" element={<ListingDetailPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="post" element={<RequireAuth><PostListingPage /></RequireAuth>} />
          <Route path="listings/:id/edit" element={<RequireAuth><EditListingPage /></RequireAuth>} />
          <Route path="inbox" element={<RequireAuth><InboxPage /></RequireAuth>} />
          <Route path="inbox/:listingId/:partnerId" element={<RequireAuth><ThreadPage /></RequireAuth>} />
        </Route>
        <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="listings" element={<AdminListings />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CookieBanner />
    </>
  );
}
