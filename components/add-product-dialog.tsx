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
  onAdd: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
}

interface SerialItem {
  serialNumber: string
  barcode: string
}

export default function AddProductDialog({ open, onClose, onAdd }: AddProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serialNumber: '',
    quantity: 0,
    price: 0,
    cost: 0,
    minStockLevel: 5,
    brand: '',
    color: '',
    storage: '',
    condition: ''
  })

  const [hasMultipleSerials, setHasMultipleSerials] = useState(false)
  const [serialItems, setSerialItems] = useState<SerialItem[]>([{ serialNumber: "", barcode: "" }])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAdd(formData)
    setFormData({
      name: '',
      description: '',
      serialNumber: '',
      quantity: 0,
      price: 0,
      cost: 0,
      minStockLevel: 5,
      brand: '',
      color: '',
      storage: '',
      condition: ''
    })
    setHasMultipleSerials(false)
    setSerialItems([{ serialNumber: "", barcode: "" }])
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              value={formData.serialNumber}
              onChange={(e) => handleChange("serialNumber", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleChange("quantity", parseInt(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="minStockLevel">Low Stock Threshold</Label>
              <Input
                id="minStockLevel"
                type="number"
                min="0"
                value={formData.minStockLevel}
                onChange={(e) => handleChange("minStockLevel", parseInt(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange("price", parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => handleChange("cost", parseFloat(e.target.value))}
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="brand">Brand/Vendor</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleChange("brand", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleChange("color", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storage">Storage</Label>
              <Input
                id="storage"
                value={formData.storage}
                onChange={(e) => handleChange("storage", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                value={formData.condition}
                onChange={(e) => handleChange("condition", e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Add Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
