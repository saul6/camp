import { Calendar, MapPin, Users, Clock, ExternalLink } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

const upcomingEvents = [
  {
    id: 1,
    title: "Feria Nacional Agropecuaria 2025",
    date: "2025-02-15",
    time: "08:00 - 18:00",
    location: "Zamora, México",
    type: "Feria",
    attendees: 234,
    description: "La feria más grande del sector agrícola con más de 500 expositores nacionales e internacionales.",
    image: "https://images.unsplash.com/photo-1700588117348-4c5877c03d07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBmYXJtJTIwY3JvcHN8ZW58MXx8fHwxNzY2NTUwMTE2fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 2,
    title: "Taller: Agricultura de Precisión",
    date: "2025-01-28",
    time: "14:00 - 17:00",
    location: "Jacona, México (Virtual disponible)",
    type: "Taller",
    attendees: 89,
    description: "Aprende a implementar tecnologías de precisión para optimizar tus cultivos.",
    image: "https://images.unsplash.com/photo-1703113691621-af7d6e70dcc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBtYWNoaW5lcnklMjBlcXVpcG1lbnR8ZW58MXx8fHwxNzY2NTUwMTE4fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
  {
    id: 3,
    title: "Conferencia: Sostenibilidad Agrícola",
    date: "2025-02-05",
    time: "09:00 - 13:00",
    location: "Chilchota, México",
    type: "Conferencia",
    attendees: 156,
    description: "Expertos internacionales compartirán estrategias para una agricultura más sostenible.",
    image: "https://images.unsplash.com/photo-1628272107134-c66c4b580952?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXJtZXIlMjBwb3J0cmFpdCUyMHdvcmtpbmd8ZW58MXx8fHwxNzY2NTUwMTE3fDA&ixlib=rb-4.1.0&q=80&w=400",
  },
];

const pastEvents = [
  {
    id: 4,
    title: "Expo Café Colombia 2024",
    date: "2024-12-10",
    location: "Chavinda, México",
    type: "Feria",
    attendees: 345,
  },
  {
    id: 5,
    title: "Webinar: Control de Plagas Orgánico",
    date: "2024-12-05",
    location: "Virtual",
    type: "Webinar",
    attendees: 567,
  },
];

export function EventsSection() {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos</h1>
        <p className="text-gray-600">Descubre ferias, talleres y conferencias del sector agrícola</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-gray-600">Próximos Eventos</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-gray-600">Eventos Confirmados</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">23</p>
              <p className="text-sm text-gray-600">Eventos Anteriores</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="past">Eventos Pasados</TabsTrigger>
        </TabsList>

        {/* Próximos Eventos */}
        <TabsContent value="upcoming">
          <div className="space-y-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="md:flex">
                  {/* Image */}
                  <div className="md:w-1/3">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 md:w-2/3">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Badge className="mb-2 bg-green-600">{event.type}</Badge>
                        <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                        <p className="text-gray-600 mb-4">{event.description}</p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-5 w-5 text-green-600" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-5 w-5 text-green-600" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-5 w-5 text-green-600" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Users className="h-5 w-5 text-green-600" />
                        <span>{event.attendees} personas confirmadas</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        Registrarse
                      </Button>
                      <Button variant="outline">Más información</Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Create Event CTA */}
          <Card className="p-6 mt-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-xl font-semibold mb-2">
                ¿Organizas un evento agrícola?
              </h3>
              <p className="text-gray-600 mb-4">
                Publica tu evento en AgroLink y llega a miles de productores
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                Crear Evento
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Eventos Pasados */}
        <TabsContent value="past">
          <div className="space-y-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline">{event.type}</Badge>
                      <Badge variant="outline" className="bg-gray-100">Finalizado</Badge>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Users className="h-4 w-4" />
                        <span>{event.attendees} asistentes</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">
                    Ver Resumen
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Stats Card */}
          <Card className="p-6 mt-6">
            <h3 className="font-semibold text-lg mb-4">Tu Participación en Eventos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">23</p>
                <p className="text-sm text-gray-600">Eventos asistidos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-blue-600">145</p>
                <p className="text-sm text-gray-600">Conexiones hechas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-600">12</p>
                <p className="text-sm text-gray-600">Certificados</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-600">8</p>
                <p className="text-sm text-gray-600">Como ponente</p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
