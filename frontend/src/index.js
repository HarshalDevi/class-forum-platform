import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

// Get the root element
const container = document.getElementById('root');

// Create a root.
const root = createRoot(container);

// Initial render: Render the App component into the root.
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
