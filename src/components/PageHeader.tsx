import { memo, type ReactNode } from "react";
import { PageBackLink } from "@/components/PageBackLink";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  /** Renders above the title row, left-aligned (same position as `PageBackLink` on detail pages). */
  backHref?: string;
  backLabel?: string;
}

const PageHeader = memo(function PageHeader({
  title,
  description,
  action,
  backHref,
  backLabel,
}: PageHeaderProps) {
  const back =
    backHref && backLabel ? <PageBackLink href={backHref}>{backLabel}</PageBackLink> : null;

  if (action) {
    return (
      <>
        {back}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="page-header mb-0">
            <h1 className="page-title bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {title}
            </h1>
            {description && <p className="page-description">{description}</p>}
          </div>
          <div className="shrink-0">{action}</div>
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <div className="page-header">
        <h1 className="page-title bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
          {title}
        </h1>
        {description && <p className="page-description">{description}</p>}
      </div>
    </>
  );
});

export default PageHeader;
