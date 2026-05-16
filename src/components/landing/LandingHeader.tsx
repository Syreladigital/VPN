import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={syrelaLogo} alt="Syrela Trust" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <h1 className="text-lg font-semibold text-foreground">SyrelaTrust</h1>
            <p className="text-xs text-muted-foreground">Audits RGPD Sectoriels</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Fonctionnalités</a>
          <a href="#sectors" className="text-sm text-muted-foreground hover:text-foreground">Secteurs</a>
          <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground">Tarifs</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/auth">Se connecter</Link>
          </Button>
          <Button asChild>
            <a href="#pricing">Démarrer</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
