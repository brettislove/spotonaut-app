"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BUSINESS_TYPES_BY_CATEGORY,
  CATEGORIES,
} from "@/lib/constants/business-types";

interface BusinessTypeSelectNewProps {
  value?: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function BusinessTypeSelectNew({
  value,
  onValueChange,
  disabled = false,
}: BusinessTypeSelectNewProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [expandedCategories, setExpandedCategories] = React.useState<
    Record<string, boolean>
  >(() => Object.fromEntries(CATEGORIES.map((c) => [c, false])));

  // Normalize string for diacritics-insensitive comparison
  const normalize = (s: string) =>
    s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

  // Find the selected business type object
  const selectedBusinessType = React.useMemo(() => {
    if (!value) return null;
    for (const category of CATEGORIES) {
      const found = BUSINESS_TYPES_BY_CATEGORY[category].find(
        (business) => business.type === value,
      );
      if (found) return found;
    }
    return null;
  }, [value]);

  // Filter business types based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery) {
      return CATEGORIES.map((category) => ({
        category,
        types: BUSINESS_TYPES_BY_CATEGORY[category],
      }));
    }

    const normalizedQuery = normalize(searchQuery);
    return CATEGORIES.map((category) => ({
      category,
      types: BUSINESS_TYPES_BY_CATEGORY[category].filter((business) =>
        normalize(business.type).includes(normalizedQuery),
      ),
    })).filter((cat) => cat.types.length > 0);
  }, [searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  const handleSelect = (businessType: string) => {
    onValueChange(businessType);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border border-slate-600 bg-input/30 px-3 py-2 text-sm shadow-sm transition-colors",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            !value && "text-muted-foreground",
          )}
        >
          <span className="truncate">
            {selectedBusinessType
              ? selectedBusinessType.type
              : "Vyberte typ podnikání"}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popper-anchor-width) p-0"
        align="start"
        side="bottom"
        avoidCollisions={false}
      >
        <div className="flex items-center border-b p-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Hledat typ podnikání..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        <ScrollArea type="scroll" className="max-h-[300px]">
          {filteredCategories.length > 0 ? (
            <div className="p-1">
              {filteredCategories.map(({ category, types }) => (
                <div key={category}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between rounded-sm px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <span>{category}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 shrink-0 transition-transform",
                        (searchQuery || expandedCategories[category]) &&
                          "rotate-180",
                      )}
                    />
                  </button>
                  {(searchQuery || expandedCategories[category]) && (
                    <div className="ml-2">
                      {types.map((business) => (
                        <button
                          key={business.type}
                          type="button"
                          onClick={() => handleSelect(business.type)}
                          className={cn(
                            "flex w-full items-center rounded-sm px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                            value === business.type && "bg-accent",
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              value === business.type
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {business.type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Žádné výsledky nenalezeny.
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
