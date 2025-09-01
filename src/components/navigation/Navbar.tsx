"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMegaMenu } from "@/queries/useMusic";
import { useUserStore } from "@/stores/userStore";
import {
  Compass,
  Download,
  Heart,
  History,
  Home,
  Library,
  ListMusic,
  LogIn,
  LogOut,
  Moon,
  Radio,
  Settings,
  Sun,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LazyImage from "../LazyImage";
import MusicCommand from "../music/MusicCommand";
import { LanguagePicker } from "./language-picker";
import { MainNav } from "./main-nav";

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
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);
  const [mounted, setMounted] = useState(false);

  const {
    data: megaMenu = { top_artists: [], top_playlists: [], new_releases: [] },
  } = useMegaMenu();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div
              className="flex items-center justify-center w-10 h-10 rounded-none shadow-lg"
              onClick={() => router.push("/")}
            >
              <LazyImage
                src="/logo.png"
                alt="Logo"
                height={40}
                width={40}
                className="w-full h-full object-cover rounded-none"
              />
            </div>
          </div>

          {/* Navigation Links - Hidden on mobile */}
          <div className="hidden lg:flex items-center space-x-1">
            <MainNav megaMenu={megaMenu!} className="hidden lg:block" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md lg:mx-8">
          <MusicCommand />
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          <LanguagePicker />

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
          {user ? (
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

                <DropdownMenuItem
                  className="flex items-center space-x-2 cursor-pointer text-red-600 focus:text-red-600"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" onClick={() => router.push("/login")}>
              Login
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
