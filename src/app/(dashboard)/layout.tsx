
import Shell from '@/components/layout/Shell';
import { TeamProvider } from '@/components/providers/team-provider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TeamProvider>
      <Shell>{children}</Shell>
    </TeamProvider>
  );
}
