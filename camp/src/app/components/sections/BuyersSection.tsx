import { useEffect, useState } from "react";
import { Building2, MapPin, Star, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Link, useNavigate } from "react-router-dom";
import { SendProposalDialog } from "../dialogs/SendProposalDialog";

interface Buyer {
  id: number;
  name: string;
  type: string;
  location: string;
  rating: number;
  reviews: number;
  seeking: string[];
  volume: string;
  verified: boolean;
}

interface Opportunity {
  id: number;
  buyer: string;
  product: string;
  quantity: string;
  price: string;
  deadline: string;
  requirements: string;
}

export function BuyersSection() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({ buyers: 0, opportunities: 0, proposals: 0, contracts: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = currentUser.id;

      const [buyersRes, oppsRes, statsRes] = await Promise.all([
        fetch('http://localhost:3000/api/buyers'),
        fetch('http://localhost:3000/api/opportunities'),
        fetch(`http://localhost:3000/api/market/stats?userId=${userId || ''}`)
      ]);

      const buyersData = await buyersRes.json();
      const oppsData = await oppsRes.json();
      const statsData = await statsRes.json();

      setBuyers(buyersData);
      setOpportunities(oppsData);
      setStats(statsData);
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenProposal = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
  };

  const handleSuccessProposal = () => {
    fetchData(); // Refresh stats
  };

  // Helper to create a fake opportunity from a Buyer profile for the generic 'Enviar Propuesta' button
  const handleBuyerProposal = (buyer: Buyer) => {
    // This is a bit of a hack since 'Enviar Propuesta' on a Buyer card doesn't have a specific product context.
    // For now, let's assume it picks their first seeking tag if available, or 'General'.
    const Product = buyer.seeking[0] || 'General';
    const fakeOpp: Opportunity = {
      id: 0, // 0 indicates a direct proposal not linked to a specific opportunity record yet? Or we need logic for this.
      // Actually, for MVP let's redirect them to the first opportunity of this buyer if exists, or show a 'Not available' message.
      // Or better: Create a generic opportunity mode.
      // Let's keep it simple: The 'Enviar Propuesta' on Buyer Card might just open the dialog with pre-filled Buyer Name
      // We need to support 'buyerId' in the backend if opportunityId is missing?
      // Wait, backend requires opportunityId.
      // Let's make the button navigate to their profile for now, or alert 'Select an opportunity from the Opportunities tab'.
      // User asked for "Funcionales".
      // Let's direct them to the "Oportunidades" tab filtering by this buyer?
      // OR: Just alert "Ve a la pestaña Oportunidades para ver que necesita".
      buyer: buyer.name,
      product: Product,
      quantity: 'N/A',
      price: 'N/A',
      deadline: 'N/A',
      requirements: 'Propuesta Directa'
    } as any; // Cast to avoid strict check on missing fields like id if we allow fake.

    // BUT: The backend requires opportunity_id. We can't send a proposal without an opportunity_id.
    // Let's disable this button on the Buyer Card for now OR make it scroll to Opportunities.
    // Let's implement the "Ver Perfil Completo" first.
    navigate(`/profile/${buyer.id}`);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando compradores...</div>;

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
              <p className="text-2xl font-bold">{stats.buyers}</p>
              <p className="text-sm text-gray-600">Compradores Activos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.opportunities}</p>
              <p className="text-sm text-gray-600">Oportunidades</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.proposals}</p>
              <p className="text-sm text-gray-600">Ofertas Recibidas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{stats.contracts}</p>
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
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => alert("Por favor selecciona una 'Oportunidad' específica en la otra pestaña para enviar una propuesta a esta empresa.")}>
                        Enviar Propuesta
                      </Button>
                      <Button variant="outline" onClick={() => navigate(`/profile/${buyer.id}`)}>Ver Perfil Completo</Button>
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
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleOpenProposal(opp)}>
                        Enviar Cotización
                      </Button>
                      <Button variant="outline" onClick={() => alert("Detalles adicionales próximamente")}>Más Información</Button>
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
      <SendProposalDialog
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        opportunity={selectedOpportunity}
        onSuccess={handleSuccessProposal}
      />
    </div>
  );
}
