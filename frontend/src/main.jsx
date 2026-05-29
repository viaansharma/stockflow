import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1a1815',
            color: '#f5f4f0',
            borderRadius: '12px',
            fontSize: '13px',
            fontFamily: "'DM Sans', sans-serif",
            border: '1px solid #2e2b27',
          },
          success: {
            iconTheme: { primary: '#fbbf24', secondary: '#1a1815' },
          },
          error: {
            iconTheme: { primary: '#f43f5e', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
)
