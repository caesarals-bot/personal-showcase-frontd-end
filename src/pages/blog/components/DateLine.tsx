import { Clock } from 'lucide-react';

interface DateLineProps {
    date: string;
    readTime: string;
}

export function DateLine({ date, readTime }: DateLineProps) {
    return (
        <span className="text-xs text-foreground/50 tracking-wide uppercase">
            {date}&nbsp;·&nbsp;<Clock className="inline w-3 h-3 mb-0.5" />&nbsp;{readTime} MIN
        </span>
    );
}