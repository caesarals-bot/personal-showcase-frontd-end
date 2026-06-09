interface BlogInfoBarProps {
    location?: string;
    degree?: string;
    publishedCount: number;
}

export function BlogInfoBar({
    location = 'Santiago, Chile',
    degree = 'Ingeniería en Informática',
    publishedCount = 0,
}: BlogInfoBarProps) {
    return (
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-semibold tracking-widest uppercase text-foreground/40 border-t border-foreground/10">
            <span>{location} · {degree}</span>
            <span>{publishedCount} artículos publicados</span>
        </div>
    );
}