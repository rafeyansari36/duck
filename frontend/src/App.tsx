import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import BugDetailPage from './pages/BugDetailPage'
import BugEditPage from './pages/BugEditPage'
import EntriesPage from './pages/EntriesPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="entries/:id" element={<BugDetailPage />} />
          <Route path="entries/:id/edit" element={<BugEditPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
