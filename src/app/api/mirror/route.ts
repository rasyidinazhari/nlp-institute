import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateMirror, getDominantPattern } from '@/lib/mirror-generator';

import { Language } from '@/lib/i18n';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const lang = (searchParams.get('lang') as Language) || 'id';

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const responses = await prisma.response.findMany({
    where: { sessionId },
  });

  const count = responses.length;

  if (count < 4) {
    return NextResponse.json({ ready: false, current: count, needed: 4 });
  }

  let towardCount = 0;
  let awayCount = 0;

  for (const r of responses) {
    if (r.detectedDirection === 'toward') towardCount++;
    if (r.detectedDirection === 'away') awayCount++;
  }

  const dominantPattern = getDominantPattern(towardCount, awayCount, lang);

  const templates = await prisma.mirrorTemplate.findMany({
    where: { active: true, category: 'toward-away', language: lang },
  });

  if (templates.length === 0) {
     return NextResponse.json({ error: 'No active templates found' }, { status: 500 });
  }

  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];

  const mirrorData = {
    count,
    towardCount,
    awayCount,
    dominantPattern
  };

  const mirror = generateMirror(randomTemplate.template, mirrorData);

  return NextResponse.json({
    ready: true,
    mirror,
    stats: {
      count,
      towardCount,
      awayCount,
      dominantPattern
    }
  });
}
