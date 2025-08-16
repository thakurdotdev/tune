"use client";

import { ChevronDown, Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";

export const languages = [
  "Hindi",
  "English",
  "Punjabi",
  "Tamil",
  "Telugu",
  "Marathi",
  "Gujarati",
  "Bengali",
  "Kannada",
  "Bhojpuri",
  "Malayalam",
  "Urdu",
  "Haryanvi",
  "Rajasthani",
  "Odia",
  "Assamese",
] as const;

export type Language = Lowercase<(typeof languages)[number]>;

export function LanguagePicker() {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<Language[]>([
    "hindi",
  ]);

  function updateLanguages() {
    toast.success("Preferences updated!", {
      description: "Your language preferences have been updated.",
    });
  }

  return (
    <DropdownMenu onOpenChange={(o) => setIsOpen(o)}>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="hidden size-10 space-x-1 p-0 shadow-sm lg:inline-flex lg:w-auto lg:space-x-2 lg:p-2"
        >
          <Languages className="aspect-square h-5 lg:h-4" />
          <span className="hidden lg:inline-block">Languages</span>
          <ChevronDown
            className={cn(
              "hidden size-4 duration-300 lg:inline-block",
              isOpen && "rotate-180",
            )}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuLabel className="p-4">
          <h1 className="font-heading text-lg drop-shadow-md dark:bg-gradient-to-br dark:from-neutral-200 dark:to-neutral-600 dark:bg-clip-text dark:text-transparent sm:text-xl md:text-2xl">
            What music do you like?
          </h1>

          <small className="text-xs text-muted-foreground">
            Pick all the languages you want to listen to.
          </small>
        </DropdownMenuLabel>

        <ToggleGroup
          type="multiple"
          value={selectedLanguages}
          onValueChange={(v) => setSelectedLanguages(v as Language[])}
          className="grid grid-cols-2 border-y py-2 w-full"
        >
          {languages.map((lang) => (
            <ToggleGroupItem
              key={lang}
              value={lang.toLowerCase()}
              variant="outline"
            >
              {lang}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <DropdownMenuItem className="rounded-none focus:bg-transparent">
          <Button onClick={updateLanguages} className="w-full text-lg">
            Save
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
