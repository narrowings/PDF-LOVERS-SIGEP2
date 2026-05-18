import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';
import { setupMockApi } from './services/mockApi';
import { http } from './services/api'; // ← importar la instancia

// ⚠️ MODO DEMO: eliminar cuando el backend esté disponible
//setupMockApi(http); // ← pasarle la instancia directamente

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);