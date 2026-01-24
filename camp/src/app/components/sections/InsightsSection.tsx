import { TrendingUp, TrendingDown, DollarSign, BarChart3, LineChart } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

const priceData = [
  { product: "Tomate", currentPrice: 3500, change: 12.5, trend: "up" },
  { product: "Aguacate", currentPrice: 8200, change: -5.3, trend: "down" },
  { product: "Café", currentPrice: 12500, change: 8.7, trend: "up" },
  { product: "Maíz", currentPrice: 1800, change: -2.1, trend: "down" },
  { product: "Plátano", currentPrice: 2100, change: 15.2, trend: "up" },
];

const marketInsights = [
  {
    id: 1,
    title: "Aumento en la demanda de productos orgánicos",
    description: "Los compradores están buscando activamente certificaciones orgánicas, con un incremento del 35% en las solicitudes.",
    impact: "high",
    category: "Tendencia",
  },
  {
    id: 2,
    title: "Exportaciones de aguacate en máximo histórico",
    description: "Las exportaciones han crecido 45% este trimestre, generando oportunidades para nuevos productores.",
    impact: "high",
    category: "Oportunidad",
  },
  {
    id: 3,
    title: "Temporada de lluvias afectando cultivos de tomate",
    description: "Se espera una reducción del 20% en la producción, lo que podría incrementar los precios.",
    impact: "medium",
    category: "Alerta",
  },
];

const yourMetrics = [
  { label: "Productividad promedio", value: "12 ton/ha", change: 8.5, trend: "up" },
  { label: "Eficiencia de riego", value: "87%", change: 5.2, trend: "up" },
  { label: "Costo por hectárea", value: "$2.3M", change: -3.1, trend: "down" },
  { label: "ROI estimado", value: "24%", change: 12.8, trend: "up" },
];

export function InsightsSection() {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Insights</h1>
        <p className="text-gray-600">Datos y análisis del mercado agrícola</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="prices" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="prices">Precios de Mercado</TabsTrigger>
          <TabsTrigger value="insights">Tendencias</TabsTrigger>
          <TabsTrigger value="metrics">Mis Métricas</TabsTrigger>
        </TabsList>

        {/* Precios de Mercado */}
        <TabsContent value="prices">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Promedio General</p>
                  <p className="text-2xl font-bold">$5,620</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+5.8% vs mes anterior</span>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Mayor Incremento</p>
                  <p className="text-2xl font-bold">Plátano</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span>+15.2% esta semana</span>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Volatilidad</p>
                  <p className="text-2xl font-bold">Media</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <span>±8.3% promedio</span>
              </div>
            </Card>
          </div>

          {/* Price Table */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h3 className="font-semibold">Precios Actuales (MXN/kg)</h3>
              <p className="text-sm text-gray-600">Actualizado: Hace 2 horas</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Precio Actual
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Cambio
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Tendencia
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {priceData.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-medium text-gray-900">{item.product}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span className="font-semibold">
                          {formatPrice(item.currentPrice)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <span
                          className={`font-medium ${item.trend === "up" ? "text-green-600" : "text-red-600"
                            }`}
                        >
                          {item.trend === "up" ? "+" : ""}
                          {item.change}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {item.trend === "up" ? (
                          <div className="inline-flex items-center gap-1 text-green-600">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 text-red-600">
                            <TrendingDown className="h-5 w-5" />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Chart Placeholder */}
          <Card className="p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Tendencia de Precios (30 días)</h3>
              <Badge variant="outline">Ver gráfico completo</Badge>
            </div>
            <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <LineChart className="h-16 w-16 text-green-600 mx-auto mb-3" />
                <p className="text-gray-600">Gráfico interactivo disponible próximamente</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tendencias */}
        <TabsContent value="insights">
          <div className="space-y-4">
            {marketInsights.map((insight) => (
              <Card key={insight.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.impact === "high"
                      ? "bg-red-100"
                      : "bg-yellow-100"
                      }`}
                  >
                    {insight.impact === "high" ? (
                      <TrendingUp className="h-6 w-6 text-red-600" />
                    ) : (
                      <BarChart3 className="h-6 w-6 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{insight.title}</h3>
                      <Badge
                        className={
                          insight.impact === "high"
                            ? "bg-red-600"
                            : "bg-yellow-600"
                        }
                      >
                        {insight.category}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{insight.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Newsletter CTA */}
          <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                Recibe insights personalizados
              </h3>
              <p className="text-gray-600 mb-4">
                Suscríbete para recibir análisis semanales del mercado directamente en tu correo
              </p>
              <div className="flex gap-3 justify-center">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="px-4 py-2 border border-gray-300 rounded-lg w-64"
                />
                <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  Suscribirse
                </button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Mis Métricas */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {yourMetrics.map((metric, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                  </div>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center ${metric.trend === "up" ? "bg-green-100" : "bg-blue-100"
                      }`}
                  >
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-blue-600" />
                    )}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm ${metric.trend === "up" ? "text-green-600" : "text-blue-600"
                    }`}
                >
                  {metric.trend === "up" ? "+" : ""}
                  {metric.change}% vs período anterior
                </div>
              </Card>
            ))}
          </div>

          {/* Performance Summary */}
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Resumen de Desempeño</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Eficiencia General</span>
                  <span className="text-sm font-semibold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Uso de Recursos</span>
                  <span className="text-sm font-semibold">78%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Calidad del Producto</span>
                  <span className="text-sm font-semibold">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                </div>
              </div>
            </div>
          </Card>

          {/* ERP Teaser */}
          <Card className="p-6 mt-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-4">
              <BarChart3 className="h-12 w-12 text-purple-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  Próximamente: ERP CropLink
                </h3>
                <p className="text-gray-600 mb-3">
                  Gestiona tu finca con herramientas profesionales de planificación, inventario y análisis financiero
                </p>
                <Badge className="bg-purple-600">En desarrollo</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
