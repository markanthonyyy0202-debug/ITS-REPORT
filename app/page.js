'use client';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { autoStatus, buildReport, STATUSES } from '@/lib/report';
import Nav from './Nav';

const todayStr = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const blank = () => ({ location: '', date: todayStr(), wo: '', by: '', fault: '', finding: '', acts: [], rca: '', rcaOther: '', remarks: '', statusMode: 'auto' });

export default function Home() {
  const [faults, setFaults] = useState([]);
  const [rcas, setRcas] = useState([]);
  const [f, setF] = useState(blank());
  const [out, setOut] = useState('');
  const [errs, setErrs] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    supabase.from('faults').select('*').order('created_at').then(({ data }) => setFaults(data || []));
    supabase.from('rcas').select('*').order('created_at').then(({ data }) => setRcas(data || []));
  }, []);

  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const fault = faults.find((x) => x.name === f.finding);
  const rcaFinal = f.rca === 'Other' ? f.rcaOther.trim() : f.rca;
  const suggested = useMemo(() => autoStatus(fault?.actions || [], f.acts, rcaFinal), [fault, f.acts, rcaFinal]);
  const status = f.statusMode === 'auto' ? suggested : f.statusMode;

  const pickFault = (name) => setF((p) => ({ ...p, finding: name, acts: [] }));
  const toggle = (a) => setF((p) => ({ ...p, acts: p.acts.includes(a) ? p.acts.filter((x) => x !== a) : [...p.acts, a] }));
  const say = (t) => { setToast(t); setTimeout(() => setToast(''), 2200); };

  async function generate() {
    const m = [];
    if (!f.location.trim()) m.push('Location');
    if (!f.date) m.push('Reporting Date');
    if (!f.wo.trim()) m.push('Work Order');
    if (!f.fault.trim()) m.push('Reported Fault');
    if (!f.by.trim()) m.push('Reported By');
    if (!f.finding) m.push('Initial Fault Finding');
    if (!f.acts.length) m.push('At least one Action Taken');
    if (!f.rca) m.push('RCA'); else if (f.rca === 'Other' && !f.rcaOther.trim()) m.push('RCA (enter the RCA)');
    setErrs(m);
    if (m.length) return;
    // keep checklist order in the report
    const acts = fault.actions.filter((a) => f.acts.includes(a));
    const text = buildReport({ location: f.location.trim(), date: f.date, wo: f.wo.trim(), by: f.by.trim(), fault: f.fault.trim(), finding: f.finding, acts, rca: rcaFinal, status, remarks: f.remarks.trim() });
    setOut(text);
    // save a copy for the team history (best effort)
    await supabase.from('reports').insert({ location: f.location.trim(), report_date: f.date, work_order: f.wo.trim(), reported_by: f.by.trim(), reported_fault: f.fault.trim(), finding: f.finding, actions: acts, rca: rcaFinal, status, remarks: f.remarks.trim() || null, report_text: text });
  }

  async function copy() {
    if (!out) return say('Generate a report first.');
    try { await navigator.clipboard.writeText(out); say('Report copied successfully.'); }
    catch { const el = document.getElementById('out'); el.select(); document.execCommand('copy'); say('Report copied successfully.'); }
  }

  return (
    <>
      <Nav />
      <main>
        <section>
          <h2>1. Report information</h2>
          <div className="grid">
            <div><label htmlFor="loc">Location</label><input id="loc" value={f.location} onChange={(e) => set('location', e.target.value)} /></div>
            <div><label htmlFor="d">Reporting date</label><input id="d" type="date" value={f.date} onChange={(e) => set('date', e.target.value)} /></div>
            <div><label htmlFor="wo">Work order</label><input id="wo" value={f.wo} onChange={(e) => set('wo', e.target.value)} /></div>
            <div><label htmlFor="by">Reported by</label><input id="by" value={f.by} onChange={(e) => set('by', e.target.value)} /></div>
          </div>
          <label htmlFor="rf">Reported fault</label>
          <textarea id="rf" value={f.fault} onChange={(e) => set('fault', e.target.value)} />
        </section>

        <section>
          <h2>2. Initial fault finding</h2>
          <select value={f.finding} onChange={(e) => pickFault(e.target.value)} aria-label="Initial fault finding">
            <option value="">Select fault finding</option>
            {faults.map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}
          </select>
        </section>

        <section>
          <h2>3. Action taken</h2>
          {!fault && <p className="hint">Select a fault finding to see its checklist. Tick only what was actually done.</p>}
          <div className="checks">
            {fault?.actions.map((a) => (
              <label key={a} className={f.acts.includes(a) ? 'on' : ''}>
                <input type="checkbox" checked={f.acts.includes(a)} onChange={() => toggle(a)} />{a}
              </label>
            ))}
          </div>
        </section>

        <section>
          <h2>4. Root cause analysis</h2>
          <select value={f.rca} onChange={(e) => set('rca', e.target.value)} aria-label="RCA">
            <option value="">Select RCA</option>
            {rcas.map((x) => <option key={x.id} value={x.name}>{x.name}</option>)}
            <option value="Other">Other</option>
          </select>
          {f.rca === 'Other' && (<><label htmlFor="ro">Enter RCA</label><input id="ro" value={f.rcaOther} onChange={(e) => set('rcaOther', e.target.value)} /></>)}
        </section>

        <section>
          <h2>5. Status &amp; remarks</h2>
          <label htmlFor="st">Status</label>
          <select id="st" value={f.statusMode} onChange={(e) => set('statusMode', e.target.value)}>
            <option value="auto">Automatic</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <p className="hint">Suggested status: <span className="badge">{suggested}</span></p>
          <label htmlFor="rm">Remarks</label>
          <textarea id="rm" value={f.remarks} onChange={(e) => set('remarks', e.target.value)} />
        </section>

        <section>
          <h2>6. Generated report</h2>
          <button className="big" onClick={generate}>GENERATE REPORT</button>
          {errs.length > 0 && (<div className="errs" role="alert"><strong>Please complete the following required fields:</strong><ul>{errs.map((e) => <li key={e}>{e}</li>)}</ul></div>)}
          <textarea id="out" className="out" readOnly value={out} placeholder="Your report appears here." aria-label="Generated report" />
          <div className="row">
            <button className="btn solid" onClick={copy}>COPY REPORT</button>
            <button className="btn" onClick={generate}>REGENERATE REPORT</button>
            <button className="btn" onClick={() => setOut('')}>CLEAR REPORT</button>
            <button className="btn danger" onClick={() => { setF(blank()); setOut(''); setErrs([]); }}>CLEAR FORM</button>
          </div>
        </section>
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  );
}
