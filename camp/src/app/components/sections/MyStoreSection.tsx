import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Store className="h-8 w-8 text-green-600" />
                    Mi Tienda
                </h1>
                <p className="text-gray-600 mt-2">
                    Publica tus productos para que miles de compradores los vean.
                </p>
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
