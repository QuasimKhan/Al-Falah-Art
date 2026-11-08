import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, UploadCloud } from "lucide-react";
import { apiClient } from "../../lib/axios";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";

export const EnquiryDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [file, setFile] = useState<File | null>(null);
    const [adminNotes, setAdminNotes] = useState("");

    const { data: enq, isLoading } = useQuery({
        queryKey: ["admin-enquiry", id],
        queryFn: async () => {
            const res = await apiClient.get(`/v1/enquiries/admin/${id}`);
            return res.data.data;
        },
    });

    const uploadMutation = useMutation({
        mutationFn: async (formData: FormData) => {
            return await apiClient.patch(
                `/v1/enquiries/admin/${id}/proof`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                },
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-enquiry", id] });
            alert("Proof uploaded successfully!");
        },
    });

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return alert("Please select a file");

        const formData = new FormData();
        formData.append("proofImage", file);
        if (adminNotes) formData.append("adminNotes", adminNotes);

        uploadMutation.mutate(formData);
    };

    if (isLoading)
        return (
            <div className="p-12 flex justify-center">
                <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
            </div>
        );
    if (!enq) return <div className="p-12 text-red-500">Enquiry not found</div>;

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center gap-4 mb-6">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate("/admin")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <h2 className="text-2xl font-bold">Enquiry Details</h2>
                <Badge>{enq.status}</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Customer Details & JSON Content */}
                <div className="space-y-6">
                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                            Customer & Financials
                        </h3>
                        <div className="space-y-2 text-sm">
                            <p>
                                <strong>Name:</strong> {enq.customerId?.name}
                            </p>
                            <p>
                                <strong>Phone:</strong> {enq.customerId?.phone}
                            </p>
                            <p>
                                <strong>Product:</strong> {enq.productId?.name}
                            </p>
                            <p>
                                <strong>Quantity:</strong> {enq.quantity}
                            </p>
                            <p>
                                <strong>Total Payable:</strong> ₹
                                {enq.pricingSnapshot?.totalPayable}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-6 border rounded-lg shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                            Submitted Content
                        </h3>
                        <div className="space-y-4 text-sm bg-gray-50 p-4 rounded-md overflow-auto max-h-[400px]">
                            {Object.entries(enq.formData).map(
                                ([key, value]) => (
                                    <div
                                        key={key}
                                        className="border-b border-gray-200 pb-2 last:border-0"
                                    >
                                        <span className="font-semibold capitalize text-gray-700">
                                            {key
                                                .replace(/([A-Z])/g, " $1")
                                                .trim()}
                                            :
                                        </span>
                                        <p
                                            className="whitespace-pre-wrap mt-1 text-gray-900"
                                            dir="auto"
                                        >
                                            {String(value)}
                                        </p>
                                    </div>
                                ),
                            )}
                        </div>

                        {enq.attachments && enq.attachments.length > 0 && (
                            <div className="mt-4">
                                <h4 className="font-semibold text-sm mb-2">
                                    Customer Attachments:
                                </h4>
                                <div className="flex gap-2 flex-wrap">
                                    {enq.attachments.map(
                                        (url: string, i: number) => (
                                            <a
                                                key={i}
                                                href={url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-blue-600 text-sm hover:underline border p-2 rounded"
                                            >
                                                View Attachment {i + 1}
                                            </a>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Upload Proof */}
                <div className="bg-white p-6 border rounded-lg shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-4 border-b pb-2">
                        Design Proofing
                    </h3>

                    {enq.designProofUrl ? (
                        <div className="space-y-4">
                            <div className="bg-green-50 text-green-700 p-3 rounded text-sm font-medium border border-green-200">
                                Design Proof Uploaded
                            </div>
                            <img
                                src={enq.designProofUrl}
                                alt="Proof"
                                className="w-full rounded border"
                            />
                            {enq.adminNotes && (
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    <strong>Notes:</strong> {enq.adminNotes}
                                </p>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleUpload} className="space-y-4">
                            <div className="space-y-2">
                                <Label>
                                    Upload Exported Design (JPG/PNG/PDF)
                                </Label>
                                <Input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) =>
                                        setFile(e.target.files?.[0] || null)
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Notes for Customer</Label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) =>
                                        setAdminNotes(e.target.value)
                                    }
                                    placeholder="e.g., Please check spelling carefully."
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={uploadMutation.isPending}
                            >
                                {uploadMutation.isPending ? (
                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                ) : (
                                    <UploadCloud className="h-4 w-4 mr-2" />
                                )}
                                Upload Proof & Request Approval
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
