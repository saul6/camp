import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
// import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { MapPin, Calendar, Globe, Camera, Edit, MoreHorizontal, Image as ImageIcon, ThumbsUp, MessageCircle, Share2 } from "lucide-react";

export default function ProfilePage() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : { name: "Usuario", profileType: "Agricultor" };
    const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "US";

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* --- Header Section (Cover + Profile Info) --- */}
            <div className="bg-white shadow">
                <div className="max-w-7xl mx-auto">
                    {/* Cover Photo */}
                    <div className="relative h-64 md:h-80 w-full rounded-b-xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-800">
                        {/* Placeholder for actual cover image */}
                        <div className="absolute inset-0 flex items-center justify-center text-white/30 font-bold text-4xl select-none">
                            AgroLink Layout
                        </div>
                        <Button variant="secondary" size="sm" className="absolute bottom-4 right-4 gap-2">
                            <Camera className="h-4 w-4" />
                            <span>Agregar foto de portada</span>
                        </Button>
                    </div>

                    {/* Profile Info Bar */}
                    <div className="px-4 pb-4 md:px-8 relative">
                        <div className="flex flex-col md:flex-row items-start md:items-end -mt-12 md:-mt-8 gap-4 mb-4">

                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="h-40 w-40 rounded-full border-4 border-white bg-gray-200 overflow-hidden shadow-lg flex items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-400">{initials}</span>
                                    {/* <img src="/path-to-avatar.jpg" alt="Profile" className="h-full w-full object-cover" /> */}
                                </div>
                                <button className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors border border-gray-300">
                                    <Camera className="h-5 w-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Name & Quick Actions */}
                            <div className="flex-1 mt-2 md:mt-0 md:mb-4">
                                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-600 font-medium capitalize">{user.profileType} • 0 seguidores</p>
                                {/* Avatar Group Mockup (Friends/Connections) */}
                                <div className="flex -space-x-2 mt-2">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-gray-300"></div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3 mt-4 md:mt-0 md:mb-6 w-full md:w-auto">
                                <Button className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 gap-2">
                                    <Edit className="h-4 w-4" />
                                    Editar perfil
                                </Button>
                                <Button variant="secondary" className="flex-1 md:flex-none bg-gray-200 hover:bg-gray-300 text-gray-900">
                                    Promocionar
                                </Button>
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

                                <Button variant="outline" className="w-full bg-gray-100 hover:bg-gray-200 border-none text-gray-900 font-semibold mt-2">
                                    Editar detalles
                                </Button>
                                <Button variant="outline" className="w-full bg-gray-100 hover:bg-gray-200 border-none text-gray-900 font-semibold">
                                    Agregar pasatiempos
                                </Button>
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

                        {/* Create Post Widget */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold shrink-0">
                                        JP
                                    </div>
                                    <Input
                                        placeholder="¿Qué estás pensando, Juan?"
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

                        {/* FILTER BAR Mockup */}
                        <Card className="p-4 flex items-center justify-between">
                            <h3 className="font-bold text-lg">Publicaciones</h3>
                            <div className="flex gap-2">
                                <Button variant="secondary" size="sm" className="bg-gray-200">Filtros</Button>
                                <Button variant="secondary" size="sm" className="bg-gray-200">Administrar</Button>
                            </div>
                        </Card>

                        {/* Sample Post 1 */}
                        <PostCard
                            author="Juan Pérez"
                            time="8 de abril de 2024"
                            content="¡Excelente cosecha de aguacate este año! Listos para exportación. 🥑🌱 #AgroLink #Cosecha2024"
                            likes={45}
                            comments={12}
                        />

                        {/* Sample Post 2 */}
                        <PostCard
                            author="Juan Pérez"
                            time="5 de abril de 2024"
                            content="Preparando el terreno para la próxima siembra de berries. La tecnología de riego que implementamos está dando resultados increíbles."
                            likes={32}
                            comments={8}
                        />

                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper icons
import { Smile, User } from "lucide-react";

// Helper Component for Posts
function PostCard({ author, time, content, likes, comments }: { author: string, time: string, content: string, likes: number, comments: number }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start gap-3 pb-2">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold cursor-pointer">
                    JP
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 cursor-pointer hover:underline">{author}</h3>
                    <div className="flex items-center text-gray-500 text-sm gap-1">
                        <span>{time}</span>
                        <span>•</span>
                        <Globe className="h-3 w-3" />
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-600">
                    <MoreHorizontal className="h-5 w-5" />
                </Button>
            </CardHeader>
            <CardContent className="pb-2">
                <p className="text-gray-900 mb-4 whitespace-pre-line">{content}</p>
                {/* Placeholder for post image */}
                <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                </div>

                <div className="flex items-center justify-between text-gray-500 text-sm mb-4">
                    <div className="flex items-center gap-1">
                        <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <ThumbsUp className="h-3 w-3 text-white fill-white" />
                        </div>
                        <span>{likes}</span>
                    </div>
                    <div className="flex gap-4">
                        <span>{comments} comentarios</span>
                        <span>3 compartidos</span>
                    </div>
                </div>

                <Separator className="mb-2" />

                <div className="flex justify-between gap-2">
                    <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                        <ThumbsUp className="h-5 w-5" />
                        <span className="font-semibold">Me gusta</span>
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                        <MessageCircle className="h-5 w-5" />
                        <span className="font-semibold">Comentar</span>
                    </Button>
                    <Button variant="ghost" className="flex-1 gap-2 text-gray-600 hover:bg-gray-100">
                        <Share2 className="h-5 w-5" />
                        <span className="font-semibold">Compartir</span>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
