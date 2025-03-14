"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FilterSortProps {
  onSortChange: (option: string) => void
  onCategoryChange: (category: string) => void
  sortOption: string
  categoryFilter: string
}

// Predefined categories
const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "Theft", label: "Theft" },
  { value: "Assault", label: "Assault" },
  { value: "Fraud", label: "Fraud" },
  { value: "Drug Offense", label: "Drug Offense" },
  { value: "Homicide", label: "Homicide" },
  { value: "Other", label: "Other" },
]

// Sort options
const SORT_OPTIONS = [
  { value: "nameAsc", label: "Name (A-Z)" },
  { value: "nameDesc", label: "Name (Z-A)" },
  { value: "dateAsc", label: "Date (Oldest first)" },
  { value: "dateDesc", label: "Date (Newest first)" },
]

export default function FilterSort({ onSortChange, onCategoryChange, sortOption, categoryFilter }: FilterSortProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="w-full sm:w-1/2">
        <Label htmlFor="category-filter" className="mb-2 block">
          Filter by Category
        </Label>
        <Select value={categoryFilter} onValueChange={onCategoryChange}>
          <SelectTrigger id="category-filter">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-1/2">
        <Label htmlFor="sort-option" className="mb-2 block">
          Sort by
        </Label>
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger id="sort-option">
            <SelectValue placeholder="Select sort option" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

