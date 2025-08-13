"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Search,
  Home,
  Compass,
  Library,
  Heart,
  ListMusic,
  Radio,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Music,
  Volume2,
  Bell,
  Download,
  History,
  Mic2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserStore } from "@/stores/userStore";

const navItems = [
  { icon: Home, label: "Home", href: "/", isActive: true },
  { icon: Compass, label: "Discover", href: "/discover" },
  { icon: Radio, label: "Radio", href: "/radio" },
  { icon: Library, label: "Library", href: "/library" },
  { icon: ListMusic, label: "Playlists", href: "/playlists" },
  { icon: Heart, label: "Liked Songs", href: "/liked" },
  { icon: History, label: "Recent", href: "/recent" },
];

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((state) => state.user);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg">
                <Music className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Tune
                </h1>
                <p className="text-xs text-muted-foreground -mt-1">
                  Your Music Buddy
                </p>
              </div>
            </div>

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.slice(0, 4).map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center space-x-2 h-9 px-3 transition-all duration-200",
                      isActive
                        ? "bg-primary/10 text-primary hover:bg-primary/15"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 lg:mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 h-10 bg-muted/50 border-0 focus:bg-muted focus:ring-2 focus:ring-primary/20 transition-all duration-200"
              />
            </form>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 p-0 hover:bg-muted transition-colors duration-200"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative w-9 h-9 p-0 rounded-full hover:bg-muted transition-colors duration-200"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage
                      src={user?.profilepic}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-2">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "Music Lover"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || "user@example.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/library")}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Library className="w-4 h-4" />
                  <span>Your Library</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/liked")}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Heart className="w-4 h-4" />
                  <span>Liked Songs</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => router.push("/downloads")}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Downloads</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => router.push("/settings")}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
