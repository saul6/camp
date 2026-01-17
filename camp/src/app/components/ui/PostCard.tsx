import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { Button } from "./button";
import { Card } from "./card";
import { Textarea } from "./textarea";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

export interface Post {
    id: number;
    user_id: number;
    content: string;
    image_url: string | null;
    created_at: string;
    author_name: string;
    author_type: string;
    likes_count: number;
    comments_count: number;
}

interface PostCardProps {
    post: Post;
    currentUserId: number;
}

export function PostCard({ post, currentUserId }: PostCardProps) {
    const [likes, setLikes] = useState(post.likes_count);
    const [commentsCount, setCommentsCount] = useState(post.comments_count);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [loadingComments, setLoadingComments] = useState(false);

    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");

    // Initials for avatar
    const initials = post.author_name
        ? post.author_name.substring(0, 2).toUpperCase()
        : "??";

    const handleLike = async () => {
        try {
            const response = await fetch(`http://localhost:3000/api/posts/${post.id}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
            const data = await response.json();
            if (data.liked) {
                setLikes((prev) => prev + 1);
            } else {
                setLikes((prev) => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error liking post:", error);
        }
    };

    const loadComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }
        setLoadingComments(true);
        try {
            const response = await fetch(`http://localhost:3000/api/posts/${post.id}/comments?userId=${currentUserId}`);
            const data = await response.json();
            setComments(data);
            setShowComments(true);
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleComment = async (parentId?: number) => {
        const contentToPost = parentId ? replyContent : newComment;
        if (!contentToPost.trim()) return;

        try {
            const response = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUserId,
                    content: contentToPost,
                    parentId: parentId
                }),
            });
            if (response.ok) {
                if (parentId) {
                    setReplyContent("");
                    setReplyingTo(null);
                } else {
                    setNewComment("");
                }
                setCommentsCount((prev) => prev + 1);
                // Reload comments to show the new one
                const commentsResponse = await fetch(`http://localhost:3000/api/posts/${post.id}/comments?userId=${currentUserId}`);
                const data = await commentsResponse.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handleCommentLike = async (commentId: number) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                const isLiked = !c.is_liked;
                return {
                    ...c,
                    is_liked: isLiked,
                    likes_count: isLiked ? (c.likes_count || 0) + 1 : Math.max(0, (c.likes_count || 0) - 1)
                };
            }
            return c;
        }));

        try {
            await fetch(`http://localhost:3000/api/comments/${commentId}/like`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId }),
            });
        } catch (error) {
            console.error("Error liking comment:", error);
        }
    };

    const rootComments = comments.filter(c => !c.parent_id);
    const getReplies = (parentId: number) => comments.filter(c => c.parent_id == parentId);

    const renderWithMentions = (text: string) => {
        if (!text) return null;
        const regex = /(@[a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+(?: [A-ZÁÉÍÓÚÑ][a-zA-Z0-9_áéíóúÁÉÍÓÚñÑ]+)*)/g;
        const parts = text.split(regex);
        return parts.map((part, i) => {
            if (part.match(regex)) {
                return (
                    <Link key={i} to={`/profile/search?q=${part.slice(1)}`} className="text-green-600 font-semibold hover:underline">
                        {part}
                    </Link>
                );
            }
            return part;
        });
    };

    return (
        <Card className="overflow-hidden mb-4">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                    <Link to={`/profile/${post.user_id}`}>
                        <Avatar className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author_name}`} />
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <div>
                        <Link to={`/profile/${post.user_id}`} className="hover:underline">
                            <h3 className="font-semibold text-sm">{post.author_name}</h3>
                        </Link>
                        <p className="text-xs text-gray-500">{post.author_type}</p>
                        <p className="text-xs text-xs text-gray-400">
                            {(() => {
                                try {
                                    return formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: es });
                                } catch (e) {
                                    return "Hace un momento";
                                }
                            })()}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </div>

            {/* Content */}
            <div className="px-4 pb-3">
                <p className="text-gray-800 text-sm whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Image */}
            {post.image_url && (
                <img
                    src={post.image_url}
                    alt="Post content"
                    className="w-full h-80 object-cover bg-gray-100"
                />
            )}

            {/* Actions */}
            <div className="p-4 flex items-center justify-between border-t border-gray-100">
                <div className="flex gap-6">
                    <button
                        onClick={handleLike}
                        className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors"
                    >
                        <Heart className="h-5 w-5" />
                        <span className="text-sm">{likes}</span>
                    </button>
                    <button
                        onClick={loadComments}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
                    >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-sm">{commentsCount}</span>
                    </button>
                    <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <div className="space-y-4 mb-4">
                        {rootComments.map((comment) => (
                            <div key={comment.id} className="relative">
                                {/* Root Comment */}
                                <div className="flex gap-2 z-10 relative">
                                    <Avatar className="h-9 w-9 border border-gray-100 shrink-0">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`} />
                                        <AvatarFallback>{comment.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 max-w-[calc(100%-48px)]">
                                        <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative inline-block min-w-[200px]">
                                            <p className="text-xs font-bold text-gray-900 mb-0.5">{comment.author_name}</p>
                                            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-snug">{renderWithMentions(comment.content)}</p>
                                        </div>
                                        <div className="flex gap-4 mt-1 ml-1 items-center">
                                            <span className="text-xs text-gray-400">
                                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: es })}
                                            </span>
                                            <button
                                                className={`text-xs font-semibold hover:text-green-600 ${comment.is_liked ? 'text-green-600' : 'text-gray-500'}`}
                                                onClick={() => handleCommentLike(comment.id)}
                                            >
                                                Me gusta {comment.likes_count > 0 && `(${comment.likes_count})`}
                                            </button>
                                            <button
                                                className="text-xs font-semibold text-gray-500 hover:text-green-600"
                                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                            >
                                                Responder
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Reply Input Area */}
                                {replyingTo === comment.id && (
                                    <div className="mt-2 pl-12 relative animate-in fade-in slide-in-from-top-1">
                                        {/* Connector for input */}
                                        <div className="absolute left-[1.1rem] top-[-1.5rem] bottom-auto h-8 w-4 border-l-2 border-b-2 border-gray-300 rounded-bl-2xl z-0 bg-transparent"></div>

                                        <div className="flex flex-col gap-2">
                                            <Textarea
                                                placeholder={`Respondiendo a ${comment.author_name}...`}
                                                value={replyContent}
                                                onChange={(e) => setReplyContent(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        console.log('Enter pressed in reply input');
                                                        handleComment(comment.id);
                                                    }
                                                }}
                                                className="min-h-[60px] text-sm bg-white w-full"
                                                autoFocus
                                            />
                                            <div className="flex justify-end">
                                                <Button size="sm" onClick={() => handleComment(comment.id)} disabled={!replyContent.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                                                    Responder
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Replies List */}
                                {getReplies(comment.id).length > 0 && (
                                    <div className="mt-2 pl-12 relative">
                                        {/* Main Vertical Track for threading */}
                                        {/* We stretch it from top up to the last reply */}
                                        <div className="absolute left-[1.1rem] top-[-2rem] bottom-6 w-0.5 bg-gray-300 z-0"></div>

                                        {getReplies(comment.id).map((reply) => (
                                            <div key={reply.id} className="relative flex gap-2 mb-3">
                                                {/* Curved Connector */}
                                                <div className="absolute -left-8 top-[-10px] w-8 h-8 border-b-2 border-l-2 border-gray-300 rounded-bl-2xl z-0"></div>

                                                <Avatar className="h-7 w-7 border border-white shrink-0 z-10 ring-2 ring-gray-50">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${reply.author_name}`} />
                                                    <AvatarFallback>{reply.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                </Avatar>

                                                <div className="flex-1">
                                                    <div className="bg-gray-100 p-2.5 rounded-2xl rounded-tl-none inline-block min-w-[150px]">
                                                        <p className="text-xs font-bold text-gray-900 mb-0.5">{reply.author_name}</p>
                                                        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-snug">{renderWithMentions(reply.content)}</p>
                                                    </div>
                                                    <div className="flex gap-3 mt-1 ml-1 items-center">
                                                        <span className="text-[10px] text-gray-400">
                                                            {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true, locale: es })}
                                                        </span>
                                                        <button
                                                            className={`text-[10px] font-semibold hover:text-green-600 ${reply.is_liked ? 'text-green-600' : 'text-gray-500'}`}
                                                            onClick={() => handleCommentLike(reply.id)}
                                                        >
                                                            Me gusta {reply.likes_count > 0 && `(${reply.likes_count})`}
                                                        </button>
                                                        <button
                                                            className="text-[10px] font-semibold text-gray-500 hover:text-green-600"
                                                            onClick={() => {
                                                                setReplyingTo(comment.id);
                                                                setReplyContent(`@${reply.author_name} `);
                                                            }}
                                                        >
                                                            Responder
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-center text-gray-500 text-sm">Sé el primero en comentar.</p>}
                    </div>

                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Escribe un comentario..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleComment();
                                }
                            }}
                            className="min-h-[40px] text-sm"
                        />
                        <Button size="sm" onClick={() => handleComment()} disabled={!newComment.trim()} className="bg-green-600 hover:bg-green-700 text-white">
                            Enviar
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
