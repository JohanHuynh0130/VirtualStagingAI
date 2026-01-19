import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../style.css'; // Use shared Tailwind styles

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
);
