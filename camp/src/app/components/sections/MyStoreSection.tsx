import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import * as z from "zod";
import { Upload, Store } from "lucide-react";
import { Button } from "../ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Card } from "../ui/card";

const productSchema = z.object({
    name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
        message: "Ingresa un precio válido.",
    }),
    unit: z.string().min(1, { message: "La unidad es requerida (ej. kg, litro)." }),
    category: z.string().min(1, { message: "Selecciona una categoría." }),
    description: z.string().min(10, { message: "La descripción debe ser más detallada." }),
    image: z.string().optional(), // For now optional URL
});

export function MyStoreSection() {
    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            price: "",
            unit: "",
            category: "",
            description: "",
            image: "",
        },
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    // New State for Dashboard
    const [viewMode, setViewMode] = useState<'dashboard' | 'upload'>('dashboard');
    const [myProducts, setMyProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    // Fetch Products on Mount or when switching to dashboard
    useEffect(() => {
        if (viewMode === 'dashboard') {
            fetchMyProducts();
        }
    }, [viewMode]);

    const fetchMyProducts = async () => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user) return;

        setLoadingProducts(true);
        try {
            const res = await fetch(`http://localhost:3000/api/products?userId=${user.id}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMyProducts(data);
            }
        } catch (error) {
            console.error("Error fetching my products:", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const onSubmit = async (data: z.infer<typeof productSchema>) => {
        setIsSubmitting(true);
        try {
            const userStr = localStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : null;

            if (!user) {
                throw new Error("Debes iniciar sesión para publicar");
            }

            const formData = new FormData();
            formData.append('userId', user.id);
            formData.append('name', data.name);
            formData.append('price', data.price);
            formData.append('unit', data.unit);
            formData.append('category', data.category);
            formData.append('description', data.description);
            if (file) {
                formData.append('image', file);
            }

            const response = await fetch('http://localhost:3000/api/products', {
                method: 'POST',
                body: formData, // No Content-Type header needed
            });

            if (!response.ok) {
                throw new Error('Error al publicar producto');
            }

            console.log("Producto publicado!");
            toast.success("Producto publicado exitosamente", {
                description: "Tu producto ya está visible en el Marketplace.",
                duration: 4000,
            });
            form.reset();
            setPreviewUrl(null);
            setFile(null);
            setViewMode('dashboard'); // Return to dashboard after success
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (viewMode === 'dashboard') {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : { name: "Vendedor" };

        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Store className="h-8 w-8 text-green-600" />
                            Mi Tienda
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gestiona tus productos y observa su rendimiento.
                        </p>
                    </div>
                    <Button
                        onClick={() => setViewMode('upload')}
                        className="bg-green-600 hover:bg-green-700 text-white gap-2 shadow-lg hover:shadow-xl transition-all"
                    >
                        <Upload className="h-4 w-4" />
                        Subir Artículo
                    </Button>
                </div>

                {/* Dashboard Stats / Content */}
                {loadingProducts ? (
                    <div className="text-center py-20 text-gray-500">Cargando tus productos...</div>
                ) : myProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Tu tienda está vacía</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Aún no has publicado ningún producto. ¡Sube el primero para empezar a vender!
                        </p>
                        <Button onClick={() => setViewMode('upload')} variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                            Publicar ahora
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myProducts.map((product) => (
                            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow group">
                                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Store className="h-12 w-12 opacity-50" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                                        Activo
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1">{product.name}</h3>
                                    <p className="text-green-600 font-bold mb-3">
                                        ${Number(product.price).toLocaleString()} <span className="text-gray-400 text-sm font-normal">/ {product.unit}</span>
                                    </p>

                                    <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lg">👀</span>
                                            {/* Mock Views for now as requested */}
                                            <span>{Math.floor(Math.random() * 50) + 5} vistas</span>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {new Date(product.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Upload Form View
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Upload className="h-8 w-8 text-green-600" />
                        Publicar Producto
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Completa los detalles para añadir un nuevo producto a tu tienda.
                    </p>
                </div>
                <Button variant="ghost" onClick={() => setViewMode('dashboard')} className="text-gray-500 hover:text-gray-900">
                    Cancelar
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario */}
                <div className="lg:col-span-2">
                    <Card className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Producto</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ej. Fertilizante Triple 15" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Precio (MXN)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" placeholder="50000" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="unit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Unidad de Medida</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Ej. Bulto 50kg" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Categoría</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Selecciona una categoría" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="fertilizantes">Fertilizantes</SelectItem>
                                                    <SelectItem value="semillas">Semillas</SelectItem>
                                                    <SelectItem value="agroquimicos">Agroquímicos</SelectItem>
                                                    <SelectItem value="riego">Riego</SelectItem>
                                                    <SelectItem value="maquinaria">Maquinaria</SelectItem>
                                                    <SelectItem value="bioestimulantes">Bioestimulantes</SelectItem>
                                                    <SelectItem value="analisis">Análisis</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Descripción</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe las características principales de tu producto..."
                                                    className="h-32"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-600 font-medium">
                                        Sube una imagen de tu producto
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        PNG, JPG hasta 5MB
                                    </p>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        id="product-image-upload"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setFile(file);
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setPreviewUrl(reader.result as string);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-4"
                                        size="sm"
                                        onClick={() => document.getElementById('product-image-upload')?.click()}
                                    >
                                        Seleccionar Archivo
                                    </Button>
                                    {previewUrl && (
                                        <img src={previewUrl} alt="Preview" className="mt-4 h-32 w-auto mx-auto rounded-lg border object-cover" />
                                    )}
                                </div>

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                                    {isSubmitting ? "Publicando..." : "Publicar Producto"}
                                </Button>
                            </form>
                        </Form>
                    </Card>
                </div>

                {/* Preview / Tips */}
                <div className="space-y-6">
                    <Card className="p-6 bg-blue-50 border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2">💡 Consejos para vender más</h3>
                        <ul className="text-sm text-blue-800 space-y-2 list-disc list-inside">
                            <li>Usa fotos claras y con buena iluminación.</li>
                            <li>Describe detalladamente los beneficios de tu producto.</li>
                            <li>Ofrece un precio competitivo.</li>
                            <li>Responde rápido a las preguntas de los interesados.</li>
                        </ul>
                    </Card>
                </div>
            </div>
        </div>
    );
}
