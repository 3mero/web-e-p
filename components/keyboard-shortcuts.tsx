"use client"

import { useEffect, useCallback, memo } from "react"
import { useToast } from "@/hooks/use-toast"

interface KeyboardShortcutsProps {
  onSave?: () => void
  onRun?: () => void
  onNewFile?: () => void
  onFormat?: () => void
  disabled?: boolean
}

// Memoize the component to prevent unnecessary re-renders
export const KeyboardShortcuts = memo(function KeyboardShortcuts({
  onSave,
  onRun,
  onNewFile,
  onFormat,
  disabled = false,
}: KeyboardShortcutsProps) {
  const { toast } = useToast()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return

      // Check if the event target is an input or textarea
      const target = event.target as HTMLElement
      const isInputField = target.tagName === "INPUT" || target.tagName === "TEXTAREA"

      // Only prevent default for our specific shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case "s":
            if (onSave && !isInputField) {
              event.preventDefault()
              onSave()
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl+S: Saving changes",
              })
            }
            break
          case "enter":
            if (onRun) {
              event.preventDefault()
              onRun()
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl+Enter: Running preview",
              })
            }
            break
          case "n":
            if (onNewFile && event.shiftKey) {
              event.preventDefault()
              onNewFile()
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl+Shift+N: New file",
              })
            }
            break
          case "f":
            if (onFormat && event.shiftKey) {
              event.preventDefault()
              onFormat()
              toast({
                title: "Keyboard Shortcut",
                description: "Ctrl+Shift+F: Format code",
              })
            }
            break
        }
      }
    },
    [onSave, onRun, onNewFile, onFormat, disabled, toast],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleKeyDown])

  return null
})

