export const STATUSES = ['COMPLETED', 'PENDING', 'REQUIRES FURTHER INVESTIGATION'];

const PT = { check:'Checked', restart:'Restarted', verify:'Verified', confirm:'Confirmed', perform:'Performed', test:'Tested', refresh:'Refreshed', synchronize:'Synchronized', replace:'Replaced', inspect:'Inspected', reset:'Reset', clean:'Cleaned', measure:'Measured', reboot:'Rebooted', reconnect:'Reconnected', repair:'Repaired', update:'Updated', reconfigure:'Reconfigured', power:'Powered' };
const past = (w) => PT[w.toLowerCase()] || w.charAt(0).toUpperCase() + w.slice(1) + (/e$/i.test(w) ? 'd' : 'ed');

export function actionLine(a) {
  let t = a.trim().replace(/\s+if required$/i, '');
  t = t.replace(/^([A-Za-z]+(?:\/[A-Za-z]+)*)/, (m) =>
    m.split('/').map((w, i) => (i ? past(w).toLowerCase() : past(w))).join('/'));
  return t.replace(/\.$/, '') + '.';
}

// Suggested status: last checklist action ticked and at least 70% done = COMPLETED
export function autoStatus(allActions, done, rca) {
  if (!allActions.length || !done.length) return 'PENDING';
  const last = allActions[allActions.length - 1];
  if (done.includes(last) && done.length / allActions.length >= 0.7) return 'COMPLETED';
  if (/unknown/i.test(rca || '')) return 'REQUIRES FURTHER INVESTIGATION';
  return 'PENDING';
}

export function fmtDate(v) {
  const p = (v || '').split('-');
  return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : v;
}

export function buildReport(f) {
  const bar = '━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
  const L = [bar, 'ITS MAINTENANCE REPORT', bar, '',
    'Location: ' + f.location, '', 'Reporting Date: ' + fmtDate(f.date), '',
    'Work Order: ' + f.wo, '', 'Reported By: ' + f.by, '',
    'Reported Fault:', f.fault, '', 'Initial Fault Finding:', f.finding, '',
    'Action Taken:', ...f.acts.map((a) => '* ' + actionLine(a)), '',
    'RCA:', f.rca, '', 'Status:', f.status, ''];
  if (f.remarks) L.push('Remarks:', f.remarks, '');
  L.push(bar);
  return L.join('\n');
}
