"use client"

import { useState, useCallback } from "react"
import { TopMenuBar } from "./cad/top-menu-bar"
import { Toolbar } from "./cad/toolbar"
import { Canvas } from "./cad/canvas"
import { LayersPanel } from "./cad/layers-panel"
import { PropertiesPanel } from "./cad/properties-panel"
import { CommandLine } from "./cad/command-line"
import { StatusBar } from "./cad/status-bar"
import type { DrawingElement, Layer, Tool, Point } from "@/lib/cad-types"

export function CADEditor() {
  const [activeTool, setActiveTool] = useState<Tool>("select")
  const [elements, setElements] = useState<DrawingElement[]>([])
  const [selectedElement, setSelectedElement] = useState<DrawingElement | null>(null)
  const [layers, setLayers] = useState<Layer[]>([
    { id: "layer-0", name: "Layer 0", color: "#00ffff", visible: true, locked: false },
    { id: "layer-1", name: "Dimensions", color: "#ff0000", visible: true, locked: false },
    { id: "layer-2", name: "Construction", color: "#808080", visible: true, locked: false },
  ])
  const [activeLayer, setActiveLayer] = useState<string>("layer-0")
  const [commandHistory, setCommandHistory] = useState<string[]>(["WebCAD initialized.", "Ready for drawing commands."])
  const [cursorPosition, setCursorPosition] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(100)
  const [gridSnap, setGridSnap] = useState(true)
  const [orthoMode, setOrthoMode] = useState(false)

  const addElement = useCallback(
    (element: DrawingElement) => {
      setElements((prev) => [...prev, element])
      setCommandHistory((prev) => [
        ...prev,
        `Created ${element.type} on ${layers.find((l) => l.id === element.layerId)?.name || "Layer 0"}`,
      ])
    },
    [layers],
  )

  const updateElement = useCallback((id: string, updates: Partial<DrawingElement>) => {
    setElements((prev) => prev.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }, [])

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id))
      if (selectedElement?.id === id) {
        setSelectedElement(null)
      }
      setCommandHistory((prev) => [...prev, "Element deleted."])
    },
    [selectedElement],
  )

  const executeCommand = useCallback(
    (command: string) => {
      const cmd = command.toLowerCase().trim()
      setCommandHistory((prev) => [...prev, `> ${command}`])

      switch (cmd) {
        case "line":
        case "l":
          setActiveTool("line")
          setCommandHistory((prev) => [...prev, "LINE: Specify first point:"])
          break
        case "circle":
        case "c":
          setActiveTool("circle")
          setCommandHistory((prev) => [...prev, "CIRCLE: Specify center point:"])
          break
        case "rectangle":
        case "rec":
          setActiveTool("rectangle")
          setCommandHistory((prev) => [...prev, "RECTANGLE: Specify first corner:"])
          break
        case "arc":
        case "a":
          setActiveTool("arc")
          setCommandHistory((prev) => [...prev, "ARC: Specify start point:"])
          break
        case "polygon":
        case "pol":
          setActiveTool("polygon")
          setCommandHistory((prev) => [...prev, "POLYGON: Enter number of sides:"])
          break
        case "erase":
        case "e":
          if (selectedElement) {
            deleteElement(selectedElement.id)
          } else {
            setCommandHistory((prev) => [...prev, "Select object to erase:"])
          }
          break
        case "zoom":
        case "z":
          setCommandHistory((prev) => [
            ...prev,
            "ZOOM: Specify corner of window, enter scale factor, or [All/Center/Dynamic/Extents/Previous/Scale/Window]:",
          ])
          break
        case "pan":
        case "p":
          setActiveTool("pan")
          setCommandHistory((prev) => [...prev, "PAN: Press ESC or ENTER to exit."])
          break
        case "undo":
        case "u":
          if (elements.length > 0) {
            setElements((prev) => prev.slice(0, -1))
            setCommandHistory((prev) => [...prev, "Undo completed."])
          }
          break
        case "grid":
          setGridSnap((prev) => !prev)
          setCommandHistory((prev) => [...prev, `Grid snap: ${!gridSnap ? "ON" : "OFF"}`])
          break
        case "ortho":
          setOrthoMode((prev) => !prev)
          setCommandHistory((prev) => [...prev, `Ortho mode: ${!orthoMode ? "ON" : "OFF"}`])
          break
        case "help":
        case "?":
          setCommandHistory((prev) => [
            ...prev,
            "Available commands: LINE, CIRCLE, RECTANGLE, ARC, POLYGON, ERASE, ZOOM, PAN, UNDO, GRID, ORTHO, HELP",
          ])
          break
        default:
          setCommandHistory((prev) => [...prev, `Unknown command: ${command}`])
      }
    },
    [selectedElement, deleteElement, gridSnap, orthoMode, elements.length],
  )

  const addLayer = useCallback(() => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.length}`,
      color: "#ffffff",
      visible: true,
      locked: false,
    }
    setLayers((prev) => [...prev, newLayer])
  }, [layers.length])

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prev) => prev.map((layer) => (layer.id === id ? { ...layer, ...updates } : layer)))
  }, [])

  const deleteLayer = useCallback(
    (id: string) => {
      if (layers.length > 1) {
        setLayers((prev) => prev.filter((layer) => layer.id !== id))
        if (activeLayer === id) {
          setActiveLayer(layers[0].id)
        }
      }
    },
    [layers, activeLayer],
  )

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <TopMenuBar />
      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <div className="flex flex-1 overflow-hidden">
        <LayersPanel
          layers={layers}
          activeLayer={activeLayer}
          setActiveLayer={setActiveLayer}
          addLayer={addLayer}
          updateLayer={updateLayer}
          deleteLayer={deleteLayer}
        />
        <Canvas
          activeTool={activeTool}
          elements={elements}
          layers={layers}
          activeLayer={activeLayer}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          addElement={addElement}
          updateElement={updateElement}
          setCursorPosition={setCursorPosition}
          zoom={zoom}
          setZoom={setZoom}
          gridSnap={gridSnap}
          orthoMode={orthoMode}
        />
        <PropertiesPanel selectedElement={selectedElement} updateElement={updateElement} layers={layers} />
      </div>
      <CommandLine commandHistory={commandHistory} executeCommand={executeCommand} />
      <StatusBar
        cursorPosition={cursorPosition}
        zoom={zoom}
        gridSnap={gridSnap}
        orthoMode={orthoMode}
        setGridSnap={setGridSnap}
        setOrthoMode={setOrthoMode}
      />
    </div>
  )
}
