type Size = "xs" | "sm" | "md" | "lg" | "xl";
type Variant = "full" | "mark" | "wordmark";

const sizes: Record<Size, { mark: string; letter: string; name: string; sub: string; gap: string }> = {
  xs: { mark: "h-6 w-6 rounded-lg",  letter: "text-[11px]", name: "text-sm",  sub: "text-[8px]",  gap: "gap-1.5" },
  sm: { mark: "h-8 w-8 rounded-xl",  letter: "text-sm",     name: "text-base", sub: "text-[9px]",  gap: "gap-2"   },
  md: { mark: "h-9 w-9 rounded-xl",  letter: "text-base",   name: "text-xl",  sub: "text-[10px]", gap: "gap-2.5" },
  lg: { mark: "h-11 w-11 rounded-xl",letter: "text-lg",     name: "text-2xl", sub: "text-xs",     gap: "gap-3"   },
  xl: { mark: "h-14 w-14 rounded-2xl",letter:"text-2xl",    name: "text-3xl", sub: "text-sm",     gap: "gap-4"   },
};

const GRAD = "linear-gradient(135deg, #4f7cff 0%, #38bdf8 100%)";

interface LogoProps {
  size?: Size;
  variant?: Variant;
  className?: string;
}

export default function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const s = sizes[size];

  const mark = (
    <span
      className={`${s.mark} flex shrink-0 flex-col items-center justify-center text-white shadow-card select-none`}
      style={{ backgroundImage: GRAD }}
      aria-hidden
    >
      <span className={`${s.letter} font-black leading-none tracking-tighter`}>N</span>
      <span className={`${s.sub} font-extrabold leading-none tracking-[0.2em] opacity-80 uppercase`}>Q</span>
    </span>
  );

  const wordmark = (
    <span className={`${s.name} font-extrabold tracking-tight leading-none select-none`}>
      <span
        style={{
          backgroundImage: GRAD,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        Narzza
      </span>
      <span className="text-ink"> Quest</span>
    </span>
  );

  if (variant === "mark") return <span className={className}>{mark}</span>;
  if (variant === "wordmark") return <span className={`flex items-center ${className}`}>{wordmark}</span>;

  return (
    <span className={`flex items-center ${s.gap} ${className}`}>
      {mark}
      {wordmark}
    </span>
  );
}
