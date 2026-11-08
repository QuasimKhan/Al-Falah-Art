import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export const MainLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
                <Outlet />
            </main>
            <footer className="bg-gray-900 text-gray-300 py-8 text-center text-sm">
                <p>
                    © {new Date().getFullYear()} Al Falah Art. All rights
                    reserved.
                </p>
            </footer>
        </div>
    );
};
