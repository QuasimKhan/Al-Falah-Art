import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export const Home = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
                Custom Printing & Graphic Design{" "}
                <br className="hidden md:block" />
                <span className="text-blue-600">Tailored to Your Needs</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto mb-10">
                From elegant Shadi cards to impactful political banners and
                community posters. We bring your ideas to life with professional
                typography in Urdu, Hindi, and English.
            </p>
            <div className="flex justify-center gap-4">
                <Button size="lg" asChild>
                    <Link to="/enquiry">Request a Custom Quote</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <Link to="/gallery">Browse Gallery</Link>
                </Button>
            </div>
        </div>
    );
};
