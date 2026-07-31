"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Phone,
  Mail,
  MessageCircle,
  Globe,
  StickyNote,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import type { Channel } from "@/types/domain";
import { channelMeta } from "@/lib/display";

const channelIcons: Record<Channel, LucideIcon> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  webchat: Globe,
  internal: StickyNote,
  system: Cpu,
};

export function ChannelIcon({
  channel,
  className,
}: {
  channel: Channel;
  className?: string;
}) {
  const Icon = channelIcons[channel] ?? Globe;
  return <Icon className={cn("h-4 w-4", className)} aria-hidden />;
}

export function ChannelBadge({ channel }: { channel: Channel }) {
  const Icon = channelIcons[channel] ?? Globe;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-medium text-foreground">
      <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      {channelMeta[channel].label}
    </span>
  );
}
