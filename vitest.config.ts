import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    // Run tests in a Node.js environment (not a browser).
    // Our tests cover API routes and pure functions — no DOM needed.
    environment: "node",

    // Makes describe/test/expect available globally without importing them.
    // Same API as Jest, which most tutorials use, so examples online transfer directly.
    globals: true,
  },
  resolve: {
    // Teach Vitest that "@/" means the project root — mirrors tsconfig paths.
    // Without this, `import { slugify } from "@/lib/utils"` would fail in tests.
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
