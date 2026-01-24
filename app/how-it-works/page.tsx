import Link from "next/link";
import Image from "next/image";
import { MapPin, Sparkles, MessageSquare } from "lucide-react";
import HowItWorksSteps from "@/components/howitworks-steps";
import IntegrationsSection from "@/components/integrations-section";
import FAQSection from "@/components/faqs";

export default function HowItWorksPage() {
  return (
    <>
      <HowItWorksSteps />
      <IntegrationsSection />
      <FAQSection />
    </>
  );
}

// interface StepCardProps {
//   stepNumber: number;
//   title: string;
//   description: string;
//   icon: React.ReactNode;
//   decorativeElement: React.ReactNode;
// }

// function StepCard({
//   stepNumber,
//   title,
//   description,
//   icon,
//   decorativeElement,
// }: StepCardProps) {
//   return (
//     <div className="group relative">
//       <div className="relative bg-white/[0.18] backdrop-blur-xl rounded-[20px] border border-white/25 p-6 h-full transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:-translate-y-0.5">
//         {/* Step number badge */}
//         <div className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gradient-to-br from-[#A43BFE] to-[#3142FF] flex items-center justify-center text-white text-sm font-semibold shadow-lg">
//           {stepNumber}
//         </div>

//         {/* Icon */}
//         <div className="mb-4 text-[#A43BFE]">{icon}</div>

//         {/* Content */}
//         <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
//         <p className="text-[15px] text-white/75 leading-relaxed mb-6">
//           {description}
//         </p>

//         {/* Decorative element */}
//         <div className="mt-auto">{decorativeElement}</div>
//       </div>
//     </div>
//   );
// }

// function WaveformMock() {
//   return (
//     <div className="bg-white/10 rounded-lg p-3 border border-white/20">
//       <div className="flex items-end gap-1 h-12">
//         {[3, 8, 4, 9, 5, 7, 3, 6, 8, 4, 7, 5].map((height, i) => (
//           <div
//             key={i}
//             className="flex-1 bg-gradient-to-t from-[#A43BFE] to-[#9B8AFB] rounded-sm opacity-70"
//             style={{ height: `${height * 10}%` }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

// function AnalysisMock() {
//   return (
//     <div className="bg-white/10 rounded-lg p-3 border border-white/20 space-y-2">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A43BFE] to-[#3142FF]" />
//           <div className="space-y-1">
//             <div className="h-2 w-20 bg-white/30 rounded" />
//             <div className="h-1.5 w-16 bg-white/20 rounded" />
//           </div>
//         </div>
//         <div className="text-xs font-semibold text-[#9B8AFB]">85/100</div>
//       </div>
//       <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
//         <div className="h-full w-[85%] bg-gradient-to-r from-[#A43BFE] to-[#9B8AFB]" />
//       </div>
//     </div>
//   );
// }

// function ChatMock() {
//   return (
//     <div className="bg-white/10 rounded-lg p-3 border border-white/20 space-y-2">
//       <div className="flex gap-2">
//         <div className="w-6 h-6 rounded-full bg-white/20 flex-shrink-0" />
//         <div className="space-y-1 flex-1">
//           <div className="h-2 bg-white/30 rounded w-full" />
//           <div className="h-2 bg-white/20 rounded w-3/4" />
//         </div>
//       </div>
//       <div className="flex gap-2 justify-end">
//         <div className="space-y-1 flex-1 max-w-[70%]">
//           <div className="h-2 bg-[#A43BFE]/30 rounded w-full ml-auto" />
//           <div className="h-2 bg-[#A43BFE]/20 rounded w-2/3 ml-auto" />
//         </div>
//         <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A43BFE] to-[#3142FF] flex-shrink-0" />
//       </div>
//     </div>
//   );
// }

// export default function HowItWorksPage() {
//   return (
//     <div className="min-h-screen bg-slate-950 font-sans relative overflow-hidden py-24 px-6">
//       {/* Moon background */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <div className="w-full h-full relative">
//           <Image
//             src="/Moon.png"
//             alt="Moon"
//             fill
//             className="object-cover opacity-20"
//             priority
//           />
//         </div>
//         {/* Ambient glow effects */}
//         <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
//         <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
//       </div>

//       {/* Main container with gradient background */}
//       <div className="max-w-[1200px] mx-auto relative z-10">
//         <div className="relative rounded-[32px] bg-gradient-to-r from-[#0f172a] via-purple-950/20 to-[#0f172a] p-12 lg:p-24">
//           {/* Header */}
//           <header className="mb-16 text-center">
//             {/* Badge */}
//             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/25 backdrop-blur-sm mb-6">
//               <span className="text-[13px] font-medium text-white/90">
//                 Jak to funguje
//               </span>
//             </div>

//             {/* Headline */}
//             <h1 className="text-4xl lg:text-[48px] font-bold text-white mb-4 leading-tight">
//               3 jednoduché kroky pro{" "}
//               <span className="bg-gradient-to-r from-[#A43BFE] to-[#3142FF] bg-clip-text text-transparent">
//                 analýzu lokality
//               </span>
//             </h1>

//             {/* Subtitle */}
//             <p className="text-[15px] lg:text-base text-white/75 max-w-2xl mx-auto leading-relaxed">
//               Výběr lokality může být nejdražší rozhodnutí celého podnikání.
//               Spotonaut Ti dá rychlý, srozumitelný způsob, jak si místo prověřit
//               dřív, než podepíšeš nájemní či kupní smlouvu.
//             </p>
//           </header>

//           {/* Steps Grid */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-16">
//             <StepCard
//               stepNumber={1}
//               title="Zadej vstupní data"
//               description="Vyber cílovou lokalitu špendlíkem na mapě nebo zadej adresu. Uveď typ podnikání — tento výběr řídí celou analýzu."
//               icon={<MapPin className="w-8 h-8" />}
//               decorativeElement={<WaveformMock />}
//             />

//             <StepCard
//               stepNumber={2}
//               title="AI analýza a skóre"
//               description="Využíváme mapové podklady a veřejná data (doprava, zástavba, konkurence). AI vyhodnotí lokaci a zobrazí klíčová skóre 0–100."
//               icon={<Sparkles className="w-8 h-8" />}
//               decorativeElement={<AnalysisMock />}
//             />

//             <StepCard
//               stepNumber={3}
//               title="Interaktivní chat"
//               description="V chatu dostaneš detailní rozbor a konkrétní doporučení (sortiment, otevírací doba, marketing). Polož další otázky a rozvíjej strategii."
//               icon={<MessageSquare className="w-8 h-8" />}
//               decorativeElement={<ChatMock />}
//             />
//           </div>

//           {/* Tips Section */}
//           <section className="mb-12">
//             <h2 className="text-2xl lg:text-[32px] font-semibold text-white mb-6 text-center">
//               Tipy jak Spotonaut využít naplno
//             </h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
//               {[
//                 "Testuj víc lokalit se stejným typem podnikání pro srovnání",
//                 "Zkus různé typy podnikání na téže adrese a porovnej skóre",
//                 "Použij chat pro doporučení ohledně sortimentu a otevírací doby",
//                 "Ulož výsledky a sdílej je s poradcem nebo spolumajitelem",
//               ].map((tip, i) => (
//                 <div
//                   key={i}
//                   className="bg-white/[0.18] backdrop-blur-xl rounded-[20px] border border-white/25 p-4 text-[15px] text-white/75 transition-all duration-300 hover:bg-white/[0.22]"
//                 >
//                   {tip}
//                 </div>
//               ))}
//             </div>
//           </section>

//           {/* CTA Footer */}
//           <footer className="text-center">
//             <Link
//               href="/"
//               className="inline-block bg-gradient-to-r from-[#3142FF] to-[#A43BFE] text-white text-base font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 border border-white/20"
//             >
//               Vyzkoušej zdarma!
//             </Link>
//             <p className="text-white/60 text-[13px] mt-6">
//               Potřebuješ pomoct? Napiš nám na{" "}
//               <a
//                 href="mailto:crew@spotonaut.com"
//                 className="text-[#9B8AFB] hover:text-white transition-colors underline"
//               >
//                 crew@spotonaut.com
//               </a>
//             </p>
//           </footer>
//         </div>
//       </div>
//     </div>
//   );
// }
