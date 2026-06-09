"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { BlogTopBar } from "./BlogTopBar";
import { BlogDateBar } from "./BlogDateBar";
import { BlogCategoryNav } from "./BlogCategoryNav";
import { BlogInfoBar } from "./BlogInfoBar";
import { EditorPanel } from "./EditorPanel";

interface Category {
    id: string;
    label: string;
}

interface BlogHeaderProps {
    categories: Category[];
    publishedCount: number;
    location?: string;
    degree?: string;
}

export function BlogHeader({
    categories,
    publishedCount,
    location = "Santiago, Chile",
    degree = "Ingeniería en Informática",
}: BlogHeaderProps) {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsPanelOpen((prev) => !prev);
    };

    const blogCategories = categories.length > 0
        ? categories
        : [
              { id: "portada", label: "PORTADA" },
              { id: "web", label: "DESARROLLO WEB" },
              { id: "ia", label: "IA & AGENTES" },
              { id: "devops", label: "DEVOPS" },
              { id: "portfolio", label: "PORTFOLIO" },
          ];

    return (
        <>
            <header className="border-b border-foreground/15">
                <BlogTopBar isPanelOpen={isPanelOpen} onTogglePanel={togglePanel} />
                <BlogDateBar location={location} />
                <BlogCategoryNav categories={blogCategories} />
                <BlogInfoBar
                    location={location}
                    degree={degree}
                    publishedCount={publishedCount}
                />
            </header>

            <AnimatePresence>
                {isPanelOpen && <EditorPanel isOpen={isPanelOpen} />}
            </AnimatePresence>
        </>
    );
}