import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function FieldHelpNew({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          title="Nápověda"
          className="cursor-pointer ms-2 inline-flex items-center align-middle h-4 leading-none text-slate-400 hover:text-slate-200"
        >
          <svg
            className="w-4 h-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.529 9.988a2.502 2.502 0 1 1 5 .191A2.441 2.441 0 0 1 12 12.582V14m-.01 3.008H12M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <span className="sr-only">Zobrazit nápovědu</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 bg-secondary p-4">
        <div>
          {title && (
            <h3 className="font-semibold text-heading mb-2">{title}</h3>
          )}
          <p className="text-sm text-slate-300">{description}</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
