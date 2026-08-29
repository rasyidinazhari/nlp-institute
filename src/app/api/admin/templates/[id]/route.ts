import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const UpdateTemplateSchema = z.object({
  template: z.string().min(1).optional(),
  category: z.string().optional(),
  active: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = UpdateTemplateSchema.parse(body);

    const template = await prisma.mirrorTemplate.update({
      where: { id: (await params).id },
      data,
    });
    return NextResponse.json(template);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.mirrorTemplate.delete({
    where: { id: (await params).id },
  });
  return NextResponse.json({ success: true });
}
