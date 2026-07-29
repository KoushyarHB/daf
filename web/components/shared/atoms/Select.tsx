import type { ComponentPropsWithoutRef } from "react";

import { formSelectClass } from "@/lib/styles/formControls";
import { cn } from "@/utils/cn";

type SelectProps = ComponentPropsWithoutRef<"select"> & {
  variant?: "default" | "modal";
};

const modalSelectClass =
  "rounded-md border border-daf-border-input bg-daf-white p-2 px-[0.6rem] font-inherit text-[0.95rem] font-normal cursor-pointer appearance-none bg-daf-select-chevron bg-[length:0.75rem] bg-[right_0.55rem_center] bg-no-repeat pr-8 focus:border-daf-head/55 focus:shadow-daf-focus focus:outline-none";

export default function Select({
  variant = "default",
  className,
  ...rest
}: SelectProps) {
  return (
    <select
      className={cn(
        variant === "modal" ? modalSelectClass : formSelectClass,
        className,
      )}
      {...rest}
    />
  );
}
