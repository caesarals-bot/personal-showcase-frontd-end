"use client";

import { useState } from "react";

interface Category {
    id: string;
    label: string;
}

interface BlogCategoryNavProps {
    categories: Category[];
}

export function BlogCategoryNav({ categories }: BlogCategoryNavProps) {
    const [activeCategory, setActiveCategory] = useState(categories[0]?.id || "portada");

    return (
        <div className="max-w-5xl mx-auto px-4 border-t border-foreground/15">
            <div className="flex items-center gap-0 overflow-x-auto">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-3 text-[11px] font-bold tracking-widest uppercase transition-colors whitespace-nowrap border-b-2 ${
                            activeCategory === cat.id
                                ? "border-foreground text-foreground"
                                : "border-transparent text-foreground/45 hover:text-foreground/70"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>
        </div>
    );
}