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
  MessageSquare,
  Bot,
  Send,
  Eye,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { supabase } from "@/lib/supabase";

interface WorkspaceClientProps {
  roomId: string;
}

interface ChatMessage {
  roomId: string;
  sender: string;
  text: string;
  time: string;
}

interface AiMessage {
  role: "user" | "assistant";
  text: string;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  // Tabs state: console, chat, ai, preview
  const [activeTab, setActiveTab] = useState<"console" | "chat" | "ai" | "preview">("ai");
  const [previewKey, setPreviewKey] = useState(0);

  // User details
  const [userProfile, setUserProfile] = useState<{ username: string; email: string }>({
    username: "Developer",
    email: "",
  });

  // Live Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");

  // AI Assistant state
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      text: "Hello! I am your CodeBuddy AI Assistant. Ask me anything about the code or logical flow. You can also ask me to generate snippets and apply them directly to your workspace.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [consoleOutputs, setConsoleOutputs] = useState<string[]>([
    "// Output panel initializes here...",
    "✔ Workspace synchronized successfully.",
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const runCode = () => {
    setIsRunning(true);
    setConsoleOutputs(["Running code..."]);
    setActiveTab("preview");
    setPreviewKey(prev => prev + 1);

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
    // 1. Fetch User Profile
    const fetchUserProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email || "";
          const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/check?email=${encodeURIComponent(userEmail)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.exists && data.user) {
              setUserProfile({
                username: data.user.username,
                email: userEmail,
              });
            } else {
              setUserProfile({
                username: session.user.user_metadata?.full_name || session.user.user_metadata?.name || userEmail.split("@")[0],
                email: userEmail,
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load user profile in workspace:", err);
      }
    };
    fetchUserProfile();

    // 2. Fetch Room Name from backend
    const fetchRoomDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          setRoomName(data.name);
        }
      } catch (err) {
        console.error("Failed to fetch room name:", err);
      }
    };
    fetchRoomDetails();

    // 3. Setup Socket.io Connection
    const socket = io(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-room", roomId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    // Listen to code changes from other developers
    socket.on("receive-code", (receivedCode: string) => {
      isIncomingChangeRef.current = true;
      setCode(receivedCode);
    });

    // Listen to room chat history
    socket.on("chat-history", (history: ChatMessage[]) => {
      setChatMessages(history);
    });

    // Listen to incoming live chat messages
    socket.on("receive-chat-message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, activeTab]);

  useEffect(() => {
    aiMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [aiMessages, activeTab]);

  // Handle local code changes
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}/close`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rooms/${roomId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/dashboard/rooms");
      }
    } catch (err) {
      console.error("Failed to delete room:", err);
    }
  };

  // Send live chat message to socket room
  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    if (socketRef.current) {
      const msgData: ChatMessage = {
        roomId,
        sender: userProfile.username,
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      socketRef.current.emit("send-chat-message", msgData);
      setChatInput("");
    }
  };

  // Send question to AI Assistant
  const sendAiMessage = async () => {
    if (!aiInput.trim() || isAiLoading) return;
    const userMessage = aiInput.trim();
    setAiInput("");
    setIsAiLoading(true);

    setAiMessages((prev) => [...prev, { role: "user", text: userMessage }]);

    try {
      const history = aiMessages.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text,
      }));

      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          code: code,
          language: language,
          history: history,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiMessages((prev) => [...prev, { role: "assistant", text: data.response }]);
      } else {
        const errData = await response.json();
        setAiMessages((prev) => [
          ...prev,
          { role: "assistant", text: `❌ Error: ${errData.error || "Failed to generate AI response."}` },
        ]);
      }
    } catch (err) {
      console.error(err);
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: "❌ Error: Could not connect to CodeBuddy AI Services." },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Simple Markdown parsing for chatbot replies
  const parseMarkdown = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.split("\n");
        const firstLine = (lines[0] || "").slice(3).trim(); // Extract programming language
        const codeLines = lines.slice(1, lines.length - 1);
        const codeText = codeLines.join("\n");
        return {
          type: "code" as const,
          lang: firstLine || "javascript",
          content: codeText,
          key: index,
        };
      } else {
        return {
          type: "text" as const,
          content: part,
          key: index,
        };
      }
    });
  };

  const renderInlineFormatting = (line: string) => {
    const parts = line.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={index} className="bg-muted/40 px-1 py-0.5 rounded font-mono text-[11px] text-brand">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  const renderFormattedText = (text: string) => {
    const parsed = parseMarkdown(text);
    return parsed.map((part) => {
      if (part.type === "code") {
        return (
          <div key={part.key} className="my-3 rounded-lg border border-border/40 overflow-hidden bg-[#0d0e12]">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#181922] border-b border-border/40 shrink-0">
              <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                {part.lang}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-[10px] text-brand hover:bg-brand/10 hover:text-brand"
                  onClick={() => {
                    handleEditorChange(part.content);
                    if (socketRef.current) {
                      socketRef.current.emit("code-change", { roomId, code: part.content });
                    }
                  }}
                >
                  Replace All
                </Button>
                <Button
                  variant="ghost"
                  className="h-6 px-2 text-[10px] text-brand hover:bg-brand/10 hover:text-brand"
                  onClick={() => {
                    const newCode = code.trim() + "\n\n" + part.content;
                    handleEditorChange(newCode);
                    if (socketRef.current) {
                      socketRef.current.emit("code-change", { roomId, code: newCode });
                    }
                  }}
                >
                  Append
                </Button>
              </div>
            </div>
            <pre className="p-3 font-mono text-[11px] text-zinc-300 overflow-x-auto whitespace-pre">
              <code>{part.content}</code>
            </pre>
          </div>
        );
      } else {
        return (
          <div key={part.key} className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/90 space-y-1">
            {part.content.split("\n").map((line, lIdx) => {
              if (line.trim().startsWith("- ")) {
                return (
                  <li key={lIdx} className="ml-4 list-disc text-zinc-300">
                    {renderInlineFormatting(line.trim().slice(2))}
                  </li>
                );
              }
              return <p key={lIdx}>{renderInlineFormatting(line)}</p>;
            })}
          </div>
        );
      }
    });
  };

  const getPreviewContent = () => {
    if (language === "html") {
      return code;
    }
    if (language === "css") {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            ${code}
          </style>
          <style>
            body {
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #0f172a;
              color: #f8fafc;
              padding: 24px;
              margin: 0;
            }
            .preview-container {
              max-width: 600px;
              margin: 0 auto;
            }
            .preview-header {
              border-bottom: 1px solid #334155;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .card {
              background: #1e293b;
              border: 1px solid #334155;
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 20px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            }
            .btn {
              padding: 8px 16px;
              border-radius: 6px;
              font-weight: 600;
              cursor: pointer;
              border: none;
              margin-right: 8px;
              transition: all 0.2s;
            }
            .btn-primary {
              background-color: #3b82f6;
              color: white;
            }
            .btn-secondary {
              background-color: #475569;
              color: #f8fafc;
            }
            .form-group {
              margin-bottom: 16px;
            }
            .form-label {
              display: block;
              margin-bottom: 6px;
              font-size: 14px;
              color: #94a3b8;
            }
            .form-input {
              width: 100%;
              padding: 8px 12px;
              background: #0f172a;
              border: 1px solid #334155;
              border-radius: 6px;
              color: white;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          <div class="preview-container">
            <header class="preview-header">
              <h1>CSS Styling Showcase</h1>
              <p>Your CSS is injected directly into this document. Use selectors like <code>body</code>, <code>.card</code>, <code>.btn</code>, <code>.btn-primary</code>, etc. to style the components below.</p>
            </header>
            <main>
              <div class="card">
                <h2>Interactive Form Card</h2>
                <p>Feel free to customize the inputs, card structure, and headers using your custom rules.</p>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-input" placeholder="you@example.com" />
                </div>
                <button class="btn btn-primary">Submit Action</button>
                <button class="btn btn-secondary">Cancel</button>
              </div>
            </main>
          </div>
        </body>
        </html>
      `;
    }
    if (language === "javascript" || language === "typescript") {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              background: #0f172a;
              color: #f8fafc;
            }
            #console-log-container {
              margin-top: 20px;
              padding: 12px;
              background: #1e293b;
              border-radius: 8px;
              border: 1px solid #334155;
              max-height: 250px;
              overflow-y: auto;
              font-family: monospace;
              font-size: 12px;
            }
            .console-line {
              margin: 4px 0;
              border-bottom: 1px solid #334155;
              padding-bottom: 4px;
              white-space: pre-wrap;
              word-break: break-all;
            }
            .console-log { color: #38bdf8; }
            .console-error { color: #f43f5e; }
            .console-warn { color: #fbbf24; }
          </style>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        </head>
        <body>
          <div id="app"></div>
          <div id="console-log-container">
            <div style="font-weight: bold; color: #94a3b8; border-bottom: 1px solid #475569; padding-bottom: 4px; margin-bottom: 6px;">Console Logs:</div>
          </div>
          <script>
            (function() {
              const container = document.getElementById('console-log-container');
              function appendLog(args, type) {
                const line = document.createElement('div');
                line.className = 'console-line console-' + type;
                line.textContent = args.map(arg => {
                  if (typeof arg === 'object') {
                    try { return JSON.stringify(arg, null, 2); } catch(e) {}
                  }
                  return String(arg);
                }).join(' ');
                container.appendChild(line);
                container.scrollTop = container.scrollHeight;
              }
              const originalLog = console.log;
              const originalError = console.error;
              const originalWarn = console.warn;
              console.log = (...args) => { originalLog(...args); appendLog(args, 'log'); };
              console.error = (...args) => { originalError(...args); appendLog(args, 'error'); };
              console.warn = (...args) => { originalWarn(...args); appendLog(args, 'warn'); };
              window.addEventListener('error', (e) => {
                appendLog([e.message], 'error');
              });
            })();
          </script>
          <script type="text/babel" data-presets="typescript">
            ${code}
          </script>
        </body>
        </html>
      `;
    }
    if (language === "python") {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              margin: 0;
              padding: 16px;
              font-family: monospace;
              background: #0f172a;
              color: #f8fafc;
              font-size: 13px;
            }
            #status {
              color: #38bdf8;
              margin-bottom: 12px;
            }
            #output {
              white-space: pre-wrap;
              word-break: break-all;
            }
            .error { color: #f43f5e; }
          </style>
          <script src="https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js"></script>
        </head>
        <body>
          <div id="status">Loading Python runtime (Pyodide)...</div>
          <pre id="output"></pre>
          <script>
            const statusDiv = document.getElementById('status');
            const outputPre = document.getElementById('output');
            
            function print(text, isError = false) {
              const span = document.createElement('span');
              if (isError) span.className = 'error';
              span.textContent = text + '\\n';
              outputPre.appendChild(span);
            }

            async function main() {
              try {
                let pyodide = await loadPyodide({
                  stdout: (text) => print(text),
                  stderr: (text) => print(text, true)
                });
                statusDiv.textContent = 'Python runtime loaded. Executing...';
                
                setTimeout(() => {
                  statusDiv.style.display = 'none';
                }, 1000);

                await pyodide.runPythonAsync(${JSON.stringify(code)});
              } catch (err) {
                statusDiv.style.display = 'none';
                print(err.message, true);
              }
            }
            main();
          </script>
        </body>
        </html>
      `;
    }
    return `
      <!DOCTYPE html>
      <html>
      <body style="background: #0f172a; color: #94a3b8; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
        <div>No preview available for ${language}</div>
      </body>
      </html>
    `;
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
            }}
          />
        </div>

        {/* Tabbed Interactive Sidebar panel on right */}
        <div className="w-[400px] border-l border-border/40 bg-[#12131a] flex flex-col shrink-0">
          {/* Tabs Navigation Header */}
          <div className="flex items-center justify-between border-b border-border/40 shrink-0 bg-[#151620]">
            <div className="flex flex-1">
              <button
                onClick={() => setActiveTab("ai")}
                className={cn(
                  "flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border-b-2",
                  activeTab === "ai"
                    ? "text-brand border-brand bg-[#1b1c28]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#181922]/55"
                )}
              >
                <Bot className="w-4 h-4" />
                AI Assistant
              </button>
              <button
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border-b-2",
                  activeTab === "chat"
                    ? "text-brand border-brand bg-[#1b1c28]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#181922]/55"
                )}
              >
                <MessageSquare className="w-4 h-4" />
                Room Chat
              </button>
              <button
                onClick={() => setActiveTab("console")}
                className={cn(
                  "flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border-b-2",
                  activeTab === "console"
                    ? "text-brand border-brand bg-[#1b1c28]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#181922]/55"
                )}
              >
                <Terminal className="w-4 h-4" />
                Console
              </button>
              {/* <button
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "flex-1 py-3 px-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 border-b-2",
                  activeTab === "preview"
                    ? "text-brand border-brand bg-[#1b1c28]"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:bg-[#181922]/55"
                )}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button> */}
            </div>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#0d0e12]">
            {/* 1. AI Assistant Tab */}
            {activeTab === "ai" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages Box */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-normal",
                        msg.role === "user"
                          ? "bg-brand/10 border border-brand/20 text-foreground self-end ml-auto rounded-tr-none"
                          : "bg-muted/30 border border-border/20 text-zinc-100 self-start mr-auto rounded-tl-none"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5 opacity-60">
                        {msg.role === "user" ? (
                          <span className="font-bold text-brand uppercase text-[9px]">You</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Bot className="w-3.5 h-3.5 text-brand" />
                            <span className="font-bold text-brand uppercase text-[9px]">CodeBuddy AI</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 break-words">
                        {renderFormattedText(msg.text)}
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground text-xs p-2 self-start bg-muted/20 border border-border/10 rounded-2xl rounded-tl-none animate-pulse max-w-[85%]">
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                      <span>Thinking...</span>
                    </div>
                  )}
                  <div ref={aiMessagesEndRef} />
                </div>

                {/* Input Box */}
                <div className="p-3 border-t border-border/40 bg-[#12131a] flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Ask for code logic, optimization..."
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAiMessage()}
                    disabled={isAiLoading}
                    className="flex-1 bg-[#181922] border border-border/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand/60 text-foreground placeholder:text-muted-foreground disabled:opacity-55"
                  />
                  <Button
                    size="sm"
                    onClick={sendAiMessage}
                    disabled={isAiLoading || !aiInput.trim()}
                    className="h-8 w-8 p-0 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg glow-brand"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 2. Room Chat Tab */}
            {activeTab === "chat" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Messages Box */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <MessageSquare className="w-8 h-8 text-muted-foreground/35 mb-2 animate-bounce" />
                      <p className="text-xs text-muted-foreground">No messages yet in this room.</p>
                      <p className="text-[10px] text-muted-foreground/60">Start the conversation below!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => {
                      const isMe = msg.sender === userProfile.username;
                      return (
                        <div
                          key={idx}
                          className={cn(
                            "flex flex-col max-w-[80%] rounded-2xl px-3 py-2 text-xs",
                            isMe
                              ? "bg-brand text-brand-foreground self-end ml-auto rounded-tr-none"
                              : "bg-[#181922] border border-border/40 text-foreground self-start mr-auto rounded-tl-none"
                          )}
                        >
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <span className="font-bold text-[10px] opacity-90 truncate">
                              {msg.sender}
                            </span>
                            <span className="text-[8px] opacity-65 font-mono">
                              {msg.time}
                            </span>
                          </div>
                          <p className="break-words leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Box */}
                <div className="p-3 border-t border-border/40 bg-[#12131a] flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder="Type message to room..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
                    className="flex-1 bg-[#181922] border border-border/40 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-brand/60 text-foreground placeholder:text-muted-foreground"
                  />
                  <Button
                    size="sm"
                    onClick={sendChatMessage}
                    disabled={!chatInput.trim()}
                    className="h-8 w-8 p-0 bg-brand hover:bg-brand/90 text-brand-foreground rounded-lg glow-brand"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 3. Console Output Tab */}
            {activeTab === "console" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-[#151620]">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                    Runtime Logs
                  </span>
                  <Sparkles className="w-4 h-4 text-brand animate-pulse" />
                </div>
                <div className="flex-1 p-4 font-mono text-[11px] bg-[#0a0a0f] overflow-y-auto space-y-2 select-text">
                  {consoleOutputs.map((output, idx) => {
                    const isError = output.startsWith("❌") || output.startsWith("[ERROR]");
                    const isSuccess = output.startsWith("✔");
                    return (
                      <p
                        key={idx}
                        className={
                          isError
                            ? "text-red-400 font-semibold"
                            : isSuccess
                              ? "text-brand"
                              : "text-zinc-300"
                        }
                      >
                        {output}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
            {activeTab === "preview" && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-border/20 flex items-center justify-between shrink-0 bg-[#151620]">
                  <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                    Interactive Preview ({language})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewKey(prev => prev + 1)}
                      className="h-7 px-2 text-[10px] text-brand hover:bg-brand/10 hover:text-brand"
                    >
                      Refresh Preview
                    </Button>
                  </div>
                </div>
                <div className="flex-1 bg-white relative">
                  <iframe
                    key={previewKey}
                    srcDoc={getPreviewContent()}
                    sandbox="allow-scripts allow-modals"
                    className="w-full h-full border-0 bg-slate-900"
                    title="CodeBuddy Live Preview"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
