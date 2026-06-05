// Punto de entrada del frontend: monta el componente raíz <App/> dentro del div #root del index.html.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// StrictMode ayuda a detectar problemas potenciales en desarrollo (no afecta a producción)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
