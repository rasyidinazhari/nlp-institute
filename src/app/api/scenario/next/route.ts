import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');
  const lang = searchParams.get('lang') || 'id';

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
  }

  const scenarios = await prisma.scenario.findMany({
    where: { active: true, category: 'toward-away', language: lang },
    orderBy: { order: 'asc' },
  });

  const responses = await prisma.response.findMany({
    where: { sessionId },
    select: { scenarioId: true },
  });
  const answeredScenarioIds = new Set(responses.map((r: any) => r.scenarioId));

  const nextScenario = scenarios.find((s: any) => !answeredScenarioIds.has(s.id)) || null;

  return NextResponse.json({
    scenario: nextScenario
      ? { id: nextScenario.id, text: nextScenario.text, order: nextScenario.order }
      : null,
    progress: {
      answered: answeredScenarioIds.size,
      total: scenarios.length,
    },
  });
}
