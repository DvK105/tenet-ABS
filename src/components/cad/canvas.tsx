"use client"

import type React from "react"

import { useRef, useState, useEffect, useCallback, useMemo } from "react"
import { Stage, Layer, Line, Rect, Circle, Arc, Text } from "react-konva"
import Konva from "konva"
import type { DrawingElement, Layer as CADLayer, Tool, Point } from "@/lib/cad-types"

interface CanvasProps {
  activeTool: Tool
  elements: DrawingElement[]
  layers: CADLayer[]
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
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [isDrawing, setIsDrawing] = useState(false)
  const [startPoint, setStartPoint] = useState<Point | null>(null)
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null)
  const [stagePos, setStagePos] = useState<Point>({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState<Point>({ x: 0, y: 0 })

  const gridSize = 20
  const snapSize = gridSnap ? 10 : 1
  const scale = zoom / 100

  // Update stage size when container resizes
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

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

  const getPointerPosition = useCallback((): Point => {
    const stage = stageRef.current
    if (!stage) return { x: 0, y: 0 }

    const pointerPos = stage.getPointerPosition()
    if (!pointerPos) return { x: 0, y: 0 }

    const transformedPos = stage.getRelativePointerPosition()
    if (!transformedPos) return { x: 0, y: 0 }

    return transformedPos
  }, [])

  // Generate grid lines
  const gridLines = useMemo(() => {
    if (stageSize.width === 0 || stageSize.height === 0) return { vertical: [], horizontal: [] }

    const lines: { vertical: Array<{ x: number; y1: number; y2: number }>; horizontal: Array<{ y: number; x1: number; x2: number }> } = {
      vertical: [],
      horizontal: [],
    }

    const startX = Math.floor(-stagePos.x / scale / gridSize) * gridSize
    const startY = Math.floor(-stagePos.y / scale / gridSize) * gridSize
    const endX = startX + stageSize.width / scale + gridSize * 2
    const endY = startY + stageSize.height / scale + gridSize * 2

    for (let x = startX; x < endX; x += gridSize) {
      lines.vertical.push({ x, y1: startY, y2: endY })
    }

    for (let y = startY; y < endY; y += gridSize) {
      lines.horizontal.push({ y, x1: startX, x2: endX })
    }

    return lines
  }, [stageSize, stagePos, scale, gridSize])

  // Convert DrawingElement to Konva props
  const renderElement = useCallback(
    (element: DrawingElement, isSelected: boolean) => {
      const layer = layers.find((l) => l.id === element.layerId)
      if (!layer?.visible) return null

      const color = element.color || layer?.color || "#00ffff"
      const strokeWidth = element.lineWeight || 1

      let dash: number[] = []
      if (element.lineType === "dashed") {
        dash = [8, 4]
      } else if (element.lineType === "dotted") {
        dash = [2, 2]
      } else if (element.lineType === "center") {
        dash = [12, 4, 2, 4]
      }

      const commonProps = {
        stroke: isSelected ? "#ff6b6b" : color,
        strokeWidth: isSelected ? 2 : strokeWidth,
        dash: isSelected ? [4, 4] : dash,
        listening: activeTool === "select",
      }

      switch (element.type) {
        case "line":
          if (element.points && element.points.length >= 2) {
            return (
              <Line
                key={element.id}
                points={[element.points[0].x, element.points[0].y, element.points[1].x, element.points[1].y]}
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "rectangle":
          if (element.points && element.points.length >= 2) {
            const [p1, p2] = element.points
            return (
              <Rect
                key={element.id}
                x={p1.x}
                y={p1.y}
                width={p2.x - p1.x}
                height={p2.y - p1.y}
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "circle":
          if (element.center && element.radius) {
            return (
              <Circle
                key={element.id}
                x={element.center.x}
                y={element.center.y}
                radius={element.radius}
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "arc":
          if (element.center && element.radius) {
            return (
              <Arc
                key={element.id}
                x={element.center.x}
                y={element.center.y}
                innerRadius={0}
                outerRadius={element.radius}
                angle={((element.endAngle || Math.PI) - (element.startAngle || 0)) * (180 / Math.PI)}
                rotation={(element.startAngle || 0) * (180 / Math.PI)}
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "polygon":
          if (element.center && element.radius && element.sides) {
            const sides = element.sides
            const angle = (Math.PI * 2) / sides
            const points: number[] = []
            for (let i = 0; i <= sides; i++) {
              const x = element.center.x + element.radius * Math.cos(angle * i - Math.PI / 2)
              const y = element.center.y + element.radius * Math.sin(angle * i - Math.PI / 2)
              points.push(x, y)
            }
            return (
              <Line
                key={element.id}
                points={points}
                closed
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "polyline":
          if (element.points && element.points.length >= 2) {
            const points: number[] = []
            element.points.forEach((p) => {
              points.push(p.x, p.y)
            })
            return (
              <Line
                key={element.id}
                points={points}
                {...commonProps}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break

        case "text":
          if (element.points && element.points.length > 0 && element.text) {
            return (
              <Text
                key={element.id}
                x={element.points[0].x}
                y={element.points[0].y}
                text={element.text}
                fontSize={element.fontSize || 14}
                fontFamily="monospace"
                fill={color}
                listening={activeTool === "select"}
                onClick={() => setSelectedElement(element)}
              />
            )
          }
          break
      }

      return null
    },
    [layers, selectedElement, activeTool, setSelectedElement],
  )

  // Preview shape while drawing
  const renderPreview = () => {
    if (!isDrawing || !startPoint || !currentPoint) return null

    const layer = layers.find((l) => l.id === activeLayer)
    const color = layer?.color || "#00ffff"
    const endPoint = orthoMode ? applyOrtho(startPoint, currentPoint) : currentPoint

    switch (activeTool) {
      case "line":
        return (
          <Line
            points={[startPoint.x, startPoint.y, endPoint.x, endPoint.y]}
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )

      case "rectangle":
        return (
          <Rect
            x={startPoint.x}
            y={startPoint.y}
            width={endPoint.x - startPoint.x}
            height={endPoint.y - startPoint.y}
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )

      case "circle":
        const radius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
        return (
          <Circle
            x={startPoint.x}
            y={startPoint.y}
            radius={radius}
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )

      case "polygon":
        const polyRadius = Math.sqrt(Math.pow(endPoint.x - startPoint.x, 2) + Math.pow(endPoint.y - startPoint.y, 2))
        const sides = 6
        const angle = (Math.PI * 2) / sides
        const points: number[] = []
        for (let i = 0; i <= sides; i++) {
          const x = startPoint.x + polyRadius * Math.cos(angle * i - Math.PI / 2)
          const y = startPoint.y + polyRadius * Math.sin(angle * i - Math.PI / 2)
          points.push(x, y)
        }
        return (
          <Line
            points={points}
            closed
            stroke={color}
            strokeWidth={1}
            dash={[4, 4]}
            listening={false}
          />
        )
    }

    return null
  }

  const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage()
    if (!stage) return

    const pos = getPointerPosition()
    const snappedPos = snapToGrid(pos)
    setCursorPosition(snappedPos)

    // Handle pan tool or middle mouse button
    if (activeTool === "pan" || e.evt.button === 1) {
      setIsPanning(true)
      setPanStart({
        x: e.evt.clientX - stagePos.x,
        y: e.evt.clientY - stagePos.y,
      })
      e.evt.preventDefault()
      return
    }

    // Handle select tool
    if (activeTool === "select") {
      // Konva handles selection through onClick on shapes
      // If clicking on stage (not a shape), deselect
      if (e.target === stage || e.target.getType() === "Stage") {
        setSelectedElement(null)
      }
      return
    }

    // Start drawing
    setIsDrawing(true)
    setStartPoint(snappedPos)
    setCurrentPoint(snappedPos)
  }

  const handleStageMouseMove = (e: Konva.KonvaEventObject<MouseEvent>) => {
    const pos = getPointerPosition()
    const snappedPos = snapToGrid(pos)
    setCursorPosition(snappedPos)
    setCurrentPoint(snappedPos)

    if (isPanning) {
      setStagePos({
        x: e.evt.clientX - panStart.x,
        y: e.evt.clientY - panStart.y,
      })
      e.evt.preventDefault()
      return
    }
  }

  const handleStageMouseUp = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) {
      setIsPanning(false)
      e.evt.preventDefault()
      return
    }

    if (!isDrawing || !startPoint) return

    const pos = getPointerPosition()
    const endPos = snapToGrid(pos)
    const finalEndPoint = orthoMode ? applyOrtho(startPoint, endPos) : endPos

    const layer = layers.find((l) => l.id === activeLayer)
    if (!layer) {
      setIsDrawing(false)
      setStartPoint(null)
      setCurrentPoint(null)
      return
    }

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

  const handleStageWheel = (e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    const delta = e.evt.deltaY > 0 ? -10 : 10
    const newZoom = Math.max(10, Math.min(500, zoom + delta))
    setZoom(newZoom)
  }

  // Render crosshair cursor
  const renderCrosshair = () => {
    if (activeTool === "select" || activeTool === "pan" || !currentPoint) return null

    return (
      <>
        <Line
          points={[currentPoint.x - 10, currentPoint.y, currentPoint.x + 10, currentPoint.y]}
          stroke="#ffffff"
          strokeWidth={1}
          listening={false}
        />
        <Line
          points={[currentPoint.x, currentPoint.y - 10, currentPoint.x, currentPoint.y + 10]}
          stroke="#ffffff"
          strokeWidth={1}
          listening={false}
        />
      </>
    )
  }

  const cursorStyle =
    activeTool === "pan" || isPanning ? "grab" : activeTool === "select" ? "default" : "crosshair"

  return (
    <div
      ref={containerRef}
      className="flex-1 relative overflow-hidden bg-[#1a1a24]"
      style={{ cursor: cursorStyle }}
    >
      {stageSize.width > 0 && stageSize.height > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          x={stagePos.x}
          y={stagePos.y}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onMouseLeave={() => setCurrentPoint(null)}
          onWheel={handleStageWheel}
        >
          {/* Grid Layer */}
          <Layer>
            {/* Vertical grid lines */}
            {gridLines.vertical.map((line, i) => (
              <Line
                key={`v-${i}`}
                points={[line.x, line.y1, line.x, line.y2]}
                stroke="#2a2a35"
                strokeWidth={0.5}
                listening={false}
              />
            ))}
            {/* Horizontal grid lines */}
            {gridLines.horizontal.map((line, i) => (
              <Line
                key={`h-${i}`}
                points={[line.x1, line.y, line.x2, line.y]}
                stroke="#2a2a35"
                strokeWidth={0.5}
                listening={false}
              />
            ))}
            {/* Origin axes - render in world coordinates */}
            <Line
              points={[-10000, 0, 10000, 0]}
              stroke="#3a3a45"
              strokeWidth={1}
              listening={false}
            />
            <Line
              points={[0, -10000, 0, 10000]}
              stroke="#3a3a45"
              strokeWidth={1}
              listening={false}
            />
          </Layer>

          {/* Drawing Elements Layer */}
          <Layer>
            {elements.map((element) => renderElement(element, selectedElement?.id === element.id))}
            {renderPreview()}
            {renderCrosshair()}
          </Layer>
        </Stage>
      )}
      <div className="absolute top-2 left-2 bg-card/80 backdrop-blur-sm px-2 py-1 rounded text-xs text-muted-foreground">
        Model
      </div>
    </div>
  )
}