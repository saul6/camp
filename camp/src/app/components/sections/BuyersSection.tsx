import { Building2, MapPin, Star, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

const buyers = [
  {
    id: 1,
    name: "FreshMarket Corp",
    type: "Supermercados",
    location: "Zamora, México",
    rating: 4.8,
    reviews: 245,
    seeking: ["Frutas", "Hortalizas", "Tubérculos"],
    volume: "500+ ton/mes",
    verified: true,
  },
  {
    id: 2,
    name: "ExportAgro S.A.",
    type: "Exportadora",
    location: "Jacona, México",
    rating: 4.9,
    reviews: 189,
    seeking: ["Café", "Aguacate", "Flores"],
    volume: "1000+ ton/mes",
    verified: true,
  },
  {
    id: 3,
    name: "Jugos Naturales del Valle",
    type: "Procesadora",
    location: "Chilchota, México",
    rating: 4.7,
    reviews: 134,
    seeking: ["Cítricos", "Frutas Tropicales"],
    volume: "300+ ton/mes",
    verified: true,
  },
  {
    id: 4,
    name: "Restaurantes Premium",
    type: "Cadena de Restaurantes",
    location: "Chavinda, México",
    rating: 4.6,
    reviews: 98,
    seeking: ["Vegetales Orgánicos", "Hierbas"],
    volume: "50+ ton/mes",
    verified: false,
  },
];

const opportunities = [
  {
    id: 1,
    buyer: "FreshMarket Corp",
    product: "Tomate",
    quantity: "20 toneladas",
    price: "3,500/kg",
    deadline: "15 días",
    requirements: "Calidad Premium, certificación GLOBALG.A.P.",
  },
  {
    id: 2,
    buyer: "ExportAgro S.A.",
    product: "Aguacate Hass",
    quantity: "50 toneladas",
    price: "8,000/kg",
    deadline: "30 días",
    requirements: "Calibre 16-20, madurez óptima para exportación",
  },
  {
    id: 3,
    buyer: "Jugos Naturales del Valle",
    product: "Naranja Valencia",
    quantity: "100 toneladas",
    price: "1,200/kg",
    deadline: "20 días",
    requirements: "Alto contenido de jugo, mínimo 12° Brix",
  },
];

export function BuyersSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compradores</h1>
        <p className="text-gray-600">Conecta con empresas que buscan tus productos</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">156</p>
              <p className="text-sm text-gray-600">Compradores Activos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">89</p>
              <p className="text-sm text-gray-600">Oportunidades</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">34</p>
              <p className="text-sm text-gray-600">Ofertas Recibidas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-600">Contratos Activos</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="buyers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="buyers">Directorio de Compradores</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades de Venta</TabsTrigger>
        </TabsList>

        {/* Directorio de Compradores */}
        <TabsContent value="buyers">
          <div className="space-y-4">
            {buyers.map((buyer) => (
              <Card key={buyer.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Company Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                          <Building2 className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-semibold">{buyer.name}</h3>
                            {buyer.verified && (
                              <Badge className="bg-blue-600">Verificado</Badge>
                            )}
                          </div>
                          <p className="text-gray-600">{buyer.type}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <MapPin className="h-4 w-4" />
                            {buyer.location}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{buyer.rating}</span>
                        <span className="text-gray-500 text-sm">({buyer.reviews})</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Productos que busca:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {buyer.seeking.map((product, idx) => (
                            <Badge key={idx} variant="outline" className="bg-green-50">
                              {product}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Volumen de compra:
                        </p>
                        <Badge className="bg-purple-600">{buyer.volume}</Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Enviar Propuesta
                      </Button>
                      <Button variant="outline">Ver Perfil Completo</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Oportunidades de Venta */}
        <TabsContent value="opportunities">
          <div className="space-y-4">
            {opportunities.map((opp) => (
              <Card key={opp.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <Badge className="bg-green-600 mb-2">Oportunidad Activa</Badge>
                        <h3 className="text-xl font-semibold mb-1">
                          Solicitud de {opp.product}
                        </h3>
                        <p className="text-gray-600">{opp.buyer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          ${opp.price}
                        </p>
                        <p className="text-sm text-gray-500">Precio ofrecido</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Cantidad requerida</p>
                        <p className="font-semibold">{opp.quantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Plazo de entrega</p>
                        <p className="font-semibold">{opp.deadline}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-xs text-gray-500 mb-1">Estado</p>
                        <Badge variant="outline" className="bg-yellow-50">
                          Aceptando propuestas
                        </Badge>
                      </div>
                    </div>

                    {/* Requirements */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Requisitos:
                      </p>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        {opp.requirements}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Enviar Cotización
                      </Button>
                      <Button variant="outline">Más Información</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* CTA */}
          <Card className="p-6 mt-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                ¿Quieres recibir oportunidades personalizadas?
              </h3>
              <p className="text-gray-600 mb-4">
                Completa tu perfil y especifica tus productos para recibir alertas de compradores interesados
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Completar Perfil
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
