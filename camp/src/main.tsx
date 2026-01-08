import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.tsx'
import { SocketProvider } from './app/context/SocketContext';
import { Toaster } from 'sonner';
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SocketProvider>
            <App />
            <Toaster richColors position="top-right" />
        </SocketProvider>
    </StrictMode>,
)
