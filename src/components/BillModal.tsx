import { X, Printer, Share2 } from 'lucide-react';
import { Sale } from '@/types';
import { format } from 'date-fns';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

interface BillModalProps {
    isOpen: boolean;
    onClose: () => void;
    sale: Sale | null;
}

const BillModal = ({ isOpen, onClose, sale }: BillModalProps) => {
    if (!isOpen || !sale) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleShare = () => {
        if (!sale.customer?.phone && !sale.customerPhone) return;

        const phone = sale.customer?.phone || sale.customerPhone || '';
        const message = `*Vision Point Invoice*\n\n` +
            `Invoice #: ${sale.id}\n` +
            `Date: ${format(new Date(sale.sale_date || sale.date || ''), 'MMM dd, yyyy')}\n` +
            `Amount: ₹${sale.net_amount || sale.netAmount}\n` +
            `Due: ₹${sale.due_amount || sale.dueAmount}\n\n` +
            `Thank you for shopping with us!`;

        sendWhatsAppMessage(phone, message);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white inset-0">
            <div className="bg-card rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto print:shadow-none print:w-full print:max-w-none print:h-auto print:rounded-none">

                {/* Header */}
                <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between print:hidden">
                    <h2 className="text-2xl font-bold">Sale Invoice</h2>
                    <div className="flex gap-2">
                        <button onClick={handleShare} className="p-2 hover:bg-accent rounded-lg transition-colors text-green-600" title="Share on WhatsApp">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button onClick={handlePrint} className="p-2 hover:bg-accent rounded-lg transition-colors" title="Print">
                            <Printer className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-accent rounded-lg transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Bill Content */}
                <div className="p-8 space-y-6 print:p-0">
                    {/* Business Header (Mock) */}
                    <div className="text-center border-b pb-6">
                        <h1 className="text-3xl font-bold uppercase tracking-wider">Vision Point</h1>
                        <p className="text-muted-foreground">Premier Optical Store</p>
                        <p className="text-sm text-muted-foreground mt-1">123 Market Street, City, Country</p>
                        <p className="text-sm text-muted-foreground">Phone: +91 9876543210</p>
                    </div>

                    {/* Customer & Invoice Details */}
                    <div className="flex justify-between">
                        <div>
                            <h3 className="font-semibold text-muted-foreground text-sm uppercase mb-1">Bill To:</h3>
                            <p className="font-bold text-lg">{sale.customer?.name || sale.customerName}</p>
                            <p className="text-sm">{sale.customer?.phone || sale.customerPhone}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-semibold text-muted-foreground text-sm uppercase mb-1">Invoice Details:</h3>
                            <p className="text-sm"><span className="font-medium">Invoice #:</span> {sale.id}</p>
                            <p className="text-sm"><span className="font-medium">Date:</span> {format(new Date(sale.sale_date || sale.date || ''), 'MMM dd, yyyy')}</p>
                            <p className="text-sm"><span className="font-medium">Status:</span> {sale.status}</p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mt-6">
                        <thead className="border-b-2 border-primary">
                            <tr>
                                <th className="text-left py-2 font-bold">Item</th>
                                <th className="text-right py-2 font-bold">Price</th>
                                <th className="text-right py-2 font-bold">Qty</th>
                                <th className="text-right py-2 font-bold">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {sale.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3">
                                        <p className="font-medium">{item.name}</p>
                                        {item.note && <p className="text-xs text-muted-foreground">{item.note}</p>}
                                    </td>
                                    <td className="text-right py-3">₹{item.price}</td>
                                    <td className="text-right py-3">{item.quantity}</td>
                                    <td className="text-right py-3 font-medium">₹{item.amount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end pt-4 border-t">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>₹{sale.totalAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount:</span>
                                <span>₹{sale.discount}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                                <span>Net Amount:</span>
                                <span>₹{sale.net_amount || sale.netAmount}</span>
                            </div>
                            <div className="flex justify-between text-sm text-success font-medium">
                                <span>Received:</span>
                                <span>₹{sale.received_amount || sale.amountReceived}</span>
                            </div>
                            <div className="flex justify-between text-sm text-destructive font-bold">
                                <span>Due Amount:</span>
                                <span>₹{sale.due_amount || sale.dueAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t pt-6 text-center text-sm text-muted-foreground mt-8">
                        <p>Thank you for your business!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BillModal;
