import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { MapPin, Calendar, Globe, Camera, Edit, MoreHorizontal, Image as ImageIcon, Smile, User, UserPlus, UserCheck, MessageSquare } from "lucide-react";
import { PostCard, Post } from "../../components/ui/PostCard";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { UserListDialog } from "../../components/UserListDialog";

interface UserProfile {
    id: number;
    name: string;
    email: string;
    profile_type: string;
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
}

export default function ProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [posts, setPosts] = useState<Post[]>([]);
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);

    // Current Auth User
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Handle "Search by Name" Mode
    useEffect(() => {
        if (id === 'search') {
            const queryName = searchParams.get('q');
            if (queryName) {
                // Fetch users to find the matching name
                fetch(`http://localhost:3000/api/users`)
                    .then(res => res.json())
                    .then((users: any[]) => {
                        const foundUser = users.find((u: any) => u.name.trim().toLowerCase() === queryName.trim().toLowerCase());
                        if (foundUser) {
                            navigate(`/profile/${foundUser.id}`, { replace: true });
                        } else {
                            setLoading(false);
                            setProfileUser(null);
                        }
                    })
                    .catch(err => {
                        console.error("Error searching user:", err);
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        }
    }, [id, searchParams, navigate]);

    // Determine target user ID (URL param or current user)
    // Only parse ID if it is numeric and NOT 'search'
    const targetUserId = (id && id !== 'search' && !isNaN(parseInt(id)))
        ? parseInt(id)
        : (currentUser ? currentUser.id : 0);

    const isOwner = currentUser && currentUser.id === targetUserId;

    const fetchData = async () => {
        // If we are in search mode or invalid ID, skip standard fetch
        if (id === 'search' || (id && isNaN(parseInt(id)))) return;

        // Don't set global loading here to avoid full page flicker on silent updates
        try {
            // 1. Fetch User Details
            const userRes = await fetch(`http://localhost:3000/api/users/${targetUserId}?currentUserId=${currentUser?.id}`);
            if (userRes.ok) {
                const userData = await userRes.json();
                setProfileUser(userData);
            } else {
                setProfileUser(null);
            }
        } catch (error) {
            console.error("Error refreshing profile data:", error);
        }
    };

    useEffect(() => {
        // Skip if in search mode
        if (id === 'search') return;

        console.log("ProfilePage Effect: targetUserId", targetUserId);
        if (!targetUserId) {
            console.log("No targetUserId, stopping load");
            setLoading(false);
            return;
        }

        const loadAll = async () => {
            setLoading(true);
            await fetchData(); // Basic info
            // 2. Fetch User Posts (only needs to happen once or separately)
            try {
                const postsRes = await fetch(`http://localhost:3000/api/posts?userId=${targetUserId}`);
                const postsData = await postsRes.json();
                setPosts(postsData);
            } catch (e) {
                console.error("Error fetching posts:", e);
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [targetUserId, currentUser?.id, id]);

    const handleFollowToggle = async () => {
        if (!profileUser || !currentUser) return;

        try {
            const endpoint = `http://localhost:3000/api/users/${profileUser.id}/follow`;
            const method = profileUser.isFollowing ? 'DELETE' : 'POST';

            await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ followerId: currentUser.id }),
            });

            // Optimistic Update
            setProfileUser(prev => prev ? ({
                ...prev,
                isFollowing: !prev.isFollowing,
                followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1
            }) : null);

        } catch (error) {
            console.error("Error toggling follow:", error);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({
        location: "",
        volume: "",
        seeking_tags: "",
    });

    useEffect(() => {
        if (profileUser) {
            let tags = "";
            try {
                const rawTags = (profileUser as any).seeking_tags;
                if (Array.isArray(rawTags)) tags = rawTags.join(", ");
                else if (typeof rawTags === 'string' && rawTags.startsWith('[')) tags = JSON.parse(rawTags).join(", ");
                else tags = rawTags || "";
            } catch (e) { tags = (profileUser as any).seeking_tags || ""; }

            setEditFormData({
                location: (profileUser as any).location || "",
                volume: (profileUser as any).volume || "",
                seeking_tags: tags,
            });
        }
    }, [profileUser]);

    const handleSaveProfile = async () => {
        if (!profileUser) return;
        try {
            const seekingTagsArray = editFormData.seeking_tags.split(',').map(s => s.trim()).filter(Boolean);

            const res = await fetch(`http://localhost:3000/api/users/${profileUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profileUser.name,
                    location: editFormData.location,
                    volume: editFormData.volume,
                    seeking_tags: seekingTagsArray
                })
            });

            if (res.ok) {
                setIsEditing(false);
                fetchData(); // Reload data
            }
        } catch (err) {
            console.error("Error updating profile:", err);
        }
    };

    // Helper to render tags
    const renderTags = (tags: any) => {
        let tagArray: string[] = [];
        try {
            if (Array.isArray(tags)) tagArray = tags;
            else if (typeof tags === 'string' && tags.startsWith('[')) tagArray = JSON.parse(tags);
            else if (typeof tags === 'string') tagArray = [tags];
        } catch (e) { return null; }

        if (tagArray.length === 0) return <span className="text-gray-500 italic">No especificado</span>;

        return (
            <div className="flex flex-wrap gap-2 mt-1">
                {tagArray.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>;
    }

    if (!profileUser) {
        return <div className="min-h-screen flex items-center justify-center">Usuario no encontrado</div>;
    }

    const initials = profileUser.name ? profileUser.name.substring(0, 2).toUpperCase() : "US";

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* --- Header Section (Cover + Profile Info) --- */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto">
                    {/* Cover Photo */}
                    <div className="relative h-64 md:h-80 w-full rounded-b-xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-800">
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-4xl select-none">
                            AgroCore
                        </div>
                        {isOwner && (
                            <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 gap-2">
                                <Camera className="h-4 w-4" />
                                <span>Agregar foto de portada</span>
                            </Button>
                        )}
                    </div>

                    {/* Profile Info Bar */}
                    <div className="px-4 pb-4 md:px-8 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-8 gap-4 mb-4">

                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="h-40 w-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center">
                                    <Avatar className="h-full w-full">
                                        <AvatarFallback className="text-4xl">{initials}</AvatarFallback>
                                    </Avatar>
                                </div>
                                {isOwner && (
                                    <button className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors border border-gray-300">
                                        <Camera className="h-5 w-5 text-gray-700" />
                                    </button>
                                )}
                            </div>

                            {/* Name & Quick Actions */}
                            <div className="flex-1 mt-2 md:mt-0 md:mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{profileUser.name}</h1>

                                <div className="flex items-center gap-4 text-gray-600 font-medium mt-1">
                                    <span className="capitalize px-2 py-0.5 bg-gray-100 rounded text-sm border border-gray-200">
                                        {profileUser.profile_type}
                                    </span>
                                    <span>•</span>
                                    <button onClick={() => setShowFollowers(true)} className="hover:underline cursor-pointer hover:text-green-700">
                                        <strong>{profileUser.followersCount}</strong> seguidores
                                    </button>
                                    <span>•</span>
                                    <button onClick={() => setShowFollowing(true)} className="hover:underline cursor-pointer hover:text-green-700">
                                        <strong>{profileUser.followingCount}</strong> seguidos
                                    </button>
                                </div>
                            </div>

                            {/* USER LIST DIALOGS */}
                            <UserListDialog
                                isOpen={showFollowers}
                                onClose={() => setShowFollowers(false)}
                                userId={profileUser.id}
                                type="followers"
                                title="Seguidores"
                                onFollowChange={fetchData}
                            />
                            <UserListDialog
                                isOpen={showFollowing}
                                onClose={() => setShowFollowing(false)}
                                userId={profileUser.id}
                                type="following"
                                title="Seguidos"
                                onFollowChange={fetchData}
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 md:mt-0 md:mb-6 w-full md:w-auto">
                                {isOwner ? (
                                    isEditing ? (
                                        <>
                                            <Button onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700 gap-2">
                                                Guardar Cambios
                                            </Button>
                                            <Button variant="ghost" onClick={() => setIsEditing(false)} className="bg-gray-200 hover:bg-gray-300">
                                                Cancelar
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button onClick={() => setIsEditing(true)} className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 gap-2">
                                                <Edit className="h-4 w-4" />
                                                Editar perfil
                                            </Button>
                                            <Button variant="secondary" className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-900">
                                                Promocionar
                                            </Button>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <Button
                                            onClick={handleFollowToggle}
                                            className={`flex-1 md:flex-none gap-2 ${profileUser.isFollowing ? 'bg-white text-green-600 border border-green-600 hover:bg-green-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                        >
                                            {profileUser.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                            {profileUser.isFollowing ? 'Siguiendo' : 'Seguir'}
                                        </Button>
                                        <Button
                                            onClick={() => navigate(`/messages/${profileUser.id}`)}
                                            className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
                                        >
                                            <MessageSquare className="h-4 w-4" />
                                            Mensaje
                                        </Button>
                                    </>
                                )}

                                <Button variant="ghost" className="bg-gray-200 hover:bg-gray-300" size="icon">
                                    <MoreHorizontal className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        <Separator className="my-2" />

                        {/* Profile Navigation Tabs (Mock) */}
                        <div className="flex gap-1 overflow-x-auto pb-2 md:pb-0">
                            {["Publicaciones", "Información", "Amigos", "Fotos", "Videos", "Más"].map((tab, idx) => (
                                <button
                                    key={tab}
                                    className={`px-4 py-3 font-semibold rounded-md transition-colors whitespace-nowrap ${idx === 0 ? 'text-green-600 border-b-2 border-green-600 rounded-none' : 'text-gray-600 hover:bg-gray-100'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Main Content Grid --- */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT COLUMN: Intro & Photos */}
                    <div className="space-y-6">
                        {/* Intro Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-xl font-bold">Detalles</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Location */}
                                <div className="flex items-start gap-3 text-gray-700">
                                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div className="flex-1">
                                        <span className="block font-semibold text-xs text-gray-500 uppercase mb-0.5">Ubicación</span>
                                        {isEditing ? (
                                            <Input
                                                value={editFormData.location}
                                                onChange={e => setEditFormData({ ...editFormData, location: e.target.value })}
                                                placeholder="Ej. Guadalajara, Jalisco"
                                                className="h-8 text-sm"
                                            />
                                        ) : (
                                            <span>{(profileUser as any).location || 'No especificada'}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Join Date (Static) */}
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span>Se unió en Enero 2024</span>
                                </div>

                                {/* Buyer Specific Fields */}
                                {profileUser.profile_type === 'comercializadora' && (
                                    <>
                                        <Separator className="my-2" />

                                        {/* Volume */}
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <Globe className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <span className="block font-semibold text-xs text-gray-500 uppercase mb-0.5">Volumen de Compra</span>
                                                {isEditing ? (
                                                    <Input
                                                        value={editFormData.volume}
                                                        onChange={e => setEditFormData({ ...editFormData, volume: e.target.value })}
                                                        placeholder="Ej. 50 toneladas mensuales"
                                                        className="h-8 text-sm"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-purple-700 block bg-purple-50 px-2 py-1 rounded inline-block w-full border border-purple-100">
                                                        {(profileUser as any).volume || 'No especificado'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Products Seeking */}
                                        <div className="flex items-start gap-3 text-gray-700">
                                            <Smile className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div className="flex-1">
                                                <span className="block font-semibold text-xs text-gray-500 uppercase mb-0.5">Productos de Interés</span>
                                                {isEditing ? (
                                                    <div className="space-y-1">
                                                        <Input
                                                            value={editFormData.seeking_tags}
                                                            onChange={e => setEditFormData({ ...editFormData, seeking_tags: e.target.value })}
                                                            placeholder="Separa con comas (Ej. Fresas, Maíz)"
                                                            className="h-8 text-sm"
                                                        />
                                                        <p className="text-[10px] text-gray-500">Separa los productos con comas.</p>
                                                    </div>
                                                ) : (
                                                    renderTags((profileUser as any).seeking_tags)
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                            </CardContent>
                        </Card>

                        {/* Photos Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-xl font-bold">Fotos</CardTitle>
                                <Button variant="link" className="text-green-600 p-0 text-base">Ver todas</Button>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 gap-2 rounded-lg overflow-hidden">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                                        <div key={i} className="aspect-square bg-gray-200 hover:opacity-90 cursor-pointer">
                                            {/* Placeholder for images */}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* RIGHT COLUMN: Feed */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Create Post Widget - Only show for owner */}
                        {isOwner && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shrink-0">
                                            {initials}
                                        </div>
                                        <Input
                                            placeholder={`¿Qué estás pensando, ${profileUser.name.split(' ')[0]}?`}
                                            className="bg-gray-100 border-none rounded-full px-4 hover:bg-gray-200 transition-colors cursor-pointer"
                                        />
                                    </div>
                                    <Separator className="mb-4" />
                                    <div className="flex justify-between">
                                        <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                                            <ImageIcon className="h-6 w-6 text-green-500" />
                                            <span className="font-semibold text-sm sm:text-base">Foto/Video</span>
                                        </Button>
                                        <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                                            <User className="h-6 w-6 text-blue-500" />
                                            <span className="font-semibold text-sm sm:text-base">Etiquetar</span>
                                        </Button>
                                        <Button variant="ghost" className="hidden sm:flex flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                                            <Smile className="h-6 w-6 text-yellow-500" />
                                            <span className="font-semibold text-base">Sentimiento</span>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* FILTER BAR Mockup */}
                        <Card className="p-4 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Publicaciones</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="bg-gray-200">Filtros</Button>
                                <Button variant="secondary" size="sm" className="bg-gray-200">Administrar</Button>
                            </div>
                        </Card>

                        {/* Posts */}
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <PostCard key={post.id} post={post} currentUserId={currentUser?.id} />
                            ))
                        ) : (
                            <div className="text-center py-10 bg-white rounded-lg shadow">
                                <p className="text-gray-500">Este usuario no ha publicado nada aún.</p>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

