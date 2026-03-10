const en = {
  common: {
    language: "Language",
    czech: "CZ",
    english: "EN",
  },
  header: {
    menu: {
      howItWorks: "How it works",
      blog: "Blog",
      pricing: "Pricing",
      contact: "Contact",
    },
    auth: {
      accountSettings: "Account settings",
      signOut: "Sign out",
      signIn: "Sign in",
      signUp: "Sign up",
      start: "Get started",
    },
    mobile: {
      closeMenu: "Close menu",
      openMenu: "Open menu",
    },
  },
  appSidebar: {
    home: "Home",
    settings: "Settings",
    howItWorks: "How it works?",
    billing: "Billing & Pricing",
    termsAndPolicies: "Terms and policies",
    about: "About",
    contact: "Contact",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    clouds: {
      capture: {
        title: "Capture",
        items: {
          activeProposals: "Active Proposals",
          archived: "Archived",
        },
      },
      proposal: {
        title: "Proposal",
        items: {
          activeProposals: "Active Proposals",
          archived: "Archived",
        },
      },
      prompts: {
        title: "Prompts",
        items: {
          activeProposals: "Active Proposals",
          archived: "Archived",
        },
      },
    },
  },
  hero: {
    news: "New: view competitors on the map!",
    title: "Find the best place to open your next business",
    description:
      "Spotonaut uses advanced AI analysis to evaluate the potential of your location. Sign up for free to review the results with our AI assistant!",
    tryFree: "Try for free",
    howItWorks: "How it works?",
  },
  analysisForm: {
    card: {
      title: "Analysis data",
      description:
        "Fill in basic information about your business needed for the analysis.",
    },
    fields: {
      location: {
        label: "Target location",
        helpTitle: "Target location",
        helpDescription:
          "Enter an exact address or place name. You can use search or pick a location from the map. For best results include city and street.",
      },
      businessType: {
        label: "Business type",
        helpTitle: "Business type",
        helpDescription:
          "Select the business type that best matches your establishment. This helps tailor footfall estimates and recommended operating parameters.",
      },
      operatingHours: {
        label: "Planned opening days",
        helpTitle: "Planned opening days",
        helpDescription:
          "Select days when the business will be open and set hours for each day. Total weekly hours are calculated from selected days.",
      },
    },
    operatingSoon: "Available soon...",
    buttons: {
      clear: "Clear",
      submit: "Run analysis",
    },
    chain: {
      processing: "Analyzing your location...",
      steps: {
        geocoding: "Geocoding the provided location",
        mapsGrounding: "Fetching data from maps",
        proAnalysis: "Analyzing commercial potential",
        finalizing: "Summarizing results",
        completeLabel: "Done!",
      },
    },
    confirm: {
      title: "Overwrite existing analysis?",
      description:
        "You already have a completed analysis. Running a new analysis will remove the existing one. Continue?",
      confirmButton: "Confirm",
    },
  },
  howItWorksPage: {
    title: "Just 3 simple steps",
    intro:
      "Choosing a location can be the most expensive decision in a business. Spotonaut gives you a quick, clear way to check a place before you sign a lease or purchase agreement.",
    steps: {
      stepA: {
        title: "Enter input data",
        description:
          "Pick a target location on the map with a pin or type an address. Specify the business type — this selection drives the whole analysis.",
        imageAlt: "Map selection interface",
      },
      stepB: {
        title: "Run the analysis",
        description:
          "We use map data and public sources (transport, building density, competitors). AI evaluates the location and shows key scores from 0–100.",
        imageAlt: "AI analysis results",
      },
      stepC: {
        title: "Compare results",
        description:
          "In the chat you get a detailed breakdown and concrete recommendations (assortment, opening hours, marketing). Ask follow-up questions and build your strategy.",
        imageAlt: "Interactive chat interface",
      },
    },
  },
  integrationsSection: {
    title: "What data is it based on?",
    description:
      "Spotonaut builds on available data and uses AI to analyze their interconnections and influence on the commercial potential of the selected location.",
    tryFree: "Try for free",
  },
  faqs: {
    title: "Frequently Asked Questions",
    intro:
      "Below you'll find a selection of the most common questions from our users.",
    items: {
      item1: {
        question: "What data do we use for the analysis?",
        answer:
          "Our analysis uses publicly available data from Google Maps and Sreality.cz. The AI model processes and helps analyze their interconnections and their impact on the commercial potential of the selected location.",
      },
      item2: {
        question:
          "What are the main benefits of using Spotonaut for my business?",
        answer:
          "Spotonaut helps you pick the right place quickly and with less risk.\n\nIn a few minutes you'll learn the location's potential and can compare multiple sites. This lets you make data-driven decisions instead of relying on gut feeling, significantly reducing the chance of investing in a bad address.\n\nSpotonaut is currently free and we keep adding new features.",
      },
      item3: {
        question:
          "How does Spotonaut differ from other location analysis providers?",
        answer:
          "Spotonaut is fast, accessible and practical.\n\nWe're not an expensive consulting firm or a complex enterprise tool. You get an analysis in minutes without long meetings or high costs. We focus on simplicity, clarity and real-world usefulness for small businesses and growing chains.\n\nWe continuously evolve the tool based on user feedback.",
      },
      item4: {
        question: "What is a typical use case?",
        answer:
          "I want to open a new stall, shop or place a vending machine but I'm not sure about the location.\n\nI enter the address, compare options and quickly get a clearer idea where it's sensible to invest.\n\nSpotonaut helps decide before you sign a lease or spend the first money.",
      },
    },
    contactPrompt: "Can't find what you're looking for?",
    contactLink: "Contact us",
  },
  blog: {
    title: "Blog",
    description:
      "Practical tips, guides and case studies for choosing a location and making data-driven business decisions.",
    readMore: "Read more",
    backToBlog: "Back to blog",
    backToAllPosts: "Back to all posts",
    postNotFound: "Post not found",
  },
  pricing: {
    title: "Discover the real potential of your location in seconds.",
    intro:
      "Choose a plan that matches your ambitions — from first idea to franchise network.",
    perMonth: "/ month",
    perMonthEarlyBird: "/ month (early bird price)",
    popularBadge: "🔥 Most popular",
    plans: {
      sonda: {
        title: "🌑 Sonda",
        price: "0 Kč",
        description: "Quick area scan.",
        features: {
          f1: "25 starter credits (one-time)",
          f2: "Basic locality score",
          f3: "Map preview",
          f4: "Advanced AI chat",
          f5: "Real estate listings overview",
        },
        cta: "Try for free",
      },
      raketa: {
        title: "🚀 Raketa",
        description: "Advanced analysis.",
        features: {
          f1: "Everything in Sonda, plus:",
          f2: "200 credits / month",
          f3: "Real estate listings overview",
          f4: "Unlimited saved analyses",
        },
        cta: "Start full",
      },
      satellite: {
        title: "🛰️ Satellite",
        description: "For professionals.",
        features: {
          f1: "Everything in Raketa, plus:",
          f2: "2,200 credits / month",
          f3: "Priority support",
        },
        cta: "Profi deployment",
      },
      orbita: {
        title: "🪐 Orbita",
        priceNegotiable: "By agreement",
        description: "Enterprise solutions tailored to your business.",
        features: {
          f1: "Additional features tailored to your business needs",
        },
        cta: "Contact us",
      },
    },
    note: "Prices exclude VAT.",
  },
  pricingComparator: {
    header: {
      sonda: "🌑 Sonda",
      raketa: "🚀 Raketa",
      satellite: "🛰️ Satellite",
    },
    buttons: {
      sonda: "Try for free",
      raketa: "Start full",
      satellite: "Profi deployment",
    },
    sections: {
      creditsAndUsage: "Credits & usage",
      dataAndAnalytics: "Data & analytics",
      ai: "AI",
    },
    table: {
      credits: {
        monthlyAllowance: "Monthly allowance",
      },
      analytics: {
        localityScore: "Locality score",
        realEstateListings: "Real estate listings overview",
      },
      ai: {
        chatWithAi: "Chat with AI assistant",
      },
    },
  },
  creditsExplained: {
    title: "How do credits work?",
    intro: "Flexibility in every credit. Pay only for what you use.",
    raketaIntro:
      "With the 🚀 Raketa plan (200 credits) you can, for example, per month:",
    bullets: {
      analysisCredit: "1 location analysis = 10 Credits",
      aiQueryCredit: "1 AI assistant query = 1 Credit",
    },
    scenarios: {
      A: "Scenario A",
      B: "Scenario B",
      C: "Scenario C",
      selectedA: "20 in-depth analyses and 0 queries.",
      selectedB: "10 analyses (100 cr.) + 100 AI queries (fine-tuning).",
      selectedC: "5 analyses (50 cr.) + 150 queries.",
    },
    tipIntro: "Tip:",
    tip: "Ran out of credits? No problem. You can upgrade anytime or contact us to buy credits individually.",
  },
  navCreditMeter: {
    remainingCredits: "Remaining credits:",
    ariaLabel: "Credits usage",
    unlimited: "Unlimited credits",
    usedLabel: "Used:",
  },
  navMain: {
    newAnalysis: "New analysis",
  },
  navHistory: {
    title: "Analyses",
    more: "More",
    rename: "Rename",
    share: "Share",
    delete: "Delete",
    renameDialog: {
      title: "Rename analysis",
      description: "Enter a new name for this analysis.",
      placeholder: "Location name",
      cancel: "Cancel",
      save: "Save",
    },
    deleteDialog: {
      title: "Delete analysis",
      description:
        'Are you sure you want to delete analysis "{{name}}"? This action cannot be undone.',
      confirm: "Delete",
      cancel: "Cancel",
    },
  },
  dashboard: {
    pageName: "Control center",
    welcome: "Welcome back!",
    recentAnalyses: "Recent analyses",
  },
  analysisPage: {
    title: "Analysis",
    comingSoon: "Coming soon!",
  },
  analysisViewer: {
    loading: "Loading analysis...",
    unauthorized: "You do not have permission to view this analysis.",
    notFound: "Analysis not found.",
    fetchFailed: "Failed to load analysis.",
    backToApp: "Back to main page",
  },
  analysisResultsMobile: {
    tabAriaLabel: "Toggle between metrics and chat",
    metrics: "Metrics",
    chat: "Chat",
    openExtraFunctions: "Open extra functions drawer",
    newAnalysis: "New analysis",
  },
  analysisResultsDesktop: {
    aiDisclaimer:
      "Results are based on AI and provided for informational purposes only — they may not be accurate or complete.",
  },
  metricsPanel: {
    filters: "Filters",
    filterTypes: "Point of interest types",
    competitors: "Competitors",
    transit: "Transit",
    shopping: "Shopping",
    office: "Offices",
    residential: "Residential",
    availableProperties: "Properties",
    other: "Other",
    metrics: "Metrics",
    localityScore: "Locality score",
    footfall: "Footfall",
    recommendedHours: "Recommended hours",
  },
  recentAnalyses: {
    now: "Just now",
    minutesAgo: "{{n}} min ago",
    hoursAgo: "{{n}} h ago",
    yesterday: "Yesterday",
    daysAgo: "{{n}} days ago",
    noAnalysesTitle: "No analyses",
    emptyDescription: "Start by creating your first location analysis",
    viewAnalysis: "View analysis",
    fallbackBusinessAnalysis: "Location analysis",
    potential: "Potential: {{score}}/100",
  },
  chatPanel: {
    title: "AI Assistant",
    description: "Chat with our AI assistant.",
    newAnalysis: "New analysis",
    emptyTitle: "Start a conversation",
    emptyDescription:
      "Here you can start asking questions about your analysis.",
    thinking: "Thinking",
    askDetails: "Ask AI for details",
    inputPlaceholder: "Ask me anything...",
    loginRequiredTitle: "Login required",
    loginRequiredDescription:
      "You must be logged in to start a new analysis. Continue?",
    getChatAccessTitle: "Get chat access",
    getChatAccessDescription:
      "You must be logged in to access the AI assistant.",
    confirmSignIn: "Sign in",
    retry: "Retry",
    retryTooltip: "Try again",
    retryNotImplemented: "Retry is not implemented yet.",
    like: "Like",
    likeTooltip: "Good answer",
    dislike: "Dislike",
    dislikeTooltip: "Bad answer",
    copy: "Copy",
    copyTooltip: "Copy",
    rateLimitMessage: "Too many requests. Please try again later.",
    promptsPending: "Request for more prompts is pending approval.",
    aiError: "An error occurred while fetching a response from the AI.",
  },
  mapContent: {
    viewOnGoogleMaps: "View on Google Maps",
    distanceMeters: "{{n}} m away",
    proxyTypes: {
      transit: "Transit",
      shopping: "Shopping",
      office: "Offices",
      residential: "Residential",
      other: "Other",
    },
    perMonth: "/ month",
    distanceFromLocation: "{{n}} m from location",
    viewListing: "View listing →",
    sourceLabel: "Source:",
  },
  navUser: {
    account: "Account",
    levelPrefix: "Level:",
    signOut: "Sign out",
  },
  confirmDialog: {
    confirm: "Confirm",
    cancel: "Cancel",
  },
  api: {
    auth: {
      signup: {
        emailPasswordRequired: "Email and password are required",
        invalidEmailFormat: "Invalid email format",
        passwordTooShort: "Password must have at least 6 characters",
        invalidPromoCode: "Invalid promo code",
        userAlreadyExists: "A user with this email already exists",
        welcomeSubject: "Welcome to Spotonaut — registration confirmation",
        welcomeGreeting: "Hello",
        welcomeBody:
          "Thank you for registering to Spotonaut. Your account has been created with this email:",
        welcomeIfNotYou:
          "If you did not create this account, please contact us immediately.",
        welcomeTeam: "Thank you – Spotonaut Team",
        accountCreated: "Account has been created successfully",
        accountCreateFailed: "Failed to create account",
      },
    },
  },
  signUp: {
    title: "Create a Spotonaut account",
    welcome: "Welcome!",
    emailLabel: "Email",
    emailPlaceholder: "your@email.com",
    passwordLabel: "Password",
    passwordPlaceholder: "At least 6 characters",
    confirmPasswordLabel: "Confirm password",
    confirmPasswordPlaceholder: "Re-enter your password",
    passwordsDoNotMatch: "Passwords do not match",
    passwordsMatch: "Passwords match",
    havePromo: "Have a promo code?",
    hidePromo: "Hide promo code",
    promoLabel: "Promo code (optional)",
    promoPlaceholder: "Enter promo code",
    checkingPromo: "Checking...",
    promoValidButton: "✓ Valid",
    promoInvalidButton: "✗ Invalid",
    verify: "Verify",
    promoValidMessage: "Promo code is valid!",
    promoInvalidMessage: "Invalid promo code",
    agreeToTermsPrefix: "I agree to",
    termsLink: "terms of use",
    creatingAccount: "Creating account...",
    createAccount: "Create account",
    orContinueWith: "Or continue with",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    successToast:
      "Registration successful — check your email for confirmation.",
  },
  login: {
    title: "Sign in to Spotonaut",
    welcomeBack: "Welcome back!",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotPassword: "Forgot your password?",
    loggingIn: "Signing in...",
    loginButton: "Sign in",
    orContinueWith: "Or continue with",
    noAccount: "Don't have an account?",
    createAccount: "Create account",
    google: "Google",
  },
  locationInput: {
    placeholder: "e.g. Úvoz 40, Brno",
    pickFromMapTitle: "Pick from map",
    pickFromMapLabel: "Pick from map",
    loadingSuggestions: "Loading...",
    noSuggestions: "No suggestions",
  },
  businessTypeSelect: {
    placeholder: "Select business type",
    defaultPrompt: "Select business type",
    searchPlaceholder: "Search business type...",
    noResults: "No results found.",
  },
  businessTypeNames: {
    "Automat na kávu": "Coffee vending machine",
    "Automat na snacky a nápoje": "Snack & drink vending machine",
    "Automat na květiny": "Flower vending machine",
    "Automat na drogerii": "Drugstore vending machine",
    "Automat na jídlo": "Food vending machine",
    "Automat na mléko / vejce": "Milk & eggs vending machine",
    "Automat na maso / sýry / med": "Meat / cheese / honey vending machine",
    "Automat na fitness doplňky": "Fitness supplements vending machine",
    "Automat na elektroniku": "Electronics vending machine",
    "Káva s sebou": "Coffee to go",
    "Street food stánek": "Street food stall",
    "Pojízdný bar / káva truck": "Mobile bar / coffee truck",
    "Bistro / polévkárna": "Bistro / soup shop",
    "Kiosk s potravinami": "Food kiosk",
    Trafika: "Newsstand",
    Květinářství: "Florist",
    Pekárna: "Bakery",
    "Zmrzlinový stánek": "Ice cream stand",
    "Dárkové zboží": "Gift shop",
    Kadeřnictví: "Hair salon",
    "Barber shop": "Barber shop",
    "Nehtové studio": "Nail studio",
    "Masážní studio": "Massage studio",
    "Výdejní box": "Pickup locker",
    "Recyklační box": "Recycling box",
    "Nabíjecí stanice": "Charging station",
    "Sdílená kola / koloběžky": "Shared bikes / scooters",
    "Automat na knihy": "Book vending machine",
    "Výměnný box": "Exchange box",
    "Stánek s kasičkou": "Donation booth",
    "Pop-up stánek": "Pop-up stall",
  },
  businessTypeCategories: {
    Automaty: "Vending",
    Gastro: "Gastro",
    Maloobchod: "Retail",
    "Osobní služby": "Personal services",
    Služby: "Services",
    Komunitní: "Community",
  },
  contactPage: {
    backToApp: "Back to app",
  },
  contactSection: {
    title: "Need help with something?",
    intro:
      "If you need help with something, or want to discuss using Spotonaut for your business, feel free to write to us. We'll be happy to help.",
    company: {
      title: "For companies: contact directly",
      prefix:
        "Corporate inquiries and partnerships are handled primarily by email at ",
      email: "crew@spotonaut.com",
      suffix: " We usually reply within 1 business day.",
    },
    followTitle: "Follow us",
    form: {
      title: "Let us know and we'll get back to you",
      intro:
        "Have a question about using Spotonaut? Write to us and we'll get back to you as soon as possible.",
      labels: {
        name: "Name *",
        email: "Email *",
        message: "Message *",
      },
      validation: {
        required: "Please fill in all required fields.",
        invalidEmail: "Please enter a valid email address.",
      },
      sending: "Sending…",
      submit: "Send",
      success:
        "Thank you, your message has been sent. We'll get back to you shortly.",
      privacy:
        "By submitting the form you agree to the processing of data to handle the inquiry.",
    },
  },
  footer: {
    links: {
      about: "About",
      howItWorks: "How it works",
      contact: "Contact",
      privacy: "Privacy",
      terms: "Terms",
      cookies: "Cookies",
    },
    copyright: "© {{year}} Spotonaut, all rights reserved.",
  },
} as const;

export default en;
