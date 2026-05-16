import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.89.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate a secure random password (used internally, never shared)
const generateInternalPassword = (): string => {
  const length = 24;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=';
  let password = '';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: caller }, error: callerError } = await supabaseAuth.auth.getUser();
    if (callerError || !caller) {
      console.error('Caller verification failed:', callerError);
      return new Response(
        JSON.stringify({ error: 'Non autorisé - Utilisateur non authentifié' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Caller verified:', caller.id, caller.email);

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Check if caller is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single();

    console.log('Role check result:', { roleData, roleError });

    const callerRole = roleData?.role;
    const isAdmin = callerRole === 'super_admin' || callerRole === 'admin';

    // Parse request body
    const body = await req.json();
    const { email, first_name, last_name, firstName, lastName, jobTitle, role, name } = body;
    
    const userFirstName = first_name || firstName || name || '';
    const userLastName = last_name || lastName || '';

    // Validate role
    const validRoles = ['user', 'admin', 'super_admin', 'client'];
    const requestedRole = validRoles.includes(role) ? role : 'user';

    // Non-admins can ONLY create client accounts
    if (!isAdmin && requestedRole !== 'client') {
      return new Response(
        JSON.stringify({ error: 'Seuls les admins peuvent créer des utilisateurs non-clients' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Admins cannot create super_admin users
    if (requestedRole === 'super_admin' && callerRole !== 'super_admin') {
      return new Response(
        JSON.stringify({ error: 'Seuls les super admins peuvent créer des super admins' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate required fields
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email est obligatoire' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Format d\'email invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the user with a strong internal password (never shared)
    const internalPassword = generateInternalPassword();
    
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: internalPassword,
      email_confirm: true,
      user_metadata: {
        first_name: userFirstName,
        last_name: userLastName,
      },
    });
    
    if (createError) {
      console.error('Error creating user:', createError);
      
      // Check if user already exists - return existing user for client role
      if (createError.message.includes('already been registered') && requestedRole === 'client') {
        console.log('User already exists, looking up existing user for client access...');
        
        const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (!listError && existingUsers?.users) {
          const existingUser = existingUsers.users.find(u => u.email === email);
          if (existingUser) {
            console.log('Found existing user:', existingUser.id);
            return new Response(
              JSON.stringify({ 
                success: true, 
                user: { id: existingUser.id },
                userId: existingUser.id,
                email: existingUser.email,
                existingUser: true
              }),
              { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }
      }
      
      return new Response(
        JSON.stringify({ error: createError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!newUser.user) {
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la création de l\'utilisateur' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a recovery link for the user to set their own password
    // Use hashed_token to build a direct app link, bypassing Supabase's redirect URL restrictions
    const baseUrl = req.headers.get('origin') || Deno.env.get('PUBLIC_APP_URL') || 'https://id-preview--699947a5-b674-494e-a989-03ddcc9b8c72.lovable.app';
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    let resetLink = '';
    if (!linkError && linkData?.properties?.hashed_token) {
      // Build direct link to the app's reset-password page with token_hash
      resetLink = `${baseUrl}/reset-password?token_hash=${linkData.properties.hashed_token}&type=recovery`;
      console.log('Direct recovery link generated for:', email);
    } else {
      console.error('Error generating recovery link:', linkError);
    }

    // Update the profile with job_title if provided
    if (jobTitle) {
      await supabaseAdmin
        .from('profiles')
        .update({ job_title: jobTitle })
        .eq('user_id', newUser.user.id);
    }

    // Update the role if not default 'user'
    if (requestedRole !== 'user') {
      await supabaseAdmin
        .from('user_roles')
        .update({ role: requestedRole })
        .eq('user_id', newUser.user.id);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { id: newUser.user.id },
        userId: newUser.user.id,
        email: newUser.user.email,
        resetLink,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
