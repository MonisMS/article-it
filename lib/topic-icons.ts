import {
  Atom,
  Braces,
  BrainCircuit,
  Rocket,
  ShieldCheck,
  TrendingUp,
  Palette,
  Cloud,
  Layers,
  FlaskConical,
  Megaphone,
  GitBranch,
  Terminal,
  Zap,
  Link2,
  BarChart2,
  BookOpen,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "react":        Atom,
  "javascript":   Braces,
  "ai-ml":        BrainCircuit,
  "startups":     Rocket,
  "cybersecurity":ShieldCheck,
  "finance":      TrendingUp,
  "design":       Palette,
  "devops":       Cloud,
  "product":      Layers,
  "science":      FlaskConical,
  "marketing":    Megaphone,
  "open-source":  GitBranch,
  "python":       Terminal,
  "productivity": Zap,
  "blockchain":   Link2,
  "data-science": BarChart2,
}

export function getTopicIcon(slug: string): LucideIcon {
  return TOPIC_ICONS[slug] ?? BookOpen
}
