
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
// import { Avatar, AvatarFallback } from "../ui/avatar";
import { MessageSquare, FileText, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Contract {
    id: number;
    product_name: string;
    price: string;
    quantity: string;
    seller_name: string;
    buyer_name: string;
    seller_id: number;
    buyer_id: number;
    status: 'active' | 'completed' | 'cancelled';
    start_date: string;
}

interface ContractsListDialogProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserId: number;
}

export function ContractsListDialog({ isOpen, onClose, currentUserId }: ContractsListDialogProps) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen && currentUserId) {
            fetchContracts();
        }
    }, [isOpen, currentUserId]);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/contracts?userId=${currentUserId}`);
            if (res.ok) {
                const data = await res.json();
                setContracts(data);
            }
        } catch (error) {
            console.error("Error fetching contracts:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Contratos Activos</DialogTitle>
                </DialogHeader>

                {loading ? <p className="text-center py-4">Cargando...</p> : (
                    contracts.length > 0 ? (
                        <div className="space-y-4">
                            {contracts.map(c => (
                                <div key={c.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-green-200 hover:shadow-md transition-all">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-700">
                                            <FileText className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">{c.product_name}</h4>
                                            <p className="text-sm text-gray-600">
                                                Intercambio con: <span className="font-semibold text-gray-900">
                                                    {c.seller_id === currentUserId ? c.buyer_name : c.seller_name}
                                                </span>
                                            </p>
                                            <div className="mt-1 flex gap-3 text-sm text-gray-500">
                                                <span>{c.quantity}</span>
                                                <span>•</span>
                                                <span className="text-green-700 font-medium">${c.price}</span>
                                                <span>•</span>
                                                <span>{new Date(c.start_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 mt-4 sm:mt-0">
                                        <Button variant="outline" size="sm" className="gap-2" onClick={() => {
                                            const targetId = c.seller_id === currentUserId ? c.buyer_id : c.seller_id;
                                            navigate(`/messages/${targetId}`);
                                        }}>
                                            <MessageSquare className="h-4 w-4" />
                                            Mensaje
                                        </Button>
                                        <Button variant="outline" size="sm" className="gap-2">
                                            <Download className="h-4 w-4" />
                                            PDF
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">No tienes contratos activos actualmente.</p>
                        </div>
                    )
                )}
            </DialogContent>
        </Dialog>
    );
}
