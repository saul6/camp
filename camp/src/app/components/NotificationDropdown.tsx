import { useState, useRef, useEffect } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface Notification {
    id: number;
    type: string;
    actor_name: string;
    reference_id: number;
    created_at: string;
    is_read: boolean;
}

interface NotificationDropdownProps {
    unreadCount: number;
    userId: number;
    navigate: (path: string) => void;
}

export function NotificationDropdown({ unreadCount, userId, navigate }: NotificationDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/notifications?userId=${userId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    const handleDeleteAll = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent closing dropdown immediately if desired, or let it close
        if (!confirm("¿Borrar todas las notificaciones?")) return;

        try {
            await fetch(`http://localhost:3000/api/notifications?userId=${userId}`, {
                method: 'DELETE'
            });
            setNotifications([]);
        } catch (error) {
            console.error("Error deleting notifications", error);
        }
    };

    const handleMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setIsOpen(true);
        fetchNotifications(); // Fetch on hover
    };

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 300);
    };

    const handleNotificationClick = (notif: Notification) => {
        setIsOpen(false);
        // Navigate based on type
        if (notif.type === 'message') {
            navigate('/messages');
        } else if (notif.type === 'follow') {
            // navigate to follower profile or own profile followers list
            navigate(`/profile/${notif.reference_id}`); // Assuming reference_id is the follower's user id for 'follow' type
        } else if (notif.type === 'like' || notif.type === 'comment') {
            // navigate to post (needs post view page, for now just feed)
            navigate('/feed');
        } else if (notif.type === 'product_comment' || notif.type === 'product_reply') {
            navigate(`/product/${notif.reference_id}`);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <div
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="relative inline-block"
                >
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
                        )}
                    </Button>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-80"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                forceMount // Keep mounted to handle hover logic better if needed, but standard works too with controlled state
            >
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="font-semibold text-sm">Notificaciones</span>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
                            onClick={handleDeleteAll}
                        >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Borrar todo
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator />

                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 text-sm">
                            No tienes notificaciones
                        </div>
                    ) : (
                        notifications.map(notif => (
                            <div
                                key={notif.id}
                                onClick={() => handleNotificationClick(notif)}
                                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 flex items-start gap-3 transition-colors"
                            >
                                <Avatar className="h-8 w-8 mt-0.5">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${notif.actor_name}`} />
                                    <AvatarFallback>{notif.actor_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800">
                                        <span className="font-semibold">{notif.actor_name}</span>
                                        {" "}
                                        {notif.type === 'like' && "le dio like a tu publicación"}
                                        {notif.type === 'comment' && "comentó tu publicación"}
                                        {notif.type === 'follow' && "comenzó a seguirte"}
                                        {notif.type === 'message' && "te envió un mensaje"}
                                        {notif.type === 'product_comment' && "preguntó en tu producto"}
                                        {notif.type === 'product_reply' && "respondió a tu pregunta"}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {new Date(notif.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {!notif.is_read && (
                                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
