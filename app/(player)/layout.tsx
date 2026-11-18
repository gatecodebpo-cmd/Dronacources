import { NoContextMenu } from "@/components/layout/NoContextMenu";

// Full-screen exam shell: no site header/footer so nothing distracts during a timed test.
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="main">
      <NoContextMenu />
      {children}
    </main>
  );
}
