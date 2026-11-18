// Full-screen exam shell: no site header/footer so nothing distracts during a timed test.
export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
