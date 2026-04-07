import { DevAuthPanel } from "../auth/DevAuthPanel";
import { PageHeader } from "../components/PageHeader";

export function HomePage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Welcome"
        subtitle="Use the panel below to sign in for local development, or continue to Cases and Dashboard once authenticated."
      />
      <DevAuthPanel />
    </div>
  );
}
