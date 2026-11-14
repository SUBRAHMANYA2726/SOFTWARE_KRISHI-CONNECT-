import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { LanguageProvider } from './i18n/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ScrollToTop } from './hooks/usePage'
import './styles/index.css'

// Development-only hook used by the Selenium white-box tests.
if (import.meta.env.DEV) {
  import('./dev/testBridge').then(({ installTestBridge }) => installTestBridge())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <ScrollToTop />
            <App />
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
