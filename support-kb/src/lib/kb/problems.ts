// The problems inside #4471: the desk's own cause view, plus the one-day moves the desk noted.
import notes from '#lib/data/desk-notes.json';
import { groupByCause, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause' | 'mergedInto'> & { problem: Problem; within: CauseGroup['cause'][] };

// One-day moves stay counted under their cause, as the desk counts them, and get a row of their own.
export function groupByProblem(reports: Report[], tenantOf: (r: Report) => Tenant | undefined, oneDayMove: readonly string[] = notes.oneDayMove): ProblemGroup[] {
  const byCause = groupByCause(reports, tenantOf);
  const rows: ProblemGroup[] = byCause.map(({ cause, mergedInto: _, ...g }) => ({ ...g, problem: cause, within: [] }));
  const moved = reports.filter((r) => oneDayMove.includes(r.id));
  if (!moved.length) return rows;
  // Summarise the moved reports as one group, whatever their cause.
  const [{ cause: _c, mergedInto: _m, ...g }] = groupByCause(moved, () => undefined);
  const within = byCause.filter((c) => c.reports.some((r) => oneDayMove.includes(r.id))).map((c) => c.cause);
  return [...rows, { ...g, problem: 'one-day', within }];
}
