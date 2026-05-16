import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import syrelaLogo from '@/assets/syrela-trust-logo.png';
import { z } from 'zod';

const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");

const ResetPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendEmail, setResendEmail] = useState('');
  const [resendSubmitting, setResendSubmitting] = useState(false);

  useEffect(() => {
    let resolved = false;

    const markValid = () => {
      if (!resolved) {
        resolved = true;
        setIsValidSession(true);
        setLoading(false);
      }
    };

    const markInvalid = (msg?: string) => {
      if (!resolved) {
        resolved = true;
        if (msg) setErrorMessage(msg);
        setIsValidSession(false);
        setLoading(false);
      }
    };

    // Check URL query params for token_hash (direct link from welcome email)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenHash = urlParams.get('token_hash');
    const tokenType = urlParams.get('type');

    if (tokenHash && tokenType === 'recovery') {
      // Verify the token directly via Supabase OTP verification
      supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'recovery',
      }).then(({ data, error }) => {
        if (error) {
          console.error('Token verification failed:', error.message);
          markInvalid(error.message);
        } else if (data?.session) {
          console.log('Token verified, session established');
          markValid();
        } else {
          markInvalid('Session invalide');
        }
      });
      return;
    }

    // Check URL hash for error from Supabase (expired/invalid token)
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorDesc = hashParams.get('error_description');
    const hashType = hashParams.get('type');

    if (errorDesc) {
      markInvalid(errorDesc.replace(/\+/g, ' '));
      return;
    }

    if (hashType === 'recovery') {
      markValid();
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        markValid();
      } else if (event === 'SIGNED_IN' && session) {
        markValid();
      }
    });

    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        markValid();
      }
      setTimeout(() => {
        if (!resolved) {
          markInvalid();
        }
      }, 2500);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleResendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResendSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resendEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResendSubmitting(false);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Email envoyé", description: "Un nouveau lien a été envoyé. Vérifiez votre boîte de réception." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      passwordSchema.parse(password);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erreur de validation",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été modifié avec succès",
      });
      navigate('/app');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
              <KeyRound className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Lien expiré</CardTitle>
              <CardDescription>
                {errorMessage || "Ce lien de réinitialisation est invalide ou a expiré."}
                {' '}Demandez un nouveau lien ci-dessous.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleResendLink} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="resend-email">Votre email</Label>
                <Input
                  id="resend-email"
                  type="email"
                  placeholder="dpo@entreprise.fr"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={resendSubmitting}>
                {resendSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Renvoyer un lien
                  </>
                )}
              </Button>
            </form>
            <Button variant="ghost" onClick={() => navigate('/auth')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <img src={syrelaLogo} alt="Syrela Trust" className="mx-auto h-16 w-auto" />
          <div>
            <CardTitle className="text-2xl font-bold">Nouveau mot de passe</CardTitle>
            <CardDescription>
              Entrez votre nouveau mot de passe
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
