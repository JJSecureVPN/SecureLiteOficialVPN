import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageProvider } from '../../../../../i18n/context';
import { NewsList } from '../NewsList';
import type { NoticiaItem } from '../../../hooks/useNoticias';

const makeItem = (id: number): NoticiaItem => ({
  id,
  titulo: `Noticia ${id}`,
  descripcion: `Desc ${id}`,
  fecha_publicacion: '2020-01-01T11:59:00.000Z',
});

describe('NewsList', () => {
  it('shows skeletons when loading with no items', () => {
    const { container } = render(
      <LanguageProvider>
        <NewsList items={[]} loading={true} error={null} reload={() => {}} onOpen={() => {}} />
      </LanguageProvider>,
    );

    expect(container.firstChild).toMatchSnapshot();
  });

  it('shows empty state when no items and not loading', () => {
    render(
      <LanguageProvider>
        <NewsList items={[]} loading={false} error={null} reload={() => {}} onOpen={() => {}} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/No hay noticias disponibles/i)).toBeInTheDocument();
  });

  it('shows error state and calls reload when retry pressed', () => {
    const reload = vi.fn();
    render(
      <LanguageProvider>
        <NewsList items={[]} loading={false} error={'Boom'} reload={reload} onOpen={() => {}} />
      </LanguageProvider>,
    );

    const es = require('../../../../../i18n/locales/es.json');
    expect(screen.getByText(new RegExp(es.news.errorTitle, 'i'))).toBeInTheDocument();

    const button = screen.getByRole('button', { name: new RegExp(es.news.retry, 'i') });
    fireEvent.click(button);
    expect(reload).toHaveBeenCalled();
  });

  it('renders items and opens on item click', () => {
    const items = [makeItem(1), makeItem(2)];
    const onOpen = vi.fn();

    render(
      <LanguageProvider>
        <NewsList items={items} loading={false} error={null} reload={() => {}} onOpen={onOpen} />
      </LanguageProvider>,
    );

    expect(screen.getByText(/Noticia 1/i)).toBeInTheDocument();
    const article = screen.getByRole('button', { name: /Leer noticia: Noticia 1/i });
    fireEvent.click(article);
    expect(onOpen).toHaveBeenCalled();
  });
});
