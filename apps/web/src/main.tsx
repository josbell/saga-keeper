import React from 'react'
import ReactDOM from 'react-dom/client'
import { NarrativeDomainProvider } from './providers/NarrativeDomainProvider'
import { App } from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NarrativeDomainProvider>
      <App />
    </NarrativeDomainProvider>
  </React.StrictMode>
)
