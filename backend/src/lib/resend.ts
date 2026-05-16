import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@syrelatrust.fr',
    to: email,
    subject: 'Réinitialisation de votre mot de passe — SyrelaTrust',
    html: `
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <p><a href="${resetUrl}">Cliquer ici pour réinitialiser votre mot de passe</a></p>
      <p>Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet e-mail.</p>
      <p>L'équipe SyrelaTrust</p>
    `,
  });
}

export async function sendEmailVerification(email: string, verificationUrl: string): Promise<void> {
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@syrelatrust.fr',
    to: email,
    subject: 'Vérification de votre adresse e-mail — SyrelaTrust',
    html: `
      <p>Bonjour,</p>
      <p>Merci de vérifier votre adresse e-mail en cliquant sur le lien ci-dessous :</p>
      <p><a href="${verificationUrl}">Vérifier mon adresse e-mail</a></p>
      <p>Ce lien expire dans 24 heures.</p>
      <p>L'équipe SyrelaTrust</p>
    `,
  });
}
