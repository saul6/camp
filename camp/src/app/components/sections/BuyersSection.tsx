import { useEffect, useState } from "react";
import { Building2, MapPin, Star, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useNavigate } from "react-router-dom";
import { SendProposalDialog } from "../dialogs/SendProposalDialog";

import { ProposalsListDialog } from "../ProposalsListDialog";
import { ContractsListDialog } from "../ContractsListDialog";
import { CreateOpportunityDialog } from "../CreateOpportunityDialog";
import { Trash, EyeOff, Plus } from "lucide-react";

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
  quality?: string;
  price: string;
  deadline: string;
  requirements: string;
  status?: string;
}

export function BuyersSection() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([]);
  const [stats, setStats] = useState({ buyers: 0, opportunities: 0, proposals: 0, contracts: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [showProposals, setShowProposals] = useState(false);
  const [showContracts, setShowContracts] = useState(false);
  const [showCreateOpp, setShowCreateOpp] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;

  console.log('CurrentUser:', currentUser);
  const type = currentUser.profile_type || currentUser.profileType || '';
  const isBuyer = type.toString().toLowerCase() === 'comercializadora';

  const fetchData = async () => {
    try {
      const promises = [
        fetch('http://localhost:3000/api/buyers'),
        fetch('http://localhost:3000/api/opportunities'),
        fetch(`http://localhost:3000/api/market/stats?userId=${currentUserId || ''}`)
      ];

      if (isBuyer) {
        promises.push(fetch(`http://localhost:3000/api/opportunities?userId=${currentUserId}`));
      }

      const results = await Promise.all(promises);

      const buyersData = await results[0].json();
      const oppsData = await results[1].json();
      const statsData = await results[2].json();
      const myOppsData = isBuyer && results[3] ? await results[3].json() : [];

      setBuyers(buyersData);
      setOpportunities(oppsData);
      setStats(statsData);
      setMyOpportunities(myOppsData);
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

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await fetch(`http://localhost:3000/api/opportunities/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando compradores...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compradores</h1>
          <p className="text-gray-600">Conecta con empresas que buscan tus productos</p>
        </div>
        {isBuyer && (
          <Button onClick={() => setShowCreateOpp(true)} className="bg-green-600 hover:bg-green-700 gap-2">
            <Plus className="h-4 w-4" /> Publicar Oferta
          </Button>
        )}
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
        <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowProposals(true)}>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.proposals}</p>
              <p className="text-sm text-gray-600">Ofertas Recibidas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setShowContracts(true)}>
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
      <Tabs defaultValue={isBuyer ? "my-offers" : "buyers"} className="w-full">
        <TabsList className={`grid w-full ${isBuyer ? 'grid-cols-3' : 'grid-cols-2'} mb-6`}>
          <TabsTrigger value="buyers">Directorio de Compradores</TabsTrigger>
          <TabsTrigger value="opportunities">Oportunidades de Venta</TabsTrigger>
          {isBuyer && <TabsTrigger value="my-offers">Mis Ofertas</TabsTrigger>}
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

        {/* Mis Ofertas */}
        {isBuyer && (
          <TabsContent value="my-offers">
            <div className="space-y-4">
              {myOpportunities.length > 0 ? myOpportunities.map((opp) => (
                <Card key={opp.id} className="p-6 border-l-4 border-l-blue-500">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge className={opp.status === 'active' ? 'bg-green-600 mb-2' : 'bg-gray-400 mb-2'}>
                            {opp.status === 'active' ? 'Publicada' : 'Cerrada'}
                          </Badge>
                          <h3 className="text-xl font-semibold mb-1">{opp.product}</h3>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(opp.id, opp.status === 'active' ? 'closed' : 'active')} title="Cambiar Estado">
                            <EyeOff className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => alert("Función eliminar pendientes")} title="Eliminar">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div><p className="text-gray-500">Precio</p><p className="font-semibold">${opp.price}</p></div>
                        <div><p className="text-gray-500">Cantidad</p><p className="font-semibold">{opp.quantity}</p></div>
                        <div><p className="text-gray-500">Calidad</p><p className="font-semibold">{opp.quality || 'N/A'}</p></div>
                        <div><p className="text-gray-500">Plazo</p><p className="font-semibold">{opp.deadline}</p></div>
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No has publicado ninguna oferta todavía.</p>
                  <Button variant="link" onClick={() => setShowCreateOpp(true)}>Publicar la primera</Button>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      <SendProposalDialog
        isOpen={!!selectedOpportunity}
        onClose={() => setSelectedOpportunity(null)}
        opportunity={selectedOpportunity}
        onSuccess={handleSuccessProposal}
      />

      {/* Interactive Stats Dialogs */}
      <ProposalsListDialog
        isOpen={showProposals}
        onClose={() => setShowProposals(false)}
        currentUserId={currentUserId}
      />
      <ContractsListDialog
        isOpen={showContracts}
        onClose={() => setShowContracts(false)}
        currentUserId={currentUserId}
      />
      <CreateOpportunityDialog
        isOpen={showCreateOpp}
        onClose={() => setShowCreateOpp(false)}
        onSuccess={handleSuccessProposal}
        currentUserId={currentUserId}
      />
    </div>
  );
}
