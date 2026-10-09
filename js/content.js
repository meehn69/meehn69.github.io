/* ============================================================
   SITE CONTENT — edit this file to update the website.
   One object per section; main.js renders it into the page.
   To add a project or job: copy an existing object and change
   the text. To retire content: delete its object. That is all.
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
    { label: "Skills", target: "skills" },
    { label: "Experience", target: "experience" },
    { label: "Projects", target: "projects" },
    { label: "Contact", target: "contact" },
  ],

  hero: {
    name: "Mihin Merchant",
    role: "Unity Developer specialising in real-time multiplayer networking and complex game logic.",
    sub: "I design and build online multiplayer games in Unity — from gameplay and UI to the systems that keep players connected.",
    location: "Based in India.",
    buttons: [
      { label: "Email me", href: "mailto:your.email@example.com" },
      { label: "LinkedIn", href: "https://www.linkedin.com/in/your-profile", external: true },
    ],
  },

  about: {
    heading: "About",
    paragraphs: [
      "I am a Unity developer specialising in real-time multiplayer games and state-synchronisation problem-solving, and I leverage AI-assisted tools to deliver robust games faster.",
      "Across three studios over 3+ years I have shipped and maintained online Ludo, Rummy, Teen Patti, Pool, Carrom, Chess, Dragon Tiger, Tambola and Jhandi Munda titles — real games, played by real players, on unstable real-world networks.",
      "Honest credit: studio titles were built by teams I worked in. Within them, the systems I personally owned end to end were the client-side multiplayer (Socket.IO), Google sign-in, payment gateway integration and Firebase integration.",
    ],
  },

  skills: {
    heading: "Skills",
    groups: [
      {
        label: "Core",
        tags: [
          "C# (LINQ, delegates, custom event handling)",
          "Unity 2D/3D",
          "Unity UI & Event Systems",
          "DOTween",
          "Scriptable Objects (data-driven architecture)",
        ],
      },
      {
        label: "Multiplayer & networking",
        tags: [
          "Socket.IO (real-time events, room management)",
          "Mirror Networking",
          "Photon PUN (architecture & migration)",
          "State synchronisation (host migration, pause/resume, turn routing)",
          "Real-time physics sync",
          "Turn-based systems",
        ],
      },
      {
        label: "Game systems & algorithms",
        tags: [
          "Algorithm design (sequence/pair detection, randomised ticket generation, RNG)",
          "Bot AI & difficulty calibration (weighted probabilities)",
          "Real-money game mechanics (cash-flow optimisation)",
          "Physics & collision detection",
        ],
      },
      {
        label: "Backend & integrations",
        tags: [
          "Firebase integration",
          "Node.js API collaboration",
          "CashFree payment gateway (KYC, UPI flows)",
          "Google sign-in integration",
        ],
        secondary: true,
      },
    ],
  },

  experience: {
    heading: "Experience",
    intro: "Three studios, one card each — the career in reverse order.",
    jobs: [
      {
        studio: "Enixo Studio",
        role: "Unity Developer",
        period: "May 2023 – present",
        bullets: [
          "Upgraded a 2-player Ludo engine to robust 4-player online play with real-money-ready game modes.",
          "Led the networking migration from Photon PUN to Socket.IO on a unified multi-game APK (Chess, Carrom, 8-Ball Pool, Teen Patti, Dragon Tiger).",
          "Engineered the Rummy suite (Point, Pool, Deal) multiplayer algorithms; built Jhandi Munda from scratch; built randomised Tambola ticket generation and pattern matching.",
          "Personally owned end to end: client-side Socket.IO multiplayer (real-time state sync, room management), Google sign-in, CashFree payment integration (KYC, UPI flows) and Firebase integration.",
          "Resolved network edge cases: host/admin migration, real-time physics sync for Pool and Carrom, unstable-connection recovery.",
          "Additionally: Teen Patti suite UI reskins; bot AI and RNG calibration.",
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
          "Designed and released a physics-driven 2D bubble shooter; built a custom level editor and balanced 27+ levels.",
          "Integrated Unity Ads, a spin wheel and an in-game shop; fixed critical Android build bugs; supported Match 3 and Cooking Carnival titles.",
        ],
      },
    ],
  },

  projects: {
    heading: "Projects",
    groupA: {
      label: "Professional work — studio titles",
      note: "Source code for studio work is private; each card states exactly what I built within the team.",
      cards: [
        {
          title: "Multi-game online casino suite",
          org: "Enixo Studio",
          what: "A unified Socket.IO APK housing Chess, Carrom, 8-Ball Pool, Teen Patti and Dragon Tiger.",
          role: "Led the Photon PUN → Socket.IO migration; owned client-side multiplayer, real-time state sync and room management.",
          caption: "",
          link: null,
        },
        {
          title: "Rummy suite — Point, Pool & Deal",
          org: "Enixo Studio",
          what: "A complete multiplayer Rummy suite with three variants.",
          role: "Engineered multiplayer deck distribution, turn routing and sequence/pair detection algorithms.",
          caption: "",
          link: null,
        },
        {
          title: "Ludo — 2 → 4 players, real-money-ready",
          org: "Enixo Studio",
          what: "Online Ludo engine upgrade with modes engineered for shorter matches.",
          role: "Engine upgrade including host migration and unstable-connection handling.",
          caption: "Live titles included Navdurga Ludo — site since offline.",
          link: null,
        },
        {
          title: "Jhandi Munda",
          org: "Enixo Studio",
          what: "A classic dice game built for online play.",
          role: "Built entirely from scratch, including bet resolution and bot AI.",
          caption: "",
          link: null,
        },
        {
          title: "Tambola (Housie)",
          org: "Enixo Studio",
          what: "Online Tambola for multiplayer sessions.",
          role: "Architected randomised ticket generation and the pattern-matching system.",
          caption: "",
          link: null,
        },
        {
          title: "Divinity Games",
          org: "Multi-game suite",
          what: "A multi-game Unity suite — 8-Ball Pool, Chess, Archery Shooting and Carrom modules with Firebase integration.",
          role: "Client-side game development and Firebase integration.",
          caption: "",
          link: null,
        },
        {
          title: "Bubble Shooter",
          org: "S.N.K. IT Solutions",
          what: "A physics-driven 2D bubble shooter, released on Android.",
          role: "Owned core development: cascading physics, a custom level editor and 27+ balanced levels; integrated ads, spin wheel and shop.",
          caption: "",
          link: {
            label: "Play Store listing",
            href: "https://play.google.com/store/apps/details?id=com.emoji.puzzle.game.fun.mathching",
            external: true,
          },
        },
        {
          title: "Ludo titles",
          org: "V.R. Developers",
          what: "Multiple unique online Ludo titles with varied features and game modes.",
          role: "Photon PUN multiplayer and Node.js backend collaboration.",
          caption: "Earlier live titles included Ludo Warriors and GoluDo Pay — sites since offline.",
          link: null,
        },
      ],
    },
    groupB: {
      label: "Personal projects — code you can read",
      note: "My own end-to-end work, public and checkable.",
      cards: [
        {
          title: "Elevator Simulation",
          org: "Personal project — C# / Unity",
          what: "A 3-elevator, 5-floor dispatch simulation built to demonstrate systems engineering: SCAN-style dispatch per cabin, 6-factor weighted suitability scoring with deterministic tie-breaks, frame-batched dispatch so simultaneous calls never land on one car, and duplicate-call prevention at three layers. Stress-tested with 8 simultaneous hall calls → 8 clean dispatches, none double-assigned.",
          role: "Designed, built and documented solo — the repo ships with its own implementation plan, implementation log and an audit pass (9/9 checks verified).",
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
  },

  contact: {
    heading: "Contact",
    line: "The fastest way to reach me is email.",
    email: "your.email@example.com",
    phone: "+91 00000 00000",
    phoneHref: "tel:+910000000000",
    linkedin: "linkedin.com/in/your-profile",
    linkedinHref: "https://www.linkedin.com/in/your-profile",
    location: "Based in India.",
  },

  footer: {
    line: "Built with HTML, CSS and JavaScript.",
    email: "your.email@example.com",
    linkedinHref: "https://www.linkedin.com/in/your-profile",
    linkedinLabel: "LinkedIn",
  },
};
