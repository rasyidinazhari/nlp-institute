import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const CreateScenarioSchema = z.object({
  text: z.string().min(1),
  language: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().optional(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scenarios = await prisma.scenario.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { responses: true }
      }
    }
  });
  return NextResponse.json(scenarios);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = CreateScenarioSchema.parse(body);

    const scenario = await prisma.scenario.create({
      data,
    });
    return NextResponse.json(scenario);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
