import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Suspense } from 'react';
import { layoutsRoutes, singlePageRoutes } from './Routes';
import PageWrapper from '@/components/PageWrapper';
import ProtectedRoute from '@/components/layouts/ProtectedRoute';
import PublicRoute from '@/components/layouts/PublicRoute';

// This wrapper component applies the main layout
const Layout = () => (
  <PageWrapper>
    <Outlet />
  </PageWrapper>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes (Single Page Routes) */}
        {singlePageRoutes.map(route => (
          <Route
            key={route.name}
            path={route.path}
            element={
              route.path.includes('login') || route.path.includes('register') ? (
                <PublicRoute>
                  {route.element}
                </PublicRoute>
              ) : (
                route.element
              )
            }
          />
        ))}

        {/* Protected Routes with Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          {layoutsRoutes.map(route => (
            <Route key={route.name} path={route.path} element={route.element} />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;