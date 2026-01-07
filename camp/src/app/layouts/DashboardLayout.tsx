import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";

export function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Map current path to sidebar active section logic if strictly needed by Sidebar prop
    // Ideally Sidebar should just take the current path, but for now we adapt:
    const currentPath = location.pathname.replace("/", "") || "feed";

    const handleSectionChange = (section: string) => {
        navigate(section === "feed" ? "/" : `/${section}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar onMenuClick={() => setIsSidebarOpen(true)} />

            <div className="flex">
                <Sidebar
                    activeSection={currentPath}
                    onSectionChange={handleSectionChange}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                <main className="flex-1 lg:ml-64">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
