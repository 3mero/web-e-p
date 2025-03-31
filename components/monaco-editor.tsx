"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { FileIcon, Search } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// Add these TypeScript declarations at the top of the file, after the imports
declare global {
  interface Window {
    monaco: any
    require: any
    _monacoLoading: boolean
  }
}

interface MonacoEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  filePath: string
  isLoaded?: boolean
  setIsLoaded?: React.Dispatch<React.SetStateAction<boolean>>
  editorInstanceRef?: React.MutableRefObject<any>
  monacoRef?: React.MutableRefObject<any>
}

// Function to check if a file is binary
const isBinaryFile = (filePath: string) => {
  const extension = filePath.split(".").pop()?.toLowerCase()
  const binaryExtensions = [
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "bmp",
    "ico",
    "tiff",
    "avif",
    "woff",
    "woff2",
    "ttf",
    "otf",
    "eot",
    "mp3",
    "wav",
    "ogg",
    "flac",
    "aac",
    "mp4",
    "webm",
    "avi",
    "mov",
    "wmv",
    "mkv",
    "zip",
    "tar",
    "gz",
    "rar",
    "7z",
    "pdf",
    "doc",
    "docx",
    "xls",
    "xlsx",
    "ppt",
    "pptx",
    "wasm",
    "exe",
    "dll",
    "so",
    "dylib",
  ]

  return extension ? binaryExtensions.includes(extension) : false
}

// Get Monaco language ID from file extension
const getMonacoLanguage = (filePath: string) => {
  const extension = filePath.split(".").pop()?.toLowerCase()
  console.log(`Detecting language for file with extension: ${extension}`)

  switch (extension) {
    case "html":
    case "htm":
      return "html"
    case "xml":
    case "svg":
      return "xml"
    case "css":
      return "css"
    case "scss":
    case "sass":
      return "scss"
    case "less":
      return "less"
    case "js":
    case "mjs":
    case "cjs":
      return "javascript"
    case "jsx":
      return "javascript"
    case "ts":
    case "mts":
    case "cts":
      return "typescript"
    case "tsx":
      return "typescript"
    case "json":
    case "jsonc":
      return "json"
    case "md":
    case "markdown":
      return "markdown"
    case "yaml":
    case "yml":
      return "yaml"
    case "py":
    case "python":
      return "python"
    case "php":
      return "php"
    case "go":
      return "go"
    case "java":
      return "java"
    case "c":
    case "cpp":
    case "h":
    case "hpp":
      return "cpp"
    case "cs":
      return "csharp"
    case "rb":
      return "ruby"
    case "rs":
      return "rust"
    case "sql":
      return "sql"
    case "sh":
    case "bash":
      return "shell"
    default:
      return "plaintext"
  }
}

export default function MonacoEditor({
  value,
  onChange,
  language,
  filePath,
  isLoaded: propIsLoaded,
  setIsLoaded: propSetIsLoaded,
  editorInstanceRef: propEditorInstanceRef,
  monacoRef: propMonacoRef,
}: MonacoEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const localMonacoRef = useRef<any>(null)
  const localEditorInstanceRef = useRef<any>(null)
  const { theme } = useTheme()
  const { toast } = useToast()
  const [localIsLoaded, setLocalIsLoaded] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // استخدام المراجع المقدمة أو المراجع المحلية
  const monacoRef = propMonacoRef || localMonacoRef
  const editorInstanceRef = propEditorInstanceRef || localEditorInstanceRef
  const isLoaded = propIsLoaded !== undefined ? propIsLoaded : localIsLoaded
  const setIsLoaded = propSetIsLoaded || setLocalIsLoaded

  // Replace the entire useEffect for loading Monaco with this improved version
  useEffect(() => {
    if (!editorRef.current) return

    // Check if Monaco is already loaded to avoid duplicate loading
    if (window.monaco) {
      initializeEditor(window.monaco)
      return
    }

    // Create a global flag to prevent multiple script loads
    if (window._monacoLoading) {
      // Wait for Monaco to be loaded by another instance
      const checkMonaco = setInterval(() => {
        if (window.monaco) {
          clearInterval(checkMonaco)
          initializeEditor(window.monaco)
        }
      }, 100)
      return () => clearInterval(checkMonaco)
    }

    window._monacoLoading = true

    // Create a script element to load Monaco
    const script = document.createElement("script")
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs/loader.js"
    script.async = true
    script.crossOrigin = "anonymous"

    // Set a timeout to detect loading failures
    const timeoutId = setTimeout(() => {
      setLoadError("Failed to load Monaco Editor. Please try refreshing the page.")
      window._monacoLoading = false
    }, 10000) // 10 seconds timeout

    script.onload = () => {
      clearTimeout(timeoutId)

      // Configure RequireJS
      window.require.config({
        paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs" },
      })

      // Load Monaco Editor
      window.require(["vs/editor/editor.main"], (monaco) => {
        window.monaco = monaco
        window._monacoLoading = false
        initializeEditor(monaco)
      })
    }

    script.onerror = () => {
      clearTimeout(timeoutId)
      setLoadError("Failed to load Monaco Editor. Please try refreshing the page.")
      window._monacoLoading = false
    }

    document.head.appendChild(script)

    return () => {
      clearTimeout(timeoutId)
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose()
      }
      // Don't remove the script as other instances might be using it
    }
  }, [])

  // Add this function to initialize the editor
  const initializeEditor = (monaco: any) => {
    // تخزين مرجع Monaco
    if (monacoRef) {
      monacoRef.current = monaco
    }

    // تعريف السمات - استخدام try/catch للتعريف الآمن للسمات
    try {
      monaco.editor.defineTheme("custom-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "comment", foreground: "6A9955", fontStyle: "italic" },
          { token: "keyword", foreground: "569CD6" },
          { token: "string", foreground: "CE9178" },
          { token: "number", foreground: "B5CEA8" },
          { token: "regexp", foreground: "D16969" },
          { token: "type", foreground: "4EC9B0" },
          { token: "class", foreground: "4EC9B0" },
          { token: "function", foreground: "DCDCAA" },
          { token: "variable", foreground: "9CDCFE" },
          { token: "variable.predefined", foreground: "4FC1FF" },
          { token: "interface", foreground: "4EC9B0" },
          { token: "namespace", foreground: "4EC9B0" },
          { token: "package", foreground: "4EC9B0" },
          { token: "method", foreground: "DCDCAA" },
          { token: "property", foreground: "9CDCFE" },
          { token: "operator", foreground: "D4D4D4" },
          { token: "tag", foreground: "569CD6" },
          { token: "attribute.name", foreground: "9CDCFE" },
          { token: "attribute.value", foreground: "CE9178" },
          { token: "delimiter", foreground: "D4D4D4" },
          { token: "delimiter.html", foreground: "808080" },
          { token: "delimiter.xml", foreground: "808080" },
        ],
        colors: {
          "editor.background": "#1E1E1E",
          "editor.foreground": "#D4D4D4",
          "editorLineNumber.foreground": "#858585",
          "editorCursor.foreground": "#A7A7A7",
          "editor.selectionBackground": "#264F78",
          "editor.inactiveSelectionBackground": "#3A3D41",
          "editorWhitespace.foreground": "#3B3B3B",
        },
      })

      monaco.editor.defineTheme("custom-light", {
        base: "vs",
        inherit: true,
        rules: [
          { token: "comment", foreground: "008000", fontStyle: "italic" },
          { token: "keyword", foreground: "0000FF" },
          { token: "string", foreground: "A31515" },
          { token: "number", foreground: "098658" },
          { token: "regexp", foreground: "D16969" },
          { token: "type", foreground: "267F99" },
          { token: "class", foreground: "267F99" },
          { token: "function", foreground: "795E26" },
          { token: "variable", foreground: "001080" },
          { token: "variable.predefined", foreground: "0070C1" },
          { token: "interface", foreground: "267F99" },
          { token: "namespace", foreground: "267F99" },
          { token: "package", foreground: "267F99" },
          { token: "method", foreground: "795E26" },
          { token: "property", foreground: "001080" },
          { token: "operator", foreground: "000000" },
          { token: "tag", foreground: "800000" },
          { token: "attribute.name", foreground: "FF0000" },
          { token: "attribute.value", foreground: "0000FF" },
          { token: "delimiter", foreground: "000000" },
          { token: "delimiter.html", foreground: "383838" },
          { token: "delimiter.xml", foreground: "383838" },
        ],
        colors: {
          "editor.background": "#FFFFFF",
          "editor.foreground": "#000000",
          "editorLineNumber.foreground": "#6E6E6E",
          "editorCursor.foreground": "#000000",
          "editor.selectionBackground": "#ADD6FF",
          "editor.inactiveSelectionBackground": "#E5EBF1",
          "editorWhitespace.foreground": "#BFBFBF",
        },
      })
    } catch (error) {
      console.log("قد تكون السمات معرفة بالفعل، جاري المتابعة...")
    }

    // إنشاء نسخة المحرر
    if (editorRef.current) {
      try {
        // التحقق مما إذا كان لدينا نسخة محرر بالفعل
        if (editorInstanceRef.current) {
          editorInstanceRef.current.dispose()
        }

        // فرض اكتشاف اللغة بناءً على امتداد الملف
        const detectedLanguage = getMonacoLanguage(filePath)
        console.log(`إنشاء محرر لـ ${filePath} باللغة: ${detectedLanguage}`)

        // إنشاء نموذج جديد مع اللغة المناسبة
        const model = monaco.editor.createModel(value, detectedLanguage)

        const editor = monaco.editor.create(editorRef.current, {
          model: model,
          theme: theme === "dark" ? "custom-dark" : "custom-light",
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          lineNumbers: "on",
          renderLineHighlight: "all",
          tabSize: 2,
          fontSize: 14,
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          scrollbar: {
            useShadows: false,
            verticalHasArrows: false,
            horizontalHasArrows: false,
            vertical: "visible",
            horizontal: "visible",
            verticalScrollbarSize: 14,
            horizontalScrollbarSize: 14,
          },
          // خيارات إضافية لتحسين تلوين بناء الجملة
          bracketPairColorization: { enabled: true },
          renderWhitespace: "selection",
        })

        // الاستماع للتغييرات
        editor.onDidChangeModelContent(() => {
          onChange(editor.getValue())
        })

        // تخزين مرجع المحرر
        if (editorInstanceRef) {
          editorInstanceRef.current = editor
        } else {
          editorInstanceRef.current = editor
        }

        if (setIsLoaded) {
          setIsLoaded(true)
        }
        setLoadError(null)
      } catch (error) {
        console.error("خطأ في إنشاء محرر Monaco:", error)
        setLoadError("فشل في تهيئة محرر Monaco. يرجى تحديث الصفحة.")
      }
    }
  }

  // Update theme when it changes
  useEffect(() => {
    if (isLoaded && editorInstanceRef.current && monacoRef.current) {
      editorInstanceRef.current.updateOptions({
        theme: theme === "dark" ? "custom-dark" : "custom-light",
      })
    }
  }, [theme, isLoaded])

  // Update value when it changes externally
  useEffect(() => {
    if (isLoaded && editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value)
    }
  }, [value, isLoaded])

  // Update language when file changes
  useEffect(() => {
    if (isLoaded && editorInstanceRef.current && monacoRef.current && filePath) {
      try {
        // لا نقوم بأي شيء هنا - سيتم التعامل مع تغيير الملف في handleFileSelect
        // هذا يمنع التداخل بين تحديثات الحالة المختلفة
      } catch (error) {
        console.error("خطأ في تحديث نموذج المحرر:", error)
      }
    }
  }, [filePath, isLoaded])

  // Toggle search widget
  const toggleSearch = () => {
    if (isLoaded && editorInstanceRef.current) {
      if (searchOpen) {
        editorInstanceRef.current.getAction("closeReplaceInEditor").run()
      } else {
        editorInstanceRef.current.getAction("actions.find").run()
      }
      setSearchOpen(!searchOpen)
    }
  }

  // Format document
  const formatDocument = () => {
    if (isLoaded && editorInstanceRef.current) {
      editorInstanceRef.current.getAction("editor.action.formatDocument")?.run()
      toast({
        title: "Document formatted",
        description: "The code has been formatted",
      })
    }
  }

  // If this is a binary file, show a message instead of the editor
  if (isBinaryFile(filePath)) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-black text-white p-4 dark:bg-gray-900">
        <FileIcon className="h-12 w-12 mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">Binary File</h3>
        <p className="text-center text-sm text-gray-400 max-w-md">
          This file type cannot be edited in the text editor. You can download the project and edit this file with an
          appropriate application.
        </p>
      </div>
    )
  }

  // If there was an error loading Monaco, show an error message
  if (loadError) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-white text-black p-4 dark:bg-gray-900 dark:text-white">
        <div className="text-center max-w-md">
          <h3 className="text-lg font-medium mb-4">Monaco Editor Error</h3>
          <p className="mb-4">{loadError}</p>
          <Button onClick={() => window.location.reload()}>Reload Page</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 flex justify-between items-center">
        <div>
          {filePath.split("/").pop()} - {language}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={formatDocument} disabled={!isLoaded}>
            Format
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={toggleSearch}
            disabled={!isLoaded}
            title="Search"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={editorRef}
        className="flex-1 overflow-hidden"
        style={{
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {!isLoaded && !loadError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading editor...</p>
          </div>
        </div>
      )}
    </div>
  )
}

