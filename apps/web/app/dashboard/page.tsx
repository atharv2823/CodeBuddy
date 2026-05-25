"use client";

import {
  Users,
  Bot,
  FolderKanban,
  Activity,
  GitCommitHorizontal,
  Rocket,
  Clock,
  ArrowUpRight,
  Circle,
  Plus,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";

/* Stat Card */
function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  trend?: string;
  color: string;
}) {
  return (
    <div className="glass-card-hover rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-emerald-500 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

/* Recent Rooms */
const rooms = [
  {
    name: "Frontend Refactor",
    participants: ["S", "A", "J"],
    lang: "TypeScript",
    active: true,
    time: "2 min ago",
  },
  {
    name: "API Endpoints",
    participants: ["M", "E"],
    lang: "Python",
    active: true,
    time: "15 min ago",
  },
  {
    name: "Design System",
    participants: ["O"],
    lang: "CSS",
    active: false,
    time: "3 hours ago",
  },
  {
    name: "Database Migration",
    participants: ["D", "P", "A"],
    lang: "SQL",
    active: false,
    time: "1 day ago",
  },
];

const colors = ["#a78bfa", "#34d399", "#f472b6", "#f59e0b", "#60a5fa", "#c084fc"];

/* Activity Feed */
const activities = [
  {
    user: "Sarah",
    action: "pushed 3 commits to",
    target: "main",
    time: "2m ago",
    color: "#a78bfa",
  },
  {
    user: "Alex",
    action: "joined room",
    target: "Frontend Refactor",
    time: "5m ago",
    color: "#34d399",
  },
  {
    user: "Jamie",
    action: "deployed",
    target: "v2.1.0 to production",
    time: "12m ago",
    color: "#f472b6",
  },
  {
    user: "Marcus",
    action: "created project",
    target: "auth-service",
    time: "1h ago",
    color: "#f59e0b",
  },
  {
    user: "Elena",
    action: "merged PR #47 into",
    target: "develop",
    time: "2h ago",
    color: "#60a5fa",
  },
];

/* Teammates */
const teammates = [
  { name: "Sarah K.", status: "online", color: "#a78bfa" },
  { name: "Alex M.", status: "online", color: "#34d399" },
  { name: "Jamie L.", status: "away", color: "#f472b6" },
  { name: "Marcus C.", status: "online", color: "#f59e0b" },
  { name: "Elena V.", status: "offline", color: "#60a5fa" },
  { name: "Daniel K.", status: "offline", color: "#c084fc" },
];

/* Deployments */
const deployments = [
  { env: "Production", status: "success", version: "v2.1.0", time: "12m ago" },
  { env: "Staging", status: "building", version: "v2.2.0-rc1", time: "3m ago" },
  { env: "Preview", status: "failed", version: "v2.2.0-beta", time: "1h ago" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back 👋
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>
        <Link href="/workspace/new">
          <Button className="bg-brand hover:bg-brand/90 text-brand-foreground">
            <Plus className="w-4 h-4 mr-1" />
            New Room
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Active Rooms"
          value="12"
          trend="+3 this week"
          color="#a78bfa"
        />
        <StatCard
          icon={Bot}
          label="AI Queries Today"
          value="847"
          trend="+12%"
          color="#60a5fa"
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value="8"
          color="#34d399"
        />
        <StatCard
          icon={Activity}
          label="Online Now"
          value="5"
          color="#f472b6"
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Rooms - spans 2 cols */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Recent Rooms</h3>
            <Link
              href="/dashboard/rooms"
              className="text-xs text-brand hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {rooms.map((room) => (
              <div
                key={room.name}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  {/* Active indicator */}
                  <Circle
                    className={`w-2.5 h-2.5 ${
                      room.active
                        ? "fill-emerald-500 text-emerald-500"
                        : "fill-muted-foreground/30 text-muted-foreground/30"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{room.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {room.lang} · {room.time}
                    </p>
                  </div>
                </div>
                {/* Participant avatars */}
                <div className="flex -space-x-1.5">
                  {room.participants.map((p, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-card"
                      style={{
                        backgroundColor: colors[i % colors.length],
                      }}
                    >
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Online Teammates */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold mb-4">Team</h3>
          <div className="space-y-3">
            {teammates.map((t) => (
              <div
                key={t.name}
                className="flex items-center gap-3"
              >
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: t.color }}
                  >
                    {t.name[0]}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                      t.status === "online"
                        ? "bg-emerald-500"
                        : t.status === "away"
                        ? "bg-amber-500"
                        : "bg-muted-foreground/30"
                    }`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {t.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Feed */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: a.color }}
                >
                  {a.user[0]}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{a.user}</span>{" "}
                    <span className="text-muted-foreground">{a.action}</span>{" "}
                    <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {a.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deployments */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Deployments</h3>
            <Rocket className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-3">
            {deployments.map((d) => (
              <div
                key={d.env}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      d.status === "success"
                        ? "bg-emerald-500"
                        : d.status === "building"
                        ? "bg-amber-500 animate-pulse"
                        : "bg-red-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium">{d.env}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.version}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-xs font-medium capitalize ${
                      d.status === "success"
                        ? "text-emerald-500"
                        : d.status === "building"
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {d.status}
                  </p>
                  <p className="text-xs text-muted-foreground">{d.time}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Commits */}
          <div className="mt-5 pt-5 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GitCommitHorizontal className="w-4 h-4 text-muted-foreground" />
              Recent Commits
            </h4>
            <div className="space-y-2.5">
              {[
                { msg: "fix: resolve auth token refresh", author: "Sarah", time: "2m" },
                { msg: "feat: add room presence indicators", author: "Alex", time: "15m" },
                { msg: "chore: update dependencies", author: "Jamie", time: "1h" },
              ].map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-mono text-foreground/80">
                      {c.msg}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.author} · {c.time} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
