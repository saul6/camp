import { UserPlus, MapPin, Briefcase, Users, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Badge } from "../ui/badge";

const connections = [
  {
    id: 1,
    name: "Carlos Rodríguez",
    role: "Productor de Café",
    location: "Zamora, México",
    connections: 156,
    avatar: "CR",
    connected: true,
  },
  {
    id: 2,
    name: "Ana Martínez",
    role: "Productora de Flores",
    location: "Jacona, México",
    connections: 234,
    avatar: "AM",
    connected: true,
  },
  {
    id: 3,
    name: "Luis Herrera",
    role: "Productor de Aguacate",
    location: "Chilchota, México",
    connections: 89,
    avatar: "LH",
    connected: true,
  },
];

const suggestions = [
  {
    id: 4,
    name: "Sandra López",
    role: "Productora de Cacao",
    location: "Chavinda, México",
    connections: 67,
    mutualConnections: 12,
    avatar: "SL",
  },
  {
    id: 5,
    name: "Miguel Torres",
    role: "Productor de Plátano",
    location: "Chavinda, México",
    connections: 145,
    mutualConnections: 8,
    avatar: "MT",
  },
  {
    id: 6,
    name: "FertilPro Colombia",
    role: "Empresa de Insumos",
    location: "Zamora, México",
    connections: 892,
    mutualConnections: 23,
    avatar: "FC",
  },
];

const companies = [
  {
    id: 1,
    name: "AgroTech Solutions",
    type: "Proveedor de Insumos",
    location: "Zamora, México",
    employees: "50-200",
    followers: 1234,
    avatar: "AS",
    verified: true,
  },
  {
    id: 2,
    name: "FreshMarket Corp",
    type: "Comprador Mayorista",
    location: "Jacona, México",
    employees: "200-500",
    followers: 2156,
    avatar: "FM",
    verified: true,
  },
  {
    id: 3,
    name: "BioGrow Natural",
    type: "Productos Orgánicos",
    location: "Chilchota, México",
    employees: "20-50",
    followers: 678,
    avatar: "BG",
    verified: false,
  },
];

export function NetworkSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Red</h1>
        <p className="text-gray-600">Conecta con productores y empresas del sector agrícola</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">127</p>
              <p className="text-sm text-gray-600">Conexiones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">23</p>
              <p className="text-sm text-gray-600">Empresas Seguidas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">45</p>
              <p className="text-sm text-gray-600">Solicitudes Pendientes</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Buscar productores, empresas..."
            className="pl-10"
          />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="connections" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="connections">Mis Conexiones</TabsTrigger>
          <TabsTrigger value="suggestions">Sugerencias</TabsTrigger>
          <TabsTrigger value="companies">Empresas</TabsTrigger>
        </TabsList>

        {/* Mis Conexiones */}
        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <Card key={connection.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">{connection.avatar}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{connection.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{connection.role}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                    <MapPin className="h-3 w-3" />
                    {connection.location}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {connection.connections} conexiones
                  </p>
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" className="flex-1">
                      Ver Perfil
                    </Button>
                    <Button variant="outline" className="flex-1 text-green-600 border-green-600 hover:bg-green-50">
                      Mensaje
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sugerencias */}
        <TabsContent value="suggestions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-4">
                    <span className="text-white text-2xl">{suggestion.avatar}</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{suggestion.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{suggestion.role}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    {suggestion.location}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {suggestion.connections} conexiones
                  </p>
                  <p className="text-xs text-green-600 mb-4">
                    {suggestion.mutualConnections} conexiones en común
                  </p>
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Empresas */}
        <TabsContent value="companies">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <Card key={company.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-white text-xl">{company.avatar}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{company.name}</h3>
                    {company.verified && (
                      <Badge className="bg-blue-600 text-xs">✓</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{company.type}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    {company.location}
                  </div>
                  <p className="text-xs text-gray-600 mb-1">
                    {company.employees} empleados
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    {company.followers} seguidores
                  </p>
                  <Button variant="outline" className="w-full text-green-600 border-green-600 hover:bg-green-50">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Seguir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
