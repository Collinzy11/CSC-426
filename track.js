/* =========================================================
   IRO — Track Report page logic
   ========================================================= */
(function(){
  const input = document.getElementById('reportIdInput');
  const btn = document.getElementById('trackBtn');
  const resultBox = document.getElementById('trackResult');
  const err = document.getElementById('err-reportId');

  const ID_PATTERN = /^IRO-\d{4}-\d{3,}$/i;

  btn.addEventListener('click', track);
  input.addEventListener('keydown', (e) => { if(e.key === 'Enter') track(); });

  function track(){
    const value = input.value.trim().toUpperCase();

    if(!value){
      err.classList.add('show');
      input.classList.add('field-error');
      IRO.toast('Enter a report ID to track.', 'error');
      return;
    }
    if(!ID_PATTERN.test(value)){
      err.textContent = 'That doesn\'t look like a valid ticket ID. Expected format: IRO-2026-001.';
      err.classList.add('show');
      input.classList.add('field-error');
      IRO.toast('Invalid ticket ID format.', 'error');
      return;
    }
    err.classList.remove('show');
    input.classList.remove('field-error');

    // Look for a report actually saved in this browser first
    const reports = IRO.getReports();
    const found = reports.find(r => r.id.toUpperCase() === value);

    const data = found ? {
      id: found.id,
      status: found.status || 'Pending',
      lastUpdated: found.dateSubmitted,
      assignedUnit: found.assignedUnit || 'Student Affairs',
      issueType: found.issueType,
      location: found.location
    } : dummyFor(value);

    render(data);
    IRO.toast(`Showing status for ${data.id}.`, 'success');
  }

  // Deterministic-looking dummy data for any well-formed ID we haven't stored
  function dummyFor(id){
    const units = ['Student Affairs', 'Security', 'Works Department'];
    const statuses = ['Pending', 'In Progress', 'Resolved'];
    let hash = 0;
    for(let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) % 997;
    return {
      id,
      status: statuses[hash % statuses.length],
      lastUpdated: new Date(Date.now() - (hash % 6) * 86400000).toISOString(),
      assignedUnit: units[hash % units.length],
      issueType: 'General Issue',
      location: 'Not specified'
    };
  }

  function badgeClass(status){
    if(status === 'Resolved') return 'badge-resolved';
    if(status === 'In Progress') return 'badge-progress';
    return 'badge-pending';
  }

  function render(data){
    const badge = `<span class="badge ${badgeClass(data.status)}">${data.status}</span>`;
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
      <div class="ticket">
        <span class="ticket-eyebrow">Report ID</span>
        <div class="ticket-id">${data.id}</div>
        <div class="perf"></div>
        <div class="ticket-row"><span>Status</span>${badge}</div>
        <div class="ticket-row"><span>Last Updated</span><span>${IRO.formatDate(data.lastUpdated)}</span></div>
        <div class="ticket-row"><span>Assigned Unit</span><span>${data.assignedUnit}</span></div>
        ${data.issueType ? `<div class="ticket-row"><span>Issue Type</span><span>${data.issueType}</span></div>` : ''}
      </div>
      <div class="timeline">
        <div class="timeline-item">
          <span class="t-label">Submitted</span>
          <h4>Ticket created</h4>
          <p style="margin:0;">Report filed and assigned ID ${data.id}.</p>
        </div>
        <div class="timeline-item">
          <span class="t-label">Assigned</span>
          <h4>Routed to ${data.assignedUnit}</h4>
          <p style="margin:0;">Case handed to the unit responsible for this issue type.</p>
        </div>
        <div class="timeline-item">
          <span class="t-label">Current status</span>
          <h4>${data.status}</h4>
          <p style="margin:0;">Last updated ${IRO.formatDate(data.lastUpdated)}.</p>
        </div>
      </div>
    `;
    resultBox.scrollIntoView({ behavior:'smooth', block:'nearest' });
  }
})();
