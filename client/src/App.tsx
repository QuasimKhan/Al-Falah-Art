import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MainLayout } from "./components/layout/MainLayout";
import { Home } from "./pages/Home";
import { Gallery } from "./pages/Gallery";
import { Enquiry } from "./pages/Enquiry";
import { AdminLogin } from "./pages/admin/Login";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./pages/admin/Dashboard";
import { TrackOrder } from "./pages/TrackOrder";
import { EnquiryDetail } from "./pages/admin/EnquiryDetail";

// Create a client for TanStack query
const queryClient = new QueryClient();

// Placeholders for future phases

const NotFound = () => (
    <div className="p-8 text-xl text-center text-red-500">
        404 - Page Not Found
    </div>
);

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Router>
                <Routes>
                    {/* Public Routes with Layout */}
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<Home />} />
                        <Route path="/gallery" element={<Gallery />} />
                        <Route path="/enquiry" element={<Enquiry />} />
                        <Route
                            path="/track/:trackingToken"
                            element={<TrackOrder />}
                        />{" "}
                        {/* NEW PUBLIC ROUTE */}
                    </Route>

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route element={<AdminLayout />}>
                        <Route path="/admin" element={<Dashboard />} />
                        <Route
                            path="/admin/enquiry/:id"
                            element={<EnquiryDetail />}
                        />{" "}
                        {/* NEW ADMIN ROUTE */}
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
        </QueryClientProvider>
    );
}

export default App;
