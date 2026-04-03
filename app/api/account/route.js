import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerSupabaseClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('Listers_Info')
    .select('username, lister_email, lister_contact, lister_org, lister_ward')
    .eq('lister_UUID', session.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    username:         data.username,
    email:            data.lister_email,
    contact:          data.lister_contact,
    organisationName: data.lister_org,
    ward:             data.lister_ward,
  });
}

export async function PATCH(request) {
  const supabase = await createServerSupabaseClient();

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { section, fields } = body;

  /* ── Fetch current values to diff against ── */
  const { data: current, error: fetchError } = await supabase
    .from('Listers_Info')
    .select('username, lister_email, lister_contact, lister_org, lister_ward')
    .eq('lister_UUID', session.user.id)
    .single();

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  const errors = [];

  /* ── Personal section ── */
  if (section === 'personal') {
    const tableUpdate = {};

    if (fields.username?.trim() && fields.username !== current.username)
      tableUpdate.username = fields.username.trim();

    if (fields.email?.trim() && fields.email !== current.lister_email)
      tableUpdate.lister_email = fields.email.trim();

    if (fields.contact?.trim() && fields.contact !== current.lister_contact)
      tableUpdate.lister_contact = fields.contact.trim();

    if (Object.keys(tableUpdate).length > 0) {
      const { error: tableError } = await supabase
        .from('Listers_Info')
        .update(tableUpdate)
        .eq('lister_UUID', session.user.id);

      if (tableError) errors.push(`Table: ${tableError.message}`);
    }

    /* Update auth email if changed */
    if (fields.email?.trim() && fields.email !== current.lister_email) {
      const { error: emailError } = await supabase.auth.updateUser({
        email: fields.email.trim(),
      });
      if (emailError) errors.push(`Auth email: ${emailError.message}`);
    }

    /* Update password only if provided */
    if (fields.password?.trim()) {
      const { error: passwordError } = await supabase.auth.updateUser({
        password: fields.password.trim(),
      });
      if (passwordError) errors.push(`Password: ${passwordError.message}`);
    }
  }

  /* ── Org section ── */
  if (section === 'org') {
    const tableUpdate = {};

    if (fields.organisationName?.trim() && fields.organisationName !== current.lister_org)
      tableUpdate.lister_org = fields.organisationName.trim();

    if (fields.ward?.trim() && fields.ward !== current.lister_ward)
      tableUpdate.lister_ward = fields.ward.trim();

    if (Object.keys(tableUpdate).length > 0) {
      const { error: tableError } = await supabase
        .from('Listers_Info')
        .update(tableUpdate)
        .eq('lister_UUID', session.user.id);

      if (tableError) errors.push(`Table: ${tableError.message}`);
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' | ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}