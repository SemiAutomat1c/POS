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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { modifyReturn } from "@/store/slices/returnSlice";
import { fetchSaleById } from "@/store/slices/saleSlice";
import { Return, ReturnStatus } from "@/lib/models/Return";
import { Sale } from "@/lib/models/Sale";

type Props = {
  returnData: Return;
  open: boolean;
  onClose: () => void;
};

export default function ReturnDetails({ returnData, open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { items: products } = useAppSelector((state) => state.products);
  const { toast } = useToast();
  
  const [return_, setReturn] = useState<Return>(returnData);
  const [originalSale, setOriginalSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadSaleData = async () => {
      if (returnData.originalSaleId) {
        try {
          const action = await dispatch(fetchSaleById(returnData.originalSaleId)).unwrap();
          setOriginalSale(action);
        } catch (error) {
          console.error("Failed to load sale:", error);
        }
      }
    };
    
    loadSaleData();
  }, [dispatch, returnData.originalSaleId]);
  
  // Helper function to format dates
  const formatDate = (date: Date | string) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: ReturnStatus) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500">Pending</Badge>;
      case 'approved':
        return <Badge className="bg-blue-500/10 text-blue-500">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/10 text-green-500">Completed</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/10 text-red-500">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>;
    }
  };
  
  // Helper function to get return type badge
  const getReturnTypeBadge = (type: string) => {
    switch (type) {
      case 'refund':
        return <Badge className="bg-green-500/10 text-green-500">Refund</Badge>;
      case 'exchange':
        return <Badge className="bg-blue-500/10 text-blue-500">Exchange</Badge>;
      case 'store_credit':
        return <Badge className="bg-purple-500/10 text-purple-500">Store Credit</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500">Unknown</Badge>;
    }
  };
  
  // Get product details 
  const getProductDetails = (productId: number) => {
    return products.find(p => p.id === productId);
  };
  
  // Handle status change
  const handleStatusChange = async (newStatus: ReturnStatus) => {
    setLoading(true);
    try {
      // Create updated return object
      const updatedReturn: Return = {
        ...return_,
        status: newStatus,
        updatedAt: new Date().toISOString()
      };
      
      // Update in database
      await dispatch(modifyReturn(updatedReturn)).unwrap();
      
      // Update local state
      setReturn(updatedReturn);
      
      toast({
        title: "Status Updated",
        description: `Return #${return_.id} status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update return status:", error);
      toast({
        title: "Error",
        description: "Failed to update return status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Return Details #{return_.id}</DialogTitle>
          <DialogDescription>
            View and manage return information
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Return Date</h3>
            <p>{formatDate(return_.returnDate)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <div className="flex items-center gap-2">
              {getStatusBadge(return_.status)}
              
              {/* Status change dropdown for staff */}
              {return_.status !== 'completed' && (
                <Select 
                  value={return_.status} 
                  onValueChange={(value) => handleStatusChange(value as ReturnStatus)}
                  disabled={loading}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Change status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Original Sale</h3>
            <p>Sale #{return_.originalSaleId} on {originalSale?.date 
                ? formatDate(originalSale.date) 
                : 'Unknown date'}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Return Type</h3>
            <p>{getReturnTypeBadge(return_.returnType)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Customer</h3>
            <p>{return_.customerId ? `Customer #${return_.customerId}` : 'Walk-in customer'}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Total Refund</h3>
            <p className="font-bold">₱{return_.refundAmount.toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Refund Method</h3>
            <p>{return_.refundMethod.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium">Return Reason</h3>
            <p>{return_.reason.replace('_', ' ').split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </p>
          </div>
        </div>
        
        {return_.reasonDetails && (
          <div>
            <h3 className="text-sm font-medium">Additional Details</h3>
            <p className="text-muted-foreground">{return_.reasonDetails}</p>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div>
          <h3 className="font-medium mb-2">Returned Items</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Serial/IMEI</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>To Inventory</TableHead>
                <TableHead>Refund Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {return_.items.map((item, index) => {
                const product = getProductDetails(item.productId);
                return (
                  <TableRow key={index}>
                    <TableCell>{product?.name || `Product #${item.productId}`}</TableCell>
                    <TableCell>{item.serialNumber || 'N/A'}</TableCell>
                    <TableCell>₱{item.price.toLocaleString()}</TableCell>
                    <TableCell>{item.returnedQuantity}</TableCell>
                    <TableCell>
                      <Badge className={
                        item.condition === 'good' ? 'bg-green-500/10 text-green-500' : 
                        item.condition === 'open_box' ? 'bg-blue-500/10 text-blue-500' :
                        item.condition === 'damaged' ? 'bg-orange-500/10 text-orange-500' :
                        'bg-red-500/10 text-red-500'
                      }>
                        {item.condition.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.returnToInventory ? 'Yes' : 'No'}</TableCell>
                    <TableCell>₱{item.refundAmount.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <tfoot>
              <tr>
                <td colSpan={6} className="text-right font-medium pr-4 py-2">Total Refund:</td>
                <td className="py-2 font-bold">₱{return_.refundAmount.toLocaleString()}</td>
              </tr>
            </tfoot>
          </Table>
        </div>
        
        {return_.storeCredit && (
          <>
            <Separator className="my-4" />
            <div>
              <h3 className="font-medium mb-2">Store Credit Issued</h3>
              <div className="grid grid-cols-2 gap-4 p-4 border rounded-md bg-muted/20">
                <div>
                  <h4 className="text-sm font-medium">Reference Code</h4>
                  <p>{return_.storeCredit.referenceCode}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Amount</h4>
                  <p className="font-bold">₱{return_.storeCredit.amount.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <Badge className={
                    return_.storeCredit.status === 'active' ? 'bg-green-500/10 text-green-500' : 
                    return_.storeCredit.status === 'used' ? 'bg-blue-500/10 text-blue-500' :
                    'bg-gray-500/10 text-gray-500'
                  }>
                    {return_.storeCredit.status.charAt(0).toUpperCase() + return_.storeCredit.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Expiry Date</h4>
                  <p>{return_.storeCredit.expiryDate ? formatDate(return_.storeCredit.expiryDate) : 'No expiry'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Current Balance</h4>
                  <p>₱{return_.storeCredit.balance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {return_.notes && (
          <div>
            <h3 className="text-sm font-medium">Notes</h3>
            <p className="text-muted-foreground">{return_.notes}</p>
          </div>
        )}
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {return_.status === 'pending' && (
            <>
              <Button 
                variant="destructive" 
                onClick={() => handleStatusChange('rejected')}
                disabled={loading}
              >
                Reject Return
              </Button>
              <Button 
                onClick={() => handleStatusChange('approved')}
                disabled={loading}
              >
                Approve Return
              </Button>
            </>
          )}
          {return_.status === 'approved' && (
            <Button 
              onClick={() => handleStatusChange('completed')}
              disabled={loading}
            >
              Mark as Completed
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 