"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Moon, Sun, Github, Linkedin, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import Logo from "@/shared/components/Logo";

interface BlogTopBarProps {
    isPanelOpen: boolean;
    onTogglePanel: () => void;
}

export function BlogTopBar({ isPanelOpen, onTogglePanel }: BlogTopBarProps) {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between py-4 gap-4">
            <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center">
                    <Logo align="left" width={72} height={54} />
                </Link>
                <button
                    onClick={onTogglePanel}
                    className="text-foreground/40 hover:text-foreground transition-colors p-1"
                    aria-label="Toggle editor info"
                >
                    <motion.span
                        animate={{ rotate: isPanelOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.span>
                </button>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-[11px] font-semibold tracking-widest uppercase text-foreground/60">
                <Link to="/blog" className="hover:text-foreground transition-colors">
                    Blog
                </Link>
                <Link to="/portfolio" className="hover:text-foreground transition-colors">
                    Portfolio
                </Link>
                <Link to="/about" className="hover:text-foreground transition-colors">
                    Sobre mí
                </Link>
                <Link to="/contactame" className="hover:text-foreground transition-colors">
                    Contáctame
                </Link>
            </nav>

            <div className="flex items-center gap-3">
                <a
                    href="https://github.com/caesarals-bot"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/40 hover:text-foreground transition-colors"
                    aria-label="GitHub"
                >
                    <Github className="w-4 h-4" />
                </a>
                <a
                    href="https://linkedin.com/in/caesarals"
                    target="_blank"
                    rel="noreferrer"
                    className="text-foreground/40 hover:text-foreground transition-colors"
                    aria-label="LinkedIn"
                >
                    <Linkedin className="w-4 h-4" />
                </a>
                <button
                    onClick={toggleTheme}
                    className="text-foreground/40 hover:text-foreground transition-colors"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? (
                        <Sun className="w-4 h-4" />
                    ) : (
                        <Moon className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
}