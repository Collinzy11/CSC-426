/* =========================================================
   IRO — Report Issue page logic
   ========================================================= */
(function(){
  const form = document.getElementById('reportForm');
  if(!form) return;

  const fileInput = document.getElementById('fileInput');
  const fileNameEl = document.getElementById('file-name');
  const anonymousBox = document.getElementById('anonymous');
  const fullNameInput = document.getElementById('fullName');

  // Show chosen filename (frontend only — nothing is uploaded anywhere)
  fileInput.addEventListener('change', () => {
    if(fileInput.files.length){
      fileNameEl.textContent = `Selected: ${fileInput.files[0].name}`;
    } else {
      fileNameEl.textContent = '';
    }
  });

  // Disable + grey out name field when reporting anonymously
  anonymousBox.addEventListener('change', () => {
    if(anonymousBox.checked){
      fullNameInput.value = '';
      fullNameInput.disabled = true;
      fullNameInput.placeholder = 'Hidden — reporting anonymously';
      clearError('fullName');
    } else {
      fullNameInput.disabled = false;
      fullNameInput.placeholder = 'e.g. Adaeze Okafor';
    }
  });

  function showError(fieldId, show){
    const input = document.getElementById(fieldId);
    const err = document.getElementById('err-' + fieldId);
    if(input) input.classList.toggle('field-error', show);
    if(err) err.classList.toggle('show', show);
  }
  function clearError(fieldId){ showError(fieldId, false); }

  function validate(){
    let valid = true;

    if(!anonymousBox.checked && fullNameInput.value.trim().length < 2){
      showError('fullName', true); valid = false;
    } else { clearError('fullName'); }

    const faculty = document.getElementById('facultyCommunity');
    if(!faculty.value){ showError('facultyCommunity', true); valid = false; }
    else { clearError('facultyCommunity'); }

    const issueType = document.getElementById('issueType');
    if(!issueType.value){ showError('issueType', true); valid = false; }
    else { clearError('issueType'); }

    const location = document.getElementById('location');
    if(location.value.trim().length < 3){ showError('location', true); valid = false; }
    else { clearError('location'); }

    const title = document.getElementById('issueTitle');
    if(title.value.trim().length < 4){ showError('issueTitle', true); valid = false; }
    else { clearError('issueTitle'); }

    const desc = document.getElementById('description');
    if(desc.value.trim().length < 15){ showError('description', true); valid = false; }
    else { clearError('description'); }

    return valid;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if(!validate()){
      IRO.toast('Please fix the highlighted fields before submitting.', 'error');
      const firstError = form.querySelector('.field-error');
      if(firstError) firstError.scrollIntoView({ behavior:'smooth', block:'center' });
      return;
    }

    const isAnonymous = anonymousBox.checked;
    const reportId = IRO.generateReportId();

    const report = {
      id: reportId,
      fullName: isAnonymous ? 'Anonymous' : fullNameInput.value.trim(),
      category: form.querySelector('input[name="category"]:checked').value,
      facultyCommunity: document.getElementById('facultyCommunity').value,
      issueType: document.getElementById('issueType').value,
      issueTitle: document.getElementById('issueTitle').value.trim(),
      description: document.getElementById('description').value.trim(),
      location: document.getElementById('location').value.trim(),
      hasImage: fileInput.files.length > 0,
      anonymous: isAnonymous,
      status: 'Pending',
      assignedUnit: assignUnit(document.getElementById('issueType').value),
      dateSubmitted: new Date().toISOString()
    };

    IRO.saveReport(report);

    document.getElementById('modalTicketId').textContent = reportId;
    document.getElementById('modalIssueType').textContent = report.issueType;
    IRO.openModal('successModal');
    IRO.toast(`Report submitted. Ticket ID: ${reportId}`, 'success');

    form.reset();
    fileNameEl.textContent = '';
    fullNameInput.disabled = false;
  });

  function assignUnit(issueType){
    const map = {
      'Theft': 'Security',
      'Security Concern': 'Security',
      'Harassment': 'Student Affairs',
      'Power Outage': 'Works Department',
      'Water Supply': 'Works Department',
      'Facility Damage': 'Works Department',
      'Sanitation': 'Works Department'
    };
    return map[issueType] || 'Student Affairs';
  }
})();
