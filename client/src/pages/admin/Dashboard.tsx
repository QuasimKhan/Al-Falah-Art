import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { apiClient } from "../../lib/axios";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";

export const Dashboard = () => {
    const { data: enquiries, isLoading } = useQuery({
        queryKey: ["admin-enquiries"],
        queryFn: async () => {
            const res = await apiClient.get("/v1/enquiries/admin");
            return res.data.data;
        },
    });

    if (isLoading)
        return <Loader2 className="animate-spin text-blue-600 h-8 w-8" />;

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 border-b text-gray-700">
                    <tr>
                        <th className="px-6 py-4 font-medium">Customer</th>
                        <th className="px-6 py-4 font-medium">
                            Product / Type
                        </th>
                        <th className="px-6 py-4 font-medium">Qty</th>
                        <th className="px-6 py-4 font-medium">Total Price</th>
                        <th className="px-6 py-4 font-medium">Status</th>
                        <th className="px-6 py-4 font-medium">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {enquiries?.map((enq: any) => (
                        <tr key={enq._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                    {enq.customerId?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {enq.customerId?.phone}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="font-medium text-gray-900">
                                    {enq.productId?.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {enq.type}
                                </div>
                            </td>
                            <td className="px-6 py-4">{enq.quantity}</td>
                            <td className="px-6 py-4 font-medium">
                                ₹
                                {enq.pricingSnapshot?.totalPayable?.toFixed(
                                    2,
                                ) ?? "0.00"}
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                    variant={
                                        enq.status === "Submitted"
                                            ? "secondary"
                                            : "default"
                                    }
                                >
                                    {enq.status}
                                </Badge>
                            </td>
                            <td className="px-6 py-4">
                                <td className="px-6 py-4">
                                    <Link
                                        to={`/admin/enquiry/${enq._id}`}
                                        className="text-blue-600 font-medium hover:underline"
                                    >
                                        Review
                                    </Link>
                                </td>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {enquiries?.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                    No enquiries found.
                </div>
            )}
        </div>
    );
};
