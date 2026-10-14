import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/auth'
import { Layout } from './layout'
import { LoginPage } from '../pages/login'
import { ProductsPage } from '../pages/products'
import { ProductEditPage } from '../pages/products/edit'
import { CategoriesPage } from '../pages/categories'
import { DongxianPage } from '../pages/dongxian'
import { BannersPage } from '../pages/banners'
import { SettingsPage } from '../pages/settings'
import { AdminsPage } from '../pages/admins'
import { LogsPage } from '../pages/logs'
import { SuggestionsPage } from '../pages/suggestions'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/products" replace />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductEditPage />} />
          <Route path="products/:id/edit" element={<ProductEditPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="dongxian" element={<DongxianPage />} />
          <Route path="banners" element={<BannersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="suggestions" element={<SuggestionsPage />} />
          <Route path="admins" element={<AdminsPage />} />
          <Route path="logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
