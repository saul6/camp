import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
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
import { Sprout, User, Lock, ArrowRight } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email({
        message: "Por favor ingresa un correo electrónico válido.",
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres.",
    }),
});

export function LoginPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    async function onSubmit(data: z.infer<typeof loginSchema>) {
        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error en inicio de sesión');
            }

            console.log('Login exitoso:', result);
            localStorage.setItem('token', result.token); // Save jwt
            localStorage.setItem('user', JSON.stringify(result.user));
            navigate("/");
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
                            <span className="text-3xl font-bold tracking-tight">CropLink</span>
                        </div>
                        <h2 className="text-4xl font-bold leading-tight max-w-lg">
                            Bienvenido de vuelta.
                        </h2>
                        <p className="mt-4 text-xl text-green-100 max-w-md">
                            Accede a tu panel de control y gestiona tus operaciones agrícolas.
                        </p>
                    </div>
                    <div className="flex gap-4 text-sm text-green-200">
                        <span>© 2026 CropLink Inc.</span>
                        <a href="#" className="hover:text-white">Privacidad</a>
                        <a href="#" className="hover:text-white">Términos</a>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-12">
                <div className="mx-auto w-full max-w-md">
                    <div className="text-center lg:text-left mb-8">
                        <h1 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h1>
                        <p className="text-gray-600 mt-2">
                            Ingresa tus credenciales para continuar.
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Correo Electrónico</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input className="pl-9" placeholder="nombre@ejemplo.com" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input type="password" className="pl-9" placeholder="••••••" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input id="remember-me" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-900">Recordarme</label>
                                </div>
                                <a href="#" className="font-medium text-green-600 hover:text-green-500">
                                    ¿Olvidaste tu contraseña?
                                </a>
                            </div>

                            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 h-11 text-base shadow-lg group" disabled={isLoading}>
                                {isLoading ? "Iniciando sesión..." : (
                                    <span className="flex items-center justify-center gap-2">
                                        Ingresar <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 text-center text-sm">
                        <span className="text-gray-600">¿No tienes una cuenta? </span>
                        <Link to="/register" className="text-green-600 font-bold hover:text-green-700 hover:underline">
                            Regístrate gratis
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
