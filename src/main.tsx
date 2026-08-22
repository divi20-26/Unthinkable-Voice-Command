import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'
import './overrides.css'
import './design.css'
import './category-colors.css'
import './premium.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
