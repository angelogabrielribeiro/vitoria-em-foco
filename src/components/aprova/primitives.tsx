import { cva, type VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------- Action (botão tátil do design system) ---------------- */

export const actionVariants = cva(
  "inline-flex select-none items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight tactile ring-focus disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-glow)] hover:brightness-110",
        ember: "bg-accent text-accent-foreground shadow-[var(--shadow-ember)] hover:brightness-105",
        outline:
          "border border-border-strong bg-surface/60 text-foreground hover:border-primary/60 hover:bg-surface-2",
        ghost: "text-muted-foreground hover:bg-surface-2 hover:text-foreground",
        quiet: "bg-surface-2 text-foreground hover:bg-surface-3",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.95rem]",
        lg: "h-14 px-7 text-base",
        block: "h-14 w-full px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ActionProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    VariantProps<typeof actionVariants> {
  children?: ReactNode;
}

export function Action({ className, variant, size, children, ...props }: ActionProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.965 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={cn(actionVariants({ variant, size }), className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/* ---------------- Plate (superfície base) ---------------- */

export function Plate({
  className,
  children,
  interactive = false,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "plate p-5",
        interactive && "tactile hover:border-primary/50 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Tag ---------------- */

const tagVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em]",
  {
    variants: {
      tone: {
        neutral: "border-border-strong bg-surface-2 text-muted-foreground",
        primary: "border-primary/40 bg-primary/12 text-primary",
        accent: "border-accent/40 bg-accent/12 text-accent",
        ember: "border-ember/45 bg-ember/12 text-ember",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Tag({
  tone,
  children,
  className,
}: VariantProps<typeof tagVariants> & { children: ReactNode; className?: string }) {
  return <span className={cn(tagVariants({ tone }), className)}>{children}</span>;
}

/* ---------------- ProgressBar ---------------- */

export function ProgressBar({
  value,
  className,
  tone = "primary",
}: {
  value: number;
  className?: string;
  tone?: "primary" | "accent" | "ember";
}) {
  const fill =
    tone === "primary" ? "bg-primary" : tone === "accent" ? "bg-accent" : "bg-ember";
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-surface-3", className)}>
      <motion.div
        className={cn("h-full rounded-full", fill)}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}

/* ---------------- ProgressRing ---------------- */

export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  label,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sub?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          className="fill-none stroke-surface-3"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          strokeLinecap="round"
          className="fill-none stroke-primary"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - (c * Math.min(100, value)) / 100 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute text-center leading-none">
        <div className="font-display text-xl font-bold">{label}</div>
        {sub ? <div className="mt-1 font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground">{sub}</div> : null}
      </div>
    </div>
  );
}

/* ---------------- SelectRow (linha selecionável do fluxo) ---------------- */

export function SelectRow({
  title,
  subtitle,
  meta,
  selected,
  onClick,
  index = 0,
  icon,
}: {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  index?: number;
  icon?: ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border p-4 text-left tactile ring-focus",
        selected
          ? "border-primary/70 bg-primary/10 shadow-[var(--shadow-glow)]"
          : "border-border bg-card hover:border-border-strong hover:bg-surface-2",
      )}
    >
      {icon ? (
        <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-primary">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-display text-[1.02rem] font-semibold">{title}</span>
        {subtitle ? (
          <span className="mt-0.5 block truncate text-sm text-muted-foreground">{subtitle}</span>
        ) : null}
      </span>
      {meta ? <span className="shrink-0 text-right">{meta}</span> : null}
    </motion.button>
  );
}
