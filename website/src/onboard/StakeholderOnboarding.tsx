import type { PublicRole } from "@emappa/shared";
import { BuildingOwnerWebOnboarding } from "./building-owner/BuildingOwnerWebOnboarding";
import { ContributorWebOnboarding } from "./contributor/ContributorWebOnboarding";
import { HomeownerOnboarding } from "./homeowner/HomeownerOnboarding";
import { ResidentWebOnboarding } from "./resident/ResidentWebOnboarding";

export function StakeholderOnboarding({
  role,
  onFinished,
}: {
  role: PublicRole;
  onFinished: () => void | Promise<void>;
}) {
  if (role === "homeowner") {
    return <HomeownerOnboarding onFinished={onFinished} />;
  }
  if (role === "resident") {
    return <ResidentWebOnboarding onFinished={onFinished} />;
  }
  if (role === "building_owner") {
    return <BuildingOwnerWebOnboarding onFinished={onFinished} />;
  }
  if (role === "provider" || role === "electrician" || role === "financier") {
    return <ContributorWebOnboarding role={role} onFinished={onFinished} />;
  }
  return null;
}
