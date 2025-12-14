"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu"

const menuItems = [
  {
    label: "File",
    items: [
      { label: "New", shortcut: "Ctrl+N" },
      { label: "Open", shortcut: "Ctrl+O" },
      { label: "Save", shortcut: "Ctrl+S" },
      { label: "Save As", shortcut: "Ctrl+Shift+S" },
      { separator: true },
      { label: "Export", shortcut: "Ctrl+E" },
      { label: "Print", shortcut: "Ctrl+P" },
      { separator: true },
      { label: "Exit" },
    ],
  },
  {
    label: "Edit",
    items: [
      { label: "Undo", shortcut: "Ctrl+Z" },
      { label: "Redo", shortcut: "Ctrl+Y" },
      { separator: true },
      { label: "Cut", shortcut: "Ctrl+X" },
      { label: "Copy", shortcut: "Ctrl+C" },
      { label: "Paste", shortcut: "Ctrl+V" },
      { label: "Delete", shortcut: "Del" },
      { separator: true },
      { label: "Select All", shortcut: "Ctrl+A" },
    ],
  },
  {
    label: "View",
    items: [
      { label: "Zoom In", shortcut: "Scroll Up" },
      { label: "Zoom Out", shortcut: "Scroll Down" },
      { label: "Zoom Extents", shortcut: "Z, E" },
      { label: "Zoom Window", shortcut: "Z, W" },
      { separator: true },
      { label: "Pan", shortcut: "P" },
      { separator: true },
      { label: "Grid", shortcut: "F7" },
      { label: "Snap", shortcut: "F9" },
      { label: "Ortho", shortcut: "F8" },
    ],
  },
  {
    label: "Draw",
    items: [
      { label: "Line", shortcut: "L" },
      { label: "Polyline", shortcut: "PL" },
      { label: "Rectangle", shortcut: "REC" },
      { label: "Circle", shortcut: "C" },
      { label: "Arc", shortcut: "A" },
      { label: "Ellipse", shortcut: "EL" },
      { label: "Polygon", shortcut: "POL" },
      { separator: true },
      { label: "Text", shortcut: "T" },
      { label: "Dimension", shortcut: "DIM" },
    ],
  },
  {
    label: "Modify",
    items: [
      { label: "Move", shortcut: "M" },
      { label: "Copy", shortcut: "CO" },
      { label: "Rotate", shortcut: "RO" },
      { label: "Scale", shortcut: "SC" },
      { label: "Mirror", shortcut: "MI" },
      { separator: true },
      { label: "Trim", shortcut: "TR" },
      { label: "Extend", shortcut: "EX" },
      { label: "Offset", shortcut: "O" },
      { separator: true },
      { label: "Erase", shortcut: "E" },
    ],
  },
  {
    label: "Format",
    items: [
      { label: "Layer" },
      { label: "Color" },
      { label: "Linetype" },
      { label: "Lineweight" },
      { separator: true },
      { label: "Text Style" },
      { label: "Dimension Style" },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Distance", shortcut: "DI" },
      { label: "Area", shortcut: "AA" },
      { label: "List", shortcut: "LI" },
      { separator: true },
      { label: "Options" },
    ],
  },
  {
    label: "Help",
    items: [{ label: "Help", shortcut: "F1" }, { separator: true }, { label: "About WebCAD" }],
  },
]

export function TopMenuBar() {
  return (
    <div className="flex items-center h-8 bg-card border-b border-border px-2">
      <div className="flex items-center gap-1 mr-4">
        <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">W</span>
        </div>
        <span className="text-sm font-semibold text-foreground">WebCAD</span>
      </div>
      <div className="flex items-center gap-0.5">
        {menuItems.map((menu) => (
          <DropdownMenu key={menu.label}>
            <DropdownMenuTrigger className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors focus:outline-none">
              {menu.label}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border">
              {menu.items.map((item, index) =>
                "separator" in item ? (
                  <DropdownMenuSeparator key={index} />
                ) : (
                  <DropdownMenuItem key={item.label} className="text-sm">
                    {item.label}
                    {item.shortcut && <DropdownMenuShortcut>{item.shortcut}</DropdownMenuShortcut>}
                  </DropdownMenuItem>
                ),
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>
    </div>
  )
}
