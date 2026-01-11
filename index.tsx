
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("App initializing...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Critical: Could not find root element");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("App mounted successfully");
} catch (err) {
  console.error("Mount error:", err);
  rootElement.innerHTML = `<div style="padding: 20px; color: red;">Error: ${err.message}</div>`;
}
