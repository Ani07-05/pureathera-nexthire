"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { azureSessionManager } from "@/lib/azure-session-manager"

export function CleanupButton() {
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  const forceCleanup = async () => {
    setIsCleaningUp(true)
    try {
      await azureSessionManager.forceCleanup()
      console.log('✅ All Azure avatar sessions cleaned up')
      alert('Sessions cleaned up! You can now start a new interview.')
    } catch (error) {
      console.error('Cleanup failed:', error)
    } finally {
      setIsCleaningUp(false)
    }
  }

  return (
    <Button
      onClick={forceCleanup}
      disabled={isCleaningUp}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {isCleaningUp ? 'Cleaning...' : 'Force Cleanup'}
    </Button>
  )
}