"use client";

import { Bell, Lock, Palette, ShieldCheck, UserCircle2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Switch } from "@base-ui/react/switch";

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-2xl font-display font-bold">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage security, notifications, theme preferences, and decision-support behavior.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCircle2 size={18} />
              Founder Profile
            </CardTitle>
            <CardDescription>Account details used for reports and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
              Name shown in board-ready PDF summaries.
            </div>
            <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
              Timezone alignment for runway and collections reminders.
            </div>
            <Button variant="secondary">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} />
              Notifications
            </CardTitle>
            <CardDescription>Choose when the platform should interrupt you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingRow label="Runway drops below 6 months" defaultChecked />
            <SettingRow label="Invoice overdue by 14+ days" defaultChecked />
            <SettingRow label="Compliance deadline within 7 days" defaultChecked />
            <SettingRow label="Daily AI briefing at 8AM" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={18} />
              Data Integrations
            </CardTitle>
            <CardDescription>Connection health for financial data pipelines.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <IntegrationRow name="Bank Account Feed" status="Healthy" progress={96} />
            <IntegrationRow name="QuickBooks Sync" status="Stable" progress={88} />
            <IntegrationRow name="Stripe Events" status="Healthy" progress={93} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette size={18} />
              Experience
            </CardTitle>
            <CardDescription>Tune the assistant and dashboard behavior.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
              Theme follows your toggle from the header.
            </div>
            <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
              Enable plain-language explanations for all analytics cards.
            </div>
            <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
              Keep motion effects moderate for focused analysis sessions.
            </div>
            <Button>
              <Lock size={14} />
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SettingRow({ label, defaultChecked = false }: { label: string; defaultChecked?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/35 px-3 py-2">
      <p className="text-sm">{label}</p>
      <Switch.Root
        defaultChecked={defaultChecked}
        className="relative inline-flex h-6 w-10 items-center rounded-full border border-border bg-background data-[checked]:bg-primary transition-colors"
      >
        <Switch.Thumb className="size-4 translate-x-1 rounded-full bg-foreground transition-transform data-[checked]:translate-x-5" />
      </Switch.Root>
    </div>
  );
}

function IntegrationRow({ name, status, progress }: { name: string; status: string; progress: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/35 p-3">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span>{name}</span>
        <span className="text-muted-foreground">{status}</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
