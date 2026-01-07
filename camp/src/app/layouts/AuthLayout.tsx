import { Outlet } from "react-router-dom";

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        <img src="/logo192.png" alt="AgroLink" className="h-10 w-10" />
                        <span className="text-2xl font-bold text-gray-900">AgroLink</span>
                    </div>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
