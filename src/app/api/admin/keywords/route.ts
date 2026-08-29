import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const CreateKeywordSchema = z.object({
  phrase: z.string().min(1),
  language: z.string().optional(),
  direction: z.string().min(1),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const keywords = await prisma.keyword.findMany({
    orderBy: [
      { category: 'asc' },
      { direction: 'asc' }
    ],
  });
  return NextResponse.json(keywords);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = CreateKeywordSchema.parse(body);

    const keyword = await prisma.keyword.create({
      data,
    });
    return NextResponse.json(keyword);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
