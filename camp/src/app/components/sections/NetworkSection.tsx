import { useState, useEffect } from "react";
import { UserPlus, MapPin, Search, UserCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface User {
  id: number;
  name: string;
  email: string;
  profile_type: string;
  isFollowing: boolean;
}

export function NetworkSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const userStr = localStorage.getItem('user');
  const currentUser = userStr ? JSON.parse(userStr) : null;

  const fetchUsers = async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`http://localhost:3000/api/users?currentUserId=${currentUser.id}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFollow = async (targetUserId: number) => {
    try {
      await fetch(`http://localhost:3000/api/users/${targetUserId}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUser.id }),
      });
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isFollowing: true } : u));
    } catch (error) {
      console.error("Error following:", error);
    }
  };

  const handleUnfollow = async (targetUserId: number) => {
    try {
      await fetch(`http://localhost:3000/api/users/${targetUserId}/follow`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerId: currentUser.id }),
      });
      // Optimistic update
      setUsers(prev => prev.map(u => u.id === targetUserId ? { ...u, isFollowing: false } : u));
    } catch (error) {
      console.error("Error unfollowing:", error);
    }
  };

  const connections = users.filter(u => u.isFollowing);
  const suggestions = users.filter(u => !u.isFollowing);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mi Red</h1>
        <p className="text-gray-600">Conecta con productores y empresas del sector agrícola</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{connections.length}</p>
              <p className="text-sm text-gray-600">Conexiones</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{suggestions.length}</p>
              <p className="text-sm text-gray-600">Personas por descubrir</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="suggestions" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="suggestions">Sugerencias ({suggestions.length})</TabsTrigger>
          <TabsTrigger value="connections">Mis Conexiones ({connections.length})</TabsTrigger>
        </TabsList>

        {/* Sugerencias */}
        <TabsContent value="suggestions">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{user.profile_type}</p>

                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <MapPin className="h-3 w-3" />
                    México
                  </div>

                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={() => handleFollow(user.id)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Conectar
                  </Button>
                </div>
              </Card>
            ))}
            {suggestions.length === 0 && <p className="text-center text-gray-500 col-span-full">No hay nuevas sugerencias.</p>}
          </div>
        </TabsContent>

        {/* Mis Conexiones */}
        <TabsContent value="connections">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((user) => (
              <Card key={user.id} className="p-6">
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-lg mb-1">{user.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">{user.profile_type}</p>

                  <div className="flex gap-2 w-full mt-4">
                    <Button variant="outline" className="flex-1 text-red-600 hover:bg-red-50" onClick={() => handleUnfollow(user.id)}>
                      Dejar de seguir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {connections.length === 0 && <p className="text-center text-gray-500 col-span-full">Aún no sigues a nadie.</p>}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
