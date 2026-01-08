import { useState, useEffect, useRef } from "react";
import { Bell, Menu, MessageSquare, Search, LogOut, User, Settings as SettingsIcon, FileText } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";

const logo = "/logo_new.png";

interface NavbarProps {
  onMenuClick: () => void;
}

interface SearchResult {
  users: any[];
  posts: any[];
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const navigate = useNavigate();
  const { unreadCount } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search State
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ users: [], posts: [] });
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search Debounce
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:3000/api/search?q=${query}`);
          const data = await res.json();

          // Defensive check to ensure arrays exist
          setResults({
            users: Array.isArray(data.users) ? data.users : [],
            posts: Array.isArray(data.posts) ? data.posts : []
          });
          setShowResults(true);
        } catch (error) {
          console.error("Error searching:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setShowResults(false);
        setResults({ users: [], posts: [] });
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [query]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate("/login");
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: "Invitado", email: "", profileType: "" };
  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : "INV";

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Menu Mobile */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/feed")}
            >
              <img src={logo} alt="AgroCore" className="h-10 w-10" />
              <span className="text-xl font-bold text-green-600 hidden sm:block">AgroCore</span>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block relative" ref={searchRef}>
            <div className={`relative ${showResults ? 'z-50' : ''}`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => { if (query.length >= 2) setShowResults(true); }}
                placeholder="Buscar productores, empresas, productos..."
                className="pl-10 w-full focus-visible:ring-green-500"
              />
            </div>

            {/* Dropdown de Resultados */}
            {showResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Buscando...</div>
                ) : (
                  <>
                    {/* Sección Usuarios */}
                    {results.users?.length > 0 && (
                      <div className="py-2">
                        <h3 className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Usuarios</h3>
                        {results.users.map(u => (
                          <div
                            key={u.id}
                            onClick={() => { navigate(`/profile/${u.id}`); setShowResults(false); setQuery(""); }}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center gap-3 transition-colors"
                          >
                            <Avatar className="h-8 w-8 border border-gray-100">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} />
                              <AvatarFallback className="text-xs bg-green-100 text-green-700">{u.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-gray-900 leading-none">{u.name}</p>
                              <p className="text-xs text-gray-500 mt-0.5 capitalize">{u.profile_type}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Sección Publicaciones */}
                    {results.posts?.length > 0 && (
                      <div className="py-2 border-t border-gray-100">
                        <h3 className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Publicaciones</h3>
                        {results.posts.map(p => (
                          <div
                            key={p.id}
                            onClick={() => { navigate(`/profile/${p.user_id}`); setShowResults(false); setQuery(""); }}
                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-start gap-3 transition-colors"
                          >
                            <div className="mt-0.5 bg-gray-100 p-1.5 rounded-md">
                              <FileText className="h-4 w-4 text-gray-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-800 line-clamp-1">{p.content}</p>
                              <p className="text-xs text-gray-500 mt-0.5">por <span className="font-medium">{p.author_name}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {(!results.users?.length && !results.posts?.length) && (
                      <div className="p-8 text-center">
                        <p className="text-gray-500 text-sm">No se encontraron resultados para "{query}"</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <MessageSquare className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Button>

            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="inline-block"
                >
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden hover:opacity-80 transition-opacity">
                    <div className="h-full w-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{initials}</span>
                    </div>
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                align="end"
                forceMount
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(`/profile/${user.id}`)} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Mi Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Búsqueda Mobile (simplificada por ahora, idealmente debería abrir un overlay) */}
        <div className="pb-3 md:hidden">
          {/* ... Implementación Mobile pendiente ... */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar..."
              className="pl-10 w-full"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}