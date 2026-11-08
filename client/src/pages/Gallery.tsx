import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Loader2 } from "lucide-react";

interface Sample {
    _id: string;
    title: string;
    imageUrl: string;
    description: string;
    categoryId: { name: string };
}

export const Gallery = () => {
    const {
        data: samples,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["samples"],
        queryFn: async () => {
            const res = await apiClient.get("/v1/catalog/samples");
            return res.data.data as Sample[];
        },
    });

    if (isLoading)
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    if (isError)
        return (
            <div className="text-center py-20 text-red-500">
                Failed to load gallery. Please try again.
            </div>
        );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                    Design Gallery
                </h2>
                <p className="text-gray-600 mt-2">
                    Browse our previous work and select a reference for your
                    order.
                </p>
            </div>

            {samples?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <p className="text-gray-500">
                        No design samples available yet.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {samples?.map((sample) => (
                        <Card
                            key={sample._id}
                            className="overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="h-48 bg-gray-200 overflow-hidden">
                                {/* Fallback image if URL is broken, in production you'd use the actual Cloudinary URL */}
                                <img
                                    src={
                                        sample.imageUrl ||
                                        "https://placehold.co/600x400?text=Image+Coming+Soon"
                                    }
                                    alt={sample.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "https://placehold.co/600x400?text=Image+Not+Found";
                                    }}
                                />
                            </div>
                            <CardHeader>
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="secondary">
                                        {sample.categoryId?.name}
                                    </Badge>
                                </div>
                                <CardTitle className="text-xl">
                                    {sample.title}
                                </CardTitle>
                                {sample.description && (
                                    <CardDescription>
                                        {sample.description}
                                    </CardDescription>
                                )}
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
