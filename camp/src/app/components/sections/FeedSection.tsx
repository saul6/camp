import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";

const posts = [
  {
    id: 1,
    author: "Juan Pérez",
    role: "Productor de Maíz",
    avatar: "JP",
    time: "Hace 2 horas",
    content: "¡Excelente cosecha esta temporada! Implementamos un nuevo sistema de riego que aumentó la producción en un 30%. ¿Alguien más está usando riego por goteo?",
    image: "https://images.unsplash.com/photo-1700588117348-4c5877c03d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmYXJtJTIwY3JvcHN8ZW58MXx8fHwxNzY2NTUwMTE2fDA&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 42,
    comments: 8,
    shares: 3,
  },
  {
    id: 2,
    author: "María González",
    role: "Productora de Hortalizas",
    avatar: "MG",
    time: "Hace 5 horas",
    content: "Busco recomendaciones de proveedores de fertilizantes orgánicos en la región central. Mi producción es 100% orgánica y necesito mantener la certificación.",
    likes: 28,
    comments: 15,
    shares: 5,
  },
  {
    id: 3,
    author: "AgroTech Solutions",
    role: "Empresa de Insumos",
    avatar: "AS",
    time: "Hace 1 día",
    content: "🎉 ¡Nueva línea de productos bioestimulantes! Aumenta la resistencia de tus cultivos ante condiciones climáticas adversas. Oferta especial este mes. #AgroInnovación",
    image: "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXJ0aWxpemVyJTIwc2VlZHMlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjY1NTAxMTd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    likes: 65,
    comments: 12,
    shares: 18,
  },
];

const suggestions = [
  { name: "Pedro Ruiz", role: "Productor de Café", connections: 45 },
  { name: "Laura Martínez", role: "Productora de Frutas", connections: 78 },
  { name: "FertiGrow Corp", role: "Empresa de Insumos", connections: 234 },
];

export function FeedSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feed Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crear Publicación */}
          <Card className="p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white">JP</span>
              </div>
              <Textarea
                placeholder="¿Qué está pasando en tu finca?"
                className="min-h-[80px] resize-none"
              />
            </div>
            <div className="flex justify-end mt-3">
              <Button className="bg-green-600 hover:bg-green-700">
                Publicar
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
          {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden">
              {/* Header */}
              <div className="p-4 flex items-start justify-between">
                <div className="flex gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white">{post.avatar}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{post.author}</h3>
                    <p className="text-sm text-gray-600">{post.role}</p>
                    <p className="text-xs text-gray-500">{post.time}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-800">{post.content}</p>
              </div>

              {/* Image */}
              {post.image && (
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-80 object-cover"
                />
              )}

              {/* Actions */}
              <div className="p-4 flex items-center justify-between border-t">
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Heart className="h-5 w-5" />
                    <span className="text-sm">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <MessageCircle className="h-5 w-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors">
                    <Share2 className="h-5 w-5" />
                    <span className="text-sm">{post.shares}</span>
                  </button>
                </div>
                <Button variant="ghost" size="icon">
                  <Bookmark className="h-5 w-5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Sidebar Derecha */}
        <div className="space-y-6">
          {/* Estadísticas */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Tu Actividad</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conexiones</span>
                <span className="font-semibold text-green-600">127</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Publicaciones</span>
                <span className="font-semibold text-green-600">34</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vistas de perfil</span>
                <span className="font-semibold text-green-600">89</span>
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
                <p className="text-xs text-gray-500">234 publicaciones</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">#AgriculturaOrgánica</p>
                <p className="text-xs text-gray-500">189 publicaciones</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">#PreciosDelMercado</p>
                <p className="text-xs text-gray-500">156 publicaciones</p>
              </div>
            </div>
          </Card>

          {/* Sugerencias */}
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Conectar</h3>
            </div>
            <div className="space-y-4">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm">
                        {suggestion.name.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{suggestion.name}</p>
                      <p className="text-xs text-gray-500">{suggestion.role}</p>
                      <p className="text-xs text-gray-400">{suggestion.connections} conexiones</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50">
                    Conectar
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
