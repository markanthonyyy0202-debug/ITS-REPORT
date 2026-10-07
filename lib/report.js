export const STATUSES = ['COMPLETED', 'PENDING', 'REQUIRES FURTHER INVESTIGATION'];

const PT = { check:'Checked', restart:'Restarted', verify:'Verified', confirm:'Confirmed', perform:'Performed', test:'Tested', refresh:'Refreshed', synchronize:'Synchronized', replace:'Replaced', inspect:'Inspected', reset:'Reset', clean:'Cleaned', measure:'Measured', reboot:'Rebooted', reconnect:'Reconnected', repair:'Repaired', update:'Updated', reconfigure:'Reconfigured', power:'Powered', run:'Ran', reseat:'Reseated', reterminate:'Reterminated', install:'Installed', observe:'Observed' };
const past = (w) => {
  if (PT[w.toLowerCase()]) return PT[w.toLowerCase()];
  const c = w.charAt(0).toUpperCase() + w.slice(1);
  if (/[^aeiou]y$/i.test(c)) return c.slice(0, -1) + 'ied';
  return c + (/e$/i.test(c) ? 'd' : 'ed');
};

export function actionLine(a) {
  let t = a.trim().replace(/\s+if required$/i, '');
  t = t.replace(/^([A-Za-z-]+(?:\/[A-Za-z-]+)*)/, (m) =>
    m.split('/').map((w, i) => (i ? past(w).toLowerCase() : past(w))).join('/'));
  // "... and install new unit" / "... or reseat connection" -> past tense too
  t = t.replace(/\b(and|or) ([a-z-]+)\b/gi, (m, c, v) =>
    PT[v.toLowerCase()] || /^re-/i.test(v) ? c + ' ' + past(v).toLowerCase() : m);
  return t.replace(/\.$/, '') + '.';
}

// Suggested status: COMPLETED once a final confirmation/test action is ticked
export function autoStatus(done, rca) {
  if (!done.length) return 'PENDING';
  if (done.some((a) => /confirm.*(online|normal|stable)|test the equipment after|run display test|verify stable|verify connectivity|verify camera focus/i.test(a))) return 'COMPLETED';
  if (/unknown/i.test(rca || '')) return 'REQUIRES FURTHER INVESTIGATION';
  return 'PENDING';
}

export function fmtDate(v) {
  const p = (v || '').split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v;
}

export function buildReport(f) {
  const L = ['ITS MAINTENANCE REPORT', '',
    'Location: ' + f.location, '',
    'Reporting date: ' + fmtDate(f.date), '',
    'Work order: ' + f.wo, '',
    'Reported by: ' + f.by, '',
    'Reported fault: ' + f.fault, '',
    'Initial fault finding: ' + f.finding, '',
    'Action taken:', ...f.acts.map((a) => '* ' + actionLine(a)), '',
    'RCA: ' + f.rca, '',
    'Status: ' + f.status];
  if (f.remarks) L.push('', 'Remarks: ' + f.remarks);
  return L.join('\n');
}
