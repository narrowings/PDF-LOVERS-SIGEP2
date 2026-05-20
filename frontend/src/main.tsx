import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/index.css';


// ⚠️ MODO DEMO: eliminar cuando el backend esté disponible
//setupMockApi(http); // ← pasarle la instancia directamente

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);