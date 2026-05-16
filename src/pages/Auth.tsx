import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { loginFormSchema, emailSchema, getFirstError } from '@/lib/validationSchemas';
import syrelaLogo from '@/assets/syrela-trust-logo.png';

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading, signIn } = useAuth();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  
  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Fonction pour vérifier le rôle et rediriger
  const checkRoleAndRedirect = async (userId: string) => {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    navigate('/app');
  };

  useEffect(() => {
    if (!loading && user) {
      checkRoleAndRedirect(user.id);
    }
  }, [user, loading, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = getFirstError(loginFormSchema, {
      email: loginEmail,
      password: loginPassword,
    });
    
    if (validationError) {
      toast({
        title: "Erreur de validation",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error, data } = await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (error) {
      let message = "Une erreur est survenue lors de la connexion";
      if (error.message.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect";
      } else if (error.message.includes("Email not confirmed")) {
        message = "Veuillez confirmer votre email avant de vous connecter";
      }
      toast({
        title: "Erreur de connexion",
        description: message,
        variant: "destructive",
      });
    } else if (data?.user) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue",
      });
      await checkRoleAndRedirect(data.user.id);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = getFirstError(emailSchema, forgotEmail);
    
    if (validationError) {
      toast({
        title: "Erreur de validation",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte de réception pour réinitialiser votre mot de passe",
      });
      setShowForgotPassword(false);
      setForgotEmail('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Forgot password view
  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto">
              <img src={syrelaLogo} alt="Syrela Trust" className="h-20 w-auto" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Mot de passe oublié</CardTitle>
              <CardDescription>
                Entrez votre email pour recevoir un lien de réinitialisation
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="dpo@entreprise.fr"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Envoyer le lien'
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowForgotPassword(false)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la connexion
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img src={syrelaLogo} alt="Syrela Trust" className="h-20 w-auto" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">SyrelaTrust</CardTitle>
            <CardDescription>
              Plateforme d'audit RGPD pour DPO professionnel
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="dpo@entreprise.fr"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Mot de passe</Label>
              <Input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-sm"
              onClick={() => setShowForgotPassword(true)}
            >
              Mot de passe oublié ?
            </Button>
          </form>
          
          {/* Privacy policy link */}
          <div className="mt-6 pt-4 border-t">
            <Link 
              to="/confidentialite" 
              className="flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Shield className="h-3.5 w-3.5" />
              Politique de confidentialité
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
