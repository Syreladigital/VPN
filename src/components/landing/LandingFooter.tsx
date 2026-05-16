import { Link } from 'react-router-dom';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

export function LandingFooter() {
  return (
    <footer className="border-t bg-background py-10">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <img src={syrelaLogo} alt="Syrela Trust" className="h-9 w-auto" />
            <span className="font-semibold">SyrelaTrust</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Plateforme RGPD pour DPO et consultants. Validation humaine garantie.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Produit</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#features" className="hover:text-foreground">Fonctionnalités</a></li>
            <li><a href="#sectors" className="hover:text-foreground">Secteurs</a></li>
            <li><a href="#pricing" className="hover:text-foreground">Tarifs</a></li>
            <li><Link to="/auth" className="hover:text-foreground">Se connecter</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Légal</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/confidentialite" className="hover:text-foreground">Politique de confidentialité</Link></li>
            <li><a href="mailto:contact@syrelatrust.com" className="hover:text-foreground">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto mt-8 border-t px-4 pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} SyrelaTrust — Conforme aux recommandations CNIL
      </div>
    </footer>
  );
}
