import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSales } from "@/store/slices/saleSlice";
import { fetchProducts } from "@/store/slices/productSlice";
import { createReturn } from "@/store/slices/returnSlice";
import { Return, ReturnItem, ReturnType, ReturnReason, ReturnStatus } from "@/lib/models/Return";
import { Sale } from "@/lib/models/Sale";

// Define form schema
const formSchema = z.object({
  originalSaleId: z.number().positive("Please select a valid sale"),
  returnType: z.enum(["refund", "exchange", "store_credit"]),
  reason: z.enum(["defective", "not_as_described", "unwanted", "wrong_item", "damaged", "other"]),
  reasonDetails: z.string().optional(),
  refundMethod: z.enum(["original_payment", "cash", "store_credit", "bank_transfer"]),
  notes: z.string().optional(),
});

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NewReturnDialog({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { items: sales } = useAppSelector((state) => state.sales);
  const { items: products } = useAppSelector((state) => state.products);
  const { toast } = useToast();
  
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      returnType: "refund",
      refundMethod: "original_payment",
    },
  });
  
  useEffect(() => {
    if (open) {
      dispatch(fetchSales());
      dispatch(fetchProducts());
    }
  }, [dispatch, open]);
  
  // When a sale is selected, initialize return items
  useEffect(() => {
    if (selectedSale && selectedSale.items) {
      // Initialize return items from sale items
      const items: ReturnItem[] = selectedSale.items.map(item => ({
        originalSaleItemId: item.id || 0,
        productId: item.productId,
        serialNumber: item.serialNumber,
        quantity: item.quantity,
        returnedQuantity: item.quantity, // Default to returning all
        price: item.price,
        refundAmount: item.price, // Default to full refund
        condition: 'good',
        returnToInventory: true
      }));
      
      setReturnItems(items);
    }
  }, [selectedSale]);
  
  const handleSaleChange = (saleId: string) => {
    const id = parseInt(saleId, 10);
    form.setValue("originalSaleId", id);
    const sale = sales.find(s => s.id === id);
    setSelectedSale(sale || null);
  };
  
  const handleQuantityChange = (index: number, quantity: number) => {
    setReturnItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        returnedQuantity: quantity,
        refundAmount: updated[index].price * quantity
      };
      return updated;
    });
  };
  
  const handleConditionChange = (index: number, condition: string) => {
    setReturnItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        condition: condition as 'good' | 'damaged' | 'defective' | 'open_box',
        // Optionally adjust refund amount based on condition
        refundAmount: condition === 'good' 
          ? updated[index].price * updated[index].returnedQuantity
          : updated[index].price * updated[index].returnedQuantity * 0.9 // 10% deduction for non-perfect condition
      };
      return updated;
    });
  };
  
  const handleReturnToInventoryChange = (index: number, checked: boolean) => {
    setReturnItems(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        returnToInventory: checked
      };
      return updated;
    });
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedSale) {
      toast({
        title: "Error",
        description: "Please select a sale to process the return",
        variant: "destructive"
      });
      return;
    }
    
    if (returnItems.length === 0) {
      toast({
        title: "Error",
        description: "No items selected for return",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Calculate total refund amount
      const refundAmount = returnItems.reduce(
        (total, item) => total + item.refundAmount, 
        0
      );
      
      // Create return object
      const returnData: Omit<Return, 'id'> = {
        originalSaleId: values.originalSaleId,
        customerId: selectedSale.customerId,
        returnDate: new Date().toISOString(),
        status: 'pending' as ReturnStatus,
        returnType: values.returnType as ReturnType,
        reason: values.reason as ReturnReason,
        reasonDetails: values.reasonDetails,
        items: returnItems,
        refundAmount,
        refundMethod: values.refundMethod,
        notes: values.notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add store credit if that's the return type
      if (values.returnType === 'store_credit') {
        returnData.storeCredit = {
          id: 0, // Will be assigned by the database
          customerId: selectedSale.customerId || 0,
          amount: refundAmount,
          originalAmount: refundAmount,
          issueDate: new Date().toISOString(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year expiry
          status: 'active',
          referenceCode: `SC-${Date.now().toString().slice(-6)}`, // Simple reference code
          balance: refundAmount
        };
      }
      
      await dispatch(createReturn(returnData)).unwrap();
      
      toast({
        title: "Return Processed",
        description: "The return has been successfully created and is pending approval",
      });
      
      onClose();
    } catch (error) {
      console.error("Failed to process return:", error);
      toast({
        title: "Error",
        description: "Failed to process the return. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Get product details for display
  const getProductDetails = (productId: number) => {
    return products.find(p => p.id === productId);
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Process New Return</DialogTitle>
          <DialogDescription>
            Enter the details of the return or exchange to process it.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="originalSaleId"
                render={() => (
                  <FormItem>
                    <FormLabel>Original Sale</FormLabel>
                    <Select 
                      onValueChange={handleSaleChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sale" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sales.map((sale) => (
                          <SelectItem key={sale.id} value={sale.id.toString()}>
                            Sale #{sale.id} - {new Date(sale.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the original sale for the return
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="returnType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select return type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="refund">Refund</SelectItem>
                        <SelectItem value="exchange">Exchange</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Reason</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="defective">Defective</SelectItem>
                        <SelectItem value="not_as_described">Not As Described</SelectItem>
                        <SelectItem value="unwanted">Unwanted</SelectItem>
                        <SelectItem value="wrong_item">Wrong Item</SelectItem>
                        <SelectItem value="damaged">Damaged</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="refundMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Refund Method</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={form.watch("returnType") !== "refund"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select refund method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="original_payment">Original Payment Method</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="store_credit">Store Credit</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="reasonDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide more details about the return reason..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {selectedSale && (
              <div className="border rounded-md p-4">
                <h3 className="text-lg font-medium mb-4">Return Items</h3>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th className="px-4 py-2">Product</th>
                        <th className="px-4 py-2">Serial/IMEI</th>
                        <th className="px-4 py-2">Price</th>
                        <th className="px-4 py-2">Qty Purchased</th>
                        <th className="px-4 py-2">Qty Returning</th>
                        <th className="px-4 py-2">Condition</th>
                        <th className="px-4 py-2">Return to Inventory</th>
                        <th className="px-4 py-2">Refund Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnItems.map((item, index) => {
                        const product = getProductDetails(item.productId);
                        return (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-3">{product?.name || `Product #${item.productId}`}</td>
                            <td className="px-4 py-3">{item.serialNumber || 'N/A'}</td>
                            <td className="px-4 py-3">₱{item.price.toLocaleString()}</td>
                            <td className="px-4 py-3">{item.quantity}</td>
                            <td className="px-4 py-3">
                              <Input
                                type="number"
                                min={1}
                                max={item.quantity}
                                value={item.returnedQuantity}
                                onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                                className="w-20"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Select 
                                value={item.condition} 
                                onValueChange={(value) => handleConditionChange(index, value)}
                              >
                                <SelectTrigger className="w-[150px]">
                                  <SelectValue placeholder="Condition" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="good">Good</SelectItem>
                                  <SelectItem value="open_box">Open Box</SelectItem>
                                  <SelectItem value="damaged">Damaged</SelectItem>
                                  <SelectItem value="defective">Defective</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={item.returnToInventory}
                                  onCheckedChange={(checked) => handleReturnToInventoryChange(index, checked)}
                                />
                                <Label>{item.returnToInventory ? "Yes" : "No"}</Label>
                              </div>
                            </td>
                            <td className="px-4 py-3">₱{item.refundAmount.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/50">
                        <td colSpan={7} className="px-4 py-2 text-right font-medium">Total Refund:</td>
                        <td className="px-4 py-2 font-bold">
                          ₱{returnItems.reduce((sum, item) => sum + item.refundAmount, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional notes about this return..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Process Return
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 