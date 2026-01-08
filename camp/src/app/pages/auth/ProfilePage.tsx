import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Separator } from "../../components/ui/separator";
import { MapPin, Calendar, Globe, Camera, Edit, MoreHorizontal, Image as ImageIcon, Smile, User, UserPlus, UserCheck } from "lucide-react";
import { PostCard, Post } from "../../components/ui/PostCard";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";

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
    const [posts, setPosts] = useState<Post[]>([]);
    const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    // Current Auth User
    const userStr = localStorage.getItem('user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    // Determine target user ID (URL param or current user)
    const targetUserId = id ? parseInt(id) : (currentUser ? currentUser.id : 0);
    const isOwner = currentUser && currentUser.id === targetUserId;

    useEffect(() => {
        console.log("ProfilePage Effect: targetUserId", targetUserId);
        if (!targetUserId) {
            console.log("No targetUserId, stopping load");
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                console.log("Fetching data for user:", targetUserId);
                // 1. Fetch User Details
                const userRes = await fetch(`http://localhost:3000/api/users/${targetUserId}?currentUserId=${currentUser?.id}`);
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setProfileUser(userData);
                } else {
                    console.error("Error fetching user details:", await userRes.text());
                }

                // 2. Fetch User Posts
                const postsRes = await fetch(`http://localhost:3000/api/posts?userId=${targetUserId}`);
                const postsData = await postsRes.json();
                setPosts(postsData);

            } catch (error) {
                console.error("Error fetching profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [targetUserId, currentUser?.id]);

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
                        {/* Placeholder for actual cover image */}
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
                                <p className="text-gray-600 font-medium capitalize">
                                    {profileUser.profile_type} • {profileUser.followersCount} seguidores • {profileUser.followingCount} seguidos
                                </p>
                                {/* Avatar Group Mockup (Friends/Connections) */}
                                <div className="flex -space-x-2 mt-2">
                                    {/* Placeholder avatars could go here */}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 md:mt-0 md:mb-6 w-full md:w-auto">
                                {isOwner ? (
                                    <>
                                        <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 gap-2">
                                            <Edit className="h-4 w-4" />
                                            Editar perfil
                                        </Button>
                                        <Button variant="secondary" className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-900">
                                            Promocionar
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleFollowToggle}
                                        className={`flex-1 md:flex-none gap-2 ${profileUser.isFollowing ? 'bg-white text-green-600 border border-green-600 hover:bg-green-50' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                                    >
                                        {profileUser.isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                        {profileUser.isFollowing ? 'Siguiendo' : 'Seguir'}
                                    </Button>
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
                                <div className="flex items-center gap-3 text-gray-700">
                                    <MapPin className="h-5 w-5 text-gray-400" />
                                    <span>Vive en <span className="font-semibold">Guadalajara, Jalisco</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Globe className="h-5 w-5 text-gray-400" />
                                    <span>De <span className="font-semibold">Michoacán, México</span></span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Calendar className="h-5 w-5 text-gray-400" />
                                    <span>Se unió en Enero 2024</span>
                                </div>

                                {isOwner && (
                                    <>
                                        <Button variant="outline" className="w-full bg-gray-100 hover:bg-gray-200 border-none text-gray-900 font-semibold mt-2">
                                            Editar detalles
                                        </Button>
                                        <Button variant="outline" className="w-full bg-gray-100 hover:bg-gray-200 border-none text-gray-900 font-semibold">
                                            Agregar pasatiempos
                                        </Button>
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

