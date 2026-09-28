import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { ErrorMessage } from '../components/ErrorMessage';
import { AuthorBadge } from '../components/AuthorBadge';
import { CommentList } from '../components/CommentList';
import { CommentForm } from '../components/CommentForm';
import { useFetch } from '../hooks/useFetch';
import { endpoints } from '../api/endpoints';
import type { Post, Comment } from '../types';

export default function PostPage() {
  const { postId = '' } = useParams();

  const [localComments, setLocalComments] = useState<Comment[]>([]);

  const {
    data: post,
    isLoading: isPostLoading,
    error: postError,
    status: postStatus,
    refetch: refetchPost,
  } = useFetch<Post>(endpoints.post(postId));

  const {
    data: comments,
    isLoading: isCommentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useFetch<Comment[]>(endpoints.postComments(postId));

  if (isPostLoading) {
    return (
      <section>
        <Link to="/posts" className="back-link">
          ← К списку постов
        </Link>
        <Loader />
      </section>
    );
  }

  if (postStatus === 404) {
    return (
      <section>
        <Link to="/posts" className="back-link">
          ← К списку постов
        </Link>
        <p>Пост не найден</p>
        <Link to="/posts">← Вернуться к списку постов</Link>
      </section>
    );
  }

  if (postError) {
    return (
      <section>
        <Link to="/posts" className="back-link">
          ← К списку постов
        </Link>
        <ErrorMessage message={postError} onRetry={refetchPost} />
      </section>
    );
  }

  if (!post) return null;

  const allComments: Comment[] = [
    ...(comments ?? []),
    ...localComments,
  ];

  return (
    <section>
      <Link to="/posts" className="back-link">
        ← К списку постов
      </Link>

      <h1>{post.title}</h1>
      <AuthorBadge userId={post.userId} />
      <p>{post.body}</p>

      <h2>Комментарии</h2>

      {isCommentsLoading && <Loader />}

      {commentsError && !isCommentsLoading && (
        <ErrorMessage message={commentsError} onRetry={refetchComments} />
      )}

      {!isCommentsLoading && !commentsError && (
        <CommentList comments={allComments} />
      )}

      <CommentForm
        postId={Number(postId)}
        onCreated={newComment => {
          setLocalComments(prev => [
            ...prev,
            { ...newComment, id: Date.now() },
          ]);
        }}
      />
    </section>
  );
}