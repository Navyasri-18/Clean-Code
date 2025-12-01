export function detectLanguage(code) {
  const trimmed = code.trim();

  // ---- Java ----
  if (
    /class\s+[A-Z]/.test(trimmed) ||
    /public\s+static\s+void\s+main/.test(trimmed)
  ) {
    return "java";
  }

  // ---- Python ----
  if (
    /^def\s+\w+/.test(trimmed) ||
    /print\(.+\)/.test(trimmed) ||
    trimmed.includes("import ") && trimmed.includes("as")
  ) {
    return "python";
  }

  // ---- C ----
  if (
    /#include\s+<stdio.h>/.test(trimmed) ||
    /int\s+main\s*\(/.test(trimmed) && trimmed.includes(";")
  ) {
    return "c";
  }

  // ---- C++ ----
  if (
    /#include\s+<iostream>/.test(trimmed) ||
    /std::cout/.test(trimmed)
  ) {
    return "cpp";
  }

  // ---- Go ----
  if (
    trimmed.startsWith("package ") ||
    trimmed.includes("func main()")
  ) {
    return "go";
  }

  // ---- TypeScript ----
  if (
    /interface\s+\w+/.test(trimmed) ||
    /:\s*\w+/.test(trimmed) && trimmed.includes("=>")
  ) {
    return "typescript";
  }

  // ---- JavaScript (default fallback) ----
  if (
    /function\s+\w+/.test(trimmed) ||
    trimmed.includes("console.log") ||
    trimmed.includes("=>")
  ) {
    return "javascript";
  }

  // Default fallback
  return "javascript";
}
