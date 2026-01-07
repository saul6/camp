import { MapPin, Phone, Mail, Lock, Bell, Globe, Shield } from "lucide-react";
// const MapPin = () => null; const Phone = () => null; const Mail = () => null; const Lock = () => null; const Bell = () => null; const Globe = () => null; const Shield = () => null;
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export function SettingsSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
        <p className="text-gray-600">Administra tu perfil y preferencias</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="privacy">Privacidad</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="profile">
          <div className="space-y-6">
            {/* Profile Picture */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Foto de Perfil</h3>
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-3xl">JP</span>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Cambiar foto</Button>
                  <Button variant="outline" className="text-red-600">Eliminar</Button>
                </div>
              </div>
            </Card>

            {/* Basic Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input id="firstName" defaultValue="Juan" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input id="lastName" defaultValue="Pérez" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="role">Rol / Ocupación</Label>
                  <Input id="role" defaultValue="Productor de Maíz" className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="bio">Biografía</Label>
                  <Textarea
                    id="bio"
                    defaultValue="Productor agrícola con más de 15 años de experiencia en cultivos de maíz y hortalizas. Apasionado por la agricultura sostenible."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </div>
            </Card>

            {/* Location */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-600" />
                Ubicación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">País</Label>
                  <Select defaultValue="colombia">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="colombia">Colombia</SelectItem>
                      <SelectItem value="mexico">México</SelectItem>
                      <SelectItem value="peru">Perú</SelectItem>
                      <SelectItem value="chile">Chile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="region">Departamento / Región</Label>
                  <Input id="region" defaultValue="Cundinamarca" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="city">Ciudad / Municipio</Label>
                  <Input id="city" defaultValue="Zipaquirá" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="farmSize">Tamaño de la finca (hectáreas)</Label>
                  <Input id="farmSize" type="number" defaultValue="50" className="mt-1" />
                </div>
              </div>
            </Card>

            {/* Crops */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Cultivos Principales</h3>
              <div className="space-y-3">
                <Input placeholder="Ejemplo: Maíz, Frijol, Café" defaultValue="Maíz, Hortalizas" />
                <p className="text-sm text-gray-600">
                  Especifica los cultivos que produces para recibir contenido y oportunidades relevantes
                </p>
              </div>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancelar</Button>
              <Button className="bg-green-600 hover:bg-green-700">Guardar Cambios</Button>
            </div>
          </div>
        </TabsContent>

        {/* Cuenta */}
        <TabsContent value="account">
          <div className="space-y-6">
            {/* Contact Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Información de Contacto</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-green-600" />
                    Email
                  </Label>
                  <Input id="email" type="email" defaultValue="juan.perez@email.com" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600" />
                    Teléfono
                  </Label>
                  <Input id="phone" type="tel" defaultValue="+57 300 123 4567" className="mt-1" />
                </div>
              </div>
            </Card>

            {/* Change Password */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-600" />
                Cambiar Contraseña
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Contraseña Actual</Label>
                  <Input id="currentPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="newPassword">Nueva Contraseña</Label>
                  <Input id="newPassword" type="password" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
                  <Input id="confirmPassword" type="password" className="mt-1" />
                </div>
                <Button className="bg-green-600 hover:bg-green-700">
                  Actualizar Contraseña
                </Button>
              </div>
            </Card>

            {/* Language */}
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-green-600" />
                Idioma y Región
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select defaultValue="es">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select defaultValue="bogota">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bogota">Bogotá (GMT-5)</SelectItem>
                      <SelectItem value="mexico">Ciudad de México (GMT-6)</SelectItem>
                      <SelectItem value="lima">Lima (GMT-5)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Notificaciones */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Preferencias de Notificaciones
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Nuevas conexiones</p>
                    <p className="text-sm text-gray-600">Recibe notificaciones cuando alguien te envíe una solicitud</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Mensajes</p>
                    <p className="text-sm text-gray-600">Notificaciones de nuevos mensajes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Oportunidades de venta</p>
                    <p className="text-sm text-gray-600">Alertas sobre compradores interesados en tus productos</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Insights del mercado</p>
                    <p className="text-sm text-gray-600">Análisis y tendencias del mercado agrícola</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Eventos</p>
                    <p className="text-sm text-gray-600">Recordatorios de eventos y nuevas oportunidades</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Novedades de productos</p>
                    <p className="text-sm text-gray-600">Nuevos productos en el marketplace</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Método de Notificación</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <p className="font-medium">Email</p>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <p className="font-medium">SMS</p>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-3">
                  <p className="font-medium">Push Notifications</p>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Privacidad */}
        <TabsContent value="privacy">
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Configuración de Privacidad
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Perfil público</p>
                    <p className="text-sm text-gray-600">Permite que cualquier usuario vea tu perfil</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Mostrar ubicación exacta</p>
                    <p className="text-sm text-gray-600">Muestra tu ubicación precisa en tu perfil</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <div>
                    <p className="font-medium">Aparecer en búsquedas</p>
                    <p className="text-sm text-gray-600">Permite que otros usuarios te encuentren</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Compartir estadísticas</p>
                    <p className="text-sm text-gray-600">Contribuye con datos anónimos para insights del mercado</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Gestión de Datos</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  Descargar mis datos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Ver política de privacidad
                </Button>
                <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                  Eliminar mi cuenta
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
