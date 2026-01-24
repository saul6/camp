
import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

interface CreateOpportunityDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    currentUserId: number;
}

export function CreateOpportunityDialog({ isOpen, onClose, onSuccess, currentUserId }: CreateOpportunityDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        product: "",
        quantity: "",
        quality: "",
        price: "",
        deadline: "",
        requirements: ""
    });
    const [userCrops, setUserCrops] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && currentUserId) {
            fetch(`http://localhost:3000/api/users/${currentUserId}`)
                .then(res => res.json())
                .then(data => {
                    let crops = [];
                    if (data.seeking_tags) {
                        try {
                            crops = typeof data.seeking_tags === 'string' ? JSON.parse(data.seeking_tags) : data.seeking_tags;
                        } catch (e) { console.error(e); }
                    }
                    if (Array.isArray(crops)) setUserCrops(crops);
                })
                .catch(err => console.error(err));
        }
    }, [isOpen, currentUserId]);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://localhost:3000/api/opportunities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, userId: currentUserId })
            });
            if (res.ok) {
                setFormData({ product: "", quantity: "", quality: "", price: "", deadline: "", requirements: "" }); // Reset
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Publicar Nueva Oferta</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Producto (Cultivo)</label>
                        {userCrops.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                                <p className="text-xs text-gray-500 w-full mb-1">Tus intereses registrados:</p>
                                {userCrops.map(crop => (
                                    <Badge
                                        key={crop}
                                        variant={formData.product === crop ? "default" : "outline"}
                                        className={`cursor-pointer ${formData.product === crop ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50 text-gray-700'}`}
                                        onClick={() => setFormData(prev => ({ ...prev, product: crop }))}
                                    >
                                        {crop}
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <Input
                            value={formData.product}
                            onChange={e => setFormData({ ...formData, product: e.target.value })}
                            placeholder="Ej. Maíz Blanco o escribe uno nuevo"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Cantidad</label>
                            <Input
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                placeholder="Ej. 10 Toneladas"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Calidad</label>
                            <Input
                                value={formData.quality}
                                onChange={e => setFormData({ ...formData, quality: e.target.value })}
                                placeholder="Ej. Primera Calidad"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Precio Objetivo (por Kg/Ton)</label>
                            <Input
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Ej. $5.50 / kg"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Plazo de Entrega</label>
                            <Input
                                value={formData.deadline}
                                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                placeholder="Ej. 30 días"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Requisitos Adicionales</label>
                        <Textarea
                            value={formData.requirements}
                            onChange={e => setFormData({ ...formData, requirements: e.target.value })}
                            placeholder="Certificaciones, empaque, etc."
                            rows={3}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700">
                        {loading ? 'Publicando...' : 'Publicar Oferta'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
