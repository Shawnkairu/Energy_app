import { auditAllDemoProjects } from "./consistency";
import { auditStakeholderSectionParity } from "./stakeholderSections";

declare const process: {
  exit(code: number): never;
};

const audit = auditAllDemoProjects();
const sectionAudit = auditStakeholderSectionParity();

if (!audit.ok) {
  for (const result of audit.results) {
    if (!result.ok) {
      console.error(`${result.projectId}: ${result.issues.join("; ")}`);
    }
  }
  process.exit(1);
}

if (!sectionAudit.ok) {
  for (const issue of sectionAudit.issues) {
    console.error(issue);
  }
  process.exit(1);
}

console.log(`Shared consistency audit passed for ${audit.results.length} demo projects.`);
console.log("Stakeholder section parity audit passed.");
