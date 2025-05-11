'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Product, ProductVariantOption, ProductWithVariants } from '@/lib/models/Product';

interface ProductVariantManagerProps {
  baseProduct: Product;
  onSaveVariants: (baseProduct: ProductWithVariants) => void;
  existingVariants?: Product[];
}

export default function ProductVariantManager({
  baseProduct,
  onSaveVariants,
  existingVariants = [],
}: ProductVariantManagerProps) {
  // Available variant types and their options
  const variantTypes = [
    { id: 'color', name: 'Color', options: ['Black', 'White', 'Silver', 'Gold', 'Blue', 'Red', 'Green', 'Purple', 'Other'] },
    { id: 'storage', name: 'Storage', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB', 'N/A'] },
    { id: 'size', name: 'Size', options: ['Small', 'Medium', 'Large', 'XL', 'XXL', 'N/A'] },
    { id: 'memory', name: 'Memory', options: ['4GB', '8GB', '16GB', '32GB', '64GB', 'N/A'] },
  ];

  // State for selected variant types
  const [selectedVariantTypes, setSelectedVariantTypes] = useState<string[]>(
    existingVariants.length > 0 
      ? [...new Set(existingVariants.map(v => v.variantType || ''))]
      : []
  );

  // State for all product variants
  const [variants, setVariants] = useState<Product[]>(
    existingVariants.length > 0 
      ? existingVariants 
      : []
  );
  
  // Add a variant type
  const addVariantType = (type: string) => {
    if (!selectedVariantTypes.includes(type)) {
      setSelectedVariantTypes([...selectedVariantTypes, type]);
    }
  };

  // Remove a variant type
  const removeVariantType = (type: string) => {
    const updatedTypes = selectedVariantTypes.filter(t => t !== type);
    setSelectedVariantTypes(updatedTypes);
    
    // Also remove any variants that were using this type
    const updatedVariants = variants.filter(v => v.variantType !== type);
    setVariants(updatedVariants);
  };

  // Add a new variant
  const addVariant = (type: string, value: string) => {
    // Generate a variant name based on base product and variant
    const variantName = `${baseProduct.name} - ${value}`;
    
    // Create a new variant based on the base product
    const newVariant: Product = {
      ...baseProduct,
      id: Date.now(), // Temporary ID, will be replaced when saved to DB
      baseProductId: baseProduct.id,
      isBaseProduct: false,
      variantType: type,
      variantValue: value,
      variantName: variantName,
      name: variantName, // Set the name to the variant name
      [type]: value, // Also set the actual attribute (e.g., color: 'Blue')
    };
    
    setVariants([...variants, newVariant]);
    toast.success(`Added variant: ${variantName}`);
  };

  // Remove a variant
  const removeVariant = (variantId: number) => {
    const updatedVariants = variants.filter(v => v.id !== variantId);
    setVariants(updatedVariants);
    toast.success('Variant removed');
  };

  // Update variant details
  const updateVariant = (variantId: number, field: keyof Product, value: any) => {
    const updatedVariants = variants.map(variant => {
      if (variant.id === variantId) {
        return { ...variant, [field]: value };
      }
      return variant;
    });
    setVariants(updatedVariants);
  };

  // Save all variants
  const saveVariants = () => {
    // Prepare the base product with variant information
    const productWithVariants: ProductWithVariants = {
      ...baseProduct,
      isBaseProduct: true,
      variants: variants,
      variantOptions: selectedVariantTypes.map(type => {
        // Get all unique values for this variant type
        const values = [...new Set(variants
          .filter(v => v.variantType === type)
          .map(v => v.variantValue || ''))];
        
        return { type, values };
      })
    };
    
    onSaveVariants(productWithVariants);
    toast.success('Product variants saved');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Product Variants for {baseProduct.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Create and manage different variations of this product
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Variant Types Selector */}
          <div className="space-y-2">
            <Label>Variant Types</Label>
            <div className="flex flex-wrap gap-2 pb-2">
              {selectedVariantTypes.map(type => (
                <Badge key={type} variant="outline" className="flex gap-1 items-center px-3 py-1">
                  {type}
                  <button onClick={() => removeVariantType(type)} className="ml-1 text-destructive hover:bg-destructive/10 rounded-full">
                    <Trash2 size={14} />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={(value) => addVariantType(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Add variant type" />
                </SelectTrigger>
                <SelectContent>
                  {variantTypes.map(type => (
                    <SelectItem 
                      key={type.id} 
                      value={type.id}
                      disabled={selectedVariantTypes.includes(type.id)}
                    >
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Variant Creator */}
          {selectedVariantTypes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Add Variants</h3>
              
              {selectedVariantTypes.map(type => {
                const variantType = variantTypes.find(t => t.id === type);
                if (!variantType) return null;
                
                return (
                  <div key={type} className="space-y-2">
                    <Label>{variantType.name} Options</Label>
                    <div className="flex flex-wrap gap-2">
                      {variantType.options.map(option => {
                        // Check if this variant already exists
                        const exists = variants.some(
                          v => v.variantType === type && v.variantValue === option
                        );
                        
                        return (
                          <Button
                            key={option}
                            type="button"
                            variant={exists ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => addVariant(type, option)}
                            disabled={exists}
                          >
                            {option} {exists && '✓'}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Variants Table */}
          {variants.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Current Variants</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Variant</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map(variant => (
                      <TableRow key={variant.id}>
                        <TableCell>
                          <div className="font-medium">{variant.variantName}</div>
                          <div className="text-sm text-muted-foreground">
                            {variant.variantType}: {variant.variantValue}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.price || baseProduct.price}
                            onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={variant.quantity || 0}
                            onChange={(e) => updateVariant(variant.id, 'quantity', parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={variant.sku || ''}
                            onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                            className="w-24"
                            placeholder="SKU"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeVariant(variant.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="default"
              onClick={saveVariants}
              disabled={variants.length === 0}
              className="gap-2"
            >
              <Save size={16} />
              Save All Variants
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 