import type { ReactNode } from "react";

import Input from "@/components/shared/atoms/Input";
import Label from "@/components/shared/atoms/Label";
import { adminSearchInputClass } from "@/lib/styles/tagsPage";

type SearchFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

/** Labelled search input — admin user/deck lists. */
export default function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: SearchFieldProps) {
  return (
    <Label variant="search" htmlFor={id} className={className}>
      {label}
      <Input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={adminSearchInputClass}
      />
    </Label>
  );
}
