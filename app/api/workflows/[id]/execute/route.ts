import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { runExecution } from '@/lib/engine';
import { NextResponse } from 'next/server';

export async function POST(
  r: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const workflow = await db.workflow.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { number: 'desc' },
          take: 1,
        },
      },
    });

    if (
      !workflow ||
      !user.memberships.some((m) => m.teamId === workflow.teamId)
    ) {
      return NextResponse.json(
        { error: 'Workflow not found or access denied' },
        { status: 404 }
      );
    }

    const body = await r.json().catch(() => ({}));

    const execution = await db.execution.create({
      data: {
        workflowId: id,
        versionId: workflow.versions[0]?.id,
        trigger: 'MANUAL',
        status: 'QUEUED',
        input: body.input || {},
      },
    });

    try {
      await runExecution(execution.id);
    } catch (error) {
      console.error('Workflow execution failed:', error);
    }

    const updatedExecution = await db.execution.findUnique({
      where: { id: execution.id },
      select: {
        id: true,
        status: true,
        error: true,
      },
    });

    return NextResponse.json(
      updatedExecution ?? {
        id: execution.id,
        status: 'QUEUED',
      }
    );
  } catch (error: any) {
    console.error('Execution route failed:', error);

    return NextResponse.json(
      { error: error?.message || 'Execution failed' },
      { status: 400 }
    );
  }
}