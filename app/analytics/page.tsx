import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Analytics() {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  const teamIds = user.memberships.map(
    (membership: { teamId: string }) => membership.teamId
  );

  const executions = await db.execution.findMany({
    where: {
      workflow: {
        teamId: {
          in: teamIds,
        },
      },
    },
    include: {
      workflow: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100,
  });

  type ExecutionWithWorkflow = (typeof executions)[number];

  const completedExecutions = executions.filter(
    (execution: ExecutionWithWorkflow) =>
      execution.startedAt !== null &&
      execution.finishedAt !== null
  );

  const successfulExecutions = executions.filter(
    (execution: ExecutionWithWorkflow) =>
      execution.status === "SUCCEEDED"
  );

  const successRate =
    executions.length > 0
      ? Math.round(
          (successfulExecutions.length / executions.length) * 100
        )
      : 0;

  const averageDuration =
    completedExecutions.length > 0
      ? Math.round(
          completedExecutions.reduce(
            (
              total: number,
              execution: ExecutionWithWorkflow
            ) => {
              if (!execution.startedAt || !execution.finishedAt) {
                return total;
              }

              return (
                total +
                (execution.finishedAt.getTime() -
                  execution.startedAt.getTime())
              );
            },
            0
          ) / completedExecutions.length
        )
      : 0;

  return (
    <main className="container">
      <div className="row between">
        <div>
          <h1>Analytics</h1>
          <p className="muted">Last 100 executions</p>
        </div>

        <Link className="btn secondary" href="/dashboard">
          Dashboard
        </Link>
      </div>

      <div className="grid">
        <div className="card">
          <span className="muted">Executions</span>
          <div className="stat">{executions.length}</div>
        </div>

        <div className="card">
          <span className="muted">Success rate</span>
          <div className="stat">{successRate}%</div>
        </div>

        <div className="card">
          <span className="muted">Average duration</span>

          <div className="stat">
            {averageDuration < 1000
              ? `${averageDuration} ms`
              : `${(averageDuration / 1000).toFixed(1)} s`}
          </div>
        </div>
      </div>

      <h2>Recent duration statistics</h2>

      {completedExecutions
        .slice(0, 20)
        .map((execution: ExecutionWithWorkflow) => {
          const duration =
            execution.startedAt && execution.finishedAt
              ? execution.finishedAt.getTime() -
                execution.startedAt.getTime()
              : 0;

          return (
            <div
              className="card row between item"
              key={execution.id}
            >
              <span>{execution.workflow.name}</span>
              <span>{execution.status}</span>
              <b>{duration} ms</b>
            </div>
          );
        })}
    </main>
  );
}