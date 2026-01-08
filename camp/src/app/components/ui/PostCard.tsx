import { useState } from "react";
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
            const response = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
            const data = await response.json();
            setComments(data);
            setShowComments(true);
        } catch (error) {
            console.error("Error loading comments:", error);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleComment = async () => {
        if (!newComment.trim()) return;

        try {
            const response = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUserId, content: newComment }),
            });
            if (response.ok) {
                setNewComment("");
                setCommentsCount((prev) => prev + 1);
                // Reload comments to show the new one
                const commentsResponse = await fetch(`http://localhost:3000/api/posts/${post.id}/comments`);
                const data = await commentsResponse.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    return (
        <Card className="overflow-hidden mb-4">
            {/* Header */}
            <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author_name}`} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-semibold text-sm">{post.author_name}</h3>
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
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${comment.author_name}`} />
                                    <AvatarFallback>{comment.author_name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 bg-white p-2 rounded-lg shadow-sm">
                                    <p className="text-xs font-semibold">{comment.author_name}</p>
                                    <p className="text-sm text-gray-700">{comment.content}</p>
                                </div>
                            </div>
                        ))}
                        {comments.length === 0 && <p className="text-center text-gray-500 text-sm">Sé el primero en comentar.</p>}
                    </div>

                    <div className="flex gap-2">
                        <Textarea
                            placeholder="Escribe un comentario..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="min-h-[40px] text-sm"
                        />
                        <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                            Enviar
                        </Button>
                    </div>
                </div>
            )}
        </Card>
    );
}
