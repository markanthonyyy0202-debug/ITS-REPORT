'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Nav from '../Nav';

export default function Admin() {
  const [faults, setFaults] = useState([]);
  const [rcas, setRcas] = useState([]);
  const [sel, setSel] = useState(null); // fault id, or 'new'
  const [name, setName] = useState('');
  const [asset, setAsset] = useState('');
  const [acts, setActs] = useState('');
  const [newRca, setNewRca] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => {
    setFaults((await supabase.from('faults').select('*').order('created_at')).data || []);
    setRcas((await supabase.from('rcas').select('*').order('created_at')).data || []);
  };
  useEffect(() => { load(); }, []);
  const say = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };

  function choose(id) {
    setSel(id || null);
    const x = faults.find((y) => y.id === id);
    setName(x?.name || ''); setAsset(x?.asset || ''); setActs(x ? x.actions.join('\n') : '');
  }
  async function saveFault() {
    const actions = acts.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!name.trim() || !actions.length) return say('Enter a fault name and at least one action.');
    const row = { name: name.trim(), asset: asset.trim() || null, actions };
    const { error } = sel && sel !== 'new' ? await supabase.from('faults').update(row).eq('id', sel) : await supabase.from('faults').insert(row);
    if (error) return say(error.message);
    say('Fault saved.'); await load();
  }
  async function delFault() {
    if (!sel || sel === 'new' || !confirm('Delete this fault finding?')) return;
    await supabase.from('faults').delete().eq('id', sel);
    setSel(null); setName(''); setAsset(''); setActs(''); say('Fault deleted.'); load();
  }
  async function addRca() {
    const n = newRca.trim();
    if (!n || n.toLowerCase() === 'other') return;
    const { error } = await supabase.from('rcas').insert({ name: n });
    if (error) return say(error.message);
    setNewRca(''); load();
  }
  async function delRca(id) { await supabase.from('rcas').delete().eq('id', id); load(); }

  return (
    <>
      <Nav />
      <main>
        <section>
          <h2>Fault findings &amp; action checklists</h2>
          <label htmlFor="sf">Fault finding</label>
          <select id="sf" value={sel && sel !== 'new' ? sel : ''} onChange={(e) => choose(e.target.value)}>
            <option value="">Choose fault to edit</option>
            {faults.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <div className="row"><button className="btn" onClick={() => choose('new')}>New fault</button></div>
          {sel && (<>
            <label htmlFor="fn">Fault name</label><input id="fn" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="fa">Asset type (optional, e.g. CCTV, DMS, LCS)</label><input id="fa" value={asset} onChange={(e) => setAsset(e.target.value)} />
            <label htmlFor="fac">Actions (one per line, in the order they should appear)</label>
            <textarea id="fac" style={{ minHeight: 180 }} value={acts} onChange={(e) => setActs(e.target.value)} />
            <div className="row">
              <button className="btn solid" onClick={saveFault}>Save fault</button>
              {sel !== 'new' && <button className="btn danger" onClick={delFault}>Delete fault</button>}
            </div>
          </>)}
        </section>
        <section>
          <h2>RCA choices</h2>
          <p className="hint">"Other" is always available in the report form.</p>
          {rcas.map((r) => (<div className="item" key={r.id}><span>{r.name}</span><button className="btn danger" onClick={() => delRca(r.id)}>Remove</button></div>))}
          <label htmlFor="nr">Add RCA</label>
          <input id="nr" value={newRca} onChange={(e) => setNewRca(e.target.value)} />
          <div className="row"><button className="btn solid" onClick={addRca}>Add RCA</button></div>
        </section>
      </main>
      {msg && <div className="toast" role="status">{msg}</div>}
    </>
  );
}
