import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('<Button>', () => {
  it('renderiza el children y dispara onClick', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Hola</Button>);
    const btn = screen.getByRole('button', { name: 'Hola' });
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('queda deshabilitado mientras loading', () => {
    render(<Button loading>Procesando</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('aplica la variante danger', () => {
    render(<Button variant="danger">Eliminar</Button>);
    expect(screen.getByRole('button').className).toContain('bg-danger');
  });
});
