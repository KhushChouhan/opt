import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET() {
  try {
    console.log('Test DB route triggered');
    console.log('supabaseUrl:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('supabaseServiceKey length:', process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0);
    
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
