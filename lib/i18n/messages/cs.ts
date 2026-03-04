const cs = {
  common: {
    language: "Jazyk",
    czech: "CZ",
    english: "EN",
  },
  header: {
    menu: {
      howItWorks: "Jak to funguje",
      blog: "Blog",
      pricing: "Ceník",
      contact: "Kontakt",
    },
    auth: {
      accountSettings: "Nastavení účtu",
      signOut: "Odhlásit se",
      signIn: "Přihlásit se",
      signUp: "Zaregistrovat se",
      start: "Začít",
    },
    mobile: {
      closeMenu: "Zavřít menu",
      openMenu: "Otevřít menu",
    },
  },
  appSidebar: {
    home: "Domů",
    settings: "Nastavení",
    howItWorks: "Jak to funguje?",
    termsAndPolicies: "Podmínky a zásady",
    about: "O nás",
    contact: "Kontakt",
    privacy: "GDPR",
    terms: "Podmínky",
    cookies: "Cookies",
    clouds: {
      capture: {
        title: "Zachytávání",
        items: {
          activeProposals: "Aktivní návrhy",
          archived: "Archiv",
        },
      },
      proposal: {
        title: "Návrh",
        items: {
          activeProposals: "Aktivní návrhy",
          archived: "Archiv",
        },
      },
      prompts: {
        title: "Prompty",
        items: {
          activeProposals: "Aktivní návrhy",
          archived: "Archiv",
        },
      },
    },
  },
  hero: {
    news: "Novinka: zobrazení konkurence v mapě!",
    title: "Zjistěte, kde otevřít svůj další podnik",
    description:
      "Spotonaut využívá pokročilou AI analýzu k vyhodnocení potenciálu vaší lokality. Zaregistrujte se zdarma a využijte možnost zhodnotit výsledná data s naším AI asistentem!",
    tryFree: "Vyzkoušet zdarma",
    howItWorks: "Jak to funguje?",
  },
  analysisForm: {
    card: {
      title: "Data k analýze",
      description:
        "Vyplňte základní informace o vašem podnikání potřebné pro analýzu.",
    },
    fields: {
      location: {
        label: "Cílová lokalita",
        helpTitle: "Cílová lokalita",
        helpDescription:
          "Zadejte přesnou adresu nebo název místa. Můžete použít vyhledávání nebo vybrat lokaci z mapy. Pro nejlepší výsledky zadejte město a ulici.",
      },
      businessType: {
        label: "Typ podnikání",
        helpTitle: "Typ podnikání",
        helpDescription:
          "Vyberte typ podnikání, který nejlépe vystihuje vaši provozovnu. Tento výběr pomůže přizpůsobit odhad návštěvnosti a doporučené provozní parametry.",
      },
      operatingHours: {
        label: "Plánované dny otevření",
        helpTitle: "Plánované dny otevření",
        helpDescription:
          "Vyberte dny, kdy bude provozovna otevřená a nastavte počet hodin pro každý den. Celkové hodiny za týden se vypočtou z vybraných dnů.",
      },
    },
    operatingSoon: "Dostupné brzy...",
    buttons: {
      clear: "Vymazat",
      submit: "Spustit analýzu",
    },
    chain: {
      processing: "Probíhá analýza vaší lokality...",
      steps: {
        geocoding: "Geokódování zadané lokality",
        mapsGrounding: "Získávání dat z map",
        proAnalysis: "Analýza obchodního potenciálu",
        finalizing: "Sumarizace výsledků",
        completeLabel: "Hotovo!",
      },
    },
    confirm: {
      title: "Přepsat existující analýzu?",
      description:
        "Již máte dokončenou analýzu. Spuštěním nové analýzy bude stávající analýza odstraněna. Chcete pokračovat?",
      confirmButton: "Potvrdit",
    },
  },
  howItWorksPage: {
    title: "Stačí 3 jednoduché kroky",
    intro:
      "Výběr lokality může být nejdražší rozhodnutí celého podnikání. Spotonaut Ti dá rychlý, srozumitelný způsob, jak si místo prověřit dřív, než podepíšeš nájemní či kupní smlouvu.",
    steps: {
      stepA: {
        title: "Zadej vstupní data",
        description:
          "Vyber cílovou lokalitu špendlíkem na mapě nebo zadej adresu. Uveď typ podnikání — tento výběr řídí celou analýzu.",
        imageAlt: "Map selection interface",
      },
      stepB: {
        title: "Spusť analýzu",
        description:
          "Využíváme mapové podklady a veřejná data (doprava, zástavba, konkurence). AI vyhodnotí lokaci a zobrazí klíčová skóre 0–100.",
        imageAlt: "AI analysis results",
      },
      stepC: {
        title: "Porovnej výsledky",
        description:
          "V chatu dostaneš detailní rozbor a konkrétní doporučení (sortiment, otevírací doba, marketing). Polož další otázky a rozvíjej strategii.",
        imageAlt: "Interactive chat interface",
      },
    },
  },
  integrationsSection: {
    title: "Na čem jsou data založená?",
    description:
      "Spotonaut staví na dostupných datech a s pomocí AI pomáhá analyzovat jejich vzájemné propojení a vliv na obchodní potenciál zvolené lokality.",
    tryFree: "Vyzkoušet zdarma",
  },
  faqs: {
    title: "Často kladené otázky",
    intro: "Níže naleznete výběr nejčastějších dotazů našich uživatelů.",
    items: {
      item1: {
        question: "Jaká data používáme pro analýzu?",
        answer:
          "Naše analýza využívá veřejně dostupná data z Google Maps a Sreality.cz. AI model je zpracovává a pomáhá analyzovat jejich vzájemné propojení, či vliv na obchodní potenciál zvolené lokality.",
      },
      item2: {
        question: "Jaké jsou hlavní výhody využití Spotonauta pro můj byznys?",
        answer:
          "Spotonaut vám pomůže vybrat správné místo rychle a bez zbytečného rizika.\n\nBěhem pár minut zjistíte, jaký má lokalita potenciál, a můžete porovnat více míst mezi sebou. Díky tomu děláte rozhodnutí na základě dat, ne pocitu. Výrazně tím snížíte šanci, že investujete do špatné adresy.\n\nNavíc je Spotonaut aktuálně zdarma a stále přidáváme nové funkce.",
      },
      item3: {
        question:
          "V čem se Spotonaut liší od jiných zprostředkovatelů lokačních analýz?",
        answer:
          "Spotonaut je rychlý, dostupný a praktický.\n\nNejsme drahá konzultační firma ani složitý enterprise nástroj. Analýzu získáte během pár minut, bez dlouhých jednání a vysokých nákladů. Zaměřujeme se na jednoduchost, srozumitelnost a reálné využití v praxi pro malé podnikatele i rostoucí sítě.\n\nNavíc nástroj neustále vyvíjíme podle zpětné vazby uživatelů.",
      },
      item4: {
        question: "Jaký je typický případ užití?",
        answer:
          "Chci otevřít nový stánek, provozovnu nebo umístit automat, ale nejsem si jistý lokalitou.\n\nZadám adresu, porovnám možnosti a během chvíle mám jasnější představu, kde má smysl investovat.\n\nSpotonaut pomáhá rozhodnout se dřív, než podepíšete nájem nebo utratíte první peníze.",
      },
    },
    contactPrompt: "Nemůžete najít, co hledáte?",
    contactLink: "Kontaktujte nás",
  },
  blog: {
    title: "Blog",
    description:
      "Praktické tipy, návody a případové studie k výběru lokality a podnikatelskému rozhodování na základě dat.",
    readMore: "Číst dál",
    backToBlog: "Zpět na blog",
    backToAllPosts: "Zpět na všechny články",
    postNotFound: "Článek nenalezen",
  },
  pricing: {
    title: "Zjistěte skutečný potenciál vaší lokality během vteřin.",
    intro:
      "Vyberte si plán, který odpovídá vašim ambicím. Od prvního nápadu po franšízovou síť.",
    perMonth: "/ měsíc",
    perYear: "/ rok",
    perMonthAnnualPayment: "/ měsíc (roční platba)",
    perMonthEarlyBird: "/ měsíc (early bird cena)",
    popularBadge: "🔥 Nejpopulárnější",
    plans: {
      sonda: {
        title: "🌑 Sonda",
        price: "0 Kč",
        description: "Pro rychlý sken okolí.",
        features: {
          f1: "25 kreditů do začátku (jednorázově)",
          f2: "Základní 'Skóre lokality'",
          f3: "Náhled na mapě",
          f4: "Pokročilý AI chat",
          f5: "Zobrazení realitních inzercí",
        },
        cta: "Vyzkoušet zdarma",
      },
      raketa: {
        title: "🚀 Raketa",
        description: "Pokročilá analýza.",
        features: {
          f1: "Vše v plánu Sonda, plus:",
          f2: "200 kreditů / měsíc",
          f3: "Zobrazení realitních inzercí",
          f4: "Možnost uložit si neomezený počet analýz",
        },
        cta: "Začít naplno",
      },
      modul: {
        title: "🛰️ Modul",
        description: "Pro profesionály.",
        features: {
          f1: "Vše v plánu Raketa, plus:",
          f2: "2 200 kreditů / měsíc",
          f3: "Prioritní podpora",
        },
        cta: "Profi nasazení",
      },
      orbita: {
        title: "🪐 Orbita",
        priceNegotiable: "Dle dohody",
        description: "Podniková řešení na míru.",
        features: {
          f1: "Další funkce na míru dle potřeb vašeho podnikání",
        },
        cta: "Kontaktujte nás",
      },
    },
    note: "Ceny jsou bez DPH.",
  },
  pricingComparator: {
    header: {
      sonda: "🌑 Sonda",
      raketa: "🚀 Raketa",
      modul: "🛰️ Modul",
    },
    buttons: {
      sonda: "Vyzkoušet zdarma",
      raketa: "Začít naplno",
      modul: "Profi nasazení",
    },
    sections: {
      creditsAndUsage: "Kredity a použití",
      dataAndAnalytics: "Data a analytika",
      ai: "AI",
    },
    table: {
      credits: {
        monthlyAllowance: "Měsíční příděl",
      },
      analytics: {
        localityScore: "Skóre lokality",
        realEstateListings: "Zobrazení realitních inzercí",
      },
      ai: {
        chatWithAi: "Chat s AI asistentem",
      },
    },
  },
  creditsExplained: {
    title: "Jak fungují kredity?",
    intro: "Flexibilita v každém kreditu. Plaťte jen za to, co využijete.",
    raketaIntro:
      "S tarifem 🚀 Raketa (200 kreditů) můžete měsíčně udělat například:",
    bullets: {
      analysisCredit: "1 analýza lokality = 10 Kreditů",
      aiQueryCredit: "1 dotaz na AI asistenta = 1 Kredit",
    },
    scenarios: {
      A: "Scénář A",
      B: "Scénář B",
      C: "Scénář C",
      selectedA: "20 Hloubkových analýz a 0 dotazů.",
      selectedB: "10 Analýz (100 kr.) + 100 Dotazů na AI (doladění detailů).",
      selectedC: "5 Analýz (50 kr.) + 150 Dotazů.",
    },
    tipIntro: "Tip:",
    tip: "Došly vám kredity? Nevadí. Tarif je možné kdykoliv upgradovat nebo nás můžete kontaktovat a dokoupit si kredity individuálně.",
  },
  navCreditMeter: {
    remainingCredits: "Zbývající kredity:",
    ariaLabel: "Využití kreditů",
    unlimited: "Neomezené kredity",
    usedLabel: "Využito:",
  },
  navMain: {
    newAnalysis: "Nová analýza",
  },
  navHistory: {
    title: "Analýzy",
    more: "Více",
    rename: "Přejmenovat",
    share: "Sdílet",
    delete: "Smazat",
    renameDialog: {
      title: "Přejmenovat analýzu",
      description: "Zadejte nový název pro tuto analýzu.",
      placeholder: "Název lokace",
      cancel: "Zrušit",
      save: "Uložit",
    },
    deleteDialog: {
      title: "Smazat analýzu",
      description:
        'Opravdu chcete smazat analýzu "{{name}}"? Tuto akci nelze vrátit zpět.',
      confirm: "Smazat",
      cancel: "Zrušit",
    },
  },
  dashboard: {
    pageName: "Řídící centrum",
    welcome: "Vítejte zpět!",
    recentAnalyses: "Nedávné analýzy",
  },
  analysisPage: {
    title: "Analýza",
    comingSoon: "Bude brzy dostupné!",
  },
  analysisViewer: {
    loading: "Načítání analýzy...",
    unauthorized: "Nemáte oprávnění zobrazit tuto analýzu.",
    notFound: "Analýza nebyla nalezena.",
    fetchFailed: "Nepodařilo se načíst analýzu.",
    backToApp: "Zpět na hlavní stránku",
  },
  analysisResultsMobile: {
    tabAriaLabel: "Přepnout mezi metrikami a chatem",
    metrics: "Metriky",
    chat: "Chat",
    openExtraFunctions: "Otevřít nabídku dalších funkcí",
    newAnalysis: "Nová analýza",
  },
  analysisResultsDesktop: {
    aiDisclaimer:
      "Výsledky jsou založeny na AI a slouží pouze pro informační účely — nemusí být přesné ani úplné.",
  },
  metricsPanel: {
    filters: "Filtry",
    filterTypes: "Typy bodů zájmu",
    competitors: "Konkurence",
    transit: "Doprava",
    shopping: "Nákupy",
    office: "Kanceláře",
    residential: "Bydlení",
    availableProperties: "Reality",
    other: "Ostatní",
    metrics: "Metriky",
    localityScore: "Hodnocení lokality",
    footfall: "Průchodnost",
    recommendedHours: "Doporučené hodiny",
  },
  recentAnalyses: {
    now: "Právě teď",
    minutesAgo: "Před {{n}} min",
    hoursAgo: "Před {{n}} h",
    yesterday: "Včera",
    daysAgo: "Před {{n}} dny",
    noAnalysesTitle: "Žádné analýzy",
    emptyDescription: "Začněte vytvořením vaší první analýzy lokality",
    viewAnalysis: "Zobrazit analýzu",
    fallbackBusinessAnalysis: "Analýza lokality",
    potential: "Potenciál: {{score}}/100",
  },
  chatPanel: {
    title: "AI Asistent",
    description: "Chatujte s naším AI asistentem.",
    newAnalysis: "Nová analýza",
    emptyTitle: "Začněte konverzaci",
    emptyDescription: "Zde můžete začít klást otázky týkající se vaší analýzy.",
    thinking: "Přemýšlím",
    askDetails: "Zeptat se AI na detaily",
    inputPlaceholder: "Zeptejte se mě na cokoli...",
    loginRequiredTitle: "Je nutné se přihlásit",
    loginRequiredDescription:
      "Pro zahájení nové analýzy je nutné se přihlásit. Chcete pokračovat?",
    getChatAccessTitle: "Získat přístup k chatu",
    getChatAccessDescription:
      "Pro získání přístupu k AI asistentovi je nutné se přihlásit.",
    confirmSignIn: "Přihlásit se",
    retry: "Zkusit znovu",
    retryTooltip: "Zkusit znovu",
    retryNotImplemented: "Opětovný dotaz zatím není implementován.",
    like: "Dobrá odpověď",
    likeTooltip: "Dobrá odpověď",
    dislike: "Špatná odpověď",
    dislikeTooltip: "Špatná odpověď",
    copy: "Zkopírovat",
    copyTooltip: "Zkopírovat",
    rateLimitMessage:
      "Příliš mnoho požadavků. Prosím, zkuste to znovu za chvíli.",
    promptsPending: "Žádost o další prompty je v procesu schválení.",
    aiError: "Došlo k chybě při získávání odpovědi od AI.",
  },
  mapContent: {
    viewOnGoogleMaps: "Zobrazit na Google Maps",
    distanceMeters: "{{n}}m daleko",
    proxyTypes: {
      transit: "Doprava",
      shopping: "Nákupy",
      office: "Kancelář",
      residential: "Bydlení",
      other: "Ostatní",
    },
    perMonth: "/ měsíc",
    distanceFromLocation: "{{n}}m od lokace",
    viewListing: "Zobrazit inzerát →",
    sourceLabel: "Zdroj:",
  },
  navUser: {
    account: "Účet",
    levelPrefix: "Úroveň:",
    signOut: "Odhlásit se",
  },
  confirmDialog: {
    confirm: "Potvrdit",
    cancel: "Zrušit",
  },
  api: {
    auth: {
      signup: {
        emailPasswordRequired: "Email a heslo jsou povinné",
        invalidEmailFormat: "Neplatný formát emailu",
        passwordTooShort: "Heslo musí mít alespoň 6 znaků",
        invalidPromoCode: "Neplatný promo kód",
        userAlreadyExists: "Uživatel s tímto emailem již existuje",
        welcomeSubject: "Vítejte na Spotonaut — potvrzení registrace",
        welcomeGreeting: "Ahoj",
        welcomeBody:
          "Děkujeme za registraci do aplikace Spotonaut. Váš účet byl úspěšně vytvořen s tímto emailem:",
        welcomeIfNotYou:
          "Pokud jste registraci neprováděl(a), ihned nás, prosím, kontaktujte.",
        welcomeTeam: "Děkujeme – Tým Spotonaut",
        accountCreated: "Účet byl úspěšně vytvořen",
        accountCreateFailed: "Nepodařilo se vytvořit účet",
      },
    },
  },
  signUp: {
    title: "Vytvořit účet u Spotonauta",
    welcome: "Vítejte!",
    emailLabel: "Email",
    emailPlaceholder: "vas@email.cz",
    passwordLabel: "Heslo",
    passwordPlaceholder: "Alespoň 6 znaků",
    confirmPasswordLabel: "Potvrzení hesla",
    confirmPasswordPlaceholder: "Zadejte heslo znovu",
    passwordsDoNotMatch: "Hesla se neshodují",
    passwordsMatch: "Hesla se shodují",
    havePromo: "Máte promo kód?",
    hidePromo: "Skrýt promo kód",
    promoLabel: "Promo kód (volitelné)",
    promoPlaceholder: "Zadejte promo kód",
    checkingPromo: "Kontroluji...",
    promoValidButton: "✓ Platný",
    promoInvalidButton: "✗ Neplatný",
    verify: "Ověřit",
    promoValidMessage: "Promo kód je platný!",
    promoInvalidMessage: "Neplatný promo kód",
    agreeToTermsPrefix: "Souhlasím s",
    termsLink: "podmínkami použití",
    creatingAccount: "Vytvářím účet...",
    createAccount: "Vytvořit účet",
    orContinueWith: "Nebo pokračujte s",
    alreadyHaveAccount: "Už máte účet?",
    signIn: "Přihlásit se",
    successToast:
      "Registrace úspěšná — zkontrolujte svůj e-mail pro potvrzení.",
  },
  login: {
    title: "Přihlaste se do Spotonauta",
    welcomeBack: "Vítejte zpět!",
    emailLabel: "E-mail",
    passwordLabel: "Heslo",
    forgotPassword: "Zapomněli jste heslo?",
    loggingIn: "Přihlašování...",
    loginButton: "Přihlásit se",
    orContinueWith: "Nebo pokračujte s",
    noAccount: "Nemáte účet?",
    createAccount: "Vytvořit účet",
    google: "Google",
  },
  locationInput: {
    placeholder: "např. Úvoz 40, Brno",
    pickFromMapTitle: "Vybrat z mapy",
    pickFromMapLabel: "Vybrat z mapy",
    loadingSuggestions: "Načítání...",
    noSuggestions: "Žádné návrhy",
  },
  businessTypeSelect: {
    placeholder: "Vyberte typ podnikání",
    defaultPrompt: "Vyberte typ podnikání",
    searchPlaceholder: "Hledat typ podnikání...",
    noResults: "Žádné výsledky nenalezeny.",
  },
  businessTypeNames: {
    "Automat na kávu": "Automat na kávu",
    "Automat na snacky a nápoje": "Automat na snacky a nápoje",
    "Automat na květiny": "Automat na květiny",
    "Automat na drogerii": "Automat na drogerii",
    "Automat na jídlo": "Automat na jídlo",
    "Automat na mléko / vejce": "Automat na mléko / vejce",
    "Automat na maso / sýry / med": "Automat na maso / sýry / med",
    "Automat na fitness doplňky": "Automat na fitness doplňky",
    "Automat na elektroniku": "Automat na elektroniku",
    "Káva s sebou": "Káva s sebou",
    "Street food stánek": "Street food stánek",
    "Pojízdný bar / káva truck": "Pojízdný bar / káva truck",
    "Bistro / polévkárna": "Bistro / polévkárna",
    "Kiosk s potravinami": "Kiosk s potravinami",
    Trafika: "Trafika",
    Květinářství: "Květinářství",
    Pekárna: "Pekárna",
    "Zmrzlinový stánek": "Zmrzlinový stánek",
    "Dárkové zboží": "Dárkové zboží",
    Kadeřnictví: "Kadeřnictví",
    "Barber shop": "Barber shop",
    "Nehtové studio": "Nehtové studio",
    "Masážní studio": "Masážní studio",
    "Výdejní box": "Výdejní box",
    "Recyklační box": "Recyklační box",
    "Nabíjecí stanice": "Nabíjecí stanice",
    "Sdílená kola / koloběžky": "Sdílená kola / koloběžky",
    "Automat na knihy": "Automat na knihy",
    "Výměnný box": "Výměnný box",
    "Stánek s kasičkou": "Stánek s kasičkou",
    "Pop-up stánek": "Pop-up stánek",
  },
  businessTypeCategories: {
    Automaty: "Automaty",
    Gastro: "Gastro",
    Maloobchod: "Maloobchod",
    "Osobní služby": "Osobní služby",
    Služby: "Služby",
    Komunitní: "Komunitní",
  },
  contactPage: {
    backToApp: "Zpět do aplikace",
  },
  contactSection: {
    title: "Potřebujete s něčím poradit?",
    intro:
      "Pokud si s něčím nevíte rady, nebo chcete probrat možnosti využití Spotonauta ve vaší firmě, neváhejte nám napsat. Rádi vám pomůžeme.",
    company: {
      title: "Pro firmy: kontakt napřímo",
      prefix: "Firemní poptávky a spolupráce řešíme přednostně e-mailem na ",
      email: "crew@spotonaut.com",
      suffix: " Odpovídáme obvykle do 1 pracovního dne.",
    },
    followTitle: "Sledujte nás",
    form: {
      title: "Dejte nám vědět a my se vám ozveme",
      intro:
        "Máte otázku k používání Spotonautu? Napište nám a my se vám co nejdříve ozveme s odpovědí.",
      labels: {
        name: "Jméno *",
        email: "E-mail *",
        message: "Zpráva *",
      },
      validation: {
        required: "Vyplňte prosím všechna povinná pole.",
        invalidEmail: "Zadejte prosím platný e-mail.",
      },
      sending: "Odesílám…",
      submit: "Odeslat",
      success: "Děkujeme, zpráva byla odeslána. Ozveme se co nejdříve.",
      privacy:
        "Odesláním formuláře souhlasíte se zpracováním údajů pro vyřízení dotazu.",
    },
  },
  footer: {
    links: {
      about: "O nás",
      howItWorks: "Jak to funguje",
      contact: "Kontakt",
      privacy: "GDPR",
      terms: "Podmínky",
      cookies: "Cookies",
    },
    copyright: "© {{year}} Spotonaut, všechna práva vyhrazena.",
  },
} as const;

export default cs;
