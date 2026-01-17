import { ShoppingCart, Star, Filter, Search, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string | number;
  unit: string;
  category: string;
  image_url: string;
  seller_name: string;
  seller_type: string;
  featured?: boolean;
  rating?: number;
  reviews?: number;
}

const categories = [
  "Todas las categorías",
  "Fertilizantes",
  "Semillas",
  "Agroquímicos",
  "Riego",
  "Maquinaria",
  "Bioestimulantes",
  "Análisis",
];

export function MarketplaceSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-low") {
        return Number(a.price) - Number(b.price);
      } else if (sortBy === "price-high") {
        return Number(b.price) - Number(a.price);
      } else if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortBy === "featured") {
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketplace</h1>
        <p className="text-gray-600">Encuentra los mejores productos e insumos para tu finca</p>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((cat) => {
                if (cat === "Todas las categorías") return null;
                return (
                  <SelectItem key={cat} value={cat.toLowerCase().replace(/\s/g, '-')}>
                    {cat}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Destacados</SelectItem>
              <SelectItem value="price-low">Menor precio</SelectItem>
              <SelectItem value="price-high">Mayor precio</SelectItem>
              <SelectItem value="rating">Mejor calificados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Productos Destacados */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Productos Destacados</h2>
        {loading ? (
          <div className="text-center py-10">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts
              .filter((p) => p.featured)
              .map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover:shadow-md transition-shadow group cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Store className="h-12 w-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 bg-white/90 text-gray-800 text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-gray-100 shadow-sm">
                      {product.category}
                    </div>
                    {product.featured && (
                      <Badge className="absolute top-2 right-2 bg-green-600">
                        Destacado
                      </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{product.seller_name}</p>

                    <div className="flex items-center gap-1 mb-3">
                      <span className="text-yellow-400 text-sm">★</span>
                      <span className="text-sm font-medium text-gray-900">{product.rating || 5.0}</span>
                      <span className="text-xs text-gray-400">({product.reviews || 0})</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-lg font-bold text-green-600">
                        {formatPrice(Number(product.price))}
                        <span className="text-xs text-gray-400 font-normal block md:inline md:ml-1">
                          / {product.unit}
                        </span>
                      </p>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">
                        <ShoppingCart className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* Todos los Productos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Todos los Productos</h2>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Más filtros
          </Button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="relative">
                  <img
                    src={product.image_url || "https://images.unsplash.com/photo-1595246140625-573b715d11dc?q=80&w=400&auto=format&fit=crop"}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {product.featured && (
                    <Badge className="absolute top-2 right-2 bg-green-600">
                      Destacado
                    </Badge>
                  )}
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.seller_name}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating || 5.0}</span>
                    <span className="text-sm text-gray-500">({product.reviews || 0})</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(Number(product.price))}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Ver
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No hay productos que coincidan con tu búsqueda.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
