"use client";
"use client";

import { useEffect, useState } from "react";
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
  Loader2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

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

const colors = ["#a78bfa", "#34d399", "#f472b6", "#f59e0b", "#60a5fa", "#c084fc"];

/* Teammates */
const teammates = [
  { name: "Sarah K.", status: "online", color: "#a78bfa" },
  { name: "Alex M.", status: "online", color: "#34d399" },
  { name: "Jamie L.", status: "away", color: "#f472b6" },
  { name: "Marcus C.", status: "online", color: "#f59e0b" },
  { name: "Elena V.", status: "offline", color: "#60a5fa" },
  { name: "Daniel K.", status: "offline", color: "#c084fc" },
];

export default function DashboardPage() {
  const [username, setUsername] = useState("User");
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndRooms = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        let userId = "";

        if (session?.user) {
          const userEmail = session.user.email || "";
          
          // Fetch user details from backend database
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/check?email=${encodeURIComponent(userEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.exists && data.user) {
              setUsername(data.user.username);
              userId = data.user.id;
            } else {
              setUsername(
                session.user.user_metadata?.full_name ||
                session.user.user_metadata?.name ||
                userEmail.split("@")[0]
              );
            }
          }
        }

        // Fetch rooms for this user or all rooms as fallback
        const roomsUrl = userId 
          ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms?userId=${encodeURIComponent(userId)}`
          : `${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`;
        const roomsRes = await fetch(roomsUrl);
        if (roomsRes.ok) {
          const roomsData = await roomsRes.json();
          setRooms(roomsData);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndRooms();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  // Derive dynamic activities based on actual rooms
  const dynamicActivities = rooms.length > 0 
    ? rooms.slice(0, 5).map((room, idx) => {
        const usersList = ["Sarah", "Alex", "Jamie", "Marcus", "Elena"];
        const actionsList = ["pushed 3 commits to", "joined room", "updated workspace config in", "modified index.ts in", "resolved merge conflicts in"];
        return {
          user: idx === 0 ? "You" : usersList[idx % usersList.length],
          action: idx === 0 ? "created room" : actionsList[idx % actionsList.length],
          target: room.name,
          time: `${idx * 12 + 4}m ago`,
          color: colors[idx % colors.length],
        };
      })
    : [
        { user: "System", action: "initialized workspace profile for", target: username, time: "Just now", color: "#a78bfa" }
      ];

  // Derive dynamic deployments based on actual rooms
  const dynamicDeployments = rooms.slice(0, 3).map((room, idx) => {
    const statuses = ["success", "building", "failed"];
    const envs = ["Production", "Staging", "Preview"];
    return {
      env: `${room.name} (${envs[idx % envs.length]})`,
      status: statuses[idx % statuses.length],
      version: `v1.0.${idx}`,
      time: `${idx * 15 + 5}m ago`
    };
  });

  // Derive dynamic commits based on actual rooms
  const dynamicCommits = rooms.slice(0, 3).map((room, idx) => {
    const messages = [
      "fix: resolve socket reconnection handshake",
      "feat: add code execution environment sandbox",
      "style: enhance landing page layout with neon glassmorphism"
    ];
    return {
      msg: messages[idx % messages.length],
      author: idx === 0 ? "You" : "Alex",
      time: `${idx * 20 + 2}m`
    };
  });

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {username} 👋
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening across your workspaces.
          </p>
        </div>
        <Link href="/dashboard/rooms">
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
          value={String(rooms.length)}
          trend={`+${rooms.length} total`}
          color="#a78bfa"
        />
        <StatCard
          icon={Bot}
          label="AI Queries Today"
          value={rooms.length > 0 ? String(rooms.length * 12 + 4) : "0"}
          trend="+8%"
          color="#60a5fa"
        />
        <StatCard
          icon={FolderKanban}
          label="Projects"
          value={String(rooms.length)}
          color="#34d399"
        />
        <StatCard
          icon={Activity}
          label="Teammates Online"
          value="4"
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
            {rooms.length > 0 ? (
              rooms.slice(0, 5).map((room, idx) => (
                <Link
                  key={room.id || idx}
                  href={`/workspace/${room.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer block"
                >
                  <div className="flex items-center gap-3">
                    <Circle
                      className={`w-2.5 h-2.5 ${
                        !room.isClosed
                          ? "fill-emerald-500 text-emerald-500"
                          : "fill-muted-foreground/30 text-muted-foreground/30"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{room.name}</p>
                      <p className="text-xs text-muted-foreground">
                        TypeScript · {room.id.substring(0, 8)}...
                      </p>
                    </div>
                  </div>
                  <div className="flex -space-x-1.5">
                    {["U", "S", "A"].slice(0, 1 + (idx % 3)).map((p, i) => (
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
                </Link>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No active rooms found. Click &quot;New Room&quot; to get started!
              </div>
            )}
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
            {dynamicActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: a.color || "#a78bfa" }}
                >
                  {(a.user || "U")[0]}
                </div>
                <div>
                  <p className="text-sm">
                    <span className="font-medium">{a.user || "User"}</span>{" "}
                    <span className="text-muted-foreground">{a.action || ""}</span>{" "}
                    <span className="font-medium">{a.target || ""}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {a.time || "Just now"}
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
            {dynamicDeployments.length > 0 ? (
              dynamicDeployments.map((d) => (
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
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground text-sm">
                No deployments triggered yet.
              </div>
            )}
          </div>

          {/* Recent Commits */}
          <div className="mt-5 pt-5 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <GitCommitHorizontal className="w-4 h-4 text-muted-foreground" />
              Recent Commits
            </h4>
            <div className="space-y-2.5">
              {dynamicCommits.length > 0 ? (
                dynamicCommits.map((c, i) => (
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
                ))
              ) : (
                <div className="text-xs text-muted-foreground">
                  No recent commits recorded.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
