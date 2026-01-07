import { ShoppingCart, Star, Filter, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const products = [
  {
    id: 1,
    name: "Fertilizante NPK Premium",
    company: "AgroTech Solutions",
    price: 45000,
    unit: "saco 50kg",
    rating: 4.8,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXJ0aWxpemVyJTIwc2VlZHMlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjY1NTAxMTd8MA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Fertilizantes",
    featured: true,
  },
  {
    id: 2,
    name: "Sistema de Riego por Goteo",
    company: "IrrigaPro",
    price: 280000,
    unit: "kit 1 hectárea",
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1628272107134-c66c4b580952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBwb3J0cmFpdCUyMHdvcmtpbmd8ZW58MXx8fHwxNzY2NTUwMTE3fDA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Riego",
    featured: true,
  },
  {
    id: 3,
    name: "Semillas de Maíz Híbrido",
    company: "SemillasTop",
    price: 89000,
    unit: "bolsa 20kg",
    rating: 4.7,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1700588117348-4c5877c03d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmYXJtJTIwY3JvcHN8ZW58MXx8fHwxNzY2NTUwMTE2fDA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Semillas",
    featured: false,
  },
  {
    id: 4,
    name: "Herbicida Selectivo",
    company: "CropCare",
    price: 32000,
    unit: "litro",
    rating: 4.6,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1703113691621-af7d6e70dcc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBtYWNoaW5lcnklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY2NTUwMTE4fDA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Agroquímicos",
    featured: false,
  },
  {
    id: 5,
    name: "Bioestimulante Foliar",
    company: "BioGrow Natural",
    price: 28000,
    unit: "litro",
    rating: 4.9,
    reviews: 98,
    image: "https://images.unsplash.com/photo-1731970820339-e725b78f55e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZXJ0aWxpemVyJTIwc2VlZHMlMjBwcm9kdWN0c3xlbnwxfHx8fDE3NjY1NTAxMTd8MA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Bioestimulantes",
    featured: true,
  },
  {
    id: 6,
    name: "Kit de Análisis de Suelo",
    company: "SoilTech Labs",
    price: 15000,
    unit: "kit",
    rating: 4.5,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1700588117348-4c5877c03d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmYXJtJTIwY3JvcHN8ZW58MXx8fHwxNzY2NTUwMTE2fDA&ixlib=rb-4.1.0&q=80&w=400",
    category: "Análisis",
    featured: false,
  },
];

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
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
              />
            </div>
          </div>
          <Select defaultValue="all">
            <SelectTrigger>
              <SelectValue placeholder="Categoría" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase().replace(/\s/g, '-')}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="featured">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products
            .filter((p) => p.featured)
            .map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-green-600">
                    Destacado
                  </Badge>
                </div>
                <div className="p-4">
                  <Badge variant="outline" className="mb-2">
                    {product.category}
                  </Badge>
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.company}</p>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-gray-500">({product.reviews})</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">{product.unit}</p>
                    </div>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Comprar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image}
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
                <p className="text-sm text-gray-600 mb-2">{product.company}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{product.rating}</span>
                  <span className="text-sm text-gray-500">({product.reviews})</span>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(product.price)}
                    </p>
                    <p className="text-xs text-gray-500">{product.unit}</p>
                  </div>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Comprar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
