'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fmtDate } from '@/lib/report';
import Nav from '../Nav';

export default function History() {
  const [rows, setRows] = useState([]);
  const [msg, setMsg] = useState('');
  useEffect(() => {
    supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(100).then(({ data }) => setRows(data || []));
  }, []);
  async function copy(t) { await navigator.clipboard.writeText(t); setMsg('Report copied successfully.'); setTimeout(() => setMsg(''), 2000); }
  return (
    <>
      <Nav />
      <main>
        <section>
          <h2>Saved reports (latest 100)</h2>
          {!rows.length && <p className="hint">No reports saved yet.</p>}
          {rows.map((r) => (
            <details key={r.id}>
              <summary>{fmtDate(r.report_date)} · {r.work_order} · {r.location} · {r.status}</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{r.report_text}</pre>
              <button className="btn" onClick={() => copy(r.report_text)}>COPY REPORT</button>
            </details>
          ))}
        </section>
      </main>
      {msg && <div className="toast" role="status">{msg}</div>}
    </>
  );
}
