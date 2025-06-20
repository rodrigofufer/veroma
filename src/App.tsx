import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { IdeasProvider } from './contexts/IdeasContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import EmailConfirmationSuccessPage from './pages/EmailConfirmationSuccessPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import NewIdeaPage from './pages/NewIdeaPage';
import ContactPage from './pages/ContactPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import CookiesPage from './pages/CookiesPage';
import SupportPage from './pages/SupportPage';
import AboutPage from './pages/AboutPage';
import RolesPage from './pages/RolesPage';
import RepresentativesPage from './pages/RepresentativesPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import NotFound from './pages/errors/NotFound';
import AccessDenied from './pages/errors/AccessDenied';
import ServerError from './pages/errors/ServerError';
import ScrollToTop from './components/ScrollToTop';
import './i18n';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <IdeasProvider>
          <Toaster position="top-center" />
          <main id="main-content" tabIndex={-1}>
            <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/email-confirmed" element={<EmailConfirmationSuccessPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/cookies" element={<CookiesPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/representatives" element={<RepresentativesPage />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            <Route path="/server-error" element={<ServerError />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/new-idea" element={
              <ProtectedRoute>
                <NewIdeaPage />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            } />

            {/* Catch all route - 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </main>
        </IdeasProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;