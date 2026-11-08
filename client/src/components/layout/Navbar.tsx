import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import { buttonVariants } from "../ui/button";

export const Navbar = () => {
    return (
        <nav className="bg-white border-b sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2">
                    <Printer className="h-6 w-6 text-blue-600" />

                    <span className="font-bold text-xl tracking-tight text-gray-900">
                        Al Falah Art
                    </span>
                </Link>

                <div className="hidden md:flex gap-6 items-center">
                    <Link
                        to="/"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Home
                    </Link>

                    <Link
                        to="/gallery"
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                        Design Gallery
                    </Link>

                    <Link to="/enquiry" className={buttonVariants()}>
                        Request a Quote
                    </Link>
                </div>
            </div>
        </nav>
    );
};
