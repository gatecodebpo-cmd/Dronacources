import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { sectionRoles } from "@/lib/admin/access";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role as string | undefined;
    const path = req.nextUrl.pathname;
    if (path.startsWith("/admin")) {
      if (!role || role === "STUDENT") return NextResponse.redirect(new URL("/admin/login", req.url));
      const section = path.split("/")[2] ?? "";
      const allowed = sectionRoles(section);
      if (!allowed.includes(role)) return NextResponse.redirect(new URL("/admin?denied=1", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith("/admin")) return true; // handled above so we can send staff to /admin/login
        return !!token;
      },
    },
  },
);

export const config = { matcher: ["/dashboard/:path*", "/admin/((?!login).*)", "/admin"] };
