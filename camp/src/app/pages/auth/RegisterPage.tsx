
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "../../components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";

import { Sprout, Tractor, Store, Building2, User, Phone, Plus, Briefcase, Leaf, Search } from "lucide-react";

// ...

const registerSchema = z.object({
    name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
    companyName: z.string().min(2, { message: "El nombre de la empresa es requerido." }),
    phone: z.string().min(8, { message: "Ingresa un número de teléfono válido." }),
    email: z.string().email({ message: "Por favor ingresa un correo electrónico válido." }),
    profileType: z.string().min(1, { message: "Selecciona un tipo de perfil." }),
    password: z.string().min(6, { message: "La contraseña debe tener al menos 6 caracteres." }),
    confirmPassword: z.string(),
    crops: z.array(z.string()).optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

const CROP_LIST = [
    "Caña de azúcar", "Maíz", "Trigo", "Arroz", "Frijol", "Sorgo", "Avena", "Cebada", "Alfalfa",
    "Aguacate", "Chile", "Jitomate (Tomate Rojo)", "Tomate Verde (Tomatillo)", "Limón", "Naranja", "Toronja",
    "Mango", "Papaya", "Melón", "Sandía", "Piña", "Uva", "Fresas", "Frambuesas", "Zarzamoras", "Arándanos",
    "Durazno", "Manzana", "Guayaba", "Ciruela", "Higo", "Granada", "Litchi", "Membrillo", "Tuna", "Plátano",
    "Cebolla", "Ajo", "Ajonjolí", "Pepino", "Brócoli", "Espárrago", "Lechuga", "Col (Repollo)", "Coliflor",
    "Calabacita", "Calabaza", "Chayote", "Ejote", "Chícharo", "Espinaca", "Papa", "Rábano", "Zanahoria", "Betabel",
    "Nopal", "Cacao", "Vainilla", "Agave", "Café", "Girasol", "Algodón"
];

export function RegisterPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showMoreProfiles, setShowMoreProfiles] = useState(false);
    const [cropSearch, setCropSearch] = useState("");

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            companyName: "",
            phone: "",
            email: "",
            profileType: "",
            password: "",
            confirmPassword: "",
            crops: [],
        },
    });

    async function onSubmit(data: z.infer<typeof registerSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error en el registro');
            }

            console.log('Registro exitoso:', result);
            alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
            navigate("/login");
        } catch (error: any) {
            console.error(error);
            alert(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex bg-white">
            {/* Left Side: Brand & Visual */}
            <div className="hidden lg:flex w-1/2 bg-green-900 relative">
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1625246333195-58f21a4061a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80")' }}></div>
                <div className="relative z-10 p-12 flex flex-col justify-between text-white h-full">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <Sprout className="h-10 w-10 text-green-300" />
                            <span className="text-3xl font-bold tracking-tight">AgroLink</span>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight max-w-lg">
                            Conecta tu negocio agrícola con el futuro.
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-md">
                            Únete a la plataforma líder para comprar, vender y gestionar operaciones en el campo.
                        </p>
                    </div>
                    <div className="flex gap-4 text-sm text-green-200">
                        <span>© 2026 AgroLink Inc.</span>
                        <a href="#" className="hover:text-white">Privacidad</a>
                        <a href="#" className="hover:text-white">Términos</a>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12 overflow-y-auto">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta Profesional</h1>
                        <p className="text-gray-600 mt-2">
                            Completa tus datos para comenzar.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                            {/* Profile Type Selection */}
                            <FormField
                                control={form.control}
                                name="profileType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Negocio</FormLabel>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {[
                                                { value: "agricola", icon: Tractor, label: "Productor", main: true },
                                                { value: "agroquimica", icon: Building2, label: "Agroquímica", main: true },
                                                { value: "comercializadora", icon: Store, label: "Comprador", main: true },
                                                { value: "proveedor", icon: Briefcase, label: "Proveedor", main: false },
                                                { value: "ingeniero", icon: Leaf, label: "Ingeniero", main: false },
                                                { value: "otro", icon: User, label: "Otro", main: false }
                                            ].filter(t => t.main || showMoreProfiles).map((type) => (
                                                <div
                                                    key={type.value}
                                                    className={`cursor-pointer rounded-lg border p-3 flex flex-col items-center gap-2 transition-all ${field.value === type.value ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-gray-200 hover:bg-gray-50'}`}
                                                    onClick={() => field.onChange(type.value)}
                                                >
                                                    <type.icon className={`h-6 w-6 ${field.value === type.value ? 'text-green-700' : 'text-gray-500'}`} />
                                                    <span className={`text-xs font-medium text-center ${field.value === type.value ? 'text-green-900' : 'text-gray-600'}`}>
                                                        {type.label}
                                                    </span>
                                                </div>
                                            ))}

                                            {!showMoreProfiles && (
                                                <div
                                                    className="cursor-pointer rounded-lg border border-dashed border-gray-300 p-3 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                                                    onClick={() => setShowMoreProfiles(true)}
                                                >
                                                    <Plus className="h-6 w-6 text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-500">Más</span>
                                                </div>
                                            )}
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Crops/Interests Selection - For Agricola and Comercializadora */}
                            {(form.watch("profileType") === "agricola" || form.watch("profileType") === "comercializadora") && (
                                <FormField
                                    control={form.control}
                                    name="crops"
                                    render={({ field }) => (
                                        <FormItem className="animate-in fade-in slide-in-from-top-4 duration-500">
                                            <FormLabel>
                                                {form.watch("profileType") === "comercializadora"
                                                    ? "¿Qué productos le interesa comprar? (Selecciona múltiples)"
                                                    : "¿Qué cultivas? (Selecciona múltiples)"}
                                            </FormLabel>
                                            <div className="border rounded-lg p-4 bg-gray-50/50">
                                                <div className="relative mb-3">
                                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        placeholder={form.watch("profileType") === "comercializadora" ? "Buscar producto..." : "Buscar cultivo..."}
                                                        className="pl-9 bg-white border-gray-200 h-9 text-sm"
                                                        value={cropSearch}
                                                        onChange={(e) => setCropSearch(e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300">
                                                    {CROP_LIST.filter(c => c.toLowerCase().includes(cropSearch.toLowerCase())).map((crop) => {
                                                        const isSelected = (field.value || []).includes(crop);
                                                        return (
                                                            <div
                                                                key={crop}
                                                                className={`cursor-pointer px-3 py-1.5 rounded-full text-xs font-medium border transition-all select-none ${isSelected
                                                                    ? "bg-green-600 text-white border-green-600 shadow-sm"
                                                                    : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-700"
                                                                    }`}
                                                                onClick={() => {
                                                                    const current = field.value || [];
                                                                    if (isSelected) {
                                                                        field.onChange(current.filter((c: string) => c !== crop));
                                                                    } else {
                                                                        field.onChange([...current, crop]);
                                                                    }
                                                                }}
                                                            >
                                                                {crop}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-2 text-right">
                                                    {(field.value || []).length} seleccionados
                                                </p>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre de Usuario</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input className="pl-9" placeholder="Tu nombre" {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input className="pl-9" placeholder="+52..." {...field} />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="companyName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de la Empresa / Finca</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Ej. Agrícola Santa María" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <Input placeholder="nombre@ejemplo.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contraseña</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="••••••" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11 text-base shadow-lg" disabled={isLoading}>
                                    {isLoading ? "Creando Cuenta..." : "Registrarse Ahora"}
                                </Button>
                            </div>
                        </form>
                    </Form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-600">¿Ya tienes una cuenta? </span>
                        <Link to="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline">
                            Inicia Sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
