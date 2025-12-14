"use client"

import { Button } from "@/components/ui/button"
import { Grid3X3, CornerDownRight, Magnet } from "lucide-react"
import type { Point } from "@/lib/cad-types"

interface StatusBarProps {
  cursorPosition: Point
  zoom: number
  gridSnap: boolean
  orthoMode: boolean
  setGridSnap: (value: boolean) => void
  setOrthoMode: (value: boolean) => void
}

export function StatusBar({ cursorPosition, zoom, gridSnap, orthoMode, setGridSnap, setOrthoMode }: StatusBarProps) {
  return (
    <div className="h-6 bg-card border-t border-border flex items-center justify-between px-3 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
          <span>X:</span>
          <span className="w-20 text-foreground">{cursorPosition.x.toFixed(4)}</span>
          <span>Y:</span>
          <span className="w-20 text-foreground">{cursorPosition.y.toFixed(4)}</span>
          <span>Z:</span>
          <span className="w-20 text-foreground">0.0000</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant={gridSnap ? "secondary" : "ghost"}
          size="sm"
          className={`h-5 px-2 text-xs ${gridSnap ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setGridSnap(!gridSnap)}
        >
          <Grid3X3 className="h-3 w-3 mr-1" />
          GRID
        </Button>
        <Button
          variant={gridSnap ? "secondary" : "ghost"}
          size="sm"
          className={`h-5 px-2 text-xs ${gridSnap ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setGridSnap(!gridSnap)}
        >
          <Magnet className="h-3 w-3 mr-1" />
          SNAP
        </Button>
        <Button
          variant={orthoMode ? "secondary" : "ghost"}
          size="sm"
          className={`h-5 px-2 text-xs ${orthoMode ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setOrthoMode(!orthoMode)}
        >
          <CornerDownRight className="h-3 w-3 mr-1" />
          ORTHO
        </Button>
        <div className="ml-4 text-muted-foreground">
          Zoom: <span className="text-foreground">{zoom}%</span>
        </div>
        <div className="ml-4 text-muted-foreground">Model</div>
      </div>
    </div>
  )
}
