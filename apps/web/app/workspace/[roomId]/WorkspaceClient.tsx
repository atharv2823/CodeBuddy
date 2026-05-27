"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { io, Socket } from "socket.io-client";
import {
  Code2,
  Copy,
  Check,
  ArrowLeft,
  Terminal,
  Play,
  Share2,
  Sparkles,
  Loader2,
  Lock,
  Trash2,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface WorkspaceClientProps {
  roomId: string;
}

export default function WorkspaceClient({ roomId }: WorkspaceClientProps) {
  const router = useRouter();
  const [code, setCode] = useState<string>("// Happy coding! Start collaborating in real-time.\n");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState("typescript");
  const [roomName, setRoomName] = useState("Collaborative Room");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const isIncomingChangeRef = useRef(false);

  const [consoleOutputs, setConsoleOutputs] = useState<string[]>([
    "// Output panel initializes here...",
    "✔ Workspace synchronized successfully.",
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutputs(["Running code..."]);

    setTimeout(() => {
      if (language === "javascript" || language === "typescript") {
        const logs: string[] = [];
        const originalLog = console.log;
        const originalError = console.error;

        // Hijack console.log & console.error
        console.log = (...args) => {
          logs.push(args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg)).join(" "));
        };
        console.error = (...args) => {
          logs.push("[ERROR] " + args.map(arg => typeof arg === "object" ? JSON.stringify(arg) : String(arg)).join(" "));
        };

        try {
          let codeToRun = code;
          if (language === "typescript") {
            // Strip typescript type annotations for browser runtime compatibility
            codeToRun = code
              .replace(/:\s*string/g, "")
              .replace(/:\s*number/g, "")
              .replace(/:\s*boolean/g, "")
              .replace(/:\s*any/g, "")
              .replace(/:\s*void/g, "");
          }

          const runner = new Function(codeToRun);
          runner();

          console.log = originalLog;
          console.error = originalError;

          if (logs.length === 0) {
            setConsoleOutputs(["Code executed successfully, but returned no console outputs."]);
          } else {
            setConsoleOutputs(logs);
          }
        } catch (err: any) {
          console.log = originalLog;
          console.error = originalError;
          setConsoleOutputs([`❌ Execution Error: ${err.message}`]);
        }
      } else {
        setConsoleOutputs([
          `Running ${language} code...`,
          `✔ Successfully compiled ${language} script!`,
          `[Console Output Mock]: Code execution completed.`,
        ]);
      }
      setIsRunning(false);
    }, 400);
  };

  useEffect(() => {
    // 1. Fetch Room Name from backend
    const fetchRoomDetails = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setRoomName(data.name);
        }
      } catch (err) {
        console.error("Failed to fetch room name:", err);
      }
    };
    fetchRoomDetails();

    // 2. Setup Socket.io Connection
    const socket = io("http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // 3. Listen to code changes from other developers
    socket.on("receive-code", (receivedCode: string) => {
      isIncomingChangeRef.current = true;
      setCode(receivedCode);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // 4. Handle local code changes
  const handleEditorChange = (value: string | undefined) => {
    const updatedCode = value || "";
    
    // Prevent feedback loops
    if (isIncomingChangeRef.current) {
      isIncomingChangeRef.current = false;
      return;
    }

    setCode(updatedCode);
    if (socketRef.current) {
      socketRef.current.emit("code-change", { roomId, code: updatedCode });
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseRoom = async () => {
    if (!confirm("Are you sure you want to CLOSE this room? This blocks all new entries permanently.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}/close`, {
        method: "PUT",
      });
      if (res.ok) {
        router.push("/dashboard/rooms");
      }
    } catch (err) {
      console.error("Failed to close room:", err);
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("Are you sure you want to DELETE this room? This will delete it completely for all members.")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/rooms");
      }
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0e12] text-foreground font-sans overflow-hidden">
      {/* Premium Top Bar Navbar */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border/40 bg-[#12131a] relative z-10 shrink-0">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard/rooms")}
            className="hover:bg-muted/50 rounded-lg shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand/10 border border-brand/20 shrink-0">
              <Code2 className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight leading-none mb-1">
                {roomName}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-muted-foreground/80 bg-muted/30 px-1.5 py-0.5 rounded">
                  {roomId}
                </span>
                <span
                  className={cn(
                    "w-2 h-2 rounded-full",
                    connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                  )}
                />
                <span className="text-[10px] text-muted-foreground">
                  {connected ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-[#181922] border border-border/40 text-muted-foreground rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand/50 transition-colors"
          >
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          {/* Copy Share ID */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="h-9 gap-2 text-xs font-semibold hover:border-brand/30 hover:bg-brand/5 transition-all duration-300"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" />
                Copied ID!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                Copy ID
              </>
            )}
          </Button>

          {/* Close Session */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCloseRoom}
            className="h-9 gap-2 text-xs font-semibold border-amber-500/30 text-amber-500 hover:bg-amber-500/10 hover:border-amber-500/50 transition-all duration-300"
          >
            <Lock className="w-3.5 h-3.5" />
            Close Session
          </Button>

          {/* Delete Session */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteRoom}
            className="h-9 gap-2 text-xs font-semibold border-red-500/30 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all duration-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </Button>

          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="h-9 bg-brand hover:bg-brand/90 text-brand-foreground text-xs font-semibold gap-1.5 glow-brand transition-all duration-300"
          >
            {isRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            Run Code
          </Button>
        </div>
      </header>

      {/* Editor & Sidebar Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Monaco Editor Container */}
        <div className="flex-1 h-full relative overflow-hidden bg-[#16171e]">
          <Editor
            height="100%"
            language={language}
            theme="vs-dark"
            value={code}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              fontFamily: "Fira Code, JetBrains Mono, Source Code Pro, Courier New, monospace",
              minimap: { enabled: true },
              lineNumbers: "on",
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 2,
              cursorBlinking: "smooth",
              padding: { top: 16 },
              // background: "#16171e",
            }}
          />
        </div>

        {/* Dynamic mini-console pane on right */}
        <div className="w-80 border-l border-border/40 bg-[#12131a] flex flex-col shrink-0">
          <div className="p-4 border-b border-border/40 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-brand" />
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Console Output
              </span>
            </div>
            <Sparkles className="w-4 h-4 text-brand animate-pulse" />
          </div>
          <div className="flex-1 p-4 font-mono text-xs bg-[#0a0a0f] overflow-y-auto space-y-2 select-text">
            {consoleOutputs.map((output, idx) => {
              const isError = output.startsWith("❌") || output.startsWith("[ERROR]");
              const isSuccess = output.startsWith("✔");
              return (
                <p 
                  key={idx} 
                  className={
                    isError 
                      ? "text-red-400 font-bold" 
                      : isSuccess 
                        ? "text-brand/80" 
                        : "text-muted-foreground/90"
                  }
                >
                  {output}
                </p>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
