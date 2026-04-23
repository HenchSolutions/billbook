"use client";

import { useParams } from "next/navigation";
import { RoleGroupEditor } from "@/components/role-groups/RoleGroupEditor";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";

export default function EditRoleGroupPage() {
  const params = useParams<{ roleGroupId?: string }>();
  const raw = params?.roleGroupId;
  const idStr = Array.isArray(raw) ? raw[0] : raw;
  const roleGroupId = idStr && /^\d+$/.test(idStr) ? Number(idStr) : undefined;

  const { can } = usePermissions();
  if (!can(PAGE.role_groups) && !can(PAGE.role_groups_manage)) {
    return <AccessDeniedPage homeHref="/settings/role-groups" />;
  }

  if (roleGroupId === undefined) {
    return (
      <div className="page-container animate-fade-in">
        <p className="text-sm text-muted-foreground">Invalid role group.</p>
      </div>
    );
  }

  return <RoleGroupEditor roleGroupId={roleGroupId} />;
}
