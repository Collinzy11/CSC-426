/* =========================================================
   IRO — Admin dashboard logic
   ========================================================= */
(function(){
  const tbody = document.getElementById('reportsTableBody');
  if(!tbody) return;

  const SAMPLE_DATA = [
    { id:'IRO-001', fullName:'John', issueType:'Theft', status:'Pending', anonymous:false, category:'Student', facultyCommunity:'Faculty of Computing', location:'Hostel Block A', assignedUnit:'Security', dateSubmitted:'2026-06-28T09:00:00Z', description:'Laptop was taken from the reading room while unattended for a few minutes.' },
    { id:'IRO-002', fullName:'Anonymous', issueType:'Power Outage', status:'Resolved', anonymous:true, category:'Indigene', facultyCommunity:'Akungba Ward 1', location:'Market Road', assignedUnit:'Works Department', dateSubmitted:'2026-06-20T09:00:00Z', description:'No electricity supply for three days in the ward, affecting shops along Market Road.' },
    { id:'IRO-003', fullName:'Grace Adebayo', issueType:'Water Supply', status:'In Progress', anonymous:false, category:'Student', facultyCommunity:'Faculty of Science', location:'Female Hostel', assignedUnit:'Works Department', dateSubmitted:'2026-07-01T09:00:00Z', description:'Taps in the female hostel block have had no running water since Monday.' },
    { id:'IRO-004', fullName:'Anonymous', issueType:'Harassment', status:'Pending', anonymous:true, category:'Student', facultyCommunity:'Faculty of Arts', location:'Lecture Theatre 2', assignedUnit:'Student Affairs', dateSubmitted:'2026-07-04T09:00:00Z', description:'Repeated inappropriate comments from a coursemate during group work sessions.' }
  ];

  // Working in-memory dataset: seed samples + anything actually submitted via report.html
  let reports = [];

  function loadData(){
    const stored = IRO.getReports();
    reports = [...SAMPLE_DATA, ...stored];
    render();
  }

  function render(){
    tbody.innerHTML = reports.map(r => `
      <tr data-id="${r.id}">
        <td class="id-mono">${r.id}</td>
        <td>${r.anonymous ? 'Anonymous' : r.fullName}</td>
        <td>${r.issueType}</td>
        <td><span class="badge ${badgeClass(r.status)}">${r.status}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-outline btn-sm" data-action="view" data-id="${r.id}"><i class="fa-solid fa-eye"></i> View</button>
            <button class="btn btn-outline btn-sm" data-action="status" data-id="${r.id}"><i class="fa-solid fa-arrows-rotate"></i> Change Status</button>
            <button class="btn btn-danger btn-sm" data-action="delete" data-id="${r.id}"><i class="fa-solid fa-trash"></i> Delete</button>
          </div>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="5" style="text-align:center; color:var(--slate);">No reports left. Use "Reset demo data" to bring them back.</td></tr>`;

    updateCards();
  }

  function badgeClass(status){
    if(status === 'Resolved') return 'badge-resolved';
    if(status === 'In Progress') return 'badge-progress';
    return 'badge-pending';
  }

  function updateCards(){
    document.getElementById('cardTotal').textContent = reports.length;
    document.getElementById('cardPending').textContent = reports.filter(r => r.status === 'Pending').length;
    document.getElementById('cardProgress').textContent = reports.filter(r => r.status === 'In Progress').length;
    document.getElementById('cardResolved').textContent = reports.filter(r => r.status === 'Resolved').length;
  }

  function findReport(id){ return reports.find(r => r.id === id); }

  // ---- Table action delegation ----
  let activeId = null;

  tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if(!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const report = findReport(id);
    if(!report) return;
    activeId = id;

    if(action === 'view'){
      document.getElementById('viewModalBody').innerHTML = `
        <div class="ticket" style="transform:none; max-width:100%; margin:14px 0 0;">
          <span class="ticket-eyebrow">Report ID</span>
          <div class="ticket-id">${report.id}</div>
          <div class="perf"></div>
          <div class="ticket-row"><span>Reporter</span><span>${report.anonymous ? 'Anonymous' : report.fullName}</span></div>
          <div class="ticket-row"><span>Category</span><span>${report.category || '—'}</span></div>
          <div class="ticket-row"><span>Faculty / Community</span><span>${report.facultyCommunity || '—'}</span></div>
          <div class="ticket-row"><span>Issue Type</span><span>${report.issueType}</span></div>
          <div class="ticket-row"><span>Location</span><span>${report.location || '—'}</span></div>
          <div class="ticket-row"><span>Assigned Unit</span><span>${report.assignedUnit || '—'}</span></div>
          <div class="ticket-row"><span>Status</span><span class="badge ${badgeClass(report.status)}">${report.status}</span></div>
          <div class="ticket-row"><span>Submitted</span><span>${IRO.formatDate(report.dateSubmitted)}</span></div>
        </div>
        ${report.description ? `<p style="margin-top:16px;">${report.description}</p>` : ''}
      `;
      IRO.openModal('viewModal');
    }

    if(action === 'status'){
      document.getElementById('statusModalId').textContent = `${report.id} — currently ${report.status}`;
      document.getElementById('statusSelect').value = report.status;
      IRO.openModal('statusModal');
    }

    if(action === 'delete'){
      document.getElementById('deleteModalId').textContent = `${report.id} — ${report.issueType}`;
      IRO.openModal('deleteModal');
    }
  });

  document.getElementById('confirmStatusBtn').addEventListener('click', () => {
    const report = findReport(activeId);
    if(!report) return;
    report.status = document.getElementById('statusSelect').value;
    render();
    IRO.closeModal('statusModal');
    IRO.toast(`${report.id} marked as ${report.status}.`, 'success');
  });

  document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
    reports = reports.filter(r => r.id !== activeId);
    render();
    IRO.closeModal('deleteModal');
    IRO.toast(`Report ${activeId} deleted.`, 'success');
  });

  document.getElementById('resetDataBtn').addEventListener('click', () => {
    loadData();
    IRO.toast('Demo data reset.', 'success');
  });

  loadData();
})();
