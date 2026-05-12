import { View } from "react-native";
import {
  InstallerMetricCard,
  InstallerScaffold,
  InstallerTrustCard,
} from "./InstallerShared";

export function InstallerProfileScreen() {
  return (
    <InstallerScaffold
      section="Profile"
      title="Crew Profile"
      subtitle="Credentials first."
      actions={["Lead card", "Crew queue", "Service ticket"]}
      hero={(building) => ({
        label: "Trust score",
        value: building.roleViews.installer.certified ? "4.9" : "Hold",
        sub: building.roleViews.installer.certified ? "Verified lead electrician" : "Certification needed",
        tone: building.roleViews.installer.certified ? "good" : "bad",
      })}
    >
      {(building) => {
        const certified = building.roleViews.installer.certified;

        return (
          <>
            <InstallerTrustCard
              name="Amina Otieno"
              role="Lead electrician"
              status={certified ? "verified" : "hold"}
              tone={certified ? "good" : "bad"}
              stats={[
                { label: "rating", value: certified ? "4.9" : "-" },
                { label: "jobs", value: "38" },
                { label: "closeout", value: "96%" },
              ]}
              checks={[
                { label: "Identity", detail: "Account verified.", complete: true },
                { label: "License", detail: certified ? "Current license." : "Upload license.", complete: certified },
                { label: "Current site", detail: building.project.name, complete: certified },
              ]}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard label="Response" value="18m" detail="Avg field reply." />
              </View>
              <View style={{ flex: 1 }}>
                <InstallerMetricCard label="Proof" value={`${building.roleViews.installer.checklistComplete}/${building.roleViews.installer.checklistTotal}`} detail="Active job." />
              </View>
            </View>
          </>
        );
      }}
    </InstallerScaffold>
  );
}
