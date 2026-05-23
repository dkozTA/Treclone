import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
