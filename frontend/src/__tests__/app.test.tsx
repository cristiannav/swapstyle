import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { App } from '@/app';

// Reemplaza al routing por filesystem de Next: si un import de ruta se rompe
// o el árbol de providers deja de montar, esto falla.
function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe('<App>', () => {
  it('renderiza la landing en /', async () => {
    renderAt('/');
    expect(await screen.findByRole('link', { name: /Crear cuenta/i })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('resuelve una ruta lazy detrás del AuthLayout', async () => {
    renderAt('/login');
    expect(await screen.findByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('cae en el 404 con una ruta desconocida', async () => {
    renderAt('/no-existe');
    expect(await screen.findByRole('heading', { name: /Esta página no existe/i })).toBeInTheDocument();
  });
});
