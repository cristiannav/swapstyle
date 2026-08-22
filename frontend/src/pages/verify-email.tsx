import { Link, useSearchParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from '@/components/ui';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/lib/api-error';

type Status = 'pending' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [status, setStatus] = useState<Status>('pending');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus('error');
      setErrorMessage('Falta el token de verificación.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((error) => {
        const msg =
          error instanceof ApiError ? error.message : 'No pudimos verificar el email.';
        setErrorMessage(msg);
        setStatus('error');
      });
  }, [token]);

  return (
    <div className="space-y-4 text-center">
      {status === 'pending' && (
        <>
          <div className="flex justify-center">
            <Spinner size="lg" />
          </div>
          <h1 className="text-display text-3xl text-text-primary">Verificando...</h1>
          <p className="text-text-secondary text-sm">Estamos confirmando tu email.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-display text-3xl text-text-primary">Email verificado</h1>
          <p className="text-text-secondary text-sm">
            Listo, tu email quedó confirmado. Ya podés ingresar.
          </p>
          <Link
            to="/login"
            className="inline-block mt-4 text-sm font-semibold text-brand-700 hover:underline"
          >
            Iniciar sesión
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-display text-3xl text-text-primary">No pudimos verificar</h1>
          <p className="text-text-secondary text-sm">{errorMessage}</p>
          <Link
            to="/login"
            className="inline-block mt-4 text-sm font-semibold text-brand-700 hover:underline"
          >
            Volver a iniciar sesión
          </Link>
        </>
      )}
    </div>
  );
}
