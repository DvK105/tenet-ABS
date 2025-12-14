"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Eye, EyeOff, Lock, Unlock, Plus, Trash2, Layers } from "lucide-react"
import type { Layer } from "@/lib/cad-types"

interface LayersPanelProps {
  layers: Layer[]
  activeLayer: string
  setActiveLayer: (id: string) => void
  addLayer: () => void
  updateLayer: (id: string, updates: Partial<Layer>) => void
  deleteLayer: (id: string) => void
}

export function LayersPanel({
  layers,
  activeLayer,
  setActiveLayer,
  addLayer,
  updateLayer,
  deleteLayer,
}: LayersPanelProps) {
  return (
    <div className="w-56 bg-card border-r border-border flex flex-col">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Layers</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={addLayer}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {layers.map((layer) => (
            <div
              key={layer.id}
              className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                activeLayer === layer.id ? "bg-primary/20 text-primary" : "hover:bg-secondary text-foreground"
              }`}
              onClick={() => setActiveLayer(layer.id)}
            >
              <button
                className="p-0.5 hover:bg-secondary rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  updateLayer(layer.id, { visible: !layer.visible })
                }}
              >
                {layer.visible ? (
                  <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              <button
                className="p-0.5 hover:bg-secondary rounded"
                onClick={(e) => {
                  e.stopPropagation()
                  updateLayer(layer.id, { locked: !layer.locked })
                }}
              >
                {layer.locked ? (
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </button>
              <div className="w-3 h-3 rounded-sm border border-border" style={{ backgroundColor: layer.color }} />
              <span className="flex-1 truncate">{layer.name}</span>
              {layers.length > 1 && (
                <button
                  className="p-0.5 hover:bg-destructive/20 rounded opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLayer(layer.id)
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-2 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Active: {layers.find((l) => l.id === activeLayer)?.name || "None"}
        </div>
      </div>
    </div>
  )
}
