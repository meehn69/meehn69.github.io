/* ============================================================
   SITE CONTENT — edit this file to update the website.
   main.js renders every section from this data; index.html has
   section shells only. Add a project/job/chip/patch-note by
   copying an object and changing the text; retire one by
   deleting its object. Every array renders N items — nothing
   is hard-coded to a count. That is all.
   ============================================================ */

const SITE = {
  meta: {
    name: "Mihin Merchant",
    title: "Mihin Merchant — Unity Developer",
    description:
      "Unity Developer specialising in real-time multiplayer networking and complex game logic. Online multiplayer games, state synchronisation, and the systems that keep players connected.",
  },

  nav: [
    { label: "About", target: "about" },
    { label: "Experience", target: "experience" },
    { label: "Projects", target: "projects" },
    { label: "Contact", target: "contact" },
  ],

  gate: {
    cabinet: "MIHIN-8",
    bootLines: [
      "MIHIN-8 BIOS v3.2",
      "MEMORY 64K … OK",
      "CARTRIDGE … FOUND",
      "LOADING PORTFOLIO … READY",
    ],
    title: "MIHIN MERCHANT",
    pressStart: "PRESS START",
    insertCoin: "INSERT COIN",
    skip: "SKIP",
  },

  hero: {
    name: "Mihin Merchant",
    badge: "3+ YEARS · 10+ SHIPPED TITLES",
    roleParts: ["UNITY DEVELOPER", "REAL-TIME MULTIPLAYER", "SURAT, INDIA"],
    sub: "I build online multiplayer games in Unity — the gameplay, the UI, and the netcode that keeps players connected on real-world networks.",
    buttons: [
      { label: "VIEW PROJECTS", href: "#projects" },
      { label: "EMAIL ME", href: "mailto:your.email@example.com" },
    ],
    tokens: [
      { label: "C#", style: "cart" },
      { label: "SOCKET.IO", style: "cart" },
      { label: "FIREBASE", style: "cart" },
      { label: "MULTIPLAYER", style: "cart" },
      { label: "3+ YRS", style: "coin" },
      { label: "10+ SHIPPED", style: "coin" },
    ],
  },

  marquee: {
    items: [
      { label: "LUDO", glyph: "dice-six-faces-five" },
      { label: "RUMMY", glyph: "card-random" },
      { label: "TEEN PATTI", glyph: "card-ace-hearts" },
      { label: "8-BALL POOL", glyph: "eight-ball" },
      { label: "CHESS", glyph: "chess-knight" },
      { label: "CARROM", glyph: "target-arrows" },
      { label: "DRAGON TIGER", glyph: "dragon-head" },
      { label: "TAMBOLA", glyph: "ticket" },
      { label: "JHANDI MUNDA", glyph: "dice-six-faces-one" },
    ],
  },

  about: {
    heading: "ABOUT",
    lines: [
      "Unity developer for real-time multiplayer games. Three studios, three-plus years, ten shipped titles — Ludo to Dragon Tiger — all played by real players on unstable networks.",
    ],
    bullets: [
      "Socket.IO client multiplayer: state sync, rooms, host migration",
      "Photon PUN architecture and the PUN→Socket.IO migration",
      "Firebase, Google sign-in, CashFree payments (KYC, UPI)",
      "Bot AI and RNG calibration for real-money play",
      "AI-assisted tooling to ship faster without losing rigor",
    ],
  },

  playerCard: {
    heading: "PLAYER PROFILE",
    level: { label: "LEVEL", value: 3, suffix: "+" },
    studios: { label: "STUDIOS CLEARED", value: 3, suffix: "" },
    titles: { label: "TITLES SHIPPED", value: 10, suffix: "+" },
    quest: { label: "CURRENT QUEST", value: "REAL-TIME MULTIPLAYER" },
    interests: [
      { label: "NETCODE", icon: "network" },
      { label: "GAME FEEL", icon: "gamepad-2" },
      { label: "SHIPPED SOFTWARE", icon: "rocket" },
      { label: "AI-ASSISTED TOOLING", icon: "sparkles" },
    ],
  },

  skills: {
    heading: "SKILLS",
    groups: [
      {
        label: "Core",
        core: true,
        tags: [
          { label: "C# (LINQ, delegates, custom events)", proof: "6+ shipped codebases" },
          { label: "Unity 2D/3D", proof: "Shipped studio and personal titles" },
          { label: "Unity UI & Event Systems", proof: "Full suite reskins, Teen Patti" },
          { label: "DOTween", proof: "Tweens, pops and game-feel polish" },
          { label: "Scriptable Objects (data-driven design)", proof: "This very site runs on data" },
        ],
      },
      {
        label: "Multiplayer & networking",
        core: false,
        tags: [
          { label: "Socket.IO", proof: "Led the PUN→Socket.IO migration" },
          { label: "Photon PUN (architecture & migration)", proof: "Multiple shipped Ludo titles" },
          { label: "Mirror Networking", proof: "Host-authority sync patterns" },
          { label: "State synchronisation", proof: "Host migration, pause/resume, turn routing" },
          { label: "Networked physics synchronisation", proof: "Pool and Carrom on unstable links" },
          { label: "Turn-based systems", proof: "Cards, Ludo, Tambola — shipped" },
        ],
      },
      {
        label: "Game systems & algorithms",
        core: false,
        tags: [
          { label: "Randomisation & pattern matching", proof: "Tambola tickets, Rummy sequences" },
          { label: "Bot AI & difficulty calibration", proof: "Weighted probabilities, dice RNG" },
          { label: "Physics & collision detection", proof: "Bubble cascades, 8-Ball trajectories" },
        ],
      },
      {
        label: "Backend & integrations",
        core: false,
        tags: [
          { label: "Firebase integration", proof: "Auth + live data on shipped suites" },
          { label: "Node.js API collaboration", proof: "Multiplayer services across titles" },
          { label: "CashFree payment gateway (KYC, UPI flows)", proof: "Debugged live payment flows" },
          { label: "Google sign-in integration", proof: "Auth on real-money-ready builds" },
        ],
      },
    ],
  },

  experience: {
    heading: "EXPERIENCE",
    intro: "Shipped with studio teams — every bullet below is my own contribution within those teams.",
    stamp: "STAGE CLEAR",
    jobs: [
      {
        studio: "Enixo Studio",
        role: "Unity Developer",
        period: "May 2023 – present",
        bullets: [
          "Upgraded a 2-player Ludo engine to robust 4-player online play with real-money-ready game modes.",
          "Network migration: Photon PUN → Socket.IO on a unified multi-game APK (Chess, Carrom, 8-Ball Pool, Teen Patti, Dragon Tiger).",
          "Engineered the Rummy suite (Point, Pool, Deal) multiplayer algorithms; built Jhandi Munda from scratch; built randomised Tambola ticket generation and pattern matching.",
          "Handled client-side Socket.IO multiplayer (real-time state sync, room management), Google sign-in, CashFree payment integration (KYC, UPI flows) and Firebase integration.",
          "Resolved network edge cases: host/admin migration, networked physics sync for Pool and Carrom, unstable-connection recovery.",
          "Teen Patti suite UI reskins; bot AI and RNG calibration.",
        ],
      },
      {
        studio: "V.R. Developers",
        role: "Unity Developer",
        period: "Aug 2022 – Jan 2023",
        bullets: [
          "Built multiple Ludo titles with Photon PUN multiplayer and Node.js backend collaboration.",
          "Improved bot AI and dice RNG; debugged CashFree payment flows; sculpted terrain for a metaverse environment.",
        ],
      },
      {
        studio: "S.N.K. IT Solutions",
        role: "Unity Developer Intern",
        period: "Jan 2022 – Jul 2022",
        bullets: [
          "Designed a physics-driven 2D bubble shooter; built a custom level editor and balanced 27+ levels.",
          "Integrated Unity Ads, a spin wheel and an in-game shop; fixed critical Android build bugs; supported Match 3 and Cooking Carnival titles.",
        ],
      },
    ],
  },

  projects: {
    heading: "PROJECTS",
    note: "Source code for studio work is private; every bullet on a card is my own contribution within the team.",
    counterFormat: "{n} / {total}",
    detailsLabel: "+ DETAILS",
    items: [
      {
        id: "casino-suite",
        type: "studio",
        title: "Multi-game online casino suite",
        studio: "Enixo Studio",
        genre: "MULTI-GAME",
        glyph: "eight-ball",
        what: "A unified Socket.IO APK housing Chess, Carrom, 8-Ball Pool, Teen Patti and Dragon Tiger.",
        tech: ["Unity", "C#", "Socket.IO", "Firebase"],
        bullets: [
          "Led the Photon PUN → Socket.IO migration across the suite",
          "Handled client-side multiplayer: real-time state sync and room management",
          "Integrated Google sign-in, CashFree payments and Firebase",
        ],
        caption: "",
        links: [],
      },
      {
        id: "rummy-suite",
        type: "studio",
        title: "Rummy suite — Point, Pool & Deal",
        studio: "Enixo Studio",
        genre: "CARD GAME",
        glyph: "card-random",
        what: "A complete multiplayer Rummy suite with three variants.",
        tech: ["Unity", "C#", "Socket.IO"],
        bullets: [
          "Engineered deck distribution and turn routing",
          "Built sequence/pair detection algorithms for all three variants",
        ],
        caption: "",
        links: [],
      },
      {
        id: "ludo-online",
        type: "studio",
        title: "Ludo — 2 → 4 players, real-money-ready",
        studio: "Enixo Studio",
        genre: "BOARD GAME",
        glyph: "dice-six-faces-five",
        what: "Online Ludo engine upgrade with modes engineered for shorter matches.",
        tech: ["Unity", "C#", "Socket.IO"],
        bullets: [
          "Upgraded the 2-player engine to robust 4-player online play",
          "Engineered host migration and unstable-connection handling",
          "Designed game modes tuned for shorter, real-money-ready matches",
        ],
        caption: "Live titles included Navdurga Ludo — site since offline.",
        links: [],
      },
      {
        id: "jhandi-munda",
        type: "studio",
        title: "Jhandi Munda",
        studio: "Enixo Studio",
        genre: "DICE GAME",
        glyph: "dice-six-faces-one",
        what: "A classic dice game built for online play.",
        tech: ["Unity", "C#"],
        bullets: [
          "Built the game entirely from scratch",
          "Implemented bet resolution and bot AI",
        ],
        caption: "",
        links: [],
      },
      {
        id: "tambola",
        type: "studio",
        title: "Tambola (Housie)",
        studio: "Enixo Studio",
        genre: "TICKET GAME",
        glyph: "ticket",
        what: "Online Tambola for multiplayer sessions.",
        tech: ["Unity", "C#"],
        bullets: [
          "Architected randomised ticket generation",
          "Built the pattern-matching system for multiplayer sessions",
        ],
        caption: "",
        links: [],
      },
      {
        id: "divinity-games",
        type: "studio",
        title: "Divinity Games",
        studio: "Multi-game suite",
        genre: "MULTI-GAME",
        glyph: "crown",
        what: "A multi-game Unity suite — 8-Ball Pool, Chess, Archery Shooting and Carrom modules.",
        tech: ["Unity", "C#", "Firebase"],
        bullets: [
          "Developed client-side gameplay across four game modules",
          "Integrated Firebase throughout the suite",
        ],
        caption: "",
        links: [],
      },
      {
        id: "bubble-shooter",
        type: "studio",
        title: "Bubble Shooter",
        studio: "S.N.K. IT Solutions",
        genre: "PUZZLE",
        glyph: "target-arrows",
        what: "A physics-driven 2D bubble shooter with a custom level editor.",
        tech: ["Unity", "C#"],
        bullets: [
          "Built cascading bubble physics from scratch",
          "Created a custom level editor and balanced 27+ levels",
          "Integrated ads, a spin wheel and an in-game shop",
        ],
        caption: "Built during my internship — never publicly released.",
        links: [],
      },
      {
        id: "ludo-titles-vr",
        type: "studio",
        title: "Ludo titles",
        studio: "V.R. Developers",
        genre: "BOARD GAME",
        glyph: "dice-six-faces-five",
        what: "Multiple unique online Ludo titles with varied features and game modes.",
        tech: ["Unity", "C#", "Photon PUN", "Node.js"],
        bullets: [
          "Built Photon PUN multiplayer across several distinct Ludo titles",
          "Collaborated with a Node.js backend team",
          "Improved bot AI and dice RNG; debugged CashFree payment flows",
        ],
        caption: "Earlier live titles included Ludo Warriors and GoluDo Pay — sites since offline.",
        links: [],
      },
      {
        id: "elevator",
        type: "personal",
        title: "Elevator Simulation",
        studio: "PERSONAL PROJECT",
        genre: "SIMULATION",
        glyph: "elevator",
        what: "3 elevators, 5 floors, zero double-assignments — a dispatch simulation built to be audited.",
        tech: ["C#", "Unity"],
        bullets: [
          "Engineered SCAN-style dispatch per cabin with 6-factor weighted suitability scoring and deterministic tie-breaks",
          "Frame-batched dispatch so simultaneous calls never land on one car",
          "Stress-tested 8 simultaneous hall calls → 8 clean dispatches, none double-assigned",
          "Shipped with its own implementation plan, log and audit pass (9/9 checks verified)",
        ],
        caption: "",
        image: "assets/elevator-screenshot.png",
        imageAlt: "Screenshot of the elevator simulation: three elevator shafts serving five floors with UP/DOWN call buttons",
        links: [
          { label: "GitHub repo", href: "https://github.com/meehn69/Elevator_Simulation", external: true },
          { label: "Engineering docs", href: "https://github.com/meehn69/Elevator_Simulation/tree/main/Docs", external: true },
        ],
      },
    ],
  },

  contact: {
    heading: "CONTACT",
    line: "Recruiter? Email is fastest. Phone works too.",
    email: "your.email@example.com",
    phone: "+91 00000 00000",
    phoneHref: "tel:+910000000000",
    linkedin: "linkedin.com/in/your-profile",
    linkedinHref: "https://www.linkedin.com/in/your-profile",
    location: "Based in India.",
  },

  dock: [
    { key: "email", icon: "mail", label: "EMAIL" },
    { key: "phone", icon: "phone", label: "PHONE" },
    { key: "linkedin", icon: "linkedin", label: "LINKEDIN" },
    { key: "location", icon: "map-pin", label: "LOCATION" },
  ],

  footer: {
    line: "Built with HTML, CSS and JavaScript.",
    patchNotes: [
      {
        version: "v1.3",
        date: "2026-10",
        lines: [
          "Genre marquee added. Glyphs licensed, velocity honest.",
          "Hero gradient replaced with a shader. Battery cost measured and accepted.",
        ],
      },
      {
        version: "v1.2",
        date: "2026-09",
        lines: [
          "Theme B shipped. Same frame rate, lighter palette.",
          "Details expander: fewer clicks to the bullets.",
        ],
      },
    ],
    attribution: "Game icons by game-icons.net (CC BY 3.0) · Fonts: Press Start 2P, Space Grotesk (SIL OFL) · three.js (MIT) · GSAP",
    restart: "INSERT COIN TO RESTART",
    email: "your.email@example.com",
    linkedinHref: "https://www.linkedin.com/in/your-profile",
    linkedinLabel: "LinkedIn",
  },
};
