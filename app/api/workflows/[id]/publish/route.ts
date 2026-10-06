import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const workflow = await db.workflow.findUnique({
      where: { id },
    });

    if (
      !workflow ||
      !user.memberships.some(
        (membership: { teamId: string }) =>
          membership.teamId === workflow.teamId
      )
    ) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const nextVersion = workflow.version + 1;

    const graph =
      workflow.draftGraph === null
        ? Prisma.JsonNull
        : (workflow.draftGraph as Prisma.InputJsonValue);

    await db.$transaction([
      db.workflowVersion.create({
        data: {
          workflowId: id,
          number: nextVersion,
          graph,
        },
      }),

      db.workflow.update({
        where: { id },
        data: {
          version: nextVersion,
          state: "PUBLISHED",
        },
      }),
    ]);

    return NextResponse.json({
      version: nextVersion,
    });
  } catch (error) {
    console.error("Failed to publish workflow:", error);

    return NextResponse.json(
      { error: "Failed to publish workflow" },
      { status: 500 }
    );
  }
}