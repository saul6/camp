import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { MessageSquare, ArrowLeft, Store } from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "../../context/SocketContext";

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    image_url: string;
    created_at: string;
    seller_id: number;
    seller_name: string;
    seller_type: string;
    seller_email: string;
}

interface Comment {
    id: number;
    user_id: number;
    content: string;
    created_at: string;
    user_name: string;
    parent_id: number | null;
}

export default function ProductDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Reply State
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // ... inside component ...
    const { socket } = useSocket(); // Assuming useSocket hook exists and is imported (need to verify import)

    useEffect(() => {
        if (id) {
            fetchProduct();
            fetchComments();
        }
    }, [id]);

    // Real-time comments listener
    useEffect(() => {
        if (!socket) return;

        const handleNewComment = (data: { productId: string, comment: Comment }) => {
            if (data.productId === id) {
                setComments(prev => [...prev, data.comment]);
            }
        };

        socket.on('new_comment', handleNewComment);

        return () => {
            socket.off('new_comment', handleNewComment);
        };
    }, [socket, id]);


    const fetchProduct = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}`);
            if (!res.ok) throw new Error("Producto no encontrado");
            const data = await res.json();
            setProduct(data);
        } catch (error) {
            console.error("Error fetching product:", error);
            toast.error("Error al cargar el producto");
            navigate('/marketplace');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}/comments`);
            const data = await res.json();
            if (Array.isArray(data)) setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleSendMessage = () => {
        if (!currentUser) {
            toast.error("Inicia sesión para contactar al vendedor");
            return;
        }
        if (currentUser.id === product?.seller_id) {
            toast.info("Eres el vendedor de este producto");
            return;
        }
        navigate(`/messages/${product?.seller_id}`);
    };

    const handlePostComment = async (parentId?: number) => {
        if (!currentUser) {
            toast.error("Inicia sesión para participar");
            return;
        }

        const contentToSend = parentId ? replyContent : newComment;
        if (!contentToSend.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`http://localhost:3000/api/products/${id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    content: contentToSend,
                    parentId: parentId || null
                })
            });

            if (!res.ok) throw new Error("Error al enviar");

            if (parentId) {
                setReplyContent("");
                setReplyingTo(null);
            } else {
                setNewComment("");
            }
            fetchComments();
            toast.success(parentId ? "Respuesta enviada" : "Pregunta publicada");
        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("No se pudo enviar");
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to render content with functional tags (Green & Precise)
    const renderCommentContent = (content: string) => {
        // 1. Identify valid names from the conversation to ensure precise matching
        const participantNames = Array.from(new Set(comments.map(c => c.user_name)))
            .sort((a, b) => b.length - a.length); // Match longest names first

        if (participantNames.length === 0) return content;

        // 2. Create a regex that strictly matches these names when prefixed with @
        const pattern = new RegExp(`@(${participantNames.join('|')})`, 'g');
        const parts = content.split(pattern);

        return parts.map((part, i) => {
            const isName = participantNames.includes(part);
            if (isName) {
                return (
                    <span
                        key={i}
                        className="font-semibold text-green-700 bg-green-50 px-1 rounded cursor-pointer hover:underline"
                        onClick={(e) => {
                            e.stopPropagation();
                            const foundUser = comments.find(c => c.user_name === part);
                            if (foundUser) navigate(`/profile/${foundUser.user_id}`);
                        }}
                    >
                        @{part}
                    </span>
                );
            }
            // If the previous part was a name (odd index in split result usually), this part might start with the rest of the string
            // But split keeps separators. 
            // Wait, split with capture group includes the separator in the result array.
            // "Hello @Saul Luviano how are you".split(/(@Saul Luviano)/) -> ["Hello ", "@Saul Luviano", " how are you"]
            // My regex above `(@(names))` captures the "@Name".
            // Let's adjust regex to capture the whole tag including @
            // actually the regex `new RegExp(`@(${participantNames.join('|')})`, 'g')` captures the GROUP inside parentheses, so just the NAME.
            // So "@Saul".split gives ["", "Saul", ""]
            // If I want to render "@Saul", I should manually add the @ in the span.
            // Correct.
            return part;
        });
    };

    // Helper to organize comments
    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: number) => comments.filter(c => c.parent_id === parentId);


    if (loading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (!product) return <div className="p-8 text-center">Producto no encontrado</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <Button variant="ghost" className="mb-6 gap-2" onClick={() => navigate('/marketplace')}>
                <ArrowLeft className="h-4 w-4" /> Volver al Marketplace
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Image Section */}
                <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square relative shadow-sm">
                    {product.image_url ? (
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Store className="h-24 w-24 opacity-50" />
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div>
                    <div className="mb-2">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium uppercase tracking-wide">
                            {product.category}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-3xl font-bold text-green-600 mb-6">
                        ${Number(product.price).toLocaleString()} <span className="text-lg text-gray-500 font-normal">/ {product.unit}</span>
                    </p>

                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4">Vendido por</h3>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(`/profile/${product.seller_id}`)}>
                                <Avatar className="h-12 w-12 border border-blue-100">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${product.seller_name}`} />
                                    <AvatarFallback>{product.seller_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-bold text-gray-900 hover:underline">{product.seller_name}</p>
                                    <p className="text-sm text-gray-500">{product.seller_type}</p>
                                </div>
                            </div>
                            <Button onClick={handleSendMessage} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                <MessageSquare className="h-4 w-4" />
                                Contactar
                            </Button>
                        </div>
                    </div>

                    <div className="prose max-w-none text-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h3>
                        <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Preguntas y Respuestas</h2>

                {/* Main Comment Form */}
                <div className="flex gap-4 mb-8">
                    <Avatar className="h-10 w-10 hidden sm:block">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || 'Guest'}`} />
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                        <Textarea
                            placeholder="Escribe tu pregunta sobre este producto..."
                            className="mb-3 min-h-[100px]"
                            value={newComment}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment();
                                }
                            }}
                        />
                        <div className="flex justify-end">
                            <Button
                                onClick={() => handlePostComment()}
                                disabled={submitting || !newComment.trim()}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                {submitting ? "Publicando..." : "Preguntar"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {rootComments.length === 0 ? (
                        <p className="text-center text-gray-400 py-4">Aún no hay preguntas. ¡Sé el primero!</p>
                    ) : (
                        rootComments.map((comment) => (
                            <div key={comment.id} className="group">
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.user_name}`} />
                                        <AvatarFallback>{comment.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <div className="flex items-baseline gap-2 mb-1">
                                            <span className="font-semibold text-gray-900 text-sm">{comment.user_name}</span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(comment.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-2">{renderCommentContent(comment.content)}</p>

                                        <button
                                            onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                            className="text-xs text-green-600 font-medium hover:underline mb-2"
                                        >
                                            Responder
                                        </button>

                                        {/* Reply Form */}
                                        {replyingTo === comment.id && (
                                            <div className="mt-2 mb-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex-1">
                                                    <Textarea
                                                        placeholder="Escribe tu respuesta..."
                                                        className="mb-2 min-h-[60px] text-sm"
                                                        value={replyContent}
                                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                                e.preventDefault();
                                                                handlePostComment(comment.id);
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>Cancelar</Button>
                                                        <Button size="sm" onClick={() => handlePostComment(comment.id)} disabled={!replyContent.trim()}>Responder</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Replies */}
                                        {getReplies(comment.id).length > 0 && (
                                            <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-4 mt-3">
                                                {getReplies(comment.id).map(reply => (
                                                    <div key={reply.id} className="flex gap-3 group/reply">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.user_name}`} />
                                                            <AvatarFallback>{reply.user_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1">
                                                            <div className="flex items-baseline gap-2 mb-1">
                                                                <span className="font-semibold text-gray-900 text-xs">{reply.user_name}</span>
                                                                <span className="text-[10px] text-gray-400">
                                                                    {new Date(reply.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mb-1">{renderCommentContent(reply.content)}</p>
                                                            <button
                                                                onClick={() => {
                                                                    setReplyingTo(comment.id);
                                                                    setReplyContent(`@${reply.user_name} `);
                                                                }}
                                                                className="text-xs text-green-600 font-medium hover:underline opacity-0 group-hover/reply:opacity-100 transition-opacity"
                                                            >
                                                                Responder
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
