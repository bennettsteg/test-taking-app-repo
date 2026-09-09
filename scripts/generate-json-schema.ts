import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { testImportSchema } from "../src/lib/test-import-schema";

const outputPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "schema",
  "test-import.schema.json",
);

const jsonSchema = z.toJSONSchema(testImportSchema, {
  target: "draft-7",
  reused: "inline",
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(jsonSchema, null, 2) + "\n");

console.log(`Wrote JSON schema to ${outputPath}`);
