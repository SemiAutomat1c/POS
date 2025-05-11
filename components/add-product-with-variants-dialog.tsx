'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Product, ProductWithVariants } from '@/lib/models/Product';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import ProductVariantManager from './product-variant-manager';

interface AddProductWithVariantsDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (product: ProductWithVariants) => void;
}

export default function AddProductWithVariantsDialog({
  open,
  onClose,
  onAdd,
}: AddProductWithVariantsDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<Product>({
    id: Date.now(), // Temporary ID for the base product
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    categoryId: 0,
    brand: '',
    sku: '',
    barcode: '',
    color: '',
    storage: '',
    condition: 'new',
    lowStockThreshold: 5,
    isBaseProduct: true,
  });

  const [hasVariants, setHasVariants] = useState(false);

  const handleChange = (field: keyof Product, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleBasicInfoSubmit = () => {
    if (!formData.name || typeof formData.price !== 'number' || formData.price <= 0) {
      toast.error('Product name and price are required');
      return;
    }

    // If product has variants, switch to the variants tab
    if (hasVariants) {
      setActiveTab('variants');
    } else {
      // Otherwise, submit the product directly
      handleSubmit(formData as ProductWithVariants);
    }
  };

  const handleSaveVariants = (productWithVariants: ProductWithVariants) => {
    handleSubmit(productWithVariants);
  };

  const handleSubmit = (product: ProductWithVariants) => {
    onAdd(product);
    resetForm();
    toast.success('Product added successfully!');
  };

  const resetForm = () => {
    setFormData({
      id: Date.now(),
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      categoryId: 0,
      brand: '',
      sku: '',
      barcode: '',
      color: '',
      storage: '',
      condition: 'new',
      lowStockThreshold: 5,
      isBaseProduct: true,
    });
    setHasVariants(false);
    setActiveTab('basic');
  };

  const categories = [
    'Phones',
    'Laptops',
    'Tablets',
    'Accessories',
    'Speakers',
    'Printers',
    'Networking',
    'Storage',
    'Other',
  ];

  const vendors = ['Apple', 'Samsung', 'HP', 'Dell', 'JBL', 'Sony', 'Other'];

  const colors = ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Other'];

  const storageOptions = ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', 'N/A'];

  const conditions = [
    { value: 'new', label: 'Brand New' },
    { value: 'pre-owned', label: 'Pre-Owned' },
    { value: 'refurbished', label: 'Refurbished' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="variants" disabled={!hasVariants || !formData.name}>
              Product Variants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter product name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter product description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.categoryId?.toString() || ''}
                      onValueChange={(value) => handleChange('categoryId', parseInt(value) || 0)}
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
                      value={formData.brand?.toString() || ''}
                      onValueChange={(value) => handleChange('brand', value)}
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Selling Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cost">Cost Price</Label>
                    <Input
                      id="cost"
                      type="number"
                      placeholder="0.00"
                      value={formData.cost || 0}
                      onChange={(e) => handleChange('cost', parseFloat(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      placeholder="Enter SKU"
                      value={formData.sku || ''}
                      onChange={(e) => handleChange('sku', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      placeholder="Enter barcode"
                      value={formData.barcode || ''}
                      onChange={(e) => handleChange('barcode', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      placeholder="5"
                      value={formData.lowStockThreshold || 5}
                      onChange={(e) =>
                        handleChange('lowStockThreshold', parseInt(e.target.value))
                      }
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Initial Stock Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="0"
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', parseInt(e.target.value))}
                      disabled={hasVariants} // Disable if using variants
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="hasVariants"
                      checked={hasVariants}
                      onCheckedChange={(checked) => setHasVariants(!!checked)}
                    />
                    <label
                      htmlFor="hasVariants"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      This product has variants (color, storage, etc.)
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={handleBasicInfoSubmit}>
                  {hasVariants ? 'Continue to Variants' : 'Add Product'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="variants" className="mt-4">
            <ProductVariantManager
              baseProduct={formData}
              onSaveVariants={handleSaveVariants}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 