import { Box, KeyRound, Wrench, Shapes } from "lucide-react";

export const DROP_CATEGORIES = {
  ACCOUNTS: {
    label: "Accounts",
    description: "Authorized CompellingCore account releases and access packages.",
    icon: KeyRound
  },
  METHODS: {
    label: "Methods",
    description: "Guides, workflows and repeatable processes for members.",
    icon: Shapes
  },
  TOOLS: {
    label: "Tools",
    description: "Utilities, scripts and resources built for the community.",
    icon: Wrench
  },
  OTHER: {
    label: "Other",
    description: "Everything useful that does not fit into the other lanes.",
    icon: Box
  }
} as const;

export type DropCategoryKey = keyof typeof DROP_CATEGORIES;
