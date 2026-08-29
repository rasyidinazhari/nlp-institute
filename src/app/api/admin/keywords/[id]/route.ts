import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdmin } from '@/lib/auth';
import { z } from 'zod';

const UpdateKeywordSchema = z.object({
  phrase: z.string().min(1).optional(),
  direction: z.string().min(1).optional(),
  category: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();
    const data = UpdateKeywordSchema.parse(body);

    const keyword = await prisma.keyword.update({
      where: { id: (await params).id },
      data,
    });
    return NextResponse.json(keyword);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await prisma.keyword.delete({
    where: { id: (await params).id },
  });
  return NextResponse.json({ success: true });
}
