"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Search, Library, Heart, Radio } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const mobileNavItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Search, label: "Search", href: "/search" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: Heart, label: "Liked", href: "/liked" },
  { icon: Radio, label: "Radio", href: "/radio" },
];

const MobileNavbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex items-center justify-around h-16 px-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center space-y-1 h-12 w-16 p-0 transition-all duration-200",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-all duration-200",
                  isActive && "scale-110",
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-1 h-1 bg-primary rounded-full" />
              )}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
