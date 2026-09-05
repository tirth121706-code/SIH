import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// The original, unmodified stylesheet and interaction script from the
// static prototype are reused as-is — nothing in them was changed.
import '../css/style.css'
import '../js/script.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
