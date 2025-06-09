'use client';

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { usePathname } from "next/navigation"

export function SearchBar() {
  const pathname = usePathname();
  
  // Determine placeholder based on current path
  const getPlaceholder = () => {
    if (pathname.includes('/inventory')) return "Search inventory...";
    if (pathname.includes('/customers')) return "Search customers...";
    if (pathname.includes('/sales')) return "Search sales...";
    if (pathname.includes('/returns')) return "Search returns...";
    return "Search..."; // Default placeholder
  };
  
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder={getPlaceholder()}
        className="w-full pl-8"
      />
    </div>
  )
} 