export type ClassValue = string | number | false | null | undefined;

/**
 * cn — minimal, dependency-free class name joiner.
 * Filters out falsy values and joins the rest with a space.
 * Used by the shadcn/acertinity-style UI components (e.g. BackgroundRippleEffect).
 */
export function cn(...inputs: ClassValue[]): string {
  return inputs.filter(Boolean).join(" ");
}
