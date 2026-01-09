import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Send, MoreVertical, Phone, Video, MessageSquare, Users, MessageCircle, CheckCheck } from 'lucide-react';

interface Message {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    image_url?: string;
    created_at: string;
    is_read: boolean;
}

interface Conversation {
    id: number; // User ID of the contact
    name: string;
    email: string;
    last_message: string;
    created_at: string; // timestamp of last message
    unread_count: number;
}

interface Contact {
    id: number;
    name: string;
    email: string;
}

export default function MessagesPage() {
    const { userId } = useParams(); // Selected contact ID
    const navigate = useNavigate();
    const { socket } = useSocket();

    // UI State
    const [activeTab, setActiveTab] = useState<'chats' | 'contacts'>('chats');

    // Data State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);

    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Current Auth User
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Fetch Initial Lists
    useEffect(() => {
        if (currentUser) {
            fetchConversations();
            fetchContacts();
        }
    }, [currentUser?.id]);

    // Fetch Messages when a contact is selected
    useEffect(() => {
        if (userId && currentUser) {
            fetchMessages(userId);
            // Mark as read in UI (optimistically)
            setConversations(prev => prev.map(c =>
                c.id === Number(userId) ? { ...c, unread_count: 0 } : c
            ));
        }
    }, [userId]);

    // Socket Listener for New Messages, Typing, and Read Receipts
    useEffect(() => {
        if (!socket) return;

        socket.on('new_message', (message: Message) => {
            // If the message belongs to the current open chat
            if (message.sender_id === Number(userId) || message.sender_id === currentUser.id) {
                setMessages(prev => [...prev, message]);
                setIsTyping(false); // Stop typing indicator if message received
                scrollToBottom();

                // If I am receiving this message and I am looking at this chat, mark it as read immediately
                if (message.sender_id === Number(userId)) {
                    socket.emit('mark_read', { senderId: message.sender_id, receiverId: currentUser.id });
                }
            }

            // Refresh conversations list to show latest message snippet
            fetchConversations();
        });

        socket.on('typing_start', ({ fromUserId }) => {
            if (Number(userId) === fromUserId) {
                setIsTyping(true);
                scrollToBottom();
            }
        });

        socket.on('typing_stop', ({ fromUserId }) => {
            if (Number(userId) === fromUserId) {
                setIsTyping(false);
            }
        });

        socket.on('messages_read', ({ byUserId }) => {
            if (Number(userId) === byUserId) {
                setMessages(prev => prev.map(msg => ({ ...msg, is_read: true })));
            }
        });

        return () => {
            socket.off('new_message');
            socket.off('typing_start');
            socket.off('typing_stop');
            socket.off('messages_read');
        };
    }, [socket, userId, currentUser]);

    const fetchConversations = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/messages/conversations?userId=${currentUser.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setConversations(data);
            } else {
                setConversations([]);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
            setConversations([]);
        }
    };

    const fetchContacts = async () => {
        try {
            // Reuse the existing endpoint for following list
            const res = await fetch(`http://localhost:3000/api/users/${currentUser.id}/following`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setContacts(data);
            } else {
                setContacts([]);
            }
        } catch (error) {
            console.error("Error fetching contacts:", error);
            setContacts([]);
        }
    };

    const fetchMessages = async (contactId: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/messages/${contactId}?currentUserId=${currentUser.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMessages(data);
                setTimeout(scrollToBottom, 100);

                // Mark messages as read when fetching
                if (socket) {
                    socket.emit('mark_read', { senderId: Number(contactId), receiverId: currentUser.id });
                }

            } else {
                setMessages([]);
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!newMessage.trim() && !selectedFile) || !userId) return;

        try {
            let res;
            if (selectedFile) {
                const formData = new FormData();
                formData.append('senderId', currentUser.id);
                formData.append('receiverId', userId);
                formData.append('content', newMessage);
                formData.append('image', selectedFile);

                res = await fetch('http://localhost:3000/api/messages', {
                    method: 'POST',
                    body: formData
                });
            } else {
                res = await fetch('http://localhost:3000/api/messages', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        senderId: currentUser.id,
                        receiverId: userId,
                        content: newMessage
                    })
                });
            }

            const savedMessage = await res.json();
            setMessages(prev => [...prev, savedMessage]);
            setNewMessage("");
            setSelectedFile(null);
            setPreviewUrl(null);
            scrollToBottom();
            fetchConversations(); // Update sidebar snippet

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const selectedConversation = conversations.find(c => c.id === Number(userId)) || contacts.find(c => c.id === Number(userId));
    const selectedName = selectedConversation ? selectedConversation.name : "Usuario";

    return (
        <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col overflow-hidden">
            <div className="flex-1 max-w-7xl w-full mx-auto p-4 flex gap-4 h-full overflow-hidden">
                {/* Sidebar */}
                <div className={`w-full md:w-80 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full ${userId ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-gray-100 shrink-0">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Mensajes</h2>

                        {/* Tabs */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('chats')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <MessageCircle className="h-4 w-4" /> Chats
                            </button>
                            <button
                                onClick={() => setActiveTab('contacts')}
                                className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'contacts' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Users className="h-4 w-4" /> Contactos
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
                        {activeTab === 'chats' ? (
                            conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    <p className="mb-2">No hay conversaciones recientes.</p>
                                    <Button variant="link" onClick={() => setActiveTab('contacts')} className="text-green-600">
                                        Iniciar un nuevo chat
                                    </Button>
                                </div>
                            ) : (
                                conversations.map(conv => (
                                    <div
                                        key={conv.id}
                                        onClick={() => navigate(`/messages/${conv.id}`)}
                                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${Number(userId) === conv.id ? 'bg-green-50' : ''}`}
                                    >
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${conv.name}`} />
                                            <AvatarFallback className="text-gray-600 bg-gray-100">{conv.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-0.5">
                                                <p className="text-sm font-semibold text-gray-900 truncate">{conv.name}</p>
                                                {conv.created_at && (
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(conv.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-bold text-gray-800' : 'text-gray-500'}`}>
                                                {conv.last_message}
                                            </p>
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <span className="h-5 w-5 bg-green-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                                                {conv.unread_count}
                                            </span>
                                        )}
                                    </div>
                                ))
                            )
                        ) : (
                            contacts.length === 0 ? (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    <p>No sigues a nadie aún.</p>
                                    <p className="text-xs mt-2">Busca usuarios en "Mi Red" para conectar.</p>
                                </div>
                            ) : (
                                contacts.map(contact => (
                                    <div
                                        key={contact.id}
                                        onClick={() => navigate(`/messages/${contact.id}`)}
                                        className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${Number(userId) === contact.id ? 'bg-green-50' : ''}`}
                                    >
                                        <Avatar className="h-10 w-10 border border-gray-100">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.name}`} />
                                            <AvatarFallback className="text-gray-600 bg-gray-100">{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{contact.name}</p>
                                            <p className="text-xs text-gray-500 truncate">{contact.email}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                {userId ? (
                    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full overflow-hidden">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={() => navigate('/messages')}>
                                    <span className="text-xl">←</span>
                                </Button>
                                <Avatar className="h-10 w-10 border border-gray-100">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedName}`} />
                                    <AvatarFallback className="text-gray-600 bg-gray-100">{selectedName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-none cursor-pointer hover:underline" onClick={() => navigate(`/profile/${userId}`)}>
                                        {selectedName}
                                    </h3>
                                    <span className="text-xs text-green-600 flex items-center gap-1 mt-0.5">
                                        <span className="h-1.5 w-1.5 bg-green-500 rounded-full"></span> En línea
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400">
                                <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 min-h-0 p-4 overflow-y-auto custom-scrollbar flex flex-col space-y-4 bg-gray-50/50">
                            {loading ? (
                                <div className="text-center py-10 text-gray-400">Cargando historial...</div>
                            ) : messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-60">
                                    <MessageSquare className="h-12 w-12 mb-2" />
                                    <p>¡Di hola! 👋</p>
                                </div>
                            ) : (
                                messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUser.id;
                                    return (
                                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div
                                                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow-sm ${isMe
                                                    ? 'bg-green-600 text-white rounded-br-none'
                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                                                    }`}
                                            >
                                                {msg.image_url && (
                                                    <img
                                                        src={msg.image_url}
                                                        alt="Compartida"
                                                        className="mb-2 rounded-lg max-w-full h-auto max-h-60 object-cover cursor-pointer"
                                                        onClick={() => window.open(msg.image_url, '_blank')}
                                                    />
                                                )}
                                                {msg.content && <p>{msg.content}</p>}
                                                <div className={`text-[10px] mt-1 text-right opacity-70 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && (
                                                        <CheckCheck className={`inline-block ml-1 h-4 w-4 ${msg.is_read ? 'text-blue-200 stroke-[3px]' : 'text-green-200/50'}`} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                            {isTyping && (
                                <div className="flex items-center gap-2 text-gray-400 text-xs px-4 animate-pulse">
                                    <div className="flex gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                    Escribiendo...
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} className="p-4 border-t border-gray-100 bg-white rounded-b-lg shrink-0">
                            <div className="flex flex-col gap-2 w-full">
                                {previewUrl && (
                                    <div className="relative inline-block self-start">
                                        <img src={previewUrl} alt="Preview" className="h-20 w-auto rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 h-4 w-4 flex items-center justify-center text-xs"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-gray-400 hover:text-green-600"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <span className="text-xl">📷</span>
                                    </Button>
                                    <Input
                                        value={newMessage}
                                        onChange={(e) => {
                                            setNewMessage(e.target.value);

                                            // Typing logic
                                            if (socket && userId) {
                                                if (!typingTimeoutRef.current) {
                                                    socket.emit('typing_start', { toUserId: userId, fromUserId: currentUser.id });
                                                }
                                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                                typingTimeoutRef.current = setTimeout(() => {
                                                    socket.emit('typing_stop', { toUserId: userId, fromUserId: currentUser.id });
                                                    typingTimeoutRef.current = null;
                                                }, 2000);
                                            }
                                        }}
                                        placeholder="Escribe un mensaje..."
                                        className="bg-gray-50 border-gray-200 focus-visible:ring-green-500"
                                    />
                                    <Button type="submit" disabled={!newMessage.trim() && !selectedFile} className="bg-green-600 hover:bg-green-700 text-white text-white">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="hidden md:flex flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex-col items-center justify-center text-gray-400 p-8">
                        <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Send className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Tus Mensajes</h3>
                        <p className="text-gray-500 max-w-xs text-center">Selecciona una conversación de la izquierda o busca un contacto para comenzar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
