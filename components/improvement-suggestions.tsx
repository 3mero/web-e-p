"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface SuggestionCategory {
  name: string
  description: string
  suggestions: {
    title: string
    description: string
    difficulty: "easy" | "medium" | "hard"
  }[]
}

const improvementSuggestions: SuggestionCategory[] = [
  {
    name: "User Interface",
    description: "Improvements to enhance the visual appearance and user experience",
    suggestions: [
      {
        title: "Dark Mode Toggle",
        description: "Add a toggle to switch between light and dark themes for better eye comfort",
        difficulty: "medium",
      },
      {
        title: "Customizable Editor Theme",
        description: "Allow users to choose from different editor color themes",
        difficulty: "medium",
      },
      {
        title: "Responsive Mobile View",
        description: "Optimize the interface for mobile devices with touch-friendly controls",
        difficulty: "hard",
      },
      {
        title: "Keyboard Shortcuts",
        description: "Add keyboard shortcuts for common actions like save, run, and navigation",
        difficulty: "medium",
      },
      {
        title: "Drag and Drop File Upload",
        description: "Allow users to drag and drop files directly into the file explorer",
        difficulty: "medium",
      },
    ],
  },
  {
    name: "Editor Features",
    description: "Enhancements to the code editing experience",
    suggestions: [
      {
        title: "Syntax Highlighting Improvements",
        description: "Add better syntax highlighting for more languages and frameworks",
        difficulty: "medium",
      },
      {
        title: "Code Formatting",
        description: "Add a button to automatically format code using Prettier or similar tools",
        difficulty: "medium",
      },
      {
        title: "Code Snippets",
        description: "Create a library of common code snippets that users can easily insert",
        difficulty: "medium",
      },
      {
        title: "Auto-completion",
        description: "Implement code auto-completion for HTML, CSS, and JavaScript",
        difficulty: "hard",
      },
      {
        title: "Error Highlighting",
        description: "Show syntax errors and warnings directly in the editor",
        difficulty: "hard",
      },
    ],
  },
  {
    name: "Project Management",
    description: "Features to better organize and manage projects",
    suggestions: [
      {
        title: "Project Templates",
        description: "Add pre-built templates for common project types (React, Vue, etc.)",
        difficulty: "medium",
      },
      {
        title: "Project Settings",
        description: "Allow users to configure project-specific settings",
        difficulty: "medium",
      },
      {
        title: "Git Integration",
        description: "Add basic Git functionality like commit, push, and pull",
        difficulty: "hard",
      },
      {
        title: "Project Sharing",
        description: "Allow users to share projects with others via a link",
        difficulty: "hard",
      },
      {
        title: "Project Backup",
        description: "Automatically backup projects to prevent data loss",
        difficulty: "medium",
      },
    ],
  },
  {
    name: "Preview & Testing",
    description: "Improvements to the preview and testing capabilities",
    suggestions: [
      {
        title: "Live Preview",
        description: "Update the preview in real-time as code changes without manual refresh",
        difficulty: "medium",
      },
      {
        title: "Responsive Testing",
        description: "Add options to preview at different screen sizes for responsive design testing",
        difficulty: "medium",
      },
      {
        title: "Console Output",
        description: "Show JavaScript console output directly in the editor interface",
        difficulty: "medium",
      },
      {
        title: "Network Request Inspection",
        description: "Display network requests made by the preview for debugging",
        difficulty: "hard",
      },
      {
        title: "Framework Support",
        description: "Improve preview support for modern frameworks like React, Vue, and Angular",
        difficulty: "hard",
      },
    ],
  },
  {
    name: "Collaboration",
    description: "Features to enable team collaboration",
    suggestions: [
      {
        title: "Real-time Collaboration",
        description: "Allow multiple users to edit the same project simultaneously",
        difficulty: "hard",
      },
      {
        title: "Comments & Annotations",
        description: "Add the ability to leave comments on specific lines of code",
        difficulty: "medium",
      },
      {
        title: "User Roles & Permissions",
        description: "Define different access levels for project collaborators",
        difficulty: "hard",
      },
      {
        title: "Change History",
        description: "Track and display changes made to files over time",
        difficulty: "hard",
      },
      {
        title: "Export & Share",
        description: "Improve options for exporting and sharing projects",
        difficulty: "medium",
      },
    ],
  },
  {
    name: "Performance & Storage",
    description: "Optimizations for better performance and storage management",
    suggestions: [
      {
        title: "Improved File Storage",
        description: "Optimize how files are stored for better performance and reliability",
        difficulty: "medium",
      },
      {
        title: "Lazy Loading",
        description: "Implement lazy loading for large projects to improve load times",
        difficulty: "medium",
      },
      {
        title: "Compression",
        description: "Compress project data to reduce storage usage",
        difficulty: "medium",
      },
      {
        title: "Cloud Sync",
        description: "Add the option to sync projects with cloud storage services",
        difficulty: "hard",
      },
      {
        title: "Offline Support",
        description: "Enable full functionality when offline with sync when reconnected",
        difficulty: "hard",
      },
    ],
  },
]

export default function ImprovementSuggestions() {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }))
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Web Editor Improvement Suggestions</h1>
      <p className="text-muted-foreground mb-8">
        Here are some suggestions to enhance your web editor platform. These improvements range from simple UI
        enhancements to advanced features.
      </p>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Suggestions</TabsTrigger>
          <TabsTrigger value="easy">Easy to Implement</TabsTrigger>
          <TabsTrigger value="medium">Medium Difficulty</TabsTrigger>
          <TabsTrigger value="hard">Advanced Features</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="grid gap-6">
            {improvementSuggestions.map((category) => (
              <Card key={category.name}>
                <CardHeader className="cursor-pointer" onClick={() => toggleCategory(category.name)}>
                  <div className="flex justify-between items-center">
                    <CardTitle>{category.name}</CardTitle>
                    {expandedCategories[category.name] ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                {expandedCategories[category.name] && (
                  <CardContent>
                    <ScrollArea className="h-[300px]">
                      <div className="space-y-4">
                        {category.suggestions.map((suggestion) => (
                          <div key={suggestion.title} className="p-4 border rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{suggestion.title}</h3>
                              <span
                                className={cn(
                                  "px-2 py-1 text-xs rounded-full",
                                  suggestion.difficulty === "easy"
                                    ? "bg-green-100 text-green-800"
                                    : suggestion.difficulty === "medium"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800",
                                )}
                              >
                                {suggestion.difficulty}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="easy">
          <div className="grid gap-6">
            {improvementSuggestions.map((category) => {
              const easySuggestions = category.suggestions.filter((s) => s.difficulty === "easy")
              if (easySuggestions.length === 0) return null

              return (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {easySuggestions.map((suggestion) => (
                        <div key={suggestion.title} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">easy</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="medium">
          <div className="grid gap-6">
            {improvementSuggestions.map((category) => {
              const mediumSuggestions = category.suggestions.filter((s) => s.difficulty === "medium")
              if (mediumSuggestions.length === 0) return null

              return (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {mediumSuggestions.map((suggestion) => (
                        <div key={suggestion.title} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">medium</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="hard">
          <div className="grid gap-6">
            {improvementSuggestions.map((category) => {
              const hardSuggestions = category.suggestions.filter((s) => s.difficulty === "hard")
              if (hardSuggestions.length === 0) return null

              return (
                <Card key={category.name}>
                  <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {hardSuggestions.map((suggestion) => (
                        <div key={suggestion.title} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium">{suggestion.title}</h3>
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">hard</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

