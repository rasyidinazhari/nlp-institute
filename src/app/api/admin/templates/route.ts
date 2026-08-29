import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const CreateTemplateSchema = z.object({
  template: z.string().min(1),
  language: z.string().optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const templates = await prisma.mirrorTemplate.findMany();
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = CreateTemplateSchema.parse(body);

    const template = await prisma.mirrorTemplate.create({
      data,
    });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
