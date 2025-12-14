"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import {
  MousePointer2,
  Minus,
  Square,
  Circle,
  ArrowUpRight,
  Hexagon,
  Type,
  Ruler,
  Move,
  RotateCcw,
  Maximize2,
  FlipHorizontal,
  Scissors,
  ArrowRight,
  Copy,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Hand,
} from "lucide-react"
import type { Tool } from "@/lib/cad-types"

interface ToolbarProps {
  activeTool: Tool
  setActiveTool: (tool: Tool) => void
}

const drawTools = [
  { id: "select" as Tool, icon: MousePointer2, label: "Select (ESC)", shortcut: "ESC" },
  { id: "line" as Tool, icon: Minus, label: "Line (L)", shortcut: "L" },
  { id: "polyline" as Tool, icon: ArrowUpRight, label: "Polyline (PL)", shortcut: "PL" },
  { id: "rectangle" as Tool, icon: Square, label: "Rectangle (REC)", shortcut: "REC" },
  { id: "circle" as Tool, icon: Circle, label: "Circle (C)", shortcut: "C" },
  { id: "arc" as Tool, icon: ArrowUpRight, label: "Arc (A)", shortcut: "A" },
  { id: "polygon" as Tool, icon: Hexagon, label: "Polygon (POL)", shortcut: "POL" },
  { id: "text" as Tool, icon: Type, label: "Text (T)", shortcut: "T" },
  { id: "dimension" as Tool, icon: Ruler, label: "Dimension (DIM)", shortcut: "DIM" },
]

const modifyTools = [
  { id: "move" as Tool, icon: Move, label: "Move (M)", shortcut: "M" },
  { id: "rotate" as Tool, icon: RotateCcw, label: "Rotate (RO)", shortcut: "RO" },
  { id: "scale" as Tool, icon: Maximize2, label: "Scale (SC)", shortcut: "SC" },
  { id: "mirror" as Tool, icon: FlipHorizontal, label: "Mirror (MI)", shortcut: "MI" },
  { id: "trim" as Tool, icon: Scissors, label: "Trim (TR)", shortcut: "TR" },
  { id: "extend" as Tool, icon: ArrowRight, label: "Extend (EX)", shortcut: "EX" },
  { id: "offset" as Tool, icon: Copy, label: "Offset (O)", shortcut: "O" },
]

const viewTools = [
  { id: "pan" as Tool, icon: Hand, label: "Pan (P)", shortcut: "P" },
  { id: "zoom" as Tool, icon: ZoomIn, label: "Zoom (Z)", shortcut: "Z" },
]

export function Toolbar({ activeTool, setActiveTool }: ToolbarProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <div className="flex items-center h-10 bg-card border-b border-border px-2 gap-1">
        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Undo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Redo2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
          </Tooltip>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Draw Tools */}
        <div className="flex items-center gap-0.5">
          {drawTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 ${activeTool === tool.id ? "bg-primary/20 text-primary" : ""}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Modify Tools */}
        <div className="flex items-center gap-0.5">
          {modifyTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 ${activeTool === tool.id ? "bg-primary/20 text-primary" : ""}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* View Tools */}
        <div className="flex items-center gap-0.5">
          {viewTools.map((tool) => (
            <Tooltip key={tool.id}>
              <TooltipTrigger asChild>
                <Button
                  variant={activeTool === tool.id ? "secondary" : "ghost"}
                  size="icon"
                  className={`h-8 w-8 ${activeTool === tool.id ? "bg-primary/20 text-primary" : ""}`}
                  onClick={() => setActiveTool(tool.id)}
                >
                  <tool.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tool.label}</TooltipContent>
            </Tooltip>
          ))}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Extents</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  )
}
