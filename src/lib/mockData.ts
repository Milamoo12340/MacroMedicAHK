import type { Ticket, KnowledgeFile, TrainedResponse, BotCommand } from "@/types";

export const mockTickets: Ticket[] = [
  {
    id: "TKT-1042",
    user: "skylar#2841",
    avatar: "https://i.pravatar.cc/80?img=11",
    subject: "Fishing macro crashes on launch",
    category: "Launch",
    status: "ai-handling",
    createdAt: "2026-05-07T08:12:00Z",
    lastMessage: "Yeah I tried running it from Program Files folder",
    macro: "fisher_v3.ahk",
    messages: [
      { id: "m1", author: "user", time: "08:12", content: "Hey my fishing macro won't even open, double-click does nothing." },
      { id: "m2", author: "ai", time: "08:12", content: "Checked — your installed macro is `fisher_v3.ahk`. Three common causes: (1) AHK v2 not installed, (2) not running as Administrator, (3) blocked by Windows SmartScreen. Can you try: right-click the .ahk → Run as administrator?" },
      { id: "m3", author: "user", time: "08:14", content: "Yeah I tried running it from Program Files folder" },
    ],
  },
  {
    id: "TKT-1041",
    user: "ravenwolf",
    avatar: "https://i.pravatar.cc/80?img=32",
    subject: "Combat macro misses clicks — 2560x1440",
    category: "Resolution",
    status: "awaiting-user",
    createdAt: "2026-05-07T07:48:00Z",
    lastMessage: "Screenshot attached showing health bar position",
    macro: "combat_loop_v5.ahk",
    messages: [
      { id: "m1", author: "user", time: "07:48", content: "Macro keeps clicking wrong spot on my ultrawide." },
      { id: "m2", author: "ai", time: "07:48", content: "Your screen is 2560×1440. The bundled coords target 1920×1080. Run `/calibrate` or enable Auto-Scale in settings.ini." },
    ],
  },
  {
    id: "TKT-1040",
    user: "noctis_7",
    avatar: "https://i.pravatar.cc/80?img=5",
    subject: "Farming macro says hotkey in use",
    category: "Debug",
    status: "escalated",
    createdAt: "2026-05-06T22:10:00Z",
    lastMessage: "Escalated to human staff — #ticket-help-1040",
    macro: "farming_pro.ahk",
    messages: [
      { id: "m1", author: "user", time: "22:10", content: "Error: hotkey F6 already in use" },
      { id: "m2", author: "ai", time: "22:10", content: "Another program has F6 registered. Common culprits: Discord push-to-talk, NVIDIA ShadowPlay, Overwolf. Disable or rebind in settings." },
      { id: "m3", author: "user", time: "22:18", content: "Tried all that, still broken — need a human" },
      { id: "m4", author: "human", time: "22:20", content: "Escalated to staff channel." },
    ],
  },
  {
    id: "TKT-1039",
    user: "quickmara",
    avatar: "https://i.pravatar.cc/80?img=47",
    subject: "PvP macro fixed after re-install",
    category: "Other",
    status: "resolved",
    createdAt: "2026-05-06T18:02:00Z",
    lastMessage: "Resolved by AI • user confirmed",
    macro: "pvp_rotation.ahk",
    messages: [
      { id: "m1", author: "user", time: "18:02", content: "working now thanks!" },
    ],
  },
];

export const mockKnowledgeFiles: KnowledgeFile[] = [
  { id: "f1", name: "fisher_v3.ahk", path: "/macros/fishing/", size: "24.3 KB", macro: "Fishing", language: "AHK2", indexed: true, updatedAt: "2026-05-06" },
  { id: "f2", name: "combat_loop_v5.ahk", path: "/macros/combat/", size: "41.8 KB", macro: "Combat", language: "AHK2", indexed: true, updatedAt: "2026-05-05" },
  { id: "f3", name: "farming_pro.ahk", path: "/macros/farming/", size: "58.1 KB", macro: "Farming", language: "AHK2", indexed: true, updatedAt: "2026-05-04" },
  { id: "f4", name: "pvp_rotation.ahk", path: "/macros/pvp/", size: "17.2 KB", macro: "PvP", language: "AHK2", indexed: true, updatedAt: "2026-05-03" },
  { id: "f5", name: "settings.ini", path: "/macros/", size: "1.2 KB", macro: "Global", language: "TXT", indexed: true, updatedAt: "2026-05-02" },
  { id: "f6", name: "TROUBLESHOOTING.md", path: "/docs/", size: "6.4 KB", macro: "Docs", language: "MD", indexed: true, updatedAt: "2026-05-01" },
  { id: "f7", name: "hotkeys.json", path: "/macros/config/", size: "3.1 KB", macro: "Global", language: "JSON", indexed: false, updatedAt: "2026-04-30" },
];

export const mockTrainedResponses: TrainedResponse[] = [
  { id: "r1", trigger: "won't launch / won't open / does nothing", category: "Launch", response: "Please right-click the .ahk file → Run as administrator. Also ensure AutoHotkey v2 is installed (NOT v1).", active: true, hits: 284 },
  { id: "r2", trigger: "wrong click position / missing target / off-screen", category: "Resolution", response: "The macro is calibrated for 1920×1080 fullscreen. If you're on a different resolution, run `/calibrate` in-app or set Auto-Scale=1 in settings.ini.", active: true, hits: 156 },
  { id: "r3", trigger: "admin / permissions / blocked", category: "Admin Rights", response: "Windows requires elevated permissions for input simulation. Right-click macro → Properties → Compatibility → Run as administrator.", active: true, hits: 94 },
  { id: "r4", trigger: "character not moving / nothing happens in game", category: "In-Game Position", response: "Before launching the macro, ensure your character is standing in the starting zone marked in the macro's README. The macro assumes a known spawn point.", active: true, hits: 72 },
  { id: "r5", trigger: "hotkey in use / F-key conflict", category: "Debug", response: "Another app has the hotkey registered. Close Discord push-to-talk binds, NVIDIA overlays, or Steam overlays, then relaunch.", active: false, hits: 18 },
];

export const mockCommands: BotCommand[] = [
  { id: "c1", command: "/ticket", description: "Opens a new ticket and starts an AI chat", response: "Starts /ticket flow with quick-fix checklist then AI chat.", active: true },
  { id: "c2", command: "/escalate", description: "Elevates the current ticket to human staff", response: "Creates staff thread and pings @TicketHelpers.", active: true },
  { id: "c3", command: "/macros", description: "Lists all macros the bot has indexed", response: "Returns indexed macro list with versions.", active: true },
  { id: "c4", command: "/calibrate", description: "Walks user through resolution calibration", response: "Step-by-step image-guided calibration.", active: true },
  { id: "c5", command: "/close", description: "Closes the current ticket", response: "Asks for confirmation then archives thread.", active: true },
];

export const quickFixes = [
  { id: "q1", icon: "shield", title: "Running as Administrator", desc: "Macros simulating input require elevation on Windows." },
  { id: "q2", icon: "monitor", title: "Screen is 1920 × 1080 fullscreen", desc: "Default coords target this resolution unless auto-scaled." },
  { id: "q3", icon: "target", title: "Character at spawn zone", desc: "Most macros assume you start at the zone marked in the README." },
  { id: "q4", icon: "download", title: "AutoHotkey v2 installed", desc: "Macros are AHK v2 — v1 will throw 'invalid syntax' errors." },
];
