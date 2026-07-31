"use client";

import * as React from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useDemoStore } from "@/lib/demo-store";
import { roleMeta } from "@/config/rbac";
import { EmptyState } from "@/components/cloudsun/shared/EmptyState";
import { Button } from "@/components/cloudsun/shared/Button";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import type { ViewId } from "@/types/domain";

export function PermissionDeniedView({ viewId }: { viewId: ViewId }) {
  const getCurrentRole = useAuthStore((s) => s.getCurrentRole);
  const navigate = useDemoStore((s) => s.navigate);
  const role = getCurrentRole();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <EmptyState
        icon={ShieldAlert}
        title="You don't have access to this view"
        description={`Your role (${role ? roleMeta[role].label : "unknown"}) doesn't include permission to view ${viewId.replace(/_/g, " ")}. Contact your organisation owner or administrator if you believe this is an error.`}
        className="border-warning/20 bg-warning/5"
      />
      <div className="mt-4 flex justify-center">
        <Button variant="outline" size="sm" onClick={() => navigate("overview")}>
          <ArrowLeft className="h-4 w-4" /> Back to overview
        </Button>
      </div>
    </div>
  );
}
