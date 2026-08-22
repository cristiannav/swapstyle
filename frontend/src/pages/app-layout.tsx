import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { Header, MobileNav } from "@/components/layout/header";
import { Spinner } from "@/components/ui";
import { useAuth } from "@/contexts/auth-context";

export default function AppLayout() {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "unauthenticated") {
      navigate(`/login?redirect=${encodeURIComponent(pathname + search)}`, { replace: true });
    }
  }, [status, navigate, pathname, search]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-warm">
        <Spinner size="lg" />
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen flex flex-col bg-surface-warm">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 pb-24 md:pb-8">
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
}
