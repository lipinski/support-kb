<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { groupByProblem, type Problem } from '#lib/kb/problems';

  let { ticket, issues }: { ticket: number; issues: Partial<Record<Problem, string>> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(merged, tenantOf));
  const tags = (t: Record<string, number>) =>
    Object.entries(t)
      .sort((a, b) => b[1] - a[1])
      .map(([tag, n]) => `${tag} ×${n}`)
      .join(' · ');
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports merged into #{ticket} ·
  <strong>{groups.length}</strong>
  {groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead>
    <tr><th>problem</th><th>reports</th><th>intake tagged as</th><th>tenants</th><th>seen</th><th>ticket</th></tr>
  </thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code></td>
        <td>{g.reports.length}{#if g.within.length}<span class="within"> (also in {g.within.join(', ')})</span>{/if}</td>
        <td class="tags">{tags(g.taggedAs)}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, 'issue #')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .tags { color: var(--muted); font-size: 0.85em; }
  .within { color: var(--muted); font-size: 0.85em; }
</style>
