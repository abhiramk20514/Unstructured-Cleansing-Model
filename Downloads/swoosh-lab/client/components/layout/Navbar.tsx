import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LogoMark from "@/components/graphics/LogoMark";
import Wordmark from "@/components/graphics/Wordmark";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const onNew = () => navigate("/landing", { replace: false });

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/80">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/landing" className="flex items-center gap-2">
          <LogoMark className="h-8 w-8" />
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-2 sm:flex">
          <NavLink to="/landing" current={location.pathname.startsWith("/landing")}>Dashboard</NavLink>
          <NavLink to="/analysis" current={location.pathname.startsWith("/analysis")}>Analysis</NavLink>
        </nav>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-muted-foreground sm:inline">Optiv Security</span>
          <Button variant="outline" onClick={onNew}>New Analysis</Button>
          <Button variant="ghost" onClick={() => navigate("/")}>Logout</Button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, children, current }: { to: string; children: React.ReactNode; current?: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground",
        current && "bg-muted text-foreground"
      )}
    >
      {children}
    </Link>
  );
}
