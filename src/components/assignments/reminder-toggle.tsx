"use client";

import * as React from "react";
import { BellIcon, BellOffIcon } from "lucide-react";
import { toast } from "sonner";

import { setEmailReminders } from "@/app/(app)/odevler/actions";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function ReminderToggle({ initial, email }: { initial: boolean; email: string }) {
  const [on, setOn] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();

  function change(v: boolean) {
    setOn(v);
    startTransition(async () => {
      const res = await setEmailReminders(v);
      if (!res.ok) {
        setOn(!v);
        toast.error(res.error);
        return;
      }
      toast.success(v ? "E-posta hatırlatmaları açık" : "E-posta hatırlatmaları kapalı", {
        description: v ? `Teslimden 7, 3 ve 1 gün önce ${email} adresine.` : undefined,
      });
    });
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <label className="flex h-8 cursor-pointer items-center gap-2 rounded-md border px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
          {on ? <BellIcon className="size-3.5" /> : <BellOffIcon className="size-3.5" />}
          <span>E-posta hatırlatma</span>
          <Switch checked={on} onCheckedChange={change} disabled={pending} aria-label="E-posta hatırlatmaları" className="ml-0.5 scale-90" />
        </label>
      </TooltipTrigger>
      <TooltipContent className="max-w-60">
        Teslim tarihinden 7, 3 ve 1 gün önce sabah 09:00 civarı {email} adresine e-posta gönderilir.
      </TooltipContent>
    </Tooltip>
  );
}
