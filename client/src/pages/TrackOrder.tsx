import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/axios";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle, Clock, CreditCard } from "lucide-react";
import { useEffect } from "react";

export const TrackOrder = () => {
    const { trackingToken } = useParams();
    const queryClient = useQueryClient();

    // Load Razorpay Script dynamically
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const {
        data: order,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["track-order", trackingToken],
        queryFn: async () => {
            const res = await apiClient.get(
                `/v1/enquiries/track/${trackingToken}`,
            );
            return res.data.data;
        },
        retry: false,
    });

    const approveMutation = useMutation({
        mutationFn: async () => {
            return await apiClient.patch(
                `/v1/enquiries/track/${trackingToken}/approve`,
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["track-order", trackingToken],
            });
        },
    });

    const handlePayment = async () => {
        try {
            // 1. Create order on backend
            const res = await apiClient.post("/v1/payments/create-order", {
                trackingToken,
            });
            const { orderId, amount, currency, keyId } = res.data.data;

            // 2. Configure Razorpay Checkout
            const options = {
                key: keyId,
                amount: amount,
                currency: currency,
                name: "Al Falah Art",
                description: `Advance Payment for Order`,
                order_id: orderId,
                handler: function (response: any) {
                    // On success, Razorpay hits our backend webhook.
                    // We refetch the UI to show the updated "Payment Confirmed" status.
                    setTimeout(() => {
                        queryClient.invalidateQueries({
                            queryKey: ["track-order", trackingToken],
                        });
                    }, 2000);
                },
                prefill: {
                    name: "Customer", // In a real app, populate from order data if you included customer details in the track API
                    contact: "",
                },
                theme: {
                    color: "#2563eb", // Tailwind blue-600
                },
            };

            // 3. Open Checkout
            const rzp = new (window as any).Razorpay(options);
            rzp.on("payment.failed", function (response: any) {
                alert("Payment failed. Please try again.");
            });
            rzp.open();
        } catch (error) {
            alert("Failed to initialize payment. Please try again.");
            console.error(error);
        }
    };

    if (isLoading)
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    if (isError || !order)
        return (
            <div className="py-20 text-center text-red-500 font-bold">
                Invalid Tracking Link
            </div>
        );

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                Order Tracking
                            </h1>
                            <p className="text-slate-300 text-sm mt-1">
                                ID: {trackingToken}
                            </p>
                        </div>
                        <div className="bg-slate-800 px-4 py-2 rounded text-sm font-semibold flex items-center gap-2">
                            <Clock className="w-4 h-4" /> {order.status}
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left: Order Summary */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">
                            Order Summary
                        </h3>
                        <p className="text-sm">
                            <strong>Product:</strong> {order.productId?.name}
                        </p>
                        <p className="text-sm">
                            <strong>Quantity:</strong> {order.quantity}
                        </p>
                        <div className="bg-gray-50 p-4 rounded mt-4 text-sm space-y-2 border">
                            <div className="flex justify-between">
                                <span>Total Amount:</span>{" "}
                                <span>
                                    ₹{order.pricingSnapshot?.totalPayable}
                                </span>
                            </div>
                            <div className="flex justify-between font-bold text-blue-700">
                                <span>Required Advance:</span>{" "}
                                <span>
                                    ₹{order.pricingSnapshot?.advanceRequired}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions / Status */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg border-b pb-2">
                            Action Required
                        </h3>

                        {order.status === "Content/Design Approved" && (
                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-4">
                                <Button
                                    className="w-full"
                                    onClick={() => approveMutation.mutate()}
                                    disabled={approveMutation.isPending}
                                >
                                    {approveMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                    )}
                                    Confirm & Lock Design
                                </Button>
                            </div>
                        )}

                        {order.status === "Awaiting Payment" && (
                            <div className="bg-white border border-gray-200 shadow-sm p-6 rounded-lg space-y-4 text-center">
                                <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CreditCard className="h-6 w-6" />
                                </div>
                                <h4 className="font-bold text-gray-900">
                                    Payment Required
                                </h4>
                                <p className="text-sm text-gray-500 mb-4">
                                    Please pay the advance amount of{" "}
                                    <strong>
                                        ₹
                                        {order.pricingSnapshot?.advanceRequired}
                                    </strong>{" "}
                                    to begin production.
                                </p>
                                <Button
                                    onClick={handlePayment}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                                >
                                    Pay Securely via Razorpay
                                </Button>
                                <div className="flex items-center justify-center mt-4 space-x-2 text-xs text-gray-400">
                                    <span>💳 Secure Encrypted Checkout</span>
                                </div>
                            </div>
                        )}

                        {order.status === "Payment Confirmed" && (
                            <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
                                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-2" />
                                <h4 className="font-bold text-green-900">
                                    Payment Confirmed!
                                </h4>
                                <p className="text-sm text-green-700">
                                    Your order is now moving into production.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
