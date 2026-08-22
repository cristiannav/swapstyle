import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Spinner } from '@/components/ui';
import { AppProviders } from '@/providers/app-providers';
import AppLayout from '@/pages/app-layout';
import AuthLayout from '@/pages/auth-layout';
import HomePage from '@/pages/home';
import NotFoundPage from '@/pages/not-found';

// El App Router de Next partía el bundle por ruta; acá hay que pedirlo explícito.
const LoginPage = lazy(() => import('@/pages/login'));
const RegisterPage = lazy(() => import('@/pages/register'));
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password'));
const ResetPasswordPage = lazy(() => import('@/pages/reset-password'));
const VerifyEmailPage = lazy(() => import('@/pages/verify-email'));

const FeedPage = lazy(() => import('@/pages/feed'));
const MatchesPage = lazy(() => import('@/pages/matches'));
const ChatPage = lazy(() => import('@/pages/chat'));
const MyGarmentsPage = lazy(() => import('@/pages/garments-me'));
const NewGarmentPage = lazy(() => import('@/pages/garment-new'));
const EditGarmentPage = lazy(() => import('@/pages/garment-edit'));
const EventsPage = lazy(() => import('@/pages/events'));
const NewEventPage = lazy(() => import('@/pages/event-new'));
const ProfileEditPage = lazy(() => import('@/pages/profile-edit'));

function RouteFallback() {
  return (
    <div className="flex justify-center py-16">
      <Spinner size="lg" />
    </div>
  );
}

export function App() {
  return (
    <AppProviders>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Público — layout editorial */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Requiere sesión — AppLayout redirige a /login */}
          <Route element={<AppLayout />}>
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/matches/:id/chat" element={<ChatPage />} />
            <Route path="/garments/me" element={<MyGarmentsPage />} />
            <Route path="/garments/new" element={<NewGarmentPage />} />
            <Route path="/garments/:id/edit" element={<EditGarmentPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<NewEventPage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppProviders>
  );
}
