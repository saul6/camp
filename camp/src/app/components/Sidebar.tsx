import { Home, Users, ShoppingBag, Factory, TrendingUp, Calendar, Settings, X, Store } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "./ui/utils";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: "feed", label: "Inicio", icon: Home },
  { id: "network", label: "Mi Red", icon: Users },
  { id: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { id: "my-store", label: "Mi Tienda", icon: Store },
  { id: "buyers", label: "Compradores", icon: Factory },
  { id: "insights", label: "Insights", icon: TrendingUp },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "settings", label: "Configuración", icon: Settings },
];

export function Sidebar({ activeSection, onSectionChange, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 z-40 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="w-64 h-full flex flex-col">
          {/* Header Mobile */}
          <div className="flex items-center justify-between p-4 border-b lg:hidden">
            <span className="font-semibold">Menú</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onSectionChange(item.id);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors",
                        activeSection === item.id
                          ? "bg-green-50 text-green-700"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold text-green-800">Próximamente:</span>
                <span className="text-gray-700"> ERP CropLink</span>
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
