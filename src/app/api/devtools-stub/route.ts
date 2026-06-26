import { NextResponse } from 'next/server';

// Stub endpoint so Chrome DevTools stops generating 404 noise in the terminal
export async function GET() {
  return NextResponse.json({});
}
