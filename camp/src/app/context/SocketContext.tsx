import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

interface SocketContextType {
    socket: Socket | null;
    unreadCount: number;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    unreadCount: 0,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;

        if (!user) return;

        // Connect to backend
        const newSocket = io('http://localhost:3000');

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            newSocket.emit('join_user', user.id);
        });

        // Listen for notifications
        newSocket.on('new_notification', (data: any) => {
            console.log('socket event: new_notification', JSON.stringify(data, null, 2));
            setUnreadCount(prev => prev + 1);

            // Show toast
            let message = "Nueva notificación";
            if (data.type === 'like') message = "A alguien le gustó tu publicación ❤️";
            if (data.type === 'comment') message = "Alguien comentó en tu publicación 💬";
            if (data.type === 'follow') message = "Alguien comenzó a seguirte 👋";
            if (data.type === 'message') message = "Has recibido un nuevo mensaje 📩";

            toast(message, {
                description: "Mira quién fue en tu perfil",
                action: {
                    label: "Ver",
                    onClick: () => console.log("Navigate to notifications") // Todo: navigation
                },
            });
        });

        // Listen for new messages specifically for toast if not covered above
        // (Backend sends BOTH 'new_message' and via sendNotification 'new_notification')
        // Ideally we handle it in one place, but let's be safe.
        newSocket.on('new_message', (message: any) => {
            // Only increment count if we are NOT on the messages page (logic handled in page?)
            // For now, let's just show a toast if it wasn't already shown by new_notification
            // Actually, the backend sends BOTH. Let's rely on 'new_notification' for the global toast/badge
            // and 'new_message' for the chat window update. 
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, unreadCount }}>
            {children}
        </SocketContext.Provider>
    );
};
