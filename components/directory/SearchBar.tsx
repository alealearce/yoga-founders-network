"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FILTER_CHIPS = [
  { label: "All",       value: "" },
  { label: "Studios",   value: "studio" },
  { label: "Teachers",  value: "teacher" },
  { label: "Schools",   value: "school" },
  { label: "Retreats",  value: "retreat" },
  { label: "Products",  value: "product" },
  { label: "Workshops", value: "workshop" },
];

interface SearchBarProps {
  initialQuery?:    string;
  initialType?:     string;
  onSearch?:        (query: string, type: string) => void;
  placeholder?:     string;
  showFilters?:     boolean;
  compact?:         boolean;
}

export default function SearchBar({
  initialQuery  = "",
  initialType   = "",
  onSearch,
  placeholder   = "Search studios, teachers, retreats...",
  showFilters   = true,
  compact       = false,
}: SearchBarProps) {
  const router   = useRouter();
  const [query,  setQuery]  = useState(initialQuery);
  const [type,   setType]   = useState(initialType);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (onSearch) {
        onSearch(query, type);
        return;
      }
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (type)  params.set("type", type);
      router.push(`/search?${params.toString()}`);
    },
    [query, type, onSearch, router]
  );

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        <div className={cn(
          "flex items-center gap-3 bg-surface-low rounded-full",
          compact ? "px-4 py-2" : "px-6 py-4"
        )}>
          <Search
            size={compact ? 16 : 20}
            className="text-on-surface-variant flex-shrink-0"
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent font-sans text-on-surface outline-none",
              "placeholder:text-on-surface-variant/50",
              compact ? "text-sm" : "text-base"
            )}
          />
          <button
            type="submit"
            className={cn(
              "flex-shrink-0 rounded-full font-sans font-semibold text-white",
              "transition-all duration-400 hover:opacity-90",
              compact ? "px-4 py-1.5 text-xs" : "px-6 py-2.5 text-sm"
            )}
            style={{ background: "linear-gradient(135deg, #536046 0%, #6b795d 100%)" }}
          >
            Search
          </button>
        </div>
      </form>

      {showFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {FILTER_CHIPS.map(chip => (
            <button
              key={chip.value}
              type="button"
              onClick={() => setType(chip.value)}
              className={cn(
                "px-4 py-1.5 rounded-full font-sans text-sm font-medium",
                "transition-all duration-300",
                type === chip.value
                  ? "bg-primary text-white"
                  : "bg-surface-low text-on-surface-variant hover:bg-secondary-container hover:text-primary"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
