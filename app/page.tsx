"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { PlusCircle, Folder, Clock, Trash2, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/hooks/use-translation"

interface Project {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const { toast } = useToast()
  const { t } = useTranslation()

  useEffect(() => {
    // Load projects from localStorage
    const loadProjects = () => {
      try {
        const storedProjects = localStorage.getItem("web-editor-projects")
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects))
        }
      } catch (error) {
        console.error("Failed to load projects:", error)
        toast({
          title: t("error"),
          description: "Failed to load your projects",
          variant: "destructive",
        })
      }
    }

    loadProjects()
  }, [toast, t])

  const deleteProject = (id: string) => {
    try {
      // Remove project from state
      const updatedProjects = projects.filter((project) => project.id !== id)
      setProjects(updatedProjects)

      // Update localStorage
      localStorage.setItem("web-editor-projects", JSON.stringify(updatedProjects))

      // Remove project files from IndexedDB
      const dbRequest = indexedDB.open("web-editor-files", 1)

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["files"], "readwrite")
        const objectStore = transaction.objectStore("files")

        // Delete all files with the project ID prefix
        const index = objectStore.index("projectId")
        const keyRange = IDBKeyRange.bound(`${id}/`, `${id}/\uffff`)

        const cursorRequest = index.openCursor(keyRange)

        cursorRequest.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result
          if (cursor) {
            objectStore.delete(cursor.primaryKey)
            cursor.continue()
          }
        }

        transaction.oncomplete = () => {
          toast({
            title: "Project deleted",
            description: "The project has been successfully deleted",
          })
        }
      }
    } catch (error) {
      console.error("Failed to delete project:", error)
      toast({
        title: t("error"),
        description: "Failed to delete the project",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Web Project Editor</h1>
        <div className="flex gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <Link href="/suggestions">
            <Button variant="outline">
              <Lightbulb className="mr-2 h-4 w-4" />
              Improvement Suggestions
            </Button>
          </Link>
          <Link href="/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("createProject")}
            </Button>
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12">
          <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">{t("noProjects")}</h2>
          <p className="text-muted-foreground mb-4">{t("noProjectsDescription")}</p>
          <Link href="/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("createYourFirstProject")}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate">{project.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm line-clamp-2 h-10">
                  {project.description || "No description"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-4">
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>Updated {formatDistanceToNow(project.updatedAt, { addSuffix: true })}</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => deleteProject(project.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link href={`/editor/${project.id}`}>
                    <Button size="sm">Open</Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

