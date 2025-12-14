"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal } from "lucide-react"

interface CommandLineProps {
  commandHistory: string[]
  executeCommand: (command: string) => void
}

export function CommandLine({ commandHistory, executeCommand }: CommandLineProps) {
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [commandHistory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      executeCommand(input.trim())
      setInput("")
    }
  }

  return (
    <div className="h-32 bg-card border-t border-border flex flex-col">
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
        <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Command Line</span>
      </div>
      <ScrollArea className="flex-1 p-2" ref={scrollRef}>
        <div className="space-y-0.5 font-mono text-xs">
          {commandHistory.map((line, index) => (
            <div key={index} className={`${line.startsWith(">") ? "text-primary" : "text-muted-foreground"}`}>
              {line}
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-2 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono">Command:</span>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or type HELP for list..."
            className="h-7 text-xs font-mono bg-secondary border-0 focus-visible:ring-1"
          />
        </div>
      </form>
    </div>
  )
}
