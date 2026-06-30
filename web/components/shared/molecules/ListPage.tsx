import type { ReactNode } from "react";

import PageHeader from "@/components/shared/molecules/PageHeader";
import { cn } from "@/utils/cn";
import { tagsPageClass, tagsPageIntroClass } from "@/lib/styles/tagsPage";

type ListPageProps = {
  title: ReactNode;
  intro?: ReactNode;
  actionHref?: string;
  actionLabel?: string;
  action?: ReactNode;
  titleClassName?: string;
  className?: string;
  children: ReactNode;
};

/** Standard list/admin page shell: constrained width, header, optional intro. */
export default function ListPage({
  title,
  intro,
  actionHref,
  actionLabel,
  action,
  titleClassName,
  className,
  children,
}: ListPageProps) {
  return (
    <div className={cn(tagsPageClass, className)}>
      <PageHeader
        title={title}
        titleClassName={titleClassName}
        actionHref={actionHref}
        actionLabel={actionLabel}
        action={action}
      />
      {intro ? <p className={tagsPageIntroClass}>{intro}</p> : null}
      {children}
    </div>
  );
}
