import Link from "next/link";
import { clsx } from "@/lib/clsx";

type Variant = "primary" | "secondary";

function buttonClasses(
  variant: Variant,
  fullWidthMobile?: boolean,
  extra?: string
) {
  return clsx(
    "btn",
    variant === "primary" ? "btn-primary" : "btn-secondary",
    fullWidthMobile && "w-full sm:w-auto",
    extra
  );
}

type LinkButtonProps = {
  href: string;
  variant?: Variant;
  fullWidthMobile?: boolean;
  className?: string;
  children: React.ReactNode;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className">;

/** Link styled as a button. Label must say what happens. */
export function ButtonLink({
  href,
  variant = "primary",
  fullWidthMobile,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      className={buttonClasses(variant, fullWidthMobile, className)}
      {...rest}
    >
      {children}
    </Link>
  );
}

type NativeButtonProps = {
  variant?: Variant;
  fullWidthMobile?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

/** Native button. Label must say what happens. */
export function Button({
  variant = "primary",
  fullWidthMobile,
  className,
  children,
  ...rest
}: NativeButtonProps) {
  return (
    <button
      className={buttonClasses(variant, fullWidthMobile, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
