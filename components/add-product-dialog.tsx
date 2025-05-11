"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, RefreshCw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Product } from "@/types"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

interface AddProductDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (product: Partial<Product>) => void
}

interface SerialItem {
  serialNumber: string
  barcode: string
}

export default function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    description: "",
    category: "",
    serialNumber: "",
    stock: 0,
    price: 0,
    costPrice: 0,
    lowStockThreshold: 5,
    vendor: "",
    barcode: "",
    color: "",
    storage: "",
    condition: "new",
  })

  const [hasMultipleSerials, setHasMultipleSerials] = useState(false)
  const [serialItems, setSerialItems] = useState<SerialItem[]>([{ serialNumber: "", barcode: "" }])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || (typeof formData.price !== 'number' || formData.price <= 0)) {
      toast.error("Product name and price are required");
      return;
    }

    console.log("Form submission - current data:", formData);
    
    // If using multiple serials, set the stock to the number of serial items
    // and use the first serial/barcode as the main product's serial/barcode
    const productToAdd = {
      ...formData,
      stock: hasMultipleSerials ? serialItems.length : formData.stock,
      // Store the first serial/barcode in the main product fields (if they exist)
      serialNumber: hasMultipleSerials && serialItems.length > 0 && serialItems[0].serialNumber 
                    ? serialItems[0].serialNumber 
                    : formData.serialNumber || "",
      barcode: hasMultipleSerials && serialItems.length > 0 && serialItems[0].barcode
               ? serialItems[0].barcode 
               : formData.barcode || "",
      // Add the full list of serials as a JSON string in the specifications field
      specifications: hasMultipleSerials ? { serialItems: JSON.stringify(serialItems) } : formData.specifications,
    }
    
    console.log("Submitting product:", productToAdd);
    onAdd(productToAdd)
    
    // Reset form data after submit
    setFormData({
      name: "",
      description: "",
      category: "",
      serialNumber: "",
      stock: 0,
      price: 0,
      costPrice: 0,
      lowStockThreshold: 5,
      vendor: "",
      barcode: "",
      color: "",
      storage: "",
      condition: "new",
    })
    setHasMultipleSerials(false)
    setSerialItems([{ serialNumber: "", barcode: "" }])
    
    // Show success message
    toast.success("Product added successfully! Add another or close when done.")
  }

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSerialItem = () => {
    setSerialItems([...serialItems, { serialNumber: "", barcode: "" }])
  }

  const removeSerialItem = (index: number) => {
    const updated = [...serialItems]
    updated.splice(index, 1)
    setSerialItems(updated)
  }

  const updateSerialItem = (index: number, field: keyof SerialItem, value: string) => {
    const updated = [...serialItems]
    updated[index][field] = value
    setSerialItems(updated)
  }

  // Generate a placeholder serial number for pre-owned items
  const generatePlaceholderSerial = (index: number) => {
    const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const condition = formData.condition || "used";
    const placeholder = `PO-${condition.substring(0, 3).toUpperCase()}-${timestamp}-${randomPart}`;
    
    const updated = [...serialItems];
    updated[index].serialNumber = placeholder;
    setSerialItems(updated);
    
    toast.success("Generated placeholder serial number");
  }

  // Generate a placeholder barcode
  const generatePlaceholderBarcode = (index: number) => {
    // Generate a simple placeholder barcode (EAN-13 format with store identifier)
    const storeCode = "6789"; // Store identifier prefix
    const timestamp = Date.now().toString().slice(-8);
    const checkDigit = "0"; // Simplified - would normally calculate this
    const placeholder = `${storeCode}${timestamp}${checkDigit}`;
    
    const updated = [...serialItems];
    updated[index].barcode = placeholder;
    setSerialItems(updated);
    
    toast.success("Generated placeholder barcode");
  }

  const categories = [
    "Phones",
    "Laptops",
    "Tablets",
    "Accessories",
    "Speakers",
    "Printers",
    "Networking",
    "Storage",
    "Other",
  ]

  const vendors = ["Apple", "Samsung", "HP", "Dell", "JBL", "Sony", "Other"]
  
  const colors = ["Black", "White", "Silver", "Gold", "Blue", "Red", "Other"]
  
  const storageOptions = ["16GB", "32GB", "64GB", "128GB", "256GB", "512GB", "1TB", "2TB", "N/A"]
  
  const conditions = [
    { value: "new", label: "Brand New" },
    { value: "pre-owned", label: "Pre-Owned" },
    { value: "refurbished", label: "Refurbished" }
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Add products one by one or multiple at once. The form will reset after each addition.
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                placeholder="Enter product name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter product description"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange("category", value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category.toLowerCase()}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={formData.vendor}
                  onValueChange={(value) => handleChange("vendor", value)}
                >
                  <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor} value={vendor}>
                        {vendor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => handleChange("color", value)}
                >
                  <SelectTrigger id="color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storage">Storage</Label>
                <Select
                  value={formData.storage}
                  onValueChange={(value) => handleChange("storage", value)}
                >
                  <SelectTrigger id="storage">
                    <SelectValue placeholder="Select storage" />
                  </SelectTrigger>
                  <SelectContent>
                    {storageOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => handleChange("condition", value)}
                >
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasMultipleSerials" 
                checked={hasMultipleSerials} 
                onCheckedChange={(checked) => setHasMultipleSerials(checked === true)}
              />
              <Label htmlFor="hasMultipleSerials">Add individual stock items with unique identifiers</Label>
            </div>

            {!hasMultipleSerials ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="serialNumber">Serial/IMEI Number</Label>
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="serialNumber"
                        placeholder="Enter serial number"
                        value={formData.serialNumber}
                        onChange={(e) => handleChange("serialNumber", e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon"
                        title="Generate placeholder serial number"
                        onClick={() => handleChange("serialNumber", `PO-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="barcode">Barcode</Label>
                      <span className="text-xs text-muted-foreground">(Optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="barcode"
                        placeholder="Enter barcode"
                        value={formData.barcode}
                        onChange={(e) => handleChange("barcode", e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        title="Generate placeholder barcode"
                        onClick={() => handleChange("barcode", `6789${Date.now().toString().slice(-8)}0`)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Stock Items with Serial Numbers/Barcodes</Label>
                    <p className="text-xs text-muted-foreground">
                      {formData.condition === "pre-owned" || formData.condition === "refurbished" ? 
                        "Use generate button if original numbers are not available" :
                        "Enter unique identifiers for each item"}
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addSerialItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                
                <ScrollArea className="h-32 border rounded-md p-2">
                  {serialItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 mb-2">
                      <div className="flex gap-1">
                        <Input
                          placeholder="Serial/IMEI"
                          value={item.serialNumber}
                          onChange={(e) => updateSerialItem(index, "serialNumber", e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          title="Generate placeholder serial"
                          onClick={() => generatePlaceholderSerial(index)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        <Input
                          placeholder="Barcode"
                          value={item.barcode}
                          onChange={(e) => updateSerialItem(index, "barcode", e.target.value)}
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          title="Generate placeholder barcode"
                          onClick={() => generatePlaceholderBarcode(index)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        type="button"
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeSerialItem(index)}
                        disabled={serialItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => handleChange("price", Number(e.target.value))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={(e) => handleChange("costPrice", Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!hasMultipleSerials && (
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", Number(e.target.value))}
                    required
                  />
                </div>
              )}

              <div className={hasMultipleSerials ? "col-span-2" : ""}>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Alert</Label>
                  <Input
                    id="lowStockThreshold"
                    type="number"
                    placeholder="5"
                    value={formData.lowStockThreshold}
                    onChange={(e) => handleChange("lowStockThreshold", Number(e.target.value))}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Add & Continue
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                // Create and submit the form data
                const productToAdd = {
                  ...formData,
                  stock: hasMultipleSerials ? serialItems.length : formData.stock,
                  serialNumber: hasMultipleSerials && serialItems.length > 0 && serialItems[0].serialNumber 
                              ? serialItems[0].serialNumber 
                              : formData.serialNumber || "",
                  barcode: hasMultipleSerials && serialItems.length > 0 && serialItems[0].barcode
                         ? serialItems[0].barcode 
                         : formData.barcode || "",
                  specifications: hasMultipleSerials ? { serialItems: JSON.stringify(serialItems) } : formData.specifications,
                };
                
                onAdd(productToAdd);
                
                // Reset form data
                setFormData({
                  name: "",
                  description: "",
                  category: "",
                  serialNumber: "",
                  stock: 0,
                  price: 0,
                  costPrice: 0,
                  lowStockThreshold: 5,
                  vendor: "",
                  barcode: "",
                  color: "",
                  storage: "",
                  condition: "new",
                });
                setHasMultipleSerials(false);
                setSerialItems([{ serialNumber: "", barcode: "" }]);
                
                // Close the dialog
                onClose();
              }}
              variant="secondary"
            >
              Add & Close
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
