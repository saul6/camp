
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CounterProposalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    originalProposal: {
        id: number;
        product_name: string;
        price: string;
        quantity_offered: string;
        buyer_name: string;
        seller_name: string;
    } | null;
}

export function CounterProposalDialog({ isOpen, onClose, onSuccess, originalProposal }: CounterProposalDialogProps) {
    const [loading, setLoading] = useState(false);
    const [price, setPrice] = useState(originalProposal?.price || "");
    const [quantity, setQuantity] = useState(originalProposal?.quantity_offered || "");
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!originalProposal) return;
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/proposals/${originalProposal.id}/counter`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price,
                    quantity,
                    message
                })
            });
            if (res.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!originalProposal) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Contra-ofertar: {originalProposal.product_name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500">
                        Propuesta actual de {originalProposal.seller_name}:
                        <br />
                        Precio: <b>${originalProposal.price}</b> | Cantidad: <b>{originalProposal.quantity_offered}</b>
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Tu Nuevo Precio</label>
                            <Input
                                value={price}
                                onChange={e => setPrice(e.target.value)}
                                placeholder="Ej. $5.00"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Cantidad Requerida</label>
                            <Input
                                value={quantity}
                                onChange={e => setQuantity(e.target.value)}
                                placeholder="Ej. 10 Toneladas"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Mensaje (Opcional)</label>
                        <Textarea
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder="Razón de la contra-oferta..."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-yellow-500 hover:bg-yellow-600">
                        {loading ? 'Enviando...' : 'Enviar Contra-oferta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
