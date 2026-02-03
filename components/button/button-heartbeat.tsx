import { Button } from "@/components/ui/button";
import Link from "next/link";

const ButtonHeartbeat = ({
  size = "sm",
  InnerText,
  variant = "default",
  className = "",
  ...props
}: {
  size?:
    | "default"
    | "xs"
    | "sm"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg"
    | null
    | undefined;
  InnerText: string;
  variant?: "default" | "outline" | "ghost" | "link" | "destructive";
  className?: string;
}) => {
  return (
    <Button
      size={size}
      variant={variant}
      className={`animate-heartbeat ${className}`}
      style={{ "--heartbeat-color": "var(--primary)" } as React.CSSProperties}
      {...props}
    >
      <Link href="#link">
        <span className="text-nowrap">{InnerText}</span>
      </Link>
    </Button>
  );
};

export default ButtonHeartbeat;
