
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface SendProposalDialogProps {
    isOpen: boolean;
    onClose: () => void;
    opportunity: {
        id: number;
        product: string;
        buyer: string;
        price: string;
        quantity: string;
    } | null;
    onSuccess: () => void;
}

export function SendProposalDialog({ isOpen, onClose, opportunity, onSuccess }: SendProposalDialogProps) {
    const [price, setPrice] = useState('');
    const [quantityOffered, setQuantityOffered] = useState('');
    const [quality, setQuality] = useState('Primera');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [paymentTerms, setPaymentTerms] = useState('Contado');
    const [transportIncluded, setTransportIncluded] = useState(false);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    if (!opportunity) return null;

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

            const response = await fetch('http://localhost:3000/api/proposals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    opportunityId: opportunity.id,
                    sellerId: currentUser.id,
                    price,
                    quantityOffered,
                    quality,
                    deliveryDate,
                    paymentTerms,
                    transportIncluded,
                    message
                })
            });

            if (response.ok) {
                alert('Propuesta completa enviada exitosamente');
                onSuccess();
                onClose();
            } else {
                const data = await response.json();
                alert('Error al enviar propuesta: ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error sending proposal:', error);
            alert('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl">Enviar Propuesta Comercial</DialogTitle>
                    <DialogDescription>
                        Presenta tu oferta para: <span className="font-semibold text-green-700">{opportunity.product}</span><br />
                        Comprador: <span className="font-semibold">{opportunity.buyer}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {/* Price & Quantity */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Precio por Unidad ($)</label>
                        <Input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder={`Meta: ${opportunity.price}`}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Cantidad Ofrecida</label>
                        <Input
                            value={quantityOffered}
                            onChange={(e) => setQuantityOffered(e.target.value)}
                            placeholder={`Req: ${opportunity.quantity}`}
                        />
                    </div>

                    {/* Quality & Terms */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Calidad del Producto</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={quality}
                            onChange={(e) => setQuality(e.target.value)}
                        >
                            <option value="Primera">Primera / Standard</option>
                            <option value="Exportación">Calidad Exportación</option>
                            <option value="Segunda">Segunda / Industrial</option>
                            <option value="Orgánico">Certificado Orgánico</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Condiciones de Pago</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                        >
                            <option value="Contado">De Contado (Contra entrega)</option>
                            <option value="Crédito 15 días">Crédito 15 días</option>
                            <option value="Crédito 30 días">Crédito 30 días</option>
                            <option value="Anticipo 50%">50% Anticipo, 50% Entrega</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha de Disponibilidad</label>
                        <Input
                            type="date"
                            value={deliveryDate}
                            onChange={(e) => setDeliveryDate(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center space-x-2 pt-8">
                        <input
                            type="checkbox"
                            id="transport"
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                            checked={transportIncluded}
                            onChange={(e) => setTransportIncluded(e.target.checked)}
                        />
                        <label htmlFor="transport" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Incluye Transporte / Flete
                        </label>
                    </div>

                    {/* Message */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-medium">Notas Adicionales (Opcional)</label>
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Detalles sobre empaque, origen, certificaciones..."
                            className="h-24"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white w-full md:w-auto">
                        {loading ? 'Enviando...' : 'Enviar Propuesta Formal'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
