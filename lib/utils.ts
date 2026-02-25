import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function copyText(text: string): Promise<boolean> {
  if (!text) return false

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fallback to execCommand path below.
    }
  }

  if (typeof document === "undefined") {
    return false
  }

  const textArea = document.createElement("textarea")
  textArea.value = text
  textArea.setAttribute("readonly", "")
  textArea.style.position = "fixed"
  textArea.style.left = "-9999px"
  textArea.style.top = "0"
  textArea.style.opacity = "0"

  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  textArea.setSelectionRange(0, textArea.value.length)

  let copied = false
  try {
    copied = document.execCommand("copy")
  } catch {
    copied = false
  }

  document.body.removeChild(textArea)
  return copied
}


