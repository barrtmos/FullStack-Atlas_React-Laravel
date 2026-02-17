import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { PostsListPage } from '@/pages/PostsListPage';
import { PostDetailPage } from '@/pages/PostDetailPage';
import { PostFormPage } from '@/pages/PostFormPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TraceProfiler } from '@/components/TraceProfiler';
import { startTrace } from '@/features/trace/actions';
import { useEffect } from 'react';
import type { ReactElement } from 'react';

const RoutedPage = ({ component, children }: { component: string; children: ReactElement }) => {
  return <TraceProfiler component={component}>{children}</TraceProfiler>;
};

export const AppRouter = () => {
  const location = useLocation();

  useEffect(() => {
    startTrace('navigation', location.pathname);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<RoutedPage component="LoginPage"><LoginPage /></RoutedPage>} />
      <Route path="/register" element={<RoutedPage component="RegisterPage"><RegisterPage /></RoutedPage>} />

      <Route element={<ProtectedRoute />}>
        <Route path="/posts" element={<RoutedPage component="PostsListPage"><PostsListPage /></RoutedPage>} />
        <Route path="/posts/create" element={<RoutedPage component="PostCreatePage"><PostFormPage /></RoutedPage>} />
        <Route path="/posts/:id" element={<RoutedPage component="PostDetailPage"><PostDetailPage /></RoutedPage>} />
        <Route path="/posts/:id/edit" element={<RoutedPage component="PostEditPage"><PostFormPage /></RoutedPage>} />
      </Route>

      <Route path="*" element={<Navigate to="/posts" replace />} />
    </Routes>
  );
};
