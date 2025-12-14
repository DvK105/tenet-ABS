"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings2 } from "lucide-react"
import type { DrawingElement, Layer } from "@/lib/cad-types"

interface PropertiesPanelProps {
  selectedElement: DrawingElement | null
  updateElement: (id: string, updates: Partial<DrawingElement>) => void
  layers: Layer[]
}

export function PropertiesPanel({ selectedElement, updateElement, layers }: PropertiesPanelProps) {
  return (
    <div className="w-56 bg-card border-l border-border flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
        <Settings2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Properties</span>
      </div>
      <div className="flex-1 p-3 space-y-4 overflow-auto">
        {selectedElement ? (
          <>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Type</Label>
              <div className="text-sm capitalize bg-secondary px-2 py-1 rounded">{selectedElement.type}</div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Layer</Label>
              <Select
                value={selectedElement.layerId}
                onValueChange={(value) => updateElement(selectedElement.id, { layerId: value })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layers.map((layer) => (
                    <SelectItem key={layer.id} value={layer.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: layer.color }} />
                        {layer.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Color</Label>
              <Input
                type="color"
                value={selectedElement.color || "#00ffff"}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                className="h-8 p-1"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Line Weight</Label>
              <Select
                value={String(selectedElement.lineWeight || 1)}
                onValueChange={(value) => updateElement(selectedElement.id, { lineWeight: Number(value) })}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">0.5</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="1.5">1.5</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Line Type</Label>
              <Select
                value={selectedElement.lineType || "solid"}
                onValueChange={(value) =>
                  updateElement(selectedElement.id, {
                    lineType: value as DrawingElement["lineType"],
                  })
                }
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            {selectedElement.points && selectedElement.points.length >= 2 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Geometry</Label>
                <div className="text-xs text-muted-foreground space-y-1 bg-secondary p-2 rounded font-mono">
                  <div>
                    Start: ({selectedElement.points[0].x.toFixed(2)}, {selectedElement.points[0].y.toFixed(2)})
                  </div>
                  <div>
                    End: ({selectedElement.points[1].x.toFixed(2)}, {selectedElement.points[1].y.toFixed(2)})
                  </div>
                </div>
              </div>
            )}
            {selectedElement.center && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Geometry</Label>
                <div className="text-xs text-muted-foreground space-y-1 bg-secondary p-2 rounded font-mono">
                  <div>
                    Center: ({selectedElement.center.x.toFixed(2)}, {selectedElement.center.y.toFixed(2)})
                  </div>
                  {selectedElement.radius && <div>Radius: {selectedElement.radius.toFixed(2)}</div>}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Settings2 className="h-8 w-8 mb-2 opacity-50" />
            <p className="text-sm">No object selected</p>
            <p className="text-xs mt-1">Select an object to view its properties</p>
          </div>
        )}
      </div>
    </div>
  )
}
