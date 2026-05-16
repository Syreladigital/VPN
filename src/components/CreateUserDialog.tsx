import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus, Loader2 } from 'lucide-react';
import { z } from 'zod';
import type { AppRole } from '@/hooks/useRole';

const emailSchema = z.string().email("Adresse email invalide");
const passwordSchema = z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères");
const nameSchema = z.string().min(1, "Ce champ est requis").max(100, "Maximum 100 caractères");

interface CreateUserDialogProps {
  onUserCreated: () => void;
  onLog?: (actionType: string, targetUserId: string, details: Record<string, string>) => void;
  isSuperAdmin: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerButton?: boolean;
}

export const CreateUserDialog = ({ 
  onUserCreated, 
  onLog, 
  isSuperAdmin,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  triggerButton = true,
}: CreateUserDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('DPO');
  const [role, setRole] = useState<AppRole>('user');

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setJobTitle('DPO');
    setRole('user');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      nameSchema.parse(firstName);
      nameSchema.parse(lastName);
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

    setIsSubmitting(true);

    try {
      // Create user with Supabase Auth Admin API via edge function
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email,
          password,
          firstName,
          lastName,
          jobTitle,
          role,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Log the activity
      if (onLog && data?.userId) {
        onLog('user_create', data.userId, { 
          email, 
          role,
          created_by_admin: 'true'
        });
      }

      toast({
        title: "Utilisateur créé",
        description: `Le compte pour ${firstName} ${lastName} (${email}) a été créé avec succès.`,
      });

      resetForm();
      setOpen(false);
      onUserCreated();
    } catch (error: any) {
      console.error('Error creating user:', error);
      let message = "Impossible de créer l'utilisateur";
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        message = "Un compte existe déjà avec cet email";
      } else if (error.message) {
        message = error.message;
      }
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableRoles = (): AppRole[] => {
    if (isSuperAdmin) {
      return ['user', 'admin', 'super_admin'];
    }
    return ['user', 'admin'];
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Créer un utilisateur
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          <DialogDescription>
            Créez un compte collaborateur (consultant/DPO). Il recevra ses identifiants pour se connecter et gérer les organismes.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-firstname">Prénom *</Label>
              <Input
                id="create-firstname"
                type="text"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-lastname">Nom *</Label>
              <Input
                id="create-lastname"
                type="text"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-email">Email *</Label>
            <Input
              id="create-email"
              type="email"
              placeholder="utilisateur@entreprise.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="create-role">Rôle</Label>
            <Select value={role} onValueChange={(value: AppRole) => setRole(value)}>
              <SelectTrigger id="create-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((r) => (
                  <SelectItem key={r} value={r}>
                    {r === 'super_admin' && 'Super Admin'}
                    {r === 'admin' && 'Administrateur'}
                    {r === 'user' && 'Utilisateur (Consultant)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
              <Label htmlFor="create-password">Mot de passe temporaire *</Label>
              <Input
                id="create-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères. L'utilisateur pourra le modifier après connexion.
              </p>
            </div>

          <div className="space-y-2">
              <Label htmlFor="create-jobtitle">Fonction</Label>
              <Input
                id="create-jobtitle"
                type="text"
                placeholder="DPO"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                maxLength={100}
              />
            </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer le compte'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
