"use client";

import Link from "next/link";
import { KeyRound } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { BusinessUsersCard } from "@/components/settings/SettingsSections";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/hooks/use-permissions";
import { PAGE } from "@/constants/page-access";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";

export default function TeamPage() {
  const { can } = usePermissions();

  if (!can(PAGE.team)) {
    return <AccessDeniedPage />;
  }

  const canRoleGroups = can(PAGE.role_groups) || can(PAGE.role_groups_manage);

  return (
    <div className="page-container animate-fade-in">
      <PageHeader
        title="Team"
        description="Invite staff with your organization code, assign a role group for permissions, and manage who can access this business."
        action={
          canRoleGroups ? (
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings/role-groups">
                <KeyRound className="mr-2 h-4 w-4" />
                Role groups
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mx-auto w-full max-w-4xl">
        <BusinessUsersCard />
      </div>
    </div>
  );
}
