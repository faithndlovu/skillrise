// ─────────────────────────────────────────────────────────────
//  CONFIG — paste your free Web3Forms access key below.
//  Get one in 30 seconds at https://web3forms.com (enter the
//  email you want submissions sent to: nfaithlubelihle@gmail.com).
//  Until this is set, forms stay fully functional in "local mode":
//  submissions are saved in the browser (run getSubmissions() in the
//  console to see them). Add the key later and they email automatically.
// ─────────────────────────────────────────────────────────────
const WEB3FORMS_ACCESS_KEY = "YOUR_ACCESS_KEY_HERE";

// Highlight the nav link for the page currently being viewed.
function setActiveNav(){
  let path = window.location.pathname.split('/').pop();
  if(!path) path = 'index.html';
  document.querySelectorAll('.nav-links a[data-page]').forEach(a=>{
    a.classList.toggle('active', a.getAttribute('href') === path);
  });
}

// Mobile hamburger menu.
function toggleMenu(){
  document.getElementById('mobileMenu').classList.toggle('open');
}

// Skills page category filter.
function filterSkills(cat,btn){
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.skill-detail-card').forEach(card=>{
    card.style.display=(cat==='all'||card.dataset.cat===cat)?'':'none';
  });
}

// Donate page tier selection -> fills the amount input.
function selectTier(el,amount){
  document.querySelectorAll('.tier-card').forEach(c=>c.style.borderColor='');
  el.style.borderColor='var(--green-mid)';
  const inp=document.getElementById('donateAmountInput');
  if(inp) inp.value=amount;
}

// Turn a form's fields into a plain object (repeated names -> arrays).
function collectFormData(form){
  const fd = new FormData(form);
  const obj = {};
  for(const [k,v] of fd.entries()){
    if(k === 'botcheck') continue;
    if(obj[k] === undefined) obj[k] = v;
    else if(Array.isArray(obj[k])) obj[k].push(v);
    else obj[k] = [obj[k], v];
  }
  return obj;
}

// Save a submission to the browser so nothing is lost before a key is set.
// View them any time from the console:  getSubmissions()
function saveLocalSubmission(form){
  const all = JSON.parse(localStorage.getItem('skillrise_submissions') || '[]');
  all.push({ form: form.id, at: new Date().toISOString(), data: collectFormData(form) });
  localStorage.setItem('skillrise_submissions', JSON.stringify(all));
}
function getSubmissions(){
  return JSON.parse(localStorage.getItem('skillrise_submissions') || '[]');
}

// Submit a form. Emails via Web3Forms once a key is set; until then it
// saves locally so the form is fully functional for testing/demos.
async function handleFormSubmit(e){
  e.preventDefault();
  const form = e.target;
  const successEl = document.getElementById(form.dataset.success);
  const btn = form.querySelector('[type="submit"]');
  const originalLabel = btn ? btn.textContent : '';
  const showSuccess = ()=>{
    if(successEl) successEl.style.display = 'block';
    form.reset();
  };

  // No key yet → local mode. Works immediately, no external service.
  if(WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE"){
    saveLocalSubmission(form);
    showSuccess();
    return;
  }

  // Key set → send a real email via Web3Forms.
  const data = new FormData(form);
  data.append('access_key', WEB3FORMS_ACCESS_KEY);

  if(btn){ btn.disabled = true; btn.textContent = 'Sending…'; }

  try{
    const res = await fetch('https://api.web3forms.com/submit', {
      method:'POST',
      headers:{'Accept':'application/json'},
      body:data
    });
    const json = await res.json();
    if(json.success){
      showSuccess();
    }else{
      alert('Sorry, something went wrong: ' + (json.message || 'please try again.'));
    }
  }catch(err){
    alert('Network error — please check your connection and try again.');
  }finally{
    if(btn){ btn.disabled = false; btn.textContent = originalLabel; }
  }
}

document.addEventListener('DOMContentLoaded', ()=>{
  setActiveNav();
  document.querySelectorAll('form[data-success]').forEach(f=>{
    f.addEventListener('submit', handleFormSubmit);
  });
});
