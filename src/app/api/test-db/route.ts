import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('admins')
      .select('*');
      
    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, count: data?.length || 0, admins: data?.map(a => ({ email: a.email })) });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
