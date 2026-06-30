import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/utils/cn";

import {
  buttonClassName,
  type ButtonSize,
  type ButtonVariant,
} from "@/lib/styles/button";

type ButtonOwnProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string;
};

type ButtonAsButton = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<"button">, keyof ButtonOwnProps> & {
    href?: undefined;
  };

type ButtonAsLink = ButtonOwnProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, keyof ButtonOwnProps> & {
    href: string;
  };

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export default function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  children,
  ...rest
}: ButtonProps) {
  const classes = buttonClassName(variant, size, className);

  if (href) {
    const linkRest = rest as Omit<
      ComponentPropsWithoutRef<typeof Link>,
      keyof ButtonOwnProps
    >;
    return (
      <Link href={href} className={classes} {...linkRest}>
        {children}
      </Link>
    );
  }

  const { type = "button", ...buttonRest } =
    rest as ComponentPropsWithoutRef<"button">;

  return (
    <button type={type} className={classes} {...buttonRest}>
      {children}
    </button>
  );
}

/** Submit button with primary block styling (auth forms). */
export function SubmitButton({
  className,
  children,
  ...rest
}: Omit<ComponentPropsWithoutRef<"button">, "type"> & { className?: string }) {
  return (
    <button
      type="submit"
      className={cn(
        buttonClassName("primary", "block", "mt-2 border-0"),
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
