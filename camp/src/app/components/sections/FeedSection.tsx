import { useState, useEffect, useRef } from "react";
import { TrendingUp, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { PostCard, Post } from "../ui/PostCard";
import { ErrorBoundary } from "../ui/ErrorBoundary";

export function FeedSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [loading, setLoading] = useState(false);

  /* New state for previewing image */
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useState<HTMLInputElement | null>(null);

  /* Fix useRef usage: standard react hook */
  const fileRef = useRef<HTMLInputElement>(null);

  // Get current user (mock or from auth context)
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  // Safety check, if no user, might redirect to login, but for component lets just handle gracefully

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/posts");
      const data = await response.json();
      console.log("Feed data:", data);
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        console.error("API returned non-array:", data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  /* Handle File Selection */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setNewPostImage(result);
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!user || (!newPostContent.trim() && !newPostImage)) return;

    setLoading(true);
    try {
      let response;
      if (newPostImage && fileRef.current?.files?.[0]) {
        // Use FormData for File Upload
        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('content', newPostContent);
        formData.append('image', fileRef.current.files[0]);

        response = await fetch("http://localhost:3000/api/posts", {
          method: "POST",
          body: formData, // No Content-Type header needed, browser sets it with boundary
        });
      } else {
        // Fallback to JSON (legacy or text-only)
        response = await fetch("http://localhost:3000/api/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            content: newPostContent,
            imageUrl: null // No image
          }),
        });
      }

      if (response.ok) {
        setNewPostContent("");
        setNewPostImage("");
        setImagePreview("");
        if (fileRef.current) fileRef.current.value = "";
        fetchPosts(); // Refresh feed
      } else {
        const errData = await response.json().catch(() => ({}));
        alert(`Error al publicar: ${errData.message || response.statusText}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  /* Keyboard Shortcut Handler */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePublish();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ErrorBoundary>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Crear Publicación */}
            <Card className="p-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : "YO"}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <Textarea
                    placeholder={`¿Qué está pasando en tu finca, ${user?.name?.split(' ')[0] || ''}?`}
                    className="min-h-[80px] resize-none"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />

                  {/* File Input (Hidden) */}
                  <input
                    type="file"
                    ref={fileRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="relative mt-2">
                      <img src={imagePreview} alt="Preview" className="max-h-60 rounded-lg border border-gray-200" />
                      <button
                        onClick={() => {
                          setNewPostImage("");
                          setImagePreview("");
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1"
                      >
                        X
                      </button>
                    </div>
                  )}

                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-green-600 gap-2 hover:bg-green-50"
                    onClick={() => fileRef.current?.click()}
                  >
                    {/* Placeholder Icon */}
                    📷 Foto/Video
                  </Button>
                </div>

                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handlePublish}
                  disabled={loading || (!newPostContent.trim() && !newPostImage)}
                >
                  {loading ? "Publicando..." : "Publicar"}
                </Button>
              </div>
            </Card>

            {/* Filtros */}
            <Card className="p-2">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="producers">Productores</TabsTrigger>
                  <TabsTrigger value="suppliers">Proveedores</TabsTrigger>
                  <TabsTrigger value="buyers">Compradores</TabsTrigger>
                </TabsList>
              </Tabs>
            </Card>

            {/* Posts */}
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} currentUserId={user?.id || 0} />
              ))}
              {posts.length === 0 && (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                  <p className="text-gray-500">No hay publicaciones aún. ¡Sé el primero!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Derecha */}
          <div className="space-y-6 hidden lg:block">
            {/* Estadísticas */}
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Tu Actividad</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conexiones</span>
                  <span className="font-semibold text-green-600">--</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Publicaciones</span>
                  <span className="font-semibold text-green-600">{posts.filter(p => p.user_id === user?.id).length}</span>
                </div>
              </div>
            </Card>

            {/* Tendencias */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Tendencias</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">#RiegoTecnificado</p>
                  <p className="text-xs text-gray-500">Popular</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">#PreciosMaíz</p>
                  <p className="text-xs text-gray-500">Tendencia hoy</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
