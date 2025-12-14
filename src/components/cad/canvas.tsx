"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback } from "react"
import type { DrawingElement, Layer, Tool, Point } from "@/lib/cad-types"

interface CanvasProps {
  activeTool: Tool
  elements: DrawingElement[]
  layers: Layer[]
  activeLayer: string
  selectedElement: DrawingElement | null
  setSelectedElement: (element: DrawingElement | null) => void
  addElement: (element: DrawingElement) => void
  updateElement: (id: string, updates: Partial<DrawingElement>) => void
  setCursorPosition: (position: Point) => void
  zoom: number
  setZoom: (zoom: number) => void
  gridSnap: boolean
  orthoMode: boolean
}

export function Canvas({
  activeTool,
  elements,
  layers,
  activeLayer,
  selectedElement,
  setSelectedElement,
  addElement,
  updateElement,
  setCursorPosition,
  zoom,
  setZoom,
  gridSnap,
  orthoMode,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [panOffset, setPanOffset] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 })

  const gridSize = 20
  const snapSize = gridSnap ? 10 : 1

  const snapToGrid = useCallback(
    (point: Point): Point => {
      if (!gridSnap) return point
      return {
        x: Math.round(point.x / snapSize) * snapSize,
        y: Math.round(point.y / snapSize) * snapSize,
      }
    },
    [gridSnap, snapSize],
  )

  const applyOrtho = useCallback(
    (start: Point, current: Point): Point => {
      if (!orthoMode || !start) return current
      const dx = Math.abs(current.x - start.x)
      const dy = Math.abs(current.y - start.y)
      if (dx > dy) {
        return { x: current.x, y: start.y }
      } else {
        return { x: start.x, y: current.y }
      }
    },
    [orthoMode],
  )

  const getMousePosition = useCallback(
    (e: React.MouseEvent): Point => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      const scale = zoom / 100
      return {
        x: (e.clientX - rect.left - panOffset.x) / scale,
        y: (e.clientY - rect.top - panOffset.y) / scale,
      }
    },
    [zoom, panOffset],
  )

  const drawGrid = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      const scale = zoom / 100
      ctx.strokeStyle = "#2a2a35"
      ctx.lineWidth = 0.5

      const startX = Math.floor(-panOffset.x / scale / gridSize) * gridSize
      const startY = Math.floor(-panOffset.y / scale / gridSize) * gridSize
      const endX = startX + width / scale + gridSize * 2
      const endY = startY + height / scale + gridSize * 2

      for (let x = startX; x < endX; x += gridSize) {
        ctx.beginPath()
        ctx.moveTo(x, startY)
        ctx.lineTo(x, endY)
        ctx.stroke()
      }

      for (let y = startY; y < endY; y += gridSize) {
        ctx.beginPath()
        ctx.moveTo(startX, y)
        ctx.lineTo(endX, y)
        ctx.stroke()
      }

      // Origin axes
      ctx.strokeStyle = "#3a3a45"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(-panOffset.x / scale, 0)
      ctx.lineTo(width / scale - panOffset.x / scale, 0)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, -panOffset.y / scale)
      ctx.lineTo(0, height / scale - panOffset.y / scale)
      ctx.stroke()
    },
    [zoom, panOffset, gridSize],
  )

  const drawElement = useCallback(
    (ctx: CanvasRenderingContext2D, element: DrawingElement, isSelected: boolean) => {
      const layer = layers.find((l) => l.id === element.layerId)
      if (!layer?.visible) return

      const color = element.color || layer?.color || "#00ffff"
      ctx.strokeStyle = color
      ctx.fillStyle = color
      ctx.lineWidth = element.lineWeight || 1

      if (element.lineType === "dashed") {
        ctx.setLineDash([8, 4])
      } else if (element.lineType === "dotted") {
        ctx.setLineDash([2, 2])
      } else if (element.lineType === "center") {
        ctx.setLineDash([12, 4, 2, 4])
      } else {
        ctx.setLineDash([])
      }

      ctx.beginPath()

      switch (element.type) {
        case "line":
          if (element.points && element.points.length >= 2) {
            ctx.moveTo(element.points[0].x, element.points[0].y)
            ctx.lineTo(element.points[1].x, element.points[1].y)
          }
          break
        case "rectangle":
          if (element.points && element.points.length >= 2) {
            const [p1, p2] = element.points
            ctx.rect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y)
          }
          break
        case "circle":
          if (element.center && element.radius) {
            ctx.arc(element.center.x, element.center.y, element.radius, 0, Math.PI * 2)
          }
          break
        case "arc":
          if (element.center && element.radius) {
            ctx.arc(
              element.center.x,
              element.center.y,
              element.radius,
              element.startAngle || 0,
              element.endAngle || Math.PI,
            )
          }
          break
        case "polygon":
          if (element.center && element.radius && element.sides) {
            const sides = element.sides
            const angle = (Math.PI * 2) / sides
            for (let i = 0; i <= sides; i++) {
              const x = element.center.x + element.radius * Math.cos(angle * i - Math.PI / 2)
              const y = element.center.y + element.radius * Math.sin(angle * i - Math.PI / 2)
              if (i === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }
            }
          }
          break
        case "polyline":
          if (element.points && element.points.length >= 2) {
            ctx.moveTo(element.points[0].x, element.points[0].y)
            for (let i = 1; i < element.points.length; i++) {
              ctx.lineTo(element.points[i].x, element.points[i].y)
            }
          }
          break
        case "text":
          if (element.points && element.points.length > 0 && element.text) {
            ctx.font = `${element.fontSize || 14}px monospace`
            ctx.fillText(element.text, element.points[0].x, element.points[0].y)
            return
          }
          break
      }

      ctx.stroke()

      if (isSelected) {
        ctx.strokeStyle = "#ff6b6b"
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.stroke()
      }

      ctx.setLineDash([])
    },
    [layers],
  )

  const drawPreview = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!isDrawing || !startPoint || !currentPoint) return

      const layer = layers.find((l) => l.id === activeLayer)
      ctx.strokeStyle = layer?.color || "#00ffff"
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.beginPath()

      const endPoint = orthoMode ? applyOrtho(startPoint, currentPoint) : currentPoint

      switch (activeTool) {
        case "line":
          ctx.moveTo(startPoint.x, startPoint.y)
          ctx.lineTo(endPoint.x, endPoint.y)
          break
        case "rectangle":
          ctx.rect(startPoint.x, startPoint.y, endPoint.x - startPoint.x, endPoint.y - startPoint.y)
          break
        case "circle":
          const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
          ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2)
          break
        case "polygon":
          const polyRadius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
          const sides = 6
          const angle = (Math.PI * 2) / sides
          for (let i = 0; i <= sides; i++) {
            const x = startPoint.x + polyRadius * Math.cos(angle * i - Math.PI / 2)
            const y = startPoint.y + polyRadius * Math.sin(angle * i - Math.PI / 2)
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              ctx.lineTo(x, y)
            }
          }
          break
      }

      ctx.stroke()
      ctx.setLineDash([])
    },
    [isDrawing, startPoint, currentPoint, activeTool, activeLayer, layers, orthoMode, applyOrtho],
  )

  const render = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    ctx.fillStyle = "#1a1a24"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    const scale = zoom / 100
    ctx.translate(panOffset.x, panOffset.y)
    ctx.scale(scale, scale)

    drawGrid(ctx, canvas.width, canvas.height)

    elements.forEach((element) => {
      drawElement(ctx, element, selectedElement?.id === element.id)
    })

    drawPreview(ctx)

    ctx.restore()

    // Crosshair cursor
    if (activeTool !== "select" && activeTool !== "pan" && currentPoint) {
      const screenX = currentPoint.x * scale + panOffset.x
      const screenY = currentPoint.y * scale + panOffset.y
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(screenX - 10, screenY)
      ctx.lineTo(screenX + 10, screenY)
      ctx.moveTo(screenX, screenY - 10)
      ctx.lineTo(screenX, screenY + 10)
      ctx.stroke()
    }
  }, [zoom, panOffset, elements, selectedElement, activeTool, currentPoint, drawGrid, drawElement, drawPreview])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => render()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [render])

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = snapToGrid(getMousePosition(e))
    setCursorPosition(pos)

    if (activeTool === "pan" || e.button === 1) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
      return
    }

    if (activeTool === "select") {
      const clicked = elements.find((el) => {
        if (el.type === "circle" && el.center && el.radius) {
          const dist = Math.sqrt(Math.pow(pos.x - el.center.x, 2) + Math.pow(pos.y - el.center.y, 2))
          return Math.abs(dist - el.radius) < 10
        }
        if (el.points && el.points.length >= 2) {
          const [p1, p2] = el.points
          const minX = Math.min(p1.x, p2.x) - 5
          const maxX = Math.max(p1.x, p2.x) + 5
          const minY = Math.min(p1.y, p2.y) - 5
          const maxY = Math.max(p1.y, p2.y) + 5
          return pos.x >= minX && pos.x <= maxX && pos.y >= minY && pos.y <= maxY
        }
        return false
      })
      setSelectedElement(clicked || null)
      return
    }

    setIsDrawing(true)
    setStartPoint(pos)
    setCurrentPoint(pos)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = snapToGrid(getMousePosition(e))
    setCursorPosition(pos)
    setCurrentPoint(pos)

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
      return
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isPanning) {
      setIsPanning(false)
      return
    }

    if (!isDrawing || !startPoint) return

    const endPos = snapToGrid(getMousePosition(e))
    const finalEndPoint = orthoMode ? applyOrtho(startPoint, endPos) : endPos

    const layer = layers.find((l) => l.id === activeLayer)
    if (!layer) return

    let newElement: DrawingElement | null = null

    switch (activeTool) {
      case "line":
        newElement = {
          id: `element-${Date.now()}`,
          type: "line",
          layerId: activeLayer,
          points: [startPoint, finalEndPoint],
          color: layer.color,
        }
        break
      case "rectangle":
        newElement = {
          id: `element-${Date.now()}`,
          type: "rectangle",
          layerId: activeLayer,
          points: [startPoint, finalEndPoint],
          color: layer.color,
        }
        break
      case "circle":
        const radius = Math.sqrt(
          Math.pow(finalEndPoint.x - startPoint.x, 2) + Math.pow(finalEndPoint.y - startPoint.y, 2),
        )
        newElement = {
          id: `element-${Date.now()}`,
          type: "circle",
          layerId: activeLayer,
          center: startPoint,
          radius,
          color: layer.color,
        }
        break
      case "polygon":
        const polyRadius = Math.sqrt(
          Math.pow(finalEndPoint.x - startPoint.x, 2) + Math.pow(finalEndPoint.y - startPoint.y, 2),
        )
        newElement = {
          id: `element-${Date.now()}`,
          type: "polygon",
          layerId: activeLayer,
          center: startPoint,
          radius: polyRadius,
          sides: 6,
          color: layer.color,
        }
        break
    }

    if (newElement) {
      addElement(newElement)
    }

    setIsDrawing(false)
    setStartPoint(null)
    setCurrentPoint(null)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -10 : 10
    const newZoom = Math.max(10, Math.min(500, zoom + delta))
    setZoom(newZoom)
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#1a1a24]"
      style={{ cursor: activeTool === "pan" || isPanning ? "grab" : activeTool === "select" ? "default" : "crosshair" }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setCurrentPoint(null)}
        onWheel={handleWheel}
        className="w-full h-full"
      />
      <div className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
        Model
      </div>
    </div>
  )
}
