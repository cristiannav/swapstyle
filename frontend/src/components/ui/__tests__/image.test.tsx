import { render, screen } from '@testing-library/react';
import { Image } from '../image';

describe('<Image>', () => {
  it('con fill cubre el contenedor posicionado', () => {
    render(<Image src="/a.jpg" alt="Prenda" fill className="object-cover" />);
    const img = screen.getByAltText('Prenda');
    expect(img.className).toContain('absolute');
    expect(img.className).toContain('inset-0');
    expect(img.className).toContain('object-cover');
  });

  it('sin fill no posiciona nada', () => {
    render(<Image src="/a.jpg" alt="Avatar" width={40} height={40} />);
    expect(screen.getByAltText('Avatar').className).not.toContain('absolute');
  });

  it('priority carga eager; el resto queda lazy', () => {
    render(
      <>
        <Image src="/a.jpg" alt="uno" priority />
        <Image src="/b.jpg" alt="dos" />
      </>,
    );
    expect(screen.getByAltText('uno')).toHaveAttribute('loading', 'eager');
    expect(screen.getByAltText('dos')).toHaveAttribute('loading', 'lazy');
  });
});
