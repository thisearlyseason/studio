import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // In production: write to Firestore sports_hub_newsletter_subscribers collection
    // const db = getFirestore();
    // await db.collection('sports_hub_newsletter_subscribers').add({
    //   email,
    //   name: name || '',
    //   subscribedAt: new Date().toISOString(),
    //   isActive: true,
    //   sports: [],
    // });

    console.log('[Sports Hub] Newsletter signup:', email);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Sports Hub] Newsletter signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
