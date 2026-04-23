"use client";

import { RoleGroupEditor } from "@/components/role-groups/RoleGroupEditor";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";

export default function NewRoleGroupPage() {
  const { can } = usePermissions();
  if (!can(PAGE.role_groups_manage)) {
    return <AccessDeniedPage homeHref="/settings/role-groups" />;
  }

  return <RoleGroupEditor />;
}
