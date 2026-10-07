'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Nav from '../Nav';

const lines = (t) => t.split('\n').map((s) => s.trim()).filter(Boolean);

export default function Admin() {
  const [cats, setCats] = useState([]);
  const [sel, setSel] = useState(null); // category id, or 'new'
  const [name, setName] = useState('');
  const [acts, setActs] = useState('');
  const [rcas, setRcas] = useState('');
  const [msg, setMsg] = useState('');

  const load = async () => setCats((await supabase.from('action_categories').select('*').order('sort')).data || []);
  useEffect(() => { load(); }, []);
  const say = (t) => { setMsg(t); setTimeout(() => setMsg(''), 2500); };

  function choose(id) {
    setSel(id || null);
    const x = cats.find((y) => y.id === id);
    setName(x?.name || ''); setActs(x ? x.actions.join('\n') : ''); setRcas(x ? (x.rca_options || []).join('\n') : '');
  }
  async function saveCat() {
    if (!name.trim()) return say('Enter a category name.');
    const row = { name: name.trim(), actions: lines(acts), rca_options: lines(rcas) };
    const { error } = sel && sel !== 'new'
      ? await supabase.from('action_categories').update(row).eq('id', sel)
      : await supabase.from('action_categories').insert({ ...row, sort: cats.length + 1 });
    if (error) return say(error.message);
    say('Category saved.'); await load();
  }
  async function delCat() {
    if (!sel || sel === 'new' || !confirm('Delete this category with its actions and root causes?')) return;
    await supabase.from('action_categories').delete().eq('id', sel);
    setSel(null); setName(''); setActs(''); setRcas(''); say('Category deleted.'); load();
  }

  return (
    <>
      <Nav />
      <main>
        <section>
          <h2>Categories: actions &amp; root causes</h2>
          <label htmlFor="sc">Category</label>
          <select id="sc" value={sel && sel !== 'new' ? sel : ''} onChange={(e) => choose(e.target.value)}>
            <option value="">Choose category to edit</option>
            {cats.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          <div className="row"><button className="btn" onClick={() => choose('new')}>New category</button></div>
          {sel && (<>
            <label htmlFor="cn">Category name</label><input id="cn" value={name} onChange={(e) => setName(e.target.value)} />
            <label htmlFor="ca">Action taken list (one per line, in the order they should appear)</label>
            <textarea id="ca" style={{ minHeight: 240 }} value={acts} onChange={(e) => setActs(e.target.value)} />
            <label htmlFor="cr">Root cause list (one per line; "Other" is always added)</label>
            <textarea id="cr" style={{ minHeight: 200 }} value={rcas} onChange={(e) => setRcas(e.target.value)} />
            <div className="row">
              <button className="btn solid" onClick={saveCat}>Save category</button>
              {sel !== 'new' && <button className="btn danger" onClick={delCat}>Delete category</button>}
            </div>
          </>)}
        </section>
      </main>
      {msg && <div className="toast" role="status">{msg}</div>}
    </>
  );
}
