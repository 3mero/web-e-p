"use client"

import { memo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"

// Memoize the component to prevent unnecessary re-renders
export const ShortcutsHelpDialog = memo(function ShortcutsHelpDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Keyboard shortcuts">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Keyboard shortcuts</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Editor</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+S</div>
                <div>Save changes</div>
                <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+Enter</div>
                <div>Run preview</div>
                <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+Shift+N</div>
                <div>New file</div>
                <div className="font-mono bg-muted px-2 py-1 rounded">Ctrl+Shift+F</div>
                <div>Format code</div>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Navigation</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-mono bg-muted px-2 py-1 rounded">Tab</div>
                <div>Indent</div>
                <div className="font-mono bg-muted px-2 py-1 rounded">Shift+Tab</div>
                <div>Outdent</div>
                <div className="font-mono bg-muted px-2 py-1 rounded">Esc</div>
                <div>Close dialogs</div>
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            <p>Note: On Mac, use Cmd instead of Ctrl for these shortcuts.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
})

