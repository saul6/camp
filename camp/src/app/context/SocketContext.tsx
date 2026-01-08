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
            console.log('New notification received:', data);
            setUnreadCount(prev => prev + 1);

            // Show toast
            let message = "Nueva notificación";
            if (data.type === 'like') message = "A alguien le gustó tu publicación ❤️";
            if (data.type === 'comment') message = "Alguien comentó en tu publicación 💬";
            if (data.type === 'follow') message = "Alguien comenzó a seguirte 👋";

            toast(message, {
                description: "Mira quién fue en tu perfil",
                action: {
                    label: "Ver",
                    onClick: () => console.log("Navigate to notifications") // Todo: navigation
                },
            });
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
