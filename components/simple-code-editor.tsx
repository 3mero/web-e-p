"use client"

import { useEffect, useRef, useState } from "react"
import { FileIcon, Search, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SimpleCodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  filePath: string
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

export default function SimpleCodeEditor({ value, onChange, language, filePath }: SimpleCodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchText, setSearchText] = useState("")
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1)

  // Update line numbers when value changes
  useEffect(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      const lineCount = (value.match(/\n/g) || []).length + 1
      const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n")
      lineNumbersRef.current.textContent = lineNumbers
    }
  }, [value])

  // Sync scrolling between textarea and line numbers
  useEffect(() => {
    const handleScroll = () => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
      }
    }

    const textarea = textareaRef.current
    if (textarea) {
      textarea.addEventListener("scroll", handleScroll)
      return () => {
        textarea.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Handle tab key in textarea
  useEffect(() => {
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && textareaRef.current === document.activeElement) {
        e.preventDefault()
        const start = textareaRef.current.selectionStart
        const end = textareaRef.current.selectionEnd

        // Insert tab at cursor position
        const newValue = value.substring(0, start) + "  " + value.substring(end)
        onChange(newValue)

        // Move cursor after the inserted tab
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
          }
        }, 0)
      }
    }

    window.addEventListener("keydown", handleTabKey)
    return () => window.removeEventListener("keydown", handleTabKey)
  }, [value, onChange])

  // Search functionality
  const performSearch = () => {
    if (!searchText || !value) {
      setSearchResults([])
      setCurrentSearchIndex(-1)
      return
    }

    const results: number[] = []
    let startIndex = 0
    let index: number

    // Find all occurrences
    while ((index = value.indexOf(searchText, startIndex)) > -1) {
      results.push(index)
      startIndex = index + searchText.length
    }

    setSearchResults(results)
    setCurrentSearchIndex(results.length > 0 ? 0 : -1)

    // Highlight the first result if found
    if (results.length > 0 && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(results[0], results[0] + searchText.length)

      // Ensure the result is visible
      const textBeforeCursor = value.substring(0, results[0])
      const linesBefore = (textBeforeCursor.match(/\n/g) || []).length
      const lineHeight = 21 // Approximate line height in pixels
      textareaRef.current.scrollTop = linesBefore * lineHeight
    }
  }

  // Navigate search results
  const navigateSearch = (direction: "next" | "prev") => {
    if (searchResults.length === 0) return

    let newIndex: number
    if (direction === "next") {
      newIndex = currentSearchIndex < searchResults.length - 1 ? currentSearchIndex + 1 : 0
    } else {
      newIndex = currentSearchIndex > 0 ? currentSearchIndex - 1 : searchResults.length - 1
    }

    setCurrentSearchIndex(newIndex)

    // Highlight the selected result
    if (textareaRef.current) {
      const startPos = searchResults[newIndex]
      textareaRef.current.focus()
      textareaRef.current.setSelectionRange(startPos, startPos + searchText.length)

      // Ensure the result is visible
      const textBeforeCursor = value.substring(0, startPos)
      const linesBefore = (textBeforeCursor.match(/\n/g) || []).length
      const lineHeight = 21 // Approximate line height in pixels
      textareaRef.current.scrollTop = linesBefore * lineHeight
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

  return (
    <div className="h-full w-full flex flex-col bg-white text-black dark:bg-gray-900 dark:text-white">
      <div className="p-2 bg-gray-100 text-xs text-gray-600 border-b border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 flex justify-between items-center">
        <div>
          {filePath.split("/").pop()} - {language}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setSearchOpen(!searchOpen)}
          title="Search"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {searchOpen && (
        <div className="p-2 bg-gray-50 border-b dark:bg-gray-800 dark:border-gray-700 flex items-center gap-2">
          <Input
            placeholder="Search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="h-8 text-sm"
          />
          <Button variant="outline" size="sm" onClick={performSearch} className="h-8">
            Find
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateSearch("prev")}
            disabled={searchResults.length === 0}
            className="h-8"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateSearch("next")}
            disabled={searchResults.length === 0}
            className="h-8"
          >
            Next
          </Button>
          <span className="text-xs text-gray-500 ml-2">
            {searchResults.length > 0 ? `${currentSearchIndex + 1} of ${searchResults.length} matches` : "No matches"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(false)}
            className="h-8 w-8 ml-auto"
            title="Close search"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex-1 flex editor-container">
        {/* Line numbers */}
        <div
          ref={lineNumbersRef}
          className="line-numbers py-3 px-2 text-right select-none bg-gray-50 dark:bg-gray-800 text-gray-500 text-sm font-mono border-r border-gray-200 dark:border-gray-700 overflow-hidden whitespace-pre"
        >
          {Array.from({ length: (value.match(/\n/g) || []).length + 1 }, (_, i) => i + 1).join("\n")}
        </div>

        {/* Editor */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="editor-textarea flex-1 p-3 font-mono text-sm resize-none outline-none border-none overflow-auto"
          spellCheck={false}
          style={{
            lineHeight: 1.5,
            tabSize: 2,
            color: theme === "dark" ? "#d4d4d4" : "#333333",
            backgroundColor: theme === "dark" ? "#1e1e1e" : "#ffffff",
          }}
        />
      </div>

      <style jsx global>{`
        /* Editor container */
        .editor-container {
          height: calc(100% - ${searchOpen ? "80px" : "40px"});
          min-height: 100px;
          overflow: hidden;
        }
        
        /* Line numbers */
        .line-numbers {
          min-width: 3rem;
          line-height: 1.5;
        }
        
        /* Textarea */
        .editor-textarea {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        }
        
        /* Ensure scrollbars are visible */
        .editor-textarea::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        
        .editor-textarea::-webkit-scrollbar-track {
          background: ${theme === "dark" ? "#2d2d2d" : "#f1f1f1"};
        }
        
        .editor-textarea::-webkit-scrollbar-thumb {
          background: ${theme === "dark" ? "#555" : "#888"};
          border-radius: 7px;
          border: 3px solid ${theme === "dark" ? "#2d2d2d" : "#f1f1f1"};
        }
        
        .editor-textarea::-webkit-scrollbar-thumb:hover {
          background: ${theme === "dark" ? "#777" : "#555"};
        }
      `}</style>
    </div>
  )
}

