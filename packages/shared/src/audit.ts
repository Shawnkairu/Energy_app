import { auditAllDemoProjects } from "./consistency";

declare const process: {
  exit(code: number): never;
};

const audit = auditAllDemoProjects();

if (!audit.ok) {
  for (const result of audit.results) {
    if (!result.ok) {
      console.error(`${result.projectId}: ${result.issues.join("; ")}`);
    }
  }
  process.exit(1);
}

console.log(`Shared consistency audit passed for ${audit.results.length} demo projects.`);
