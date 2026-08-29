import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { detectPattern } from '@/lib/pattern-detector';

const ResponseSchema = z.object({
  sessionId: z.string().min(1),
  scenarioId: z.string().min(1),
  text: z.string().min(1),
  lang: z.string().optional().default('id'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = ResponseSchema.parse(body);

    const scenario = await prisma.scenario.findUnique({
      where: { id: data.scenarioId },
    });

    if (!scenario) {
      return NextResponse.json({ error: 'Scenario not found' }, { status: 404 });
    }

    const keywords = await prisma.keyword.findMany({
      where: { category: scenario.category, language: data.lang },
    });

    const result = detectPattern(data.text, keywords);

    const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    const response = await prisma.response.create({
      data: {
        sessionId: data.sessionId,
        scenarioId: data.scenarioId,
        text: data.text,
        detectedDirection: result.direction,
        matchedKeywords: [...result.towardMatches, ...result.awayMatches],
        expiresAt,
      },
    });

    return NextResponse.json({ success: true, responseId: response.id });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
