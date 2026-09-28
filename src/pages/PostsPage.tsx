import { useState } from 'react';
import { Pagination } from '../components/Pagination';
import { PostCard } from '../components/PostCard';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { EmptyState } from '../components/EmptyState';
import { useFetch } from '../hooks/useFetch';
import { useDebounce } from '../hooks/useDebounce';
import { endpoints } from '../api/endpoints';
import type { Post } from '../types';

const POSTS_PER_PAGE = 10;

export default function PostsPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebounce(query, 500);

  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useFetch<Post[]>(endpoints.posts({ page, query: debouncedQuery }));

  function handleQueryChange(value: string) {
    setQuery(value);

    setPage(1);
  }
  const isTyping = query !== debouncedQuery;

  const hasNext = !!posts && posts.length === POSTS_PER_PAGE;

  return (
    <section>
      <h1>Посты</h1>

      <input
        className="input"
        value={query}
        onChange={e => handleQueryChange(e.target.value)}
        placeholder="Поиск по заголовку и тексту"
      />

      {isTyping && <p>Печатаете...</p>}

      {isLoading && <Loader />}

      {error && !isLoading && (
        <ErrorMessage message={error} onRetry={refetch} />
      )}

      {!isLoading && !error && posts && posts.length === 0 && (
        <EmptyState text="Ничего не найдено" />
      )}

      <ul className="list">
        {posts?.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>

      {/*
        TODO (задача 3.6): hasNext -- есть ли следующая страница.
        Если постов пришло меньше POSTS_PER_PAGE, следующей страницы нет.
        isDisabled -- блокируйте кнопки во время загрузки.
      */}
      <Pagination
        page={page}
        hasNext={hasNext}
        isDisabled={isLoading}
        onChange={setPage}
      />
    </section>
  );
}