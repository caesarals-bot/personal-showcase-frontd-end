"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";

interface Category {
    id: string;
    label: string;
}

interface BlogCategoryNavProps {
    categories: Category[];
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
}

export function BlogCategoryNav({
    categories,
    searchTerm = "",
    onSearchChange
}: BlogCategoryNavProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "portada");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchChange) {
            onSearchChange(e.target.value);
        }
    };

    const handleCategoryClick = (catId: string) => {
        setActiveCategory(catId);
        setIsDropdownOpen(false);
    };

    const visibleCategories = categories.slice(0, 5);
    const dropdownCategories = categories.slice(5);

    return (
        <div className="max-w-5xl mx-auto px-4 border-t border-foreground/15">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-0 overflow-x-auto flex-1">
                    {visibleCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategoryClick(cat.id)}
                            className={`px-4 py-3 text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap border-b-2 ${
                                activeCategory === cat.id
                                    ? "border-foreground text-foreground"
                                    : "border-transparent text-foreground/45 hover:text-foreground/70"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}

                    {dropdownCategories.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="px-4 py-3 text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap border-b-2 border-transparent text-foreground/45 hover:text-foreground/70 flex items-center gap-1"
                            >
                                MÁS
                                <ChevronDown className={`h-3 w-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isDropdownOpen && (
                                <div className="absolute top-full left-0 bg-background border border-border shadow-lg z-50 min-w-[150px]">
                                    {dropdownCategories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleCategoryClick(cat.id)}
                                            className={`w-full text-left px-4 py-2 text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap ${
                                                activeCategory === cat.id
                                                    ? "bg-foreground text-background"
                                                    : "text-foreground/45 hover:bg-muted hover:text-foreground/70"
                                            }`}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="relative flex-shrink-0">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10 pr-3 py-2 text-xs bg-muted/50 border border-border rounded-md w-[150px] focus:w-[200px] focus:outline-none focus:border-foreground/30 transition-all duration-200"
                    />
                </div>
            </div>
        </div>
    );
}
