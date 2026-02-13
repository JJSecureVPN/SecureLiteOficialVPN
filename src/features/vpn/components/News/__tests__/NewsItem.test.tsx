import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../../../i18n/context';
import { NewsItem } from '../NewsItem';
import type { NoticiaItem } from '../../../hooks/useNoticias';

const mockItem: NoticiaItem = {
  id: 1,
  titulo: 'Noticia de prueba',
  descripcion: 'Descripción corta de la noticia',
  imagen_url: 'https://example.com/image.jpg',
  imagen_alt: 'Imagen de ejemplo',
  // fixed timestamp to make snapshots deterministic
  fecha_publicacion: '2020-01-01T11:59:00.000Z',
  categoria_nombre: 'Novedades',
  categoria_color: '#ff6600',
};

describe('NewsItem', () => {
  beforeAll(() => {
    // Freeze time to make snapshots deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2020-01-01T12:00:00Z'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('renders correctly and matches snapshot', () => {
    const onClick = vi.fn();
    const { container } = render(
      <LanguageProvider>
        <NewsItem item={mockItem} onClick={onClick} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Noticia de prueba/i)).toBeInTheDocument();
    expect(screen.getByText(/Descripción corta de la noticia/i)).toBeInTheDocument();
    expect(screen.getByAltText(/Imagen de ejemplo/i)).toBeInTheDocument();

    expect(container.firstChild).toMatchSnapshot();
  });

  it('calls onClick when clicked and when pressing Enter/Space', () => {
    const onClick = vi.fn();
    render(
      <LanguageProvider>
        <NewsItem item={mockItem} onClick={onClick} />
      </LanguageProvider>,
    );

    const article = screen.getByRole('button', { name: /Leer noticia:/i });

    fireEvent.click(article);
    expect(onClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(article, { key: 'Enter' });
    fireEvent.keyDown(article, { key: ' ' });
    expect(onClick).toHaveBeenCalledTimes(3);
  });

  it('renders properly without image', () => {
    const itemNoImage: NoticiaItem = {
      ...mockItem,
      imagen_url: undefined,
      categoria_nombre: 'Sin imagen',
    };
    const { container } = render(
      <LanguageProvider>
        <NewsItem item={itemNoImage} onClick={() => {}} />
      </LanguageProvider>,
    );
    expect(container.firstChild).toMatchSnapshot();
  });
});
