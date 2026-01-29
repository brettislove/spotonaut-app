"use client";

import * as React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

interface DrawerContextValue {
  activeSnapPoint: string;
  setActiveSnapPoint: (point: string) => void;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(
  undefined,
);

function useDrawer() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawer must be used within a Drawer");
  }
  return context;
}

interface DrawerProps {
  open: boolean;
  modal?: boolean;
  dismissible?: boolean;
  snapPoints: string[];
  activeSnapPoint: string;
  setActiveSnapPoint: (point: string) => void;
  direction?: "bottom" | "top" | "left" | "right";
  fadeFromIndex?: number;
  children: React.ReactNode;
}

const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  (
    {
      open,
      modal = true,
      dismissible = true,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      direction = "bottom",
      fadeFromIndex = 0,
      children,
    },
    ref,
  ) => {
    if (!open) return null;

    return (
      <DrawerContext.Provider value={{ activeSnapPoint, setActiveSnapPoint }}>
        <div ref={ref} className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      </DrawerContext.Provider>
    );
  },
);
Drawer.displayName = "Drawer";

interface DrawerContentProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: React.ReactNode;
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ className, children, ...props }, ref) => {
    const { activeSnapPoint } = useDrawer();

    return (
      <motion.div
        ref={ref}
        className={cn(
          "absolute bottom-0 left-0 right-0 flex flex-col rounded-t-lg pointer-events-auto",
          className,
        )}
        initial={false}
        animate={{
          height: activeSnapPoint,
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 300,
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn("flex flex-col space-y-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      data-slot="drawer-title"
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className,
      )}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
