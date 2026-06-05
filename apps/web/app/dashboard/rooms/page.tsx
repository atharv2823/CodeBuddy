"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Plus,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Users,
  Search,
  Hash,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card";
import { supabase } from "../../../lib/supabase";

export default function RoomsPage() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [joinRoomId, setJoinRoomId] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [mongoUserId, setMongoUserId] = useState<string | null>(null);

  // Load existing rooms filtered user-wise
  const fetchUserRooms = async (userId: string) => {
    try {
      setIsLoadingRooms(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load user rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const fetchAllRooms = async () => {
    try {
      setIsLoadingRooms(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`);
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load all rooms:", err);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    const initializeUserAndRooms = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const email = session.user.email || "";

          // Fetch MongoDB user ID by email
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/check?email=${encodeURIComponent(email)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.exists && data.user) {
              setMongoUserId(data.user.id);
              await fetchUserRooms(data.user.id);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize user session:", err);
      }
      // Fallback: load all rooms if auth is unavailable or not synced yet
      await fetchAllRooms();
    };

    initializeUserAndRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    if (!mongoUserId) {
      setErrorMsg("User session is not initialized. Please try again.");
      return;
    }

    try {
      setIsCreating(true);
      setErrorMsg("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: roomName.trim(), userId: mongoUserId }),
      });

      if (!res.ok) throw new Error("Failed to create room");

      const newRoom = await res.json();
      setRoomName("");
      setRooms((prev) => [newRoom, ...prev]);
      
      // Instantly direct user into their brand new collaboration room!
      router.push(`/workspace/${newRoom.id}`);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to create room. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinRoomId.trim()) return;

    try {
      setIsJoining(true);
      setErrorMsg("");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${joinRoomId.trim()}`);
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("This room has been closed and cannot be entered.");
        }
        throw new Error("Room not found. Please verify the Room ID.");
      }

      // Enter the existing collaborative workspace
      router.push(`/workspace/${joinRoomId.trim()}`);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to join room.");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">
          Collaboration <span className="gradient-text">Rooms</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-xl">
          Instantly spin up real-time code rooms, share IDs with your team, and pair program collaboratively with direct synchronization.
        </p>
      </div>

      {errorMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs font-semibold text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/15"
        >
          {errorMsg}
        </motion.div>
      )}

      {/* Main grids for Join/Create actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create Room Form */}
        <Card className="border border-brand/10 bg-card/40 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full blur-3xl -z-10" />
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center mb-2">
              <Plus className="w-5 h-5 text-brand" />
            </div>
            <CardTitle>Create Collaboration Room</CardTitle>
            <CardDescription>Start a new coding room and invite others to join</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="E.g., Frontend Design Session"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="h-11 transition-all duration-300 focus-visible:ring-brand/30 focus-visible:border-brand/50"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isCreating}
                className="w-full h-11 bg-brand hover:bg-brand/90 text-brand-foreground font-medium glow-brand transition-all duration-300"
              >
                {isCreating ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Initializing room...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create & Enter Room
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Join Room Form */}
        <Card className="border border-brand/10 bg-card/40 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -z-10" />
          <CardHeader>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-2">
              <Search className="w-5 h-5 text-purple-500" />
            </div>
            <CardTitle>Join Room by ID</CardTitle>
            <CardDescription>Paste a collaborative room ID to enter an active session</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div className="space-y-1.5">
                <Input
                  type="text"
                  placeholder="Paste Room ID (UUID format)"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value)}
                  className="h-11 transition-all duration-300 focus-visible:ring-purple-500/30 focus-visible:border-purple-500/50"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isJoining}
                className="w-full h-11 bg-purple-600 hover:bg-purple-700 text-white font-medium transition-all duration-300"
              >
                {isJoining ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying ID...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Join Session
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Active rooms list */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Users className="w-5 h-5 text-brand" />
          <h2 className="text-xl font-bold font-heading">Your Active Rooms</h2>
        </div>

        {isLoadingRooms ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-brand" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-card/20">
            <Code2 className="w-8 h-8 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">No active rooms found</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Create one above to begin pair programming.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-xl border border-border/50 bg-card/30 hover:border-brand/20 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-sm font-bold truncate mb-1">{room.name}</h3>
                    <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-lg w-fit mb-3">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[150px]">
                        {room.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => handleCopyId(room.id)}
                    >
                      {copiedId === room.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-green-500 mr-1.5" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />
                          Copy ID
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-brand text-brand-foreground hover:bg-brand/90 text-xs"
                      onClick={() => router.push(`/workspace/${room.id}`)}
                    >
                      Enter Room
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
