// Simple client-side demo ERP logic (no backend). Keeps all data in-memory.
(() => {
  // Demo data stores
  const finance = [];
  const hr = [];
  const inventory = [];
  const students = [];

  // Utility: update KPI cards
  function updateKpis() {
    document.getElementById('kpi-budget').innerText = `₹ ${formatNumber(sum(finance.filter(f=>f.type==='Income').map(f=>f.amount)) - sum(finance.filter(f=>f.type==='Expense').map(f=>f.amount)))}`;
    document.getElementById('kpi-staff').innerText = hr.length;
    document.getElementById('kpi-items').innerText = inventory.reduce((s,i)=>s + (i.qty||0),0);
  }

  // Helpers
  function $(id){ return document.getElementById(id); }
  function sum(arr){ return arr.reduce((a,b)=>a+(Number(b)||0),0); }
  function formatNumber(n){ return n.toLocaleString('en-IN'); }
  function nextId(store){ return store.length ? store[store.length-1].id + 1 : 1; }

  /* ---------- Renderers ---------- */
  function renderTable(store, tableId, columns) {
    const tbody = $(tableId).querySelector('tbody') || $(tableId).getElementsByTagName('tbody')[0];
    if(!tbody) return;
    tbody.innerHTML = store.map(row => {
      const cells = columns.map(c => `<td>${escapeHtml(String(row[c] ?? ''))}</td>`).join('');
      return `<tr>${cells}</tr>`;
    }).join('');
  }

  // Escape HTML
  function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":"&#39;"}[c])); }

  /* ---------- Finance ---------- */
  function addFinance(data) {
    finance.push({
      id: nextId(finance),
      title: data.title,
      type: data.type,
      amount: Number(data.amount) || 0,
      date: data.date || new Date().toISOString().slice(0,10),
      notes: data.notes || ''
    });
    renderFinance();
  }
  function renderFinance(filterType = 'All') {
    const rows = filterType === 'All' ? finance.slice().reverse() : finance.filter(f=>f.type===filterType).slice().reverse();
    renderTable(rows, 'fin-table', ['id','title','type','amount','date','notes']);
    updateKpis();
  }

  /* ---------- HR ---------- */
  function addHr(data) {
    hr.push({
      id: nextId(hr),
      name: data.name,
      role: data.role,
      salary: Number(data.salary) || 0,
      join: data.join || new Date().toISOString().slice(0,10)
    });
    renderHr();
  }
  function renderHr(filter='All') {
    const rows = filter === 'All' ? hr.slice().reverse() : hr.filter(h=>h.role===filter).slice().reverse();
    renderTable(rows, 'hr-table', ['id','name','role','salary','join']);
    updateKpis();
  }

  /* ---------- Inventory ---------- */
  function addInv(data) {
    inventory.push({
      id: nextId(inventory),
      item: data.item,
      category: data.category,
      qty: Number(data.qty) || 0,
      location: data.location || ''
    });
    renderInv();
  }
  function renderInv(filter='All') {
    const rows = filter === 'All' ? inventory.slice().reverse() : inventory.filter(i=>i.category===filter).slice().reverse();
    renderTable(rows, 'inv-table', ['id','item','category','qty','location']);
    updateKpis();
  }

  /* ---------- Students ---------- */
  function addStu(data) {
    students.push({
      id: nextId(students),
      name: data.name,
      grade: data.grade,
      roll: data.roll,
      parent: data.parent || ''
    });
    renderStu();
  }
  function renderStu(filter='All') {
    const rows = filter === 'All' ? students.slice().reverse() : students.filter(s=>String(s.grade)===String(filter)).slice().reverse();
    renderTable(rows, 'stu-table', ['id','name','grade','roll']);
    updateKpis();
  }

  /* ---------- Reports & Export ---------- */
  function generateReport() {
    const rows = [
      ['Type','ID','Title/Name','Category/Role','Value/Qty','Date/Roll','Notes']
    ];
    finance.forEach(f => rows.push(['Finance',f.id,f.title,f.type,f.amount,f.date,f.notes]));
    hr.forEach(h => rows.push(['HR',h.id,h.name,h.role,h.salary,h.join,'']));
    inventory.forEach(i => rows.push(['Inventory',i.id,i.item,i.category,i.qty,i.location,'']));
    students.forEach(s => rows.push(['Student',s.id,s.name,s.grade,s.roll,'',s.parent]));
    const txt = rows.map(r => r.join(',')).join('\n');
    $('report-output').innerText = txt;
    return txt;
  }
  function downloadCSVFromText(txt, name='erp_report.csv'){
    const blob = new Blob([txt],{type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url);
  }

  /* ---------- Event wiring ---------- */
  function attach() {
    // Module switch
    document.querySelectorAll('.mod-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        document.querySelectorAll('.mod-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const mod = btn.getAttribute('data-module');
        document.querySelectorAll('.module').forEach(m=> m.removeAttribute('data-visible'));
        const target = document.getElementById(mod);
        if(target) target.setAttribute('data-visible','');
      });
    });

    // Finance controls
    $('save-fin').addEventListener('click', ()=> {
      addFinance({
        title: $('fin-title').value || 'Untitled',
        type: $('fin-type').value,
        amount: Number($('fin-amount').value) || 0,
        date: $('fin-date').value,
        notes: $('fin-notes').value
      });
      // clear inputs
      ['fin-title','fin-amount','fin-notes'].forEach(id=>$(id).value='');
    });
    $('filter-fin-type').addEventListener('change', e => renderFinance(e.target.value));

    // HR controls
    $('save-hr').addEventListener('click', ()=>{
      addHr({
        name: $('hr-name').value || 'Unknown',
        role: $('hr-role').value,
        salary: Number($('hr-salary').value) || 0,
        join: $('hr-join').value
      });
      ['hr-name','hr-salary','hr-notes'].forEach(id=>$(id).value='');
    });
    $('filter-hr-role').addEventListener('change', e=> renderHr(e.target.value));

    // Inventory controls
    $('save-inv').addEventListener('click', ()=>{
      addInv({
        item: $('inv-name').value || 'Item',
        category: $('inv-cat').value || 'General',
        qty: Number($('inv-qty').value) || 0,
        location: $('inv-loc').value
      });
      ['inv-name','inv-qty','inv-notes','inv-loc'].forEach(id=>$(id).value='');
    });
    $('filter-in-cat').addEventListener('change', e=> renderInv(e.target.value));

    // Students
    $('save-stu').addEventListener('click', ()=>{
      addStu({
        name: $('stu-name').value || 'Student',
        grade: $('stu-grade').value || '',
        roll: $('stu-roll').value || ''
      });
      ['stu-name','stu-grade','stu-roll','stu-parent','stu-notes'].forEach(id=>{ if($(id)) $(id).value=''; });
    });
    $('filter-st-grade').addEventListener('change', e=> renderStu(e.target.value));

    // Reports
    $('gen-month-report').addEventListener('click', ()=> {
      const txt = generateReport();
      alert('Report generated in the Reports panel. Use Download to save CSV.');
      updateKpis();
    });
    $('download-sample').addEventListener('click', ()=> {
      const txt = generateReport();
      downloadCSVFromText(txt,'erp_sample_report.csv');
    });

    // Export current visible table
    $('export-csv').addEventListener('click', ()=> {
      // find visible table in main area
      const visible = document.querySelector('.module[data-visible] table');
      if(!visible){ alert('No table to export on the active module.'); return; }
      const rows = [];
      // header
      const headers = Array.from(visible.querySelectorAll('thead th')).map(h=>h.innerText.trim());
      rows.push(headers.join(','));
      // body
      Array.from(visible.querySelectorAll('tbody tr')).forEach(tr=>{
        const cols = Array.from(tr.querySelectorAll('td')).map(td=>td.innerText.replace(/,/g,''));
        rows.push(cols.join(','));
      });
      downloadCSVFromText(rows.join('\n'), 'erp_table_export.csv');
    });

    // Reset demo data
    $('reset-demo').addEventListener('click', ()=> {
      if(!confirm('Reset demo data to defaults?')) return;
      finance.length = 0; hr.length = 0; inventory.length = 0; students.length = 0;
      loadDemoData(); alert('Demo data reset.');
    });
  }

  /* ---------- Demo: load some sample data ---------- */
  function loadDemoData() {
    // Finance
    finance.splice(0, finance.length, 
      {id:1,title:'Tuition collection',type:'Income',amount:125000,date:'2025-09-01',notes:'Sept fees'},
      {id:2,title:'Lab equipment',type:'Expense',amount:45000,date:'2025-09-08',notes:'Microscopes'},
      {id:3,title:'Exam fees',type:'Income',amount:8000,date:'2025-09-20',notes:''}
    );

    // HR
    hr.splice(0, hr.length,
      {id:1,name:'Asha Singh',role:'Teacher',salary:35000,join:'2023-06-01'},
      {id:2,name:'Rohit Kumar',role:'Admin',salary:25000,join:'2022-09-12'},
      {id:3,name:'Meena Patel',role:'Support',salary:18000,join:'2024-01-10'}
    );

    // Inventory
    inventory.splice(0, inventory.length,
      {id:1,item:'Whiteboard markers',category:'Stationery',qty:120,location:'Store A'},
      {id:2,item:'Projector',category:'Electronics',qty:4,location:'AV Room'},
      {id:3,item:'Chemistry kits',category:'Lab',qty:8,location:'Lab Store'}
    );

    // Students
    students.splice(0, students.length,
      {id:1,name:'Aman Verma',grade:8,roll:'08A'},
      {id:2,name:'Priya Sharma',grade:9,roll:'09B'},
      {id:3,name:'Rahul Joshi',grade:7,roll:'07C'}
    );

    // Render all
    renderFinance();
    renderHr();
    renderInv();
    renderStu();
    updateKpis();
    // fill report output
    $('report-output').innerText = 'Demo data loaded. Use Generate Monthly Report to create CSV.';
  }

  /* ---------- Boot ---------- */
  document.addEventListener('DOMContentLoaded', ()=> {
    attach();
    loadDemoData();
    // default: show finance module
    document.querySelectorAll('.mod-btn').forEach(b=>b.classList.remove('active'));
    const defaultBtn = document.querySelector('.mod-btn[data-module="finance"]');
    if(defaultBtn) defaultBtn.classList.add('active');
    // ensure finance visible
    document.querySelectorAll('.module').forEach(m=> m.removeAttribute('data-visible'));
    document.getElementById('finance').setAttribute('data-visible','');
  });

})();
