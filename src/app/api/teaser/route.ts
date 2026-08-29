import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { detectPattern } from '@/lib/pattern-detector';
import { generateMirror, getDominantPattern } from '@/lib/mirror-generator';

const TeaserSchema = z.object({
  text: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = TeaserSchema.parse(body);

    const keywords = await prisma.keyword.findMany({
      where: { category: 'toward-away' },
    });

    const result = detectPattern(text, keywords);

    const templates = await prisma.mirrorTemplate.findMany({
      where: { active: true, category: 'toward-away' },
    });

    let mirrorText = '';
    if (templates.length > 0) {
      const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
      const towardCount = result.direction === 'toward' ? 1 : 0;
      const awayCount = result.direction === 'away' ? 1 : 0;
      const dominantPattern = getDominantPattern(towardCount, awayCount);
      
      mirrorText = generateMirror(randomTemplate.template, {
        count: 1,
        towardCount,
        awayCount,
        dominantPattern
      });
    }

    return NextResponse.json({
      direction: result.direction,
      towardMatches: result.towardMatches || [],
      awayMatches: result.awayMatches || [],
      mirrorText,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
