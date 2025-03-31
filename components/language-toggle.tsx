"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Language = "en" | "ar"

// Memoize the component to prevent unnecessary re-renders
export const LanguageToggle = memo(function LanguageToggle() {
  const [mounted, setMounted] = useState(false)
  const [language, setLanguage] = useState<Language>("en")

  // Load saved language preference
  useEffect(() => {
    setMounted(true)
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage) {
      setLanguage(savedLanguage)
      document.documentElement.lang = savedLanguage
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr"

      if (savedLanguage === "ar") {
        document.body.classList.add("rtl")
      } else {
        document.body.classList.remove("rtl")
      }
    }
  }, [])

  // Change language - memoized to prevent unnecessary re-renders
  const changeLanguage = useCallback((newLanguage: Language) => {
    setLanguage(newLanguage)
    localStorage.setItem("language", newLanguage)
    document.documentElement.lang = newLanguage
    document.documentElement.dir = newLanguage === "ar" ? "rtl" : "ltr"

    if (newLanguage === "ar") {
      document.body.classList.add("rtl")
    } else {
      document.body.classList.remove("rtl")
    }
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Change language">
          <Globe className="h-5 w-5" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => changeLanguage("en")} className={language === "en" ? "bg-muted" : ""}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => changeLanguage("ar")} className={language === "ar" ? "bg-muted" : ""}>
          العربية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
})

