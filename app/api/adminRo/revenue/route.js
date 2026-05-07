import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(req) {
  try {
    const supabase = await createServerSupabaseClient();
    const { searchParams } = new URL(req.url);

    const filtered = searchParams.get('filtered') === 'true';
    const start    = searchParams.get('start');
    const end      = searchParams.get('end');

    let query = supabase
      .from('Payment_Ledger')
      .select('amount_kes', { count: 'exact' })
      .eq('status', 'complete');

    if (filtered && start && end) {
      query = query
        .gte('created_at', start)
        .lte('created_at', end);
    }

    const { data, error, count } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const totalRevenue      = (data ?? []).reduce((sum, row) => sum + (row.amount_kes ?? 0), 0);
    const totalTransactions = count ?? 0;

    return NextResponse.json({ totalRevenue, totalTransactions });

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}