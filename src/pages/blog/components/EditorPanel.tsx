"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CategoryBadge } from "./CategoryBadge";

interface EditorPanelProps {
    isOpen: boolean;
}

export function EditorPanel(_props: EditorPanelProps) {
    const authorName = "César Londoño";
    const authorFullName = "César Londoño Sánchez";
    const authorTitle = "Full Stack Developer";
    const authorLocation = "Santiago, Chile";
    const authorBio = "Desarrollador autodidacta especializado en React, TypeScript y Supabase. Comparto lo que aprendo construyendo productos reales: desde arquitecturas SaaS multi-tenant hasta agentes de IA autónomos.";
    const authorDegree = "Ingeniería en Informática - IACC";
    const authorAvatar = "/mia (1).png";
    const githubUrl = "https://github.com/caesarals-bot";
    const linkedinUrl = "https://linkedin.com/in/caesarals";
    const portfolioUrl = "https://caesarals.dev";
    const stack = ["React 19", "TypeScript", "Supabase", "TailwindCSS", "Framer Motion"];

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="border-b border-foreground/15 bg-background overflow-hidden"
        >
            <div className="max-w-5xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16 border-2 border-foreground/10">
                            <AvatarImage src={authorAvatar} alt={authorName} />
                            <AvatarFallback className="bg-foreground/5 text-foreground/70 font-bold">
                                {getInitials(authorName)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                            <h3 className="text-lg font-black tracking-tight text-foreground">
                                {authorFullName}
                            </h3>
                            <p className="text-xs text-foreground/60 font-medium tracking-wide">
                                {authorTitle} · {authorLocation}
                            </p>
                            <p className="mt-2 text-sm text-foreground/70 leading-relaxed">
                                "{authorBio}"
                            </p>
                            <p className="mt-2 text-[10px] font-semibold tracking-widest uppercase text-foreground/40">
                                {authorDegree}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <p className="text-[10px] font-bold tracking-widest uppercase text-foreground/40 mb-3">
                                Stack
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {stack.map((tech) => (
                                    <CategoryBadge key={tech} variant="outline">
                                        {tech}
                                    </CategoryBadge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                <span>GitHub</span>
                            </a>
                            <a
                                href={linkedinUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors"
                            >
                                <Linkedin className="w-4 h-4" />
                                <span>LinkedIn</span>
                            </a>
                            <a
                                href={portfolioUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-foreground/60 hover:text-foreground transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span>Portfolio</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}