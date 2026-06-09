interface BlogDateBarProps {
    location?: string;
}

export function BlogDateBar({ location = 'Santiago, Chile' }: BlogDateBarProps) {
    const today = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-semibold tracking-widest uppercase text-foreground/40 border-t border-foreground/10">
            <span className="capitalize">{today} · {location}</span>
            <span>Desarrollo Web · IA · DevOps</span>
        </div>
    );
}