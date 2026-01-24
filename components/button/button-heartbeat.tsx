import { Button } from "@/components/ui/button";
import Link from "next/link";

const ButtonHeartbeat = ({
  InnerText,
  variant = "default",
  className = "",
  ...props
}) => {
  return (
    <Button
      variant={variant}
      className={`animate-heartbeat ${className}`}
      style={{ "--heartbeat-color": "var(--primary)" }}
      {...props}
    >
      <Link href="#link">
        <span className="text-nowrap">{InnerText}</span>
      </Link>
    </Button>
  );
};

export default ButtonHeartbeat;
