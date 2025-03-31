"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
// إضافة استيراد الأيقونات الجديدة
import { ChevronLeft, Save, Play, Download, Smartphone, Tablet, Monitor, Upload, FileUp } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import JSZip from "jszip"
import MonacoEditor from "@/components/monaco-editor"
import FileExplorer from "@/components/file-explorer"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { ShortcutsHelpDialog } from "@/components/shortcuts-help-dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageToggle } from "@/components/language-toggle"
import { useTranslation } from "@/hooks/use-translation"

interface File {
  path: string
  projectId: string
  content: string
  lastModified: number
}

interface Project {
  id: string
  name: string
  description: string
  createdAt: number
  updatedAt: number
}

export default function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useTranslation()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [newFileName, setNewFileName] = useState("")
  const [newFileDialogOpen, setNewFileDialogOpen] = useState(false)
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false)
  const [uploadTab, setUploadTab] = useState<"files" | "zip">("files")
  const [previewSize, setPreviewSize] = useState<"desktop" | "tablet" | "mobile">("desktop")
  const previewIframeRef = useRef<HTMLIFrameElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const zipFileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)
  // إضافة مرجع لمدخل المجلد
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Declare missing variables
  const [isLoaded, setIsLoaded] = useState(false)
  const editorInstanceRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)

  // تعديل وظيفة updatePreview لمنع التحديثات المتكررة
  const updatePreview = useCallback(
    (projectFiles: File[]) => {
      try {
        // إضافة معرف للتحديث الحالي لمنع التحديثات المتداخلة
        const updateId = Date.now()
        ;(updatePreview as any).lastUpdateId = updateId

        // تأخير قصير لمنع التحديثات المتكررة بشكل سريع جدًا
        setTimeout(() => {
          // تحقق مما إذا كان هذا هو آخر تحديث مطلوب
          if ((updatePreview as any).lastUpdateId !== updateId) {
            return
          }

          // Check if this is a Next.js project
          const packageJson = projectFiles.find((file) => file.path.endsWith("package.json"))
          const isNextJsProject = packageJson && packageJson.content.includes('"next"')

          if (isNextJsProject) {
            // For Next.js projects, show a special message
            const nextJsPreviewHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Next.js Project Preview</title>
<style>
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  text-align: center;
}
.container {
  margin-top: 50px;
  padding: 30px;
  border-radius: 8px;
  background-color: #f5f5f5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
h1 {
  color: #0070f3;
}
.code {
  background-color: #eaeaea;
  padding: 12px;
  border-radius: 4px;
  font-family: monospace;
  text-align: left;
  margin: 20px 0;
  overflow-x: auto;
}
.note {
  background-color: #fffde7;
  border-left: 4px solid #ffd600;
  padding: 12px;
  margin: 20px 0;
  text-align: left;
}
</style>
</head>
<body>
<div class="container">
<h1>Next.js Project</h1>
<p>This is a Next.js project which requires a build step and server-side rendering.</p>

<div class="note">
  <strong>Note:</strong> The web editor preview cannot fully render Next.js projects. To run this project:
  <ol style="text-align: left;">
    <li>Export the project as a ZIP file</li>
    <li>Extract it on your local machine</li>
    <li>Run <code>npm install</code> and <code>npm run dev</code></li>
  </ol>
</div>

<h2>Project Structure</h2>
<div class="code">
  ${projectFiles
    .map((file) => {
      const relativePath = file.path.replace(`${id}/`, "")
      return `${relativePath}`
    })
    .join("<br>")}
</div>
</div>
</body>
</html>
          `

            // Create a blob with the Next.js preview HTML
            const blob = new Blob([nextJsPreviewHtml], { type: "text/html" })
            const url = URL.createObjectURL(blob)

            // Revoke the old URL to prevent memory leaks
            if (previewUrl) {
              URL.revokeObjectURL(previewUrl)
            }

            setPreviewUrl(url)
            return
          }

          // Regular HTML preview for non-Next.js projects (existing code)
          const htmlFiles = projectFiles.filter((file) => file.path.endsWith(".html"))
          if (htmlFiles.length === 0) {
            toast({
              title: t("error"),
              description: "Your project needs at least one HTML file for preview",
              variant: "destructive",
            })
            return
          }

          // Find index.html or use the first HTML file
          const indexHtml = htmlFiles.find((file) => file.path.endsWith("index.html")) || htmlFiles[0]

          // Create a map of all files for easy lookup
          const fileMap = new Map<string, string>()
          projectFiles.forEach((file) => {
            const relativePath = file.path.replace(`${id}/`, "")
            fileMap.set(relativePath, file.content)
          })

          // Process HTML to handle relative imports
          const processedHtml = indexHtml.content

          // Create a blob with the processed HTML
          const blob = new Blob([processedHtml], { type: "text/html" })
          const url = URL.createObjectURL(blob)

          // Revoke the old URL to prevent memory leaks
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl)
          }

          setPreviewUrl(url)
        }, 300) // تأخير 300 مللي ثانية لمنع التحديثات المتكررة
      } catch (error) {
        console.error("Failed to update preview:", error)
        toast({
          title: t("error"),
          description: "Failed to generate preview. Please check your HTML file.",
          variant: "destructive",
        })
      }
    },
    [id, previewUrl, t, toast],
  )

  // تعديل وظيفة handleEditorChange لمنع تحديث المعاينة مع كل تغيير في المحرر
  const handleEditorChange = useCallback(
    (value: string) => {
      if (!currentFile) return

      const updatedFile = { ...currentFile, content: value }
      setCurrentFile(updatedFile)
      setFiles((prev) => prev.map((file) => (file.path === currentFile.path ? updatedFile : file)))

      // لا نقوم بتحديث المعاينة هنا لمنع التحديثات المتكررة
    },
    [currentFile],
  )

  // Format code - memoized
  const formatCode = useCallback(() => {
    if (!currentFile) return

    // Get the file extension to determine language
    const extension = currentFile.path.split(".").pop()?.toLowerCase()
    let formatted = currentFile.content

    // Basic formatting based on language
    switch (extension) {
      case "html":
      case "htm":
      case "xml":
      case "svg":
        // Simple HTML formatting
        formatted = formatted.replace(/>\s*</g, ">\n<")
        formatted = formatted.replace(/<(\w+)([^>]*)>/g, "<$1$2>")
        formatted = formatted.replace(/<\/(\w+)>/g, "</$1>")
        break

      case "css":
      case "scss":
      case "less":
        // Simple CSS formatting
        formatted = formatted.replace(/\{/g, " {\n  ")
        formatted = formatted.replace(/;/g, ";\n  ")
        formatted = formatted.replace(/\s*\}/g, "\n}")
        break

      case "js":
      case "jsx":
      case "ts":
      case "tsx":
      case "json":
        // Simple JS/TS formatting
        formatted = formatted.replace(/\{/g, " {\n  ")
        formatted = formatted.replace(/\}/g, "\n}")
        formatted = formatted.replace(/;/g, ";\n")
        break
    }

    handleEditorChange(formatted)

    toast({
      title: "Code formatted",
      description: "Basic formatting applied to your code",
    })
  }, [currentFile, handleEditorChange, toast])

  // Save changes to IndexedDB - memoized
  const saveChanges = useCallback(async () => {
    if (!project) return

    setIsSaving(true)

    try {
      const dbRequest = indexedDB.open("web-editor-files", 1)

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["files"], "readwrite")
        const objectStore = transaction.objectStore("files")

        // Update all files
        const promises = files.map((file) => {
          return new Promise<void>((resolve, reject) => {
            const request = objectStore.put(file)
            request.onsuccess = () => resolve()
            request.onerror = () => reject()
          })
        })

        Promise.all(promises)
          .then(() => {
            // Update project's updatedAt timestamp
            const timestamp = Date.now()
            const updatedProject = { ...project, updatedAt: timestamp }

            // Update in localStorage
            const storedProjects = localStorage.getItem("web-editor-projects")
            if (storedProjects) {
              const projects: Project[] = JSON.parse(storedProjects)
              const updatedProjects = projects.map((p) => (p.id === project.id ? updatedProject : p))
              localStorage.setItem("web-editor-projects", JSON.stringify(updatedProjects))
            }

            setProject(updatedProject)

            // تحديث المعاينة بعد الانتهاء من الحفظ
            setTimeout(() => {
              updatePreview(files)
            }, 300)

            toast({
              title: t("changesSaved"),
              description: "Your changes have been saved successfully",
            })
          })
          .catch((error) => {
            console.error("Failed to save changes:", error)
            toast({
              title: t("error"),
              description: "Failed to save your changes",
              variant: "destructive",
            })
          })
          .finally(() => {
            setIsSaving(false)
          })
      }

      dbRequest.onerror = (event) => {
        console.error("IndexedDB error:", event)
        toast({
          title: t("error"),
          description: "Failed to save your changes",
          variant: "destructive",
        })
        setIsSaving(false)
      }
    } catch (error) {
      console.error("Failed to save changes:", error)
      toast({
        title: t("error"),
        description: "Failed to save your changes",
        variant: "destructive",
      })
      setIsSaving(false)
    }
  }, [project, files, updatePreview, t, toast])

  // Create a new file - memoized
  const createNewFile = useCallback(() => {
    if (!project || !newFileName.trim()) return

    // Validate file name
    if (!/^[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+$/.test(newFileName)) {
      toast({
        title: t("error"),
        description: "Please enter a valid file name with extension",
        variant: "destructive",
      })
      return
    }

    // Check if file already exists
    const filePath = `${id}/${newFileName}`
    if (files.some((file) => file.path === filePath)) {
      toast({
        title: t("error"),
        description: "A file with this name already exists",
        variant: "destructive",
      })
      return
    }

    // Create folders if they don't exist
    const folderPath = newFileName.split("/").slice(0, -1).join("/")
    if (folderPath) {
      // Check if the folder structure exists
      const folderExists = files.some((file) => {
        const relativePath = file.path.replace(`${id}/`, "")
        return relativePath.startsWith(folderPath + "/")
      })

      if (!folderExists) {
        // Create an empty .gitkeep file to represent the folder
        const timestamp = Date.now()
        const gitkeepFile: File = {
          path: `${id}/${folderPath}/.gitkeep`,
          projectId: id as string,
          content: "",
          lastModified: timestamp,
        }

        setFiles((prevFiles) => [...prevFiles, gitkeepFile])

        // Save the .gitkeep file to IndexedDB
        const dbRequest = indexedDB.open("web-editor-files", 1)
        dbRequest.onsuccess = (event) => {
          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["files"], "readwrite")
          const objectStore = transaction.objectStore("files")
          objectStore.add(gitkeepFile)
        }
      }
    }

    const timestamp = Date.now()
    const newFile: File = {
      path: filePath,
      projectId: id as string,
      content: "",
      lastModified: timestamp,
    }

    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    setCurrentFile(newFile)
    setNewFileName("")
    setNewFileDialogOpen(false)

    // Save the new file to IndexedDB
    const dbRequest = indexedDB.open("web-editor-files", 1)

    dbRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      const transaction = db.transaction(["files"], "readwrite")
      const objectStore = transaction.objectStore("files")

      objectStore.add(newFile)

      transaction.oncomplete = () => {
        toast({
          title: t("fileCreated"),
          description: `${newFileName} has been created successfully`,
        })
      }
    }
  }, [project, newFileName, files, id, t, toast])

  // Handle file upload - memoized
  const handleFileUpload = useCallback(
    (uploadedFiles: FileList | null) => {
      if (!uploadedFiles || !project) return

      const fileArray = Array.from(uploadedFiles)
      const timestamp = Date.now()
      const newFiles: File[] = []

      // Process each uploaded file
      fileArray.forEach((uploadedFile) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          if (!e.target?.result) return

          const filePath = `${id}/${uploadedFile.name}`

          // Check if file already exists
          if (files.some((file) => file.path === filePath)) {
            toast({
              title: t("error"),
              description: `File ${uploadedFile.name} already exists`,
              variant: "destructive",
            })
            return
          }

          // Create the file object
          const newFile: File = {
            path: filePath,
            projectId: id as string,
            content: e.target.result as string,
            lastModified: timestamp,
          }

          newFiles.push(newFile)

          // If all files have been processed
          if (newFiles.length === fileArray.length) {
            // Update state
            const updatedFiles = [...files, ...newFiles]
            setFiles(updatedFiles)

            // Save to IndexedDB
            const dbRequest = indexedDB.open("web-editor-files", 1)

            dbRequest.onsuccess = (event) => {
              const db = (event.target as IDBOpenDBRequest).result
              const transaction = db.transaction(["files"], "readwrite")
              const objectStore = transaction.objectStore("files")

              newFiles.forEach((file) => {
                objectStore.add(file)
              })

              transaction.oncomplete = () => {
                toast({
                  title: "Files uploaded",
                  description: `${newFiles.length} files have been uploaded successfully`,
                })
                setUploadFileDialogOpen(false)

                // Select the first uploaded file
                if (newFiles.length > 0) {
                  setCurrentFile(newFiles[0])
                }

                // Update preview
                updatePreview(updatedFiles)
              }
            }
          }
        }

        // Read the file as text
        reader.readAsText(uploadedFile)
      })
    },
    [project, id, files, t, toast, updatePreview],
  )

  // Delete a file - memoized
  const deleteFile = useCallback(
    (filePath: string) => {
      if (!project) return

      // Prevent deleting the last file
      if (files.length <= 1) {
        toast({
          title: t("error"),
          description: "You must have at least one file in your project",
          variant: "destructive",
        })
        return
      }

      // Remove file from state
      const updatedFiles = files.filter((file) => file.path !== filePath)
      setFiles(updatedFiles)

      // If the current file is being deleted, select another file
      if (currentFile && currentFile.path === filePath) {
        setCurrentFile(updatedFiles[0])
      }

      // Delete from IndexedDB
      const dbRequest = indexedDB.open("web-editor-files", 1)

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["files"], "readwrite")
        const objectStore = transaction.objectStore("files")

        objectStore.delete(filePath)

        transaction.oncomplete = () => {
          toast({
            title: "File deleted",
            description: "The file has been deleted successfully",
          })
          updatePreview(updatedFiles)
        }
      }
    },
    [project, files, currentFile, t, toast, updatePreview],
  )

  // Export project as ZIP - memoized
  const exportProject = useCallback(async () => {
    if (!project) return

    try {
      const zip = new JSZip()

      // Add all files to the ZIP
      files.forEach((file) => {
        const relativePath = file.path.replace(`${id}/`, "")
        // Skip .gitkeep files
        if (!relativePath.endsWith(".gitkeep")) {
          zip.file(relativePath, file.content)
        }
      })

      // Generate ZIP file
      const content = await zip.generateAsync({ type: "blob" })

      // Create download link
      const url = URL.createObjectURL(content)
      const a = document.createElement("a")
      a.href = url
      a.download = `${project.name.replace(/\s+/g, "-")}.zip`
      a.click()

      // Clean up
      URL.revokeObjectURL(url)

      toast({
        title: "Project exported",
        description: "Your project has been exported as a ZIP file",
      })
    } catch (error) {
      console.error("Failed to export project:", error)
      toast({
        title: t("error"),
        description: "Failed to export your project",
      })
    }
  }, [project, files, id, t, toast])

  // Get language for editor based on file extension - memoized
  const getLanguage = useCallback((filePath: string) => {
    const extension = filePath.split(".").pop()?.toLowerCase()

    // Basic web files
    switch (extension) {
      // HTML & Templates
      case "html":
      case "htm":
      case "xhtml":
      case "ejs":
      case "hbs":
      case "pug":
        return "html"

      // CSS & Preprocessors
      case "css":
        return "css"
      case "scss":
      case "sass":
      case "less":
        return "scss"

      // JavaScript & TypeScript
      case "js":
      case "mjs":
      case "cjs":
        return "javascript"
      case "ts":
      case "mts":
      case "cts":
        return "typescript"
      case "jsx":
        return "javascript"
      case "tsx":
        return "typescript"

      // Configuration files
      case "json":
      case "jsonc":
        return "json"
      case "yaml":
      case "yml":
        return "yaml"
      case "toml":
        return "ini"
      case "xml":
      case "svg":
      case "rss":
        return "xml"
      case "graphql":
      case "gql":
        return "graphql"

      // Framework files
      case "vue":
        return "html"
      case "svelte":
        return "html"
      case "astro":
        return "html"

      // Server-side languages
      case "php":
        return "php"
      case "py":
      case "python":
        return "python"
      case "rb":
        return "ruby"
      case "go":
        return "go"
      case "java":
        return "java"
      case "cs":
        return "csharp"
      case "sql":
        return "sql"

      // Documentation
      case "md":
      case "markdown":
        return "markdown"
      case "txt":
        return "plaintext"
      case "csv":
        return "plaintext"

      // Configuration & Build files
      case "gitignore":
      case "env":
      case "editorconfig":
        return "plaintext"
      case "lock":
        return "json"

      // Default for any other file type
      default:
        return "plaintext"
    }
  }, [])

  // Handle file selection - memoized
  const handleFileSelect = useCallback(
    (filePath: string) => {
      console.log("Selected file:", filePath)
      const selectedFile = files.find((file) => file.path === filePath)
      if (selectedFile) {
        // تعيين الملف الحالي بشكل مباشر
        setCurrentFile(selectedFile)

        // تأخير قصير قبل تهيئة المحرر لضمان تحديث الحالة أولاً
        setTimeout(() => {
          // إعادة تهيئة المحرر مباشرة عند اختيار ملف جديد
          if (editorInstanceRef.current && monacoRef.current) {
            try {
              const detectedLanguage = getLanguage(selectedFile.path)

              // إنشاء نموذج جديد بالمحتوى واللغة الصحيحة
              const oldModel = editorInstanceRef.current.getModel()
              const newModel = monacoRef.current.editor.createModel(selectedFile.content, detectedLanguage)

              // تعيين النموذج الجديد للمحرر
              editorInstanceRef.current.setModel(newModel)

              // التخلص من النموذج القديم لتجنب تسرب الذاكرة
              if (oldModel) {
                oldModel.dispose()
              }
            } catch (error) {
              console.error("خطأ في تحديث نموذج المحرر:", error)
            }
          }
        }, 10)
      }
    },
    [files, getLanguage],
  )

  // Get preview container class based on selected device size - memoized
  const getPreviewContainerClass = useCallback(() => {
    switch (previewSize) {
      case "mobile":
        return "max-w-[375px] mx-auto border border-gray-300 rounded-lg h-full overflow-hidden"
      case "tablet":
        return "max-w-[768px] mx-auto border border-gray-300 rounded-lg h-full overflow-hidden"
      default:
        return "w-full h-full"
    }
  }, [previewSize])

  // إضافة وظائف جديدة للتعامل مع الملفات
  // إضافة وظيفة تغيير اسم الملف
  const renameFile = useCallback(
    (oldPath: string, newName: string) => {
      if (!project) return

      // التحقق من صحة الاسم الجديد
      if (!/^[a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+$/.test(newName)) {
        toast({
          title: t("error"),
          description: "Please enter a valid file name with extension",
          variant: "destructive",
        })
        return
      }

      // استخراج المسار الأصلي بدون اسم الملف
      const pathParts = oldPath.split("/")
      pathParts.pop() // إزالة اسم الملف
      const newPath = [...pathParts, newName].join("/")

      // التحقق من وجود ملف بنفس الاسم الجديد
      if (files.some((file) => file.path === newPath)) {
        toast({
          title: t("error"),
          description: "A file with this name already exists",
          variant: "destructive",
        })
        return
      }

      // العثور على الملف المراد تغيير اسمه
      const fileToRename = files.find((file) => file.path === oldPath)
      if (!fileToRename) return

      // إنشاء ملف جديد بنفس المحتوى ولكن بمسار جديد
      const newFile: File = {
        ...fileToRename,
        path: newPath,
        lastModified: Date.now(),
      }

      // تحديث الحالة
      setFiles((prevFiles) => {
        const updatedFiles = prevFiles.filter((file) => file.path !== oldPath)
        return [...updatedFiles, newFile]
      })

      // إذا كان الملف الحالي هو الذي تم تغيير اسمه، قم بتحديث الملف الحالي
      if (currentFile && currentFile.path === oldPath) {
        setCurrentFile(newFile)
      }

      // تحديث IndexedDB
      const dbRequest = indexedDB.open("web-editor-files", 1)

      dbRequest.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        const transaction = db.transaction(["files"], "readwrite")
        const objectStore = transaction.objectStore("files")

        // حذف الملف القديم وإضافة الملف الجديد
        objectStore.delete(oldPath)
        objectStore.add(newFile)

        transaction.oncomplete = () => {
          toast({
            title: "File renamed",
            description: `File has been renamed to ${newName}`,
          })
        }
      }
    },
    [project, files, currentFile, t, toast],
  )

  // إضافة وظيفة تنزيل ملف
  const downloadFile = useCallback(
    (filePath: string) => {
      const file = files.find((f) => f.path === filePath)
      if (!file) return

      // إنشاء رابط تنزيل
      const blob = new Blob([file.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filePath.split("/").pop() || "file"
      a.click()

      // تنظيف
      URL.revokeObjectURL(url)

      toast({
        title: "File downloaded",
        description: `${filePath.split("/").pop()} has been downloaded`,
      })
    },
    [files, toast],
  )

  // تعديل وظيفة معالجة ملف ZIP لاستخراج المحتويات فقط
  const processZipFile = useCallback(
    async (zipFile: File) => {
      try {
        setUploadFileDialogOpen(false)

        // عرض رسالة تحميل
        toast({
          title: "Processing ZIP file",
          description: "Please wait while extracting files...",
        })

        const zip = new JSZip()
        const contents = await zip.loadAsync(zipFile)

        // استخراج جميع الملفات من ZIP
        const extractedFiles: File[] = []
        const timestamp = Date.now()

        // معالجة كل ملف في ZIP
        const filePromises = []
        for (const [relativePath, zipEntry] of Object.entries(contents.files)) {
          if (!zipEntry.dir) {
            filePromises.push(
              (async () => {
                try {
                  // قراءة محتوى الملف كنص
                  const content = await zipEntry.async("string")

                  // إنشاء كائن الملف - استخدام المسار النسبي مباشرة بدون اسم الملف ZIP
                  const file: File = {
                    path: `${id}/${relativePath}`,
                    projectId: id as string,
                    content,
                    lastModified: timestamp,
                  }

                  return file
                } catch (error) {
                  console.error(`Error extracting file ${relativePath}:`, error)
                  return null
                }
              })(),
            )
          }
        }

        // انتظار استخراج جميع الملفات
        const results = await Promise.all(filePromises)
        const validFiles = results.filter((file) => file !== null) as File[]

        if (validFiles.length === 0) {
          toast({
            title: "Error",
            description: "No valid files found in ZIP archive",
            variant: "destructive",
          })
          return
        }

        // حفظ الملفات في IndexedDB
        const dbRequest = indexedDB.open("web-editor-files", 1)

        dbRequest.onsuccess = async (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          // إنشاء معاملة واحدة لجميع العمليات
          const transaction = db.transaction(["files"], "readwrite")
          const objectStore = transaction.objectStore("files")

          // معالجة كل ملف
          for (const file of validFiles) {
            try {
              // التحقق مما إذا كان الملف موجودًا أولاً
              const getRequest = objectStore.get(file.path)

              await new Promise<void>((resolve, reject) => {
                getRequest.onsuccess = () => {
                  try {
                    if (getRequest.result) {
                      // الملف موجود، تحديثه
                      const putRequest = objectStore.put(file)
                      putRequest.onsuccess = () => resolve()
                      putRequest.onerror = () => reject()
                    } else {
                      // ملف جديد، إضافته
                      const addRequest = objectStore.add(file)
                      addRequest.onsuccess = () => resolve()
                      addRequest.onerror = () => reject()
                    }
                  } catch (error) {
                    console.error(`Error adding/updating file ${file.path}:`, error)
                    reject(error)
                  }
                }

                getRequest.onerror = (error) => {
                  console.error(`Error checking file ${file.path}:`, error)
                  reject(error)
                }
              })
            } catch (fileError) {
              console.error(`Error processing file ${file.path}:`, fileError)
            }
          }

          // تحديث الحالة بالملفات الجديدة
          setFiles((prevFiles) => {
            // إنشاء خريطة للملفات الموجودة للبحث السريع
            const existingFilesMap = new Map(prevFiles.map((file) => [file.path, file]))

            // إضافة أو تحديث الملفات من ZIP
            validFiles.forEach((newFile) => {
              existingFilesMap.set(newFile.path, newFile)
            })

            // تحويل الخريطة مرة أخرى إلى مصفوفة
            return Array.from(existingFilesMap.values())
          })

          // تحديد الملف الأول المستخرج
          if (validFiles.length > 0) {
            // تحديد الملف الأول مباشرة بدون تأخير لإصلاح مشكلة التلوين
            setCurrentFile(validFiles[0])

            // تحديث المعاينة
            updatePreview([...files, ...validFiles])

            toast({
              title: "ZIP file imported",
              description: `${validFiles.length} files have been imported successfully`,
            })
          }
        }

        dbRequest.onerror = (error) => {
          console.error("Database error:", error)
          toast({
            title: "Error",
            description: "Failed to open database for ZIP import",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to process ZIP file:", error)
        toast({
          title: "Error",
          description: "Failed to process ZIP file",
          variant: "destructive",
        })
      }
    },
    [id, files, toast, updatePreview],
  )

  // تعديل وظيفة معالجة رفع المجلد
  const processFolderUpload = useCallback(
    async (files: FileList) => {
      try {
        setUploadFileDialogOpen(false)

        // عرض رسالة تحميل
        toast({
          title: "Processing folder",
          description: `Please wait while we import ${files.length} files...`,
        })

        // استخراج جميع الملفات من المجلد
        const importedFiles: File[] = []
        const timestamp = Date.now()
        const fileArray = Array.from(files)

        // معالجة كل ملف في المجلد
        for (const file of fileArray) {
          try {
            // قراءة محتوى الملف
            const content = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader()
              reader.onload = (e) => resolve(e.target?.result as string)
              reader.onerror = reject
              reader.readAsText(file)
            })

            // الحصول على المسار النسبي (إزالة أي دليل أصل مشترك)
            const relativePath = file.webkitRelativePath || file.name

            // إنشاء كائن الملف
            importedFiles.push({
              path: `${id}/${relativePath}`,
              projectId: id as string,
              content,
              lastModified: timestamp,
            })
          } catch (error) {
            console.error(`Error processing file ${file.name}:`, error)
            // متابعة مع الملفات الأخرى
          }
        }

        if (importedFiles.length === 0) {
          toast({
            title: "Error",
            description: "No valid files found in the folder",
            variant: "destructive",
          })
          return
        }

        // فتح IndexedDB
        const dbRequest = indexedDB.open("web-editor-files", 1)

        dbRequest.onsuccess = async (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          // إنشاء معاملة واحدة لجميع العمليات
          const transaction = db.transaction(["files"], "readwrite")
          const objectStore = transaction.objectStore("files")

          // معالجة كل ملف
          for (const file of importedFiles) {
            try {
              // التحقق مما إذا كان الملف موجودًا أولاً
              const getRequest = objectStore.get(file.path)

              await new Promise<void>((resolve, reject) => {
                getRequest.onsuccess = () => {
                  try {
                    if (getRequest.result) {
                      // الملف موجود، تحديثه
                      const putRequest = objectStore.put(file)
                      putRequest.onsuccess = () => resolve()
                      putRequest.onerror = () => reject()
                    } else {
                      // ملف جديد، إضافته
                      const addRequest = objectStore.add(file)
                      addRequest.onsuccess = () => resolve()
                      addRequest.onerror = () => reject()
                    }
                  } catch (error) {
                    console.error(`Error adding/updating file ${file.path}:`, error)
                    reject(error)
                  }
                }

                getRequest.onerror = (error) => {
                  console.error(`Error checking file ${file.path}:`, error)
                  reject(error)
                }
              })
            } catch (fileError) {
              console.error(`Error processing file ${file.path}:`, fileError)
            }
          }

          // تحديث الحالة بالملفات الجديدة
          setFiles((prevFiles) => {
            // إنشاء خريطة للملفات الموجودة للبحث السريع
            const existingFilesMap = new Map(prevFiles.map((file) => [file.path, file]))

            // إضافة أو تحديث الملفات من المجلد
            importedFiles.forEach((newFile) => {
              existingFilesMap.set(newFile.path, newFile)
            })

            // تحويل الخريطة مرة أخرى إلى مصفوفة
            return Array.from(existingFilesMap.values())
          })

          // تحديد الملف الأول المستورد - بدون تأخير لإصلاح مشكلة التلوين
          if (importedFiles.length > 0) {
            setCurrentFile(importedFiles[0])

            // تحديث المعاينة
            updatePreview([...files, ...importedFiles])

            toast({
              title: "Folder imported",
              description: `${importedFiles.length} files have been imported successfully`,
            })
          }
        }

        dbRequest.onerror = (error) => {
          console.error("Database error:", error)
          toast({
            title: "Error",
            description: "Failed to open database for folder import",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to process folder:", error)
        toast({
          title: "Error",
          description: "Failed to process folder",
          variant: "destructive",
        })
      }
    },
    [id, files, toast, updatePreview],
  )

  // Load project and files
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true

    const loadProjectAndFiles = async () => {
      try {
        // Load project metadata from localStorage
        const storedProjects = localStorage.getItem("web-editor-projects")
        if (!storedProjects) {
          router.push("/")
          return
        }

        const projects: Project[] = JSON.parse(storedProjects)
        const currentProject = projects.find((p) => p.id === id)

        if (!currentProject) {
          router.push("/")
          return
        }

        if (isMounted) {
          setProject(currentProject)
        }

        // Load files from IndexedDB
        const dbRequest = indexedDB.open("web-editor-files", 1)

        dbRequest.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result

          // Create object store for files if it doesn't exist
          if (!db.objectStoreNames.contains("files")) {
            const objectStore = db.createObjectStore("files", { keyPath: "path" })
            objectStore.createIndex("projectId", "projectId", { unique: false })
          }
        }

        dbRequest.onsuccess = (event) => {
          if (!isMounted) return

          const db = (event.target as IDBOpenDBRequest).result
          const transaction = db.transaction(["files"], "readonly")
          const objectStore = transaction.objectStore("files")
          const index = objectStore.index("projectId")
          const request = index.getAll(id)

          request.onsuccess = () => {
            if (!isMounted) return

            const projectFiles = request.result as File[]

            // تحديث الملفات
            setFiles(projectFiles)

            // تعيين الملف الحالي فقط عند التحميل الأولي
            if (isLoading && projectFiles.length > 0) {
              // Set the initial file to index.html or the first file
              const indexHtml = projectFiles.find((file) => file.path.endsWith("index.html"))
              const fileToSelect = indexHtml || projectFiles[0]

              // تأخير قصير لضمان تحديث الحالة أولاً
              setTimeout(() => {
                if (isMounted) {
                  setCurrentFile(fileToSelect)

                  // تأخير إضافي لتهيئة المحرر بعد تحديث الحالة
                  setTimeout(() => {
                    if (isMounted && editorInstanceRef.current && monacoRef.current) {
                      try {
                        const detectedLanguage = getLanguage(fileToSelect.path)
                        const model = monacoRef.current.editor.createModel(fileToSelect.content, detectedLanguage)
                        editorInstanceRef.current.setModel(model)
                      } catch (error) {
                        console.error("خطأ في تهيئة المحرر:", error)
                      }
                    }

                    // تحديث المعاينة مرة واحدة فقط بعد تحميل الملفات
                    if (isMounted) {
                      setTimeout(() => {
                        updatePreview(projectFiles)
                      }, 500)
                    }
                  }, 50)
                }
              }, 10)
            }

            setIsLoading(false)
          }
        }

        dbRequest.onerror = (event) => {
          if (!isMounted) return

          console.error("IndexedDB error:", event)
          toast({
            title: t("error"),
            description: t("projectLoadError"),
            variant: "destructive",
          })
          setIsLoading(false)
        }
      } catch (error) {
        if (!isMounted) return

        console.error("Failed to load project:", error)
        toast({
          title: t("error"),
          description: t("projectLoadError"),
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    loadProjectAndFiles()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [id, router, toast, t, updatePreview, isLoading, getLanguage])

  // Handle drag and drop
  useEffect(() => {
    const dropZone = dropZoneRef.current
    if (!dropZone) return

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.add("border-primary")
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.remove("border-primary")
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dropZone.classList.remove("border-primary")

      if (e.dataTransfer?.files) {
        // Use the current files from state instead of relying on the closure
        const currentFiles = e.dataTransfer.files
        if (currentFiles.length > 0) {
          // Use a stable reference to the function
          handleFileUpload(currentFiles)
        }
      }
    }

    dropZone.addEventListener("dragover", handleDragOver)
    dropZone.addEventListener("dragleave", handleDragLeave)
    dropZone.addEventListener("drop", handleDrop)

    return () => {
      dropZone.removeEventListener("dragover", handleDragOver)
      dropZone.removeEventListener("dragleave", handleDragLeave)
      dropZone.removeEventListener("drop", handleDrop)
    }
  }, [id, handleFileUpload])

  // Now we can safely add the conditional returns after all hooks are defined
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-lg font-medium mb-4">Project not found</p>
          <Link href="/">
            <Button>Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  // تعديل مكون FileExplorer لإضافة الوظائف الجديدة
  return (
    <div className="flex flex-col h-screen">
      {/* Keyboard shortcuts handler */}
      <KeyboardShortcuts
        onSave={saveChanges}
        onRun={() => updatePreview(files)}
        onNewFile={() => setNewFileDialogOpen(true)}
        onFormat={formatCode}
      />

      {/* Header */}
      <header className="border-b p-4 flex justify-between items-center bg-background">
        <div className="flex items-center">
          <Link href="/" className="mr-4">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("back")}
            </Button>
          </Link>
          <h1 className="text-xl font-bold">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <ShortcutsHelpDialog />
          <Button variant="outline" size="sm" onClick={exportProject}>
            <Download className="mr-2 h-4 w-4" />
            {t("export")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => updatePreview(files)}>
            <Play className="mr-2 h-4 w-4" />
            {t("run")}
          </Button>
          <Button size="sm" onClick={saveChanges} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* File explorer */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <FileExplorer
            files={files}
            currentFilePath={currentFile?.path || null}
            onFileSelect={handleFileSelect}
            onDeleteFile={deleteFile}
            onRenameFile={renameFile}
            onDownloadFile={downloadFile}
            onCreateFileClick={() => setNewFileDialogOpen(true)}
            onUploadFileClick={() => setUploadFileDialogOpen(true)}
          />
        </ResizablePanel>

        <ResizableHandle />

        {/* Editor and preview */}
        <ResizablePanel defaultSize={80}>
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <TabsList className="mx-4 mt-2 justify-start">
              <TabsTrigger value="editor">{t("editor")}</TabsTrigger>
              <TabsTrigger value="preview">{t("preview")}</TabsTrigger>
              <TabsTrigger value="split">{t("splitView")}</TabsTrigger>
            </TabsList>

            <TabsContent value="editor" className="flex-1 p-0">
              {currentFile ? (
                <div className="h-full w-full">
                  <MonacoEditor
                    value={currentFile.content}
                    onChange={handleEditorChange}
                    language={getLanguage(currentFile.path)}
                    filePath={currentFile.path}
                    isLoaded={isLoaded}
                    setIsLoaded={setIsLoaded}
                    editorInstanceRef={editorInstanceRef}
                    monacoRef={monacoRef}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">No file selected</p>
                </div>
              )}
            </TabsContent>

            {/* تعديل الجزء الخاص بالمعاينة في الواجهة لإضافة زر تحديث يدوي */}
            <TabsContent value="preview" className="flex-1 p-0">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center p-2 border-b">
                  <div className="flex space-x-2">
                    <Button
                      variant={previewSize === "desktop" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPreviewSize("desktop")}
                      title={t("desktopView")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewSize === "tablet" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPreviewSize("tablet")}
                      title={t("tabletView")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewSize === "mobile" ? "default" : "outline"}
                      size="icon"
                      onClick={() => setPreviewSize("mobile")}
                      title={t("mobileView")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => updatePreview(files)} className="mr-2">
                    <Play className="mr-2 h-4 w-4" />
                    {t("run")}
                  </Button>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  <div className={getPreviewContainerClass()}>
                    {previewUrl ? (
                      <iframe
                        ref={previewIframeRef}
                        src={previewUrl}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts allow-same-origin"
                        title="Preview"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <p className="text-muted-foreground mb-2">{t("noPreview")}</p>
                        <p className="text-sm text-muted-foreground mb-4">{t("clickRunForPreview")}</p>
                        <p className="text-xs text-muted-foreground">{t("previewOnVercel")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* تعديل الجزء الخاص بالعرض المقسم أيضًا */}
            <TabsContent value="split" className="flex-1 p-0">
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={50}>
                  {currentFile ? (
                    <div className="h-full w-full">
                      <MonacoEditor
                        value={currentFile.content}
                        onChange={handleEditorChange}
                        language={getLanguage(currentFile.path)}
                        filePath={currentFile.path}
                        isLoaded={isLoaded}
                        setIsLoaded={setIsLoaded}
                        editorInstanceRef={editorInstanceRef}
                        monacoRef={monacoRef}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No file selected</p>
                    </div>
                  )}
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={50}>
                  <div className="h-full flex flex-col">
                    <div className="flex justify-between items-center p-2 border-b">
                      <div className="flex space-x-2">
                        <Button
                          variant={previewSize === "desktop" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setPreviewSize("desktop")}
                          title={t("desktopView")}
                        >
                          <Monitor className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewSize === "tablet" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setPreviewSize("tablet")}
                          title={t("tabletView")}
                        >
                          <Tablet className="h-4 w-4" />
                        </Button>
                        <Button
                          variant={previewSize === "mobile" ? "default" : "outline"}
                          size="icon"
                          onClick={() => setPreviewSize("mobile")}
                          title={t("mobileView")}
                        >
                          <Smartphone className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => updatePreview(files)} className="mr-2">
                        <Play className="mr-2 h-4 w-4" />
                        {t("run")}
                      </Button>
                    </div>
                    <div className="flex-1 overflow-auto p-4">
                      <div className={getPreviewContainerClass()}>
                        {previewUrl ? (
                          <iframe
                            src={previewUrl}
                            className="w-full h-full border-0"
                            sandbox="allow-scripts allow-same-origin"
                            title="Preview"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <p className="text-muted-foreground mb-2">{t("noPreview")}</p>
                            <p className="text-sm text-muted-foreground mb-4">{t("clickRunForPreview")}</p>
                            <p className="text-xs text-muted-foreground">{t("previewOnVercel")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* New File Dialog */}
      <Dialog open={newFileDialogOpen} onOpenChange={setNewFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("createNewFile")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="fileName">{t("fileName")}</Label>
            <Input
              id="fileName"
              placeholder="folder/example.js"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-2">{t("fileNameDescription")}</p>
          </div>
          <DialogFooter>
            <Button onClick={createNewFile}>{t("create")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Files Dialog */}
      <Dialog open={uploadFileDialogOpen} onOpenChange={setUploadFileDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("uploadFiles")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Tabs defaultValue="files" onValueChange={(value) => setUploadTab(value as "files" | "zip")}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="files">Individual Files</TabsTrigger>
                <TabsTrigger value="folder">Import Folder</TabsTrigger>
                <TabsTrigger value="zip">Import ZIP</TabsTrigger>
              </TabsList>

              {uploadTab === "files" && (
                <div
                  ref={dropZoneRef}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">{t("dragAndDropDescription")}</p>
                  <Button variant="outline" size="sm">
                    {t("chooseFiles")}
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFileUpload(e.target.files)
                      }
                    }}
                  />
                </div>
              )}

              {uploadTab === "folder" && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => folderInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Upload a folder containing your project files</p>
                  <Button variant="outline" size="sm">
                    Choose Folder
                  </Button>
                  <input
                    type="file"
                    ref={folderInputRef}
                    webkitdirectory="true"
                    directory="true"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        processFolderUpload(e.target.files)
                      }
                    }}
                  />
                </div>
              )}

              {uploadTab === "zip" && (
                <div
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => zipFileInputRef.current?.click()}
                >
                  <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <p className="mb-2 font-medium">Upload a ZIP file containing your project files</p>
                  <Button variant="outline" size="sm">
                    Choose ZIP File
                  </Button>
                  <input
                    type="file"
                    ref={zipFileInputRef}
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const file = e.target.files[0]
                        if (file.type === "application/zip" || file.name.endsWith(".zip")) {
                          processZipFile(file)
                        } else {
                          toast({
                            title: "Invalid file",
                            description: "Please upload a ZIP file",
                            variant: "destructive",
                          })
                        }
                      }
                    }}
                  />
                </div>
              )}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

