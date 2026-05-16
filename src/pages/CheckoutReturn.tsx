import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

const CheckoutReturn = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();
  const [showSpinner, setShowSpinner] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSpinner(false), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-lg">
        <CardContent className="p-8 text-center">
          <img src={syrelaLogo} alt="Syrela Trust" className="mx-auto h-12 w-auto" />
          {showSpinner ? (
            <>
              <Loader2 className="mx-auto mt-6 h-10 w-10 animate-spin text-primary" />
              <h1 className="mt-4 text-xl font-semibold">Confirmation de votre paiement…</h1>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-primary" />
              <h1 className="mt-4 text-2xl font-bold">Merci pour votre souscription !</h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Votre paiement a bien été enregistré. Notre équipe va activer votre compte et vous enverra un lien
                d'accès sécurisé par email sous 24h ouvrées.
              </p>
              {sessionId && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Référence : <span className="font-mono">{sessionId.slice(0, 24)}…</span>
                </p>
              )}
              <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                {user ? (
                  <Button asChild>
                    <Link to="/app">Accéder à mon espace</Link>
                  </Button>
                ) : (
                  <Button asChild>
                    <Link to="/auth">Se connecter</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/">Retour à l'accueil</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutReturn;
