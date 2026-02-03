import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App-with-routing';
import './App-dark-mode.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);