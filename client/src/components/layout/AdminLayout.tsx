import { useEffect } from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import {
    LayoutDashboard,
    LogOut,
    Loader2,
    FileText,
    Settings,
} from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { apiClient } from "../../lib/axios";

export const AdminLayout = () => {
    const { isAuthenticated, isLoading, checkAuth, logout } = useAuthStore();

    useEffect(() => {
        checkAuth(apiClient);
    }, [checkAuth]);

    if (isLoading)
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="h-16 flex items-center px-6 font-bold text-xl border-b border-slate-800">
                    Al Falah Admin
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-2 bg-slate-800 rounded-md"
                    >
                        <LayoutDashboard size={18} /> Dashboard
                    </Link>
                    <Link
                        to="/admin/catalog"
                        className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md"
                    >
                        <FileText size={18} /> Catalog & Pricing
                    </Link>
                    <Link
                        to="/admin/settings"
                        className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:bg-slate-800 rounded-md"
                    >
                        <Settings size={18} /> Settings
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button
                        onClick={() => logout(apiClient)}
                        className="flex items-center gap-3 text-slate-400 hover:text-white w-full px-3 py-2"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
                    <h2 className="font-semibold text-gray-800">Dashboard</h2>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};
