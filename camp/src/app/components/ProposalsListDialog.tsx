
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
// import { Avatar, AvatarFallback } from "../ui/avatar";
import { MessageSquare, Check, X, ArrowRightLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CounterProposalDialog } from "./CounterProposalDialog";

interface Proposal {
    id: number;
    product_name: string;
    price: string;
    quantity_offered: string;
    seller_name: string;
    buyer_name: string;
    seller_id: number;
    buyer_id: number;
    status: 'pending' | 'accepted' | 'rejected' | 'negotiating' | 'countered';
    created_at: string;
}

interface ProposalsListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: number;
}

export function ProposalsListDialog({ isOpen, onClose, currentUserId }: ProposalsListDialogProps) {
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCounterProposal, setSelectedCounterProposal] = useState<Proposal | null>(null);
    const [showCounterDialog, setShowCounterDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && currentUserId) {
            fetchProposals();
        }
    }, [isOpen, currentUserId]);

    const fetchProposals = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/proposals?userId=${currentUserId}`);
            if (res.ok) {
                const data = await res.json();
                setProposals(data);
            }
        } catch (error) {
            console.error("Error fetching proposals:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'accepted' | 'rejected' | 'pending') => {
        try {
            const res = await fetch(`http://localhost:3000/api/proposals/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: action })
            });
            if (res.ok) {
                fetchProposals(); // Refresh list
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleCounter = (p: Proposal) => {
        setSelectedCounterProposal(p);
        setShowCounterDialog(true);
    };

    const sentProposals = proposals.filter(p => p.seller_id === currentUserId && p.status !== 'countered');
    const receivedProposals = proposals.filter(p => p.buyer_id === currentUserId || (p.seller_id === currentUserId && p.status === 'countered'));

    const ProposalItem = ({ p, type }: { p: Proposal, type: 'sent' | 'received' }) => (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg mb-3 border border-gray-100 shadow-sm">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900">{p.product_name}</span>
                    <Badge variant={p.status === 'accepted' ? 'default' : p.status === 'rejected' ? 'destructive' : p.status === 'countered' ? 'outline' : 'secondary'}>
                        {p.status === 'pending' ? 'Pendiente' :
                            p.status === 'accepted' ? 'Aceptada' :
                                p.status === 'rejected' ? 'Rechazada' :
                                    p.status === 'countered' ? 'Contra-ofertada' : p.status}
                    </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-0.5">
                    <p>Precio: <span className="font-semibold text-green-700">${p.price}</span></p>
                    <p>Cantidad: <span className="font-medium">{p.quantity_offered || 'N/A'}</span></p>
                    <p className="text-xs text-gray-500 mt-1">
                        {p.buyer_id === currentUserId
                            ? `De: ${p.seller_name}`
                            : (p.status === 'countered' ? `Contra-oferta de: ${p.buyer_name}` : `Para: ${p.buyer_name}`)}
                        • {new Date(p.created_at).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 sm:mt-0">
                {type === 'received' && p.status === 'pending' && (
                    <>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 w-8 p-0" onClick={() => handleAction(p.id, 'accepted')} title="Aceptar">
                            <Check className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleAction(p.id, 'rejected')} title="Rechazar">
                            <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 h-8 w-8 p-0" onClick={() => handleCounter(p)} title="Contra-ofertar">
                            <ArrowRightLeft className="h-4 w-4" />
                        </Button>
                    </>
                )}

                {/* Farmer Actions for Counter-Offers (Now in Received Tab) */}
                {p.seller_id === currentUserId && p.status === 'countered' && (
                    <>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 h-8 px-3" onClick={() => handleAction(p.id, 'pending')} title="Aceptar cambios y devolver al comprador">
                            <Check className="h-4 w-4 mr-1.5" /> Aceptar Cambios
                        </Button>
                        <Button size="sm" variant="destructive" className="h-8 w-8 p-0" onClick={() => handleAction(p.id, 'rejected')} title="Rechazar Contra-oferta">
                            <X className="h-4 w-4" />
                        </Button>
                    </>
                )}

                <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => {
                    const targetId = type === 'received' ? p.seller_id : p.buyer_id;
                    navigate(`/messages/${targetId}`);
                }}>
                    <MessageSquare className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Gestión de Propuestas</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="received" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received">Recibidas ({receivedProposals.length})</TabsTrigger>
                        <TabsTrigger value="sent">Enviadas ({sentProposals.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received" className="mt-4">
                        {loading ? <p className="text-center py-4">Cargando...</p> : (
                            receivedProposals.length > 0 ? (
                                receivedProposals.map(p => <ProposalItem key={p.id} p={p} type="received" />)
                            ) : (
                                <p className="text-center text-gray-500 py-8">No has recibido propuestas.</p>
                            )
                        )}
                    </TabsContent>

                    <TabsContent value="sent" className="mt-4">
                        {loading ? <p className="text-center py-4">Cargando...</p> : (
                            sentProposals.length > 0 ? (
                                sentProposals.map(p => <ProposalItem key={p.id} p={p} type="sent" />)
                            ) : (
                                <p className="text-center text-gray-500 py-8">No has enviado propuestas.</p>
                            )
                        )}
                    </TabsContent>
                </Tabs>

                <CounterProposalDialog
                    isOpen={showCounterDialog}
                    onClose={() => setShowCounterDialog(false)}
                    onSuccess={() => { fetchProposals(); }}
                    originalProposal={selectedCounterProposal}
                />
            </DialogContent>
        </Dialog>
    );
}
