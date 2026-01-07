import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

    function onSubmit(values: z.infer<typeof productSchema>) {
        console.log("Producto a publicar:", values);
        alert("¡Producto publicado exitosamente!");
        form.reset();
    }

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
                                    <Button type="button" variant="outline" className="mt-4" size="sm">
                                        Seleccionar Archivo
                                    </Button>
                                </div>

                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 size-lg">
                                    Publicar Producto
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
