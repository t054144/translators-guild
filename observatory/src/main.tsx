import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/app.css';
import './styles/rocket.css';
import App from './App.tsx';

const el = document.getElementById('root');
if (!el) throw new Error('#root missing from index.html');

createRoot(el).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
