"use client"

import ImprovementSuggestions from "@/components/improvement-suggestions"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SuggestionsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b p-4 flex items-center bg-background">
        <Link href="/" className="mr-4">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-xl font-bold">Improvement Suggestions</h1>
      </header>

      <main className="flex-1">
        <ImprovementSuggestions />
      </main>
    </div>
  )
}

