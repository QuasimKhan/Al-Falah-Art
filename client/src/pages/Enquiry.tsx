import { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { apiClient } from "../lib/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import {
    Loader2,
    CheckCircle2,
    ArrowRight,
    IndianRupee,
    Calculator,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// Interface for Product API response
interface Product {
    _id: string;
    name: string;
}

// Type for the pricing snapshot returned from the backend
interface PricingSnapshot {
    unitPrice: number;
    subtotal: number;
    discount: number;
    deliveryCharge: number;
    platformFee: number;
    totalPayable: number;
    advanceRequired: number;
}

export const Enquiry = () => {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [isCalculating, setIsCalculating] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [pricingDetails, setPricingDetails] =
        useState<PricingSnapshot | null>(null);
    const [successToken, setSuccessToken] = useState<string | null>(null);
    const [priceError, setPriceError] = useState<string | null>(null);

    const { register, handleSubmit, control, setValue, getValues, reset } =
        useForm({
            defaultValues: {
                type: "Wedding Card",
                deliveryMode: "Pickup",
                printBrideName: "no",
                quantity: 100,
            },
        });

    // Watch fields to trigger UI changes
    const selectedType = useWatch({ control, name: "type" });
    const printBrideName = useWatch({ control, name: "printBrideName" });
    const quantity = useWatch({ control, name: "quantity" });
    const deliveryMode = useWatch({ control, name: "deliveryMode" });
    const productId = useWatch({ control, name: "productId" });

    // Reset pricing if core variables change
    useEffect(() => {
        setPricingDetails(null);
        setPriceError(null);
    }, [quantity, deliveryMode, productId]);

    // 1. DYNAMIC API FETCH INSTEAD OF MOCKS
    const { data: products, isLoading: isLoadingProducts } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const res = await apiClient.get("/v1/catalog/products");
            return res.data.data as Product[];
        },
    });

    const calculatePrice = async () => {
        const vals = getValues();
        if (!vals.productId || !vals.quantity) {
            setPriceError(
                "Please select a product and enter a valid quantity.",
            );
            return;
        }

        setIsCalculating(true);
        setPriceError(null);
        try {
            const res = await apiClient.post("/v1/enquiries/calculate-price", {
                productId: vals.productId,
                quantity: vals.quantity,
                deliveryMode: vals.deliveryMode,
                offerCode: vals.offerCode,
            });
            setPricingDetails(res.data.data);
        } catch (error: any) {
            setPriceError(
                error.response?.data?.message || "Failed to calculate price.",
            );
            setPricingDetails(null);
        } finally {
            setIsCalculating(false);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);
        try {
            const formData = new FormData();

            // Top level fields
            formData.append("name", data.customerName);
            formData.append("phone", data.phone);
            formData.append("email", data.email || "");
            formData.append("type", data.type);
            formData.append("productId", data.productId);
            if (data.designId) formData.append("designId", data.designId);
            formData.append("quantity", data.quantity);
            formData.append("deliveryMode", data.deliveryMode);
            if (data.offerCode) formData.append("offerCode", data.offerCode);

            // Group content fields securely into JSON
            const {
                customerName,
                phone,
                email,
                type,
                productId,
                designId,
                quantity,
                deliveryMode,
                offerCode,
                attachments,
                ...dynamicContent
            } = data;

            formData.append("formData", JSON.stringify(dynamicContent));

            if (attachments && attachments.length > 0) {
                for (let i = 0; i < attachments.length; i++) {
                    formData.append("attachments", attachments[i]);
                }
            }

            const res = await apiClient.post("/v1/enquiries", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setSuccessToken(res.data.trackingToken);
            setStep(3);
            reset();
        } catch (error) {
            console.error("Submission failed", error);
            alert("Failed to submit enquiry. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (step === 3 && successToken) {
        return (
            <div className="max-w-2xl mx-auto py-20 px-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Enquiry Received!
                </h2>
                <p className="text-gray-600 mb-6">
                    Your requirements have been successfully submitted for
                    review.
                </p>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg mb-6">
                    <p className="text-sm text-blue-800 font-medium mb-2">
                        Your Secure Tracking ID:
                    </p>
                    <p className="text-2xl font-mono font-bold text-blue-900">
                        {successToken}
                    </p>
                </div>
                <p className="text-sm text-gray-500">
                    Save this ID to track your order, review design proofs, and
                    make your payment once approved.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center space-x-4 mb-8">
                <div
                    className={`flex items-center ${step === 1 ? "text-blue-600 font-bold" : "text-gray-400"}`}
                >
                    <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                        1
                    </span>
                    Product & Price
                </div>
                <div className="w-16 h-[2px] bg-gray-200"></div>
                <div
                    className={`flex items-center ${step === 2 ? "text-blue-600 font-bold" : "text-gray-400"}`}
                >
                    <span className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-2">
                        2
                    </span>
                    Content Details
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* STEP 1: CONFIGURATION & PRICING */}
                {step === 1 && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                        <h2 className="text-xl font-semibold border-b pb-4">
                            Select Product & Estimate Price
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Requirement Type</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setValue("type", val)
                                    }
                                    defaultValue={selectedType}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Wedding Card">
                                            Wedding Card
                                        </SelectItem>
                                        <SelectItem value="Poster/Banner">
                                            Poster / Banner
                                        </SelectItem>
                                        <SelectItem value="General">
                                            General Printing
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Select Product *</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setValue("productId", val)
                                    }
                                    disabled={isLoadingProducts}
                                >
                                    <SelectTrigger>
                                        <SelectValue
                                            placeholder={
                                                isLoadingProducts
                                                    ? "Loading products..."
                                                    : "Select a product"
                                            }
                                        />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products?.map((p) => (
                                            <SelectItem
                                                key={p._id}
                                                value={p._id}
                                            >
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Quantity *</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    {...register("quantity")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Delivery Mode *</Label>
                                <Select
                                    onValueChange={(val) =>
                                        setValue("deliveryMode", val)
                                    }
                                    defaultValue={deliveryMode}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pickup">
                                            Shop Pickup (Free)
                                        </SelectItem>
                                        <SelectItem value="Delivery">
                                            Home Delivery (Charges Apply)
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            type="button"
                            onClick={calculatePrice}
                            disabled={isCalculating || !productId}
                            className="w-full"
                        >
                            {isCalculating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Calculator className="mr-2 h-4 w-4" />
                            )}
                            Calculate Estimated Price
                        </Button>

                        {priceError && (
                            <p className="text-red-500 text-sm font-medium text-center">
                                {priceError}
                            </p>
                        )}

                        {pricingDetails && (
                            <div className="bg-gray-50 border rounded-md p-6 mt-4">
                                <h3 className="text-lg font-semibold mb-4 flex items-center">
                                    <IndianRupee className="h-5 w-5 mr-1" />{" "}
                                    Pricing Breakdown
                                </h3>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Unit Price:</span>{" "}
                                        <span>
                                            ₹
                                            {pricingDetails.unitPrice.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Subtotal ({quantity} pcs):</span>{" "}
                                        <span>
                                            ₹
                                            {pricingDetails.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    {pricingDetails.discount > 0 && (
                                        <div className="flex justify-between text-green-600">
                                            <span>Discount applied:</span>{" "}
                                            <span>
                                                - ₹
                                                {pricingDetails.discount.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {pricingDetails.deliveryCharge > 0 && (
                                        <div className="flex justify-between">
                                            <span>Delivery Charge:</span>{" "}
                                            <span>
                                                ₹
                                                {pricingDetails.deliveryCharge.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    {pricingDetails.platformFee > 0 && (
                                        <div className="flex justify-between">
                                            <span>Platform/Handling Fee:</span>{" "}
                                            <span>
                                                ₹
                                                {pricingDetails.platformFee.toFixed(
                                                    2,
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="border-t pt-2 mt-2 flex justify-between font-bold text-gray-900 text-lg">
                                        <span>Total Amount:</span>{" "}
                                        <span>
                                            ₹
                                            {pricingDetails.totalPayable.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-medium text-blue-700">
                                        <span>
                                            Advance Required (after approval):
                                        </span>{" "}
                                        <span>
                                            ₹
                                            {pricingDetails.advanceRequired.toFixed(
                                                2,
                                            )}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="w-full mt-6 bg-green-600 hover:bg-green-700"
                                >
                                    Proceed to Fill Details{" "}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: CONTENT & CONTACT DETAILS */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center bg-gray-50 p-4 border rounded-lg">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Price Calculated
                                </p>
                                <p className="font-bold text-lg">
                                    ₹{pricingDetails?.totalPayable.toFixed(2)}
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setStep(1)}
                            >
                                Change Product/Qty
                            </Button>
                        </div>

                        {/* Wedding Card Specific Structured Fields */}
                        {selectedType === "Wedding Card" && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                                <h2 className="text-xl font-semibold border-b pb-4">
                                    Wedding Details
                                </h2>

                                {/* Groom Section */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-900">
                                        Groom's Side (Mandatory)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Groom's Full Name *</Label>
                                            <Input
                                                dir="auto"
                                                {...register("groomName")}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Groom's Father's Name *
                                            </Label>
                                            <Input
                                                dir="auto"
                                                {...register("groomFather")}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>
                                                Groom's Complete Address *
                                            </Label>
                                            <Textarea
                                                dir="auto"
                                                {...register("groomAddress")}
                                                required
                                                placeholder="Complete residential address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Bride Section */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium text-gray-900">
                                        Bride's Side
                                    </h3>

                                    <div className="space-y-2">
                                        <Label>
                                            Print Bride's Name on Card? *
                                        </Label>
                                        <Select
                                            onValueChange={(val) =>
                                                setValue("printBrideName", val)
                                            }
                                            defaultValue={printBrideName}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="yes">
                                                    Yes, print the Bride's name
                                                </SelectItem>
                                                <SelectItem value="no">
                                                    No, only D/O format
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {printBrideName === "yes" && (
                                            <div className="space-y-2">
                                                <Label>
                                                    Bride's Full Name *
                                                </Label>
                                                <Input
                                                    dir="auto"
                                                    {...register("brideName")}
                                                    required={
                                                        printBrideName === "yes"
                                                    }
                                                />
                                            </div>
                                        )}
                                        <div
                                            className={`space-y-2 ${printBrideName === "no" ? "md:col-span-2" : ""}`}
                                        >
                                            <Label>
                                                Bride's Father's Name *
                                                (Required for D/O formatting)
                                            </Label>
                                            <Input
                                                dir="auto"
                                                {...register("brideFather")}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>
                                                Bride's Complete Address *
                                            </Label>
                                            <Textarea
                                                dir="auto"
                                                {...register("brideAddress")}
                                                required
                                                placeholder="Complete residential address"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Event Section */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium text-gray-900">
                                        Event Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Wedding Date & Time *</Label>
                                            <Input
                                                dir="auto"
                                                {...register("eventDate")}
                                                required
                                                placeholder="e.g., 24 Oct 2024 (14 Rabi-ul-Awwal)"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>
                                                Venue Name & Address *
                                            </Label>
                                            <Textarea
                                                dir="auto"
                                                {...register("venue")}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>
                                                Other Details / Program Schedule
                                                / Darshan Abhilashi (Optional)
                                            </Label>
                                            <Textarea
                                                dir="auto"
                                                {...register(
                                                    "additionalContent",
                                                )}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Poster / General Fallback Fields */}
                        {selectedType !== "Wedding Card" && (
                            <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
                                <h2 className="text-xl font-semibold border-b pb-4">
                                    Content Requirements
                                </h2>
                                <div className="space-y-2">
                                    <Label>Main Heading / Title</Label>
                                    <Input
                                        dir="auto"
                                        {...register("mainHeading")}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Complete Text Content *</Label>
                                    <Textarea
                                        dir="auto"
                                        {...register("textContent")}
                                        required
                                        className="min-h-[150px]"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Customer Details & Uploads */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border space-y-6">
                            <h2 className="text-xl font-semibold border-b pb-4">
                                Your Contact Details & Uploads
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        {...register("customerName")}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>WhatsApp / Phone Number *</Label>
                                    <Input {...register("phone")} required />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label>Email (Optional)</Label>
                                    <Input
                                        type="email"
                                        {...register("email")}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 pt-4">
                                <Label>
                                    Attach References / Logos (Optional)
                                </Label>
                                <Input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    {...register("attachments")}
                                />
                                <p className="text-xs text-gray-500">
                                    Max 5 files. You can upload handwritten text
                                    or logos.
                                </p>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full mt-6"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                                        Submitting for Review...
                                    </>
                                ) : (
                                    "Submit Order Request"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
};
