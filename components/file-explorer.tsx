"use client"

import type React from "react"

import { useState, useCallback, useMemo, memo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ChevronRight,
  ChevronDown,
  FileIcon,
  FolderIcon,
  Trash2,
  Plus,
  Upload,
  FileEdit,
  Download,
  Edit,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

// تعديل واجهة FileExplorerProps لإضافة الوظائف الجديدة
interface FileExplorerProps {
  files: Array<{
    path: string
    projectId: string
    content: string
    lastModified: number
  }>
  currentFilePath: string | null
  onFileSelect: (filePath: string) => void
  onDeleteFile: (filePath: string) => void
  onRenameFile: (oldPath: string, newName: string) => void
  onDownloadFile: (filePath: string) => void
  onCreateFileClick: () => void
  onUploadFileClick: () => void
}

interface FileNode {
  name: string
  path: string
  type: "file" | "folder"
  children: FileNode[]
  content?: string
  lastModified?: number
}

// Memoize the entire FileExplorer component
const FileExplorer = memo(function FileExplorer({
  files,
  currentFilePath,
  onFileSelect,
  onDeleteFile,
  onRenameFile,
  onDownloadFile,
  onCreateFileClick,
  onUploadFileClick,
}: FileExplorerProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({})
  const { t } = useTranslation()
  const [contextMenuState, setContextMenuState] = useState<{
    isOpen: boolean
    position: { x: number; y: number }
    filePath: string
  } | null>(null)

  // Build file tree structure - memoized to prevent unnecessary recalculations
  const fileTree = useMemo(() => {
    const projectId = files.length > 0 ? files[0].projectId : ""

    const buildFileTree = (files: FileExplorerProps["files"], projectId: string): FileNode => {
      const root: FileNode = {
        name: "root",
        path: "",
        type: "folder",
        children: [],
      }

      // Sort files to ensure folders are processed before their contents
      const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

      sortedFiles.forEach((file) => {
        // Remove project ID prefix from path
        const relativePath = file.path.replace(`${projectId}/`, "")
        const pathParts = relativePath.split("/")

        let currentNode = root
        let currentPath = projectId

        // Process each part of the path
        for (let i = 0; i < pathParts.length; i++) {
          const part = pathParts[i]
          currentPath += `/${part}`

          // If this is the last part, it's a file
          if (i === pathParts.length - 1) {
            currentNode.children.push({
              name: part,
              path: file.path,
              type: "file" | "folder",
              children: [],
              content: file.content,
              lastModified: file.lastModified,
            })
          } else {
            // This is a folder
            let folderNode = currentNode.children.find((child) => child.type === "folder" && child.name === part)

            if (!folderNode) {
              folderNode = {
                name: part,
                path: currentPath,
                type: "folder",
                children: [],
              }
              currentNode.children.push(folderNode)
            }

            currentNode = folderNode
          }
        }
      })

      return root
    }

    return buildFileTree(files, projectId)
  }, [files])

  // Get file icon based on file extension - memoized
  const getFileIcon = useCallback((fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (extension === "html" || extension === "htm" || extension === "xhtml") {
      return <FileIcon className="h-4 w-4 text-orange-400" />
    } else if (extension === "css" || extension === "scss" || extension === "sass" || extension === "less") {
      return <FileIcon className="h-4 w-4 text-blue-400" />
    } else if (
      extension === "js" ||
      extension === "jsx" ||
      extension === "ts" ||
      extension === "tsx" ||
      extension === "mjs"
    ) {
      return <FileIcon className="h-4 w-4 text-yellow-400" />
    } else if (extension === "json" || extension === "jsonc") {
      return <FileIcon className="h-4 w-4 text-green-400" />
    } else if (extension === "md" || extension === "markdown") {
      return <FileIcon className="h-4 w-4 text-purple-400" />
    } else if (isBinaryFile(fileName)) {
      return <FileIcon className="h-4 w-4 text-gray-400" />
    }

    return <FileIcon className="h-4 w-4" />
  }, [])

  // Check if a file is binary - memoized
  const isBinaryFile = useCallback((fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase()
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
  }, [])

  // Toggle folder expansion - memoized
  const toggleFolder = useCallback((folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }))
  }, [])

  // Handle file selection - memoized
  const handleFileSelect = useCallback(
    (path: string) => {
      console.log("FileExplorer selecting file:", path)
      onFileSelect(path)
    },
    [onFileSelect],
  )

  // Handle file deletion - memoized
  const handleDeleteFile = useCallback(
    (path: string, e: React.MouseEvent) => {
      e.stopPropagation()
      onDeleteFile(path)
    },
    [onDeleteFile],
  )

  // Add this effect to handle closing the context menu when clicking outside
  useEffect(() => {
    if (contextMenuState?.isOpen) {
      const handleClickOutside = () => {
        setContextMenuState(null)
      }

      document.addEventListener("click", handleClickOutside)

      return () => {
        document.removeEventListener("click", handleClickOutside)
      }
    }
  }, [contextMenuState])

  // تعديل وظيفة renderFileNode لتحسين تجربة النقر على الملفات
  const renderFileNode = useCallback(
    (node: FileNode, level = 0, projectId: string) => {
      const isExpanded = expandedFolders[node.path] === true
      const isContextMenuOpen = contextMenuState?.filePath === node.path && contextMenuState.isOpen

      const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation() // منع انتشار الحدث
        setContextMenuState({
          isOpen: true,
          position: { x: e.clientX, y: e.clientY },
          filePath: node.path,
        })
      }

      const handleRenameFile = () => {
        setContextMenuState(null)
        const fileName = node.name
        const newName = window.prompt("Enter new file name:", fileName)
        if (newName && newName !== fileName) {
          onRenameFile(node.path, newName)
        }
      }

      const closeContextMenu = () => {
        setContextMenuState(null)
      }

      if (node.type === "folder") {
        // Don't render the root node
        if (node.name === "root") {
          return <div key="root">{node.children.map((child) => renderFileNode(child, level, projectId))}</div>
        }

        return (
          <div key={node.path}>
            <div
              className="flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-muted/50"
              onClick={(e) => {
                e.stopPropagation() // منع انتشار الحدث
                toggleFolder(node.path)
              }}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0 mr-1">
                {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Button>
              <FolderIcon className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm truncate">{node.name}</span>
            </div>

            {isExpanded && <div>{node.children.map((child) => renderFileNode(child, level + 1, projectId))}</div>}
          </div>
        )
      } else {
        // File node
        const isSelected = currentFilePath === node.path

        return (
          <div key={node.path} className="file-node">
            <div
              className={cn(
                "flex items-center justify-between py-1 px-2 rounded-md cursor-pointer",
                isSelected ? "bg-muted" : "hover:bg-muted/50",
              )}
              onClick={(e) => {
                // تنفيذ اختيار الملف فوراً وبشكل مباشر
                e.preventDefault()
                e.stopPropagation()

                // استخدام setTimeout لتأخير استدعاء اختيار الملف بشكل طفيف
                // هذا يضمن أن أي تحديثات حالة أخرى تكتمل أولاً
                setTimeout(() => {
                  handleFileSelect(node.path)
                }, 0)
              }}
              onContextMenu={handleContextMenu}
              style={{ paddingLeft: `${level * 12 + 8}px` }}
            >
              <div className="flex items-center overflow-hidden">
                {getFileIcon(node.name)}
                <span className="ml-2 text-sm truncate">{node.name}</span>
              </div>
            </div>

            {isContextMenuOpen && (
              <div
                className="fixed z-50 bg-background border rounded-md shadow-md py-1 min-w-[160px]"
                style={{
                  left: `${contextMenuState.position.x}px`,
                  top: `${contextMenuState.position.y}px`,
                }}
                onClick={(e) => e.stopPropagation()} // منع انتشار النقرات من القائمة
              >
                <div
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-muted flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation() // منع انتشار الحدث
                    closeContextMenu()
                    setTimeout(() => {
                      handleFileSelect(node.path)
                    }, 0)
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Open
                </div>
                <div
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-muted flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation() // منع انتشار الحدث
                    handleRenameFile()
                  }}
                >
                  <FileEdit className="h-4 w-4 mr-2" />
                  Rename
                </div>
                <div
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-muted flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation() // منع انتشار الحدث
                    closeContextMenu()
                    onDownloadFile(node.path)
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </div>
                <div
                  className="px-3 py-1.5 text-sm cursor-pointer hover:bg-muted text-red-500 flex items-center"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation() // منع انتشار الحدث
                    closeContextMenu()
                    onDeleteFile(node.path)
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </div>
              </div>
            )}
          </div>
        )
      }
    },
    [
      expandedFolders,
      currentFilePath,
      getFileIcon,
      handleFileSelect,
      onDeleteFile,
      onRenameFile,
      onDownloadFile,
      toggleFolder,
      contextMenuState,
    ],
  )

  // Get project ID from the first file
  const projectId = files.length > 0 ? files[0].projectId : ""

  // Use a stable key for the ScrollArea to force a complete remount if needed
  const scrollAreaKey = useMemo(() => `file-explorer-${projectId}`, [projectId])

  return (
    <div className="h-full flex flex-col border-r">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="font-medium">{t("files")}</h2>
        <div className="flex">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUploadFileClick} title={t("uploadFile")}>
            <Upload className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onCreateFileClick} title={t("newFile")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <div className="p-2">{renderFileNode(fileTree, 0, projectId)}</div>
      </div>
    </div>
  )
})

export default FileExplorer

