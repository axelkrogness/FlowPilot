import { requireWorkflowRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { w } = await requireWorkflowRole(id, [
      "OWNER",
      "ADMIN",
      "MEMBER",
    ]);

    const draftGraph =
      w.draftGraph === null
        ? Prisma.JsonNull
        : (w.draftGraph as Prisma.InputJsonValue);

    const duplicatedWorkflow = await db.workflow.create({
      data: {
        teamId: w.teamId,
        name: `${w.name} Copy`,
        description: w.description,
        draftGraph,
      },
    });

    return NextResponse.json(duplicatedWorkflow, {
      status: 201,
    });
  } catch {
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }
}