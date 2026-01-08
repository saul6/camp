import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
    id: number;
    name: string;
    email: string;
    profile_type: string;
    isFollowing: boolean;
}

interface UserListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    userId: number;
    type: 'followers' | 'following';
    title: string;
    onFollowChange?: () => void; // Callback to refresh parent stats
}

export function UserListDialog({ isOpen, onClose, userId, type, title, onFollowChange }: UserListDialogProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    // Current Auth User
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (isOpen && userId) {
            fetchUsers();
        }
    }, [isOpen, userId, type]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const endpoint = type === 'followers'
                ? `http://localhost:3000/api/users/${userId}/followers?currentUserId=${currentUser?.id}`
                : `http://localhost:3000/api/users/${userId}/following?currentUserId=${currentUser?.id}`;

            const response = await fetch(endpoint);
            const data = await response.json();
            setUsers(data);
        } catch (error) {
            console.error("Error fetching users list:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFollowToggle = async (targetUser: User) => {
        if (!currentUser) return;
        try {
            const endpoint = `http://localhost:3000/api/users/${targetUser.id}/follow`;
            const method = targetUser.isFollowing ? 'DELETE' : 'POST';

            await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followerId: currentUser.id }),
            });

            // Optimistic update local list
            setUsers(prev => prev.map(u =>
                u.id === targetUser.id ? { ...u, isFollowing: !u.isFollowing } : u
            ));

            // Notify parent to refresh stats if needed
            if (onFollowChange) onFollowChange();

        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.profile_type.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-white text-gray-900 border border-gray-200">
                <DialogHeader className="border-b border-gray-100 pb-4">
                    <DialogTitle className="text-center text-lg font-bold text-gray-900">{title}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {/* Search */}
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Buscar"
                            className="bg-gray-50 border-gray-200 pl-10 text-gray-900 placeholder:text-gray-500 rounded-lg h-9 focus-visible:ring-green-600"
                        />
                    </div>

                    {/* List */}
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center text-gray-400 py-4">Cargando...</div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map((u) => (
                                <div key={u.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { onClose(); navigate(`/profile/${u.id}`); }}>
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} />
                                            <AvatarFallback className="text-gray-600 bg-gray-100">{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900 group-hover:text-green-700 transition-colors">{u.name}</p>
                                            <p className="text-xs text-gray-500 capitalize">{u.profile_type}</p>
                                        </div>
                                    </div>

                                    {currentUser?.id !== u.id && (
                                        <Button
                                            variant={u.isFollowing ? "secondary" : "default"}
                                            size="sm"
                                            onClick={() => handleFollowToggle(u)}
                                            className={`h-8 px-4 font-semibold text-xs transition-colors ${u.isFollowing
                                                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-red-600"
                                                    : "bg-green-600 hover:bg-green-700 text-white"
                                                }`}
                                        >
                                            {u.isFollowing ? "Siguiendo" : "Seguir"}
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-8">No se encontraron usuarios.</div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
