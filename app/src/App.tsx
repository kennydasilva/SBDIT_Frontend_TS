import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      {/* Sem isto os toast() da aplicação nunca apareciam no ecrã. */}
      <Toaster position="top-right" richColors closeButton theme="light" />
    </BrowserRouter>
  )
}

export default App
