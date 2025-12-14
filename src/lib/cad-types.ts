export type Tool =
  | "select"
  | "line"
  | "polyline"
  | "rectangle"
  | "circle"
  | "arc"
  | "ellipse"
  | "polygon"
  | "text"
  | "dimension"
  | "move"
  | "rotate"
  | "scale"
  | "mirror"
  | "trim"
  | "extend"
  | "offset"
  | "pan"
  | "zoom"

export interface Point {
  x: number
  y: number
}

export interface DrawingElement {
  id: string
  type: "line" | "rectangle" | "circle" | "arc" | "ellipse" | "polygon" | "polyline" | "text"
  layerId: string
  color?: string
  lineWeight?: number
  lineType?: "solid" | "dashed" | "dotted" | "center"
  points?: Point[]
  center?: Point
  radius?: number
  radiusX?: number
  radiusY?: number
  startAngle?: number
  endAngle?: number
  sides?: number
  text?: string
  fontSize?: number
  rotation?: number
}

export interface Layer {
  id: string
  name: string
  color: string
  visible: boolean
  locked: boolean
}
