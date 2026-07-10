const header=document.getElementById('siteHeader');
const menuToggle=document.getElementById('menuToggle');
const mainNav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>{header?.classList.toggle('scrolled',window.scrollY>24)});
menuToggle?.addEventListener('click',()=>mainNav.classList.toggle('open'));
document.addEventListener('click',(e)=>{if(!e.target.closest('.site-header')&&mainNav?.classList.contains('open'))mainNav.classList.remove('open')});

// Mobile-only top info block: on small screens, the desktop contact/time/weather strip appears inside the hamburger menu.
(function(){
  const nav = document.getElementById('mainNav');
  const stripInner = document.querySelector('.top-strip .top-strip-inner');
  if(!nav || !stripInner || nav.querySelector('.mobile-nav-info')) return;
  const mobileInfo = document.createElement('div');
  mobileInfo.className = 'mobile-nav-info';
  mobileInfo.setAttribute('aria-label','Campus contact, time and weather');
  const cloned = stripInner.cloneNode(true);
  mobileInfo.appendChild(cloned);
  nav.insertBefore(mobileInfo, nav.firstChild);
})();

const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in');observer.unobserve(entry.target)}})},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
const popup=document.getElementById('homePopup');
const close=document.getElementById('popupClose');
if(popup && !sessionStorage.getItem('campus2PopupClosed')){setTimeout(()=>popup.classList.add('show'),550)}
close?.addEventListener('click',()=>{popup.classList.remove('show');sessionStorage.setItem('campus2PopupClosed','1')});
popup?.addEventListener('click',(e)=>{if(e.target===popup){popup.classList.remove('show');sessionStorage.setItem('campus2PopupClosed','1')}});
const search=document.getElementById('noticeSearch');
const noticeList=document.getElementById('noticeList');
search?.addEventListener('input',()=>{const q=search.value.toLowerCase().trim();noticeList.querySelectorAll('article').forEach(card=>{card.style.display=card.textContent.toLowerCase().includes(q)?'block':'none'})});

// Portal login UI behavior: front-end only, ready for backend auth integration.
document.querySelectorAll('[data-password-toggle]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    const input=btn.closest('.password-wrap')?.querySelector('input');
    if(!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
});

document.querySelectorAll('.login-form').forEach(form=>{
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    const status=form.querySelector('.form-status');
    const user=form.querySelector('[name="userid"]')?.value.trim();
    const pass=form.querySelector('[name="password"]')?.value.trim();
    if(!user || !pass){
      status.textContent='Please enter login ID and password.';
      status.classList.remove('success');
      return;
    }
    status.textContent='Checking details...';
    status.classList.add('success');
    localStorage.setItem('campus2PortalSession', JSON.stringify({role:form.dataset.role, user, signedInAt:new Date().toISOString()}));
    setTimeout(()=>{ window.location.href = form.dataset.redirect || 'login.html'; }, 650);
  });
});

document.querySelectorAll('[data-logout]').forEach(btn=>{
  btn.addEventListener('click',()=>localStorage.removeItem('campus2PortalSession'));
});

// Google login + account creation. Live mode uses Firebase when firebase-config.js is completed.
function campus2WebStorageWorks(){
  try{
    const key='campus2_storage_test';
    window.localStorage.setItem(key,'1');
    window.localStorage.removeItem(key);
    return true;
  }catch(_e){ return false; }
}
function campus2FirebaseEnvironmentIssue(){
  const allowed = ['http:', 'https:', 'chrome-extension:'];
  if(!allowed.includes(window.location.protocol)){
    return 'Firebase Auth cannot run from a direct file:// open. Start a local server and open the site with http://localhost:5500/';
  }
  if(!campus2WebStorageWorks()){
    return 'Firebase Auth needs browser storage. Enable local storage/cookies or use a normal browser window instead of restricted/incognito mode.';
  }
  return '';
}
function campus2FirebaseConfigReady(){
  const cfg = window.CAMPUS2_FIREBASE_CONFIG || {};
  return !!(window.CAMPUS2_FIREBASE_ENABLED && window.firebase && cfg.apiKey && !String(cfg.apiKey).includes('PASTE_'));
}
function campus2FirebaseIsReady(){
  return campus2FirebaseConfigReady() && !campus2FirebaseEnvironmentIssue();
}
function campus2InitFirebase(){
  const issue = campus2FirebaseEnvironmentIssue();
  if(issue){ console.warn(issue); return null; }
  if(!campus2FirebaseConfigReady()) return null;
  try{
    if(!firebase.apps.length) firebase.initializeApp(window.CAMPUS2_FIREBASE_CONFIG);
    if(firebase.analytics && !window.__campus2AnalyticsStarted){
      try{ firebase.analytics(); window.__campus2AnalyticsStarted = true; }catch(_e){}
    }
    return firebase;
  }catch(err){ console.warn('Firebase init error', err); return null; }
}
function setPortalStatus(el,msg,type){
  if(!el) return;
  el.textContent = msg;
  el.classList.toggle('success', type === 'success');
  el.classList.toggle('warn', type === 'warn');
}
function saveLocalProfile(role, data){
  const key = role && role.toLowerCase().includes('teacher') ? 'campus2TeacherProfile' : 'campus2StudentProfile';
  localStorage.setItem(key, JSON.stringify({...data, role, updatedAt:new Date().toISOString()}));
  localStorage.setItem('campus2PortalSession', JSON.stringify({role, user:data.email || data.userid || data.fullName || 'Google User', signedInAt:new Date().toISOString()}));
}
async function googlePopup(){
  const fb = campus2InitFirebase();
  if(!fb) throw new Error(campus2FirebaseEnvironmentIssue() || 'Firebase Google login is not configured yet. Add your Firebase config in firebase-config.js and enable Google provider.');
  const provider = new fb.auth.GoogleAuthProvider();
  provider.setCustomParameters({prompt:'select_account'});
  const result = await fb.auth().signInWithPopup(provider);
  return result.user;
}
document.querySelectorAll('[data-google-login]').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const role = btn.dataset.googleLogin === 'teacher' ? 'Teacher' : 'Student';
    const redirect = btn.dataset.redirect || (role === 'Teacher' ? 'teacher-dashboard.html' : 'student-dashboard.html');
    const panel = btn.closest('.login-panel') || document;
    const status = panel.querySelector('.form-status') || panel.querySelector('[role="status"]');
    btn.disabled = true;
    setPortalStatus(status, 'Opening Google sign-in...', 'success');
    try{
      const user = await googlePopup();
      saveLocalProfile(role, {googleUid:user.uid, fullName:user.displayName || '', email:user.email || '', photoURL:user.photoURL || ''});
      setPortalStatus(status, 'Google login successful. Redirecting...', 'success');
      setTimeout(()=>{window.location.href = redirect;}, 650);
    }catch(err){
      setPortalStatus(status, err.message || 'Google login could not start.', 'warn');
    }finally{ btn.disabled = false; }
  });
});
document.querySelectorAll('[data-google-fill]').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const form = document.getElementById(btn.dataset.googleFill);
    const status = form?.querySelector('.form-status');
    btn.disabled = true;
    setPortalStatus(status, 'Opening Google sign-in...', 'success');
    try{
      const user = await googlePopup();
      if(form){
        form.querySelector('[name="googleUid"]').value = user.uid || '';
        form.querySelector('[name="fullName"]').value = user.displayName || '';
        form.querySelector('[name="email"]').value = user.email || '';
      }
      setPortalStatus(status, 'Google account linked. Now add phone/WhatsApp details and create account.', 'success');
    }catch(err){
      setPortalStatus(status, err.message || 'Google account could not be linked.', 'warn');
    }finally{ btn.disabled = false; }
  });
});
document.querySelectorAll('.account-form').forEach(form=>{
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const role = form.dataset.role || 'Student';
    const data = Object.fromEntries(new FormData(form).entries());
    if(role === 'Student' && (!data.phone || !data.whatsapp)){ setPortalStatus(status, 'Please add phone number and WhatsApp number.', 'warn'); return; }
    setPortalStatus(status, 'Creating account...', 'success');
    try{
      const fb = campus2InitFirebase();
      if(fb){
        let uid = data.googleUid;
        if(!uid && data.email && data.password){
          const cred = await fb.auth().createUserWithEmailAndPassword(data.email, data.password);
          uid = cred.user.uid;
          await cred.user.updateProfile({displayName:data.fullName});
        }
        const collection = role === 'Teacher' ? 'teacherProfiles' : 'studentProfiles';
        await fb.firestore().collection(collection).doc(uid || data.email).set({...data, role, updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true});
      }
      saveLocalProfile(role, data);
      setPortalStatus(status, 'Account created successfully. Redirecting...', 'success');
      setTimeout(()=>{window.location.href = form.dataset.redirect || 'login.html';}, 700);
    }catch(err){
      // still allow static/demo package to save locally if Firebase is not ready
      if(!campus2FirebaseIsReady()){
        saveLocalProfile(role, data);
        setPortalStatus(status, 'Account saved in browser demo mode. Add Firebase config for live Google login/storage. Redirecting...', 'warn');
        setTimeout(()=>{window.location.href = form.dataset.redirect || 'login.html';}, 1000);
      }else{
        setPortalStatus(status, err.message || 'Account could not be created.', 'warn');
      }
    }
  });
});
function renderProfileSummaries(){
  document.querySelectorAll('[data-profile-summary]').forEach(box=>{
    const type = box.dataset.profileSummary;
    const key = type === 'teacher' ? 'campus2TeacherProfile' : 'campus2StudentProfile';
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if(!data) return;
    const title = data.fullName || data.email || (type === 'teacher' ? 'Teacher Profile' : 'Student Profile');
    const subtitle = type === 'teacher'
      ? `${data.email || 'Email not added'}${data.department ? ' • '+data.department : ''}${data.phone ? ' • '+data.phone : ''}`
      : `${data.email || 'Gmail not added'}${data.course ? ' • '+data.course : ''}${data.phone ? ' • Phone: '+data.phone : ''}${data.whatsapp ? ' • WhatsApp: '+data.whatsapp : ''}`;
    const h = box.querySelector('h3'); const p = box.querySelector('p');
    if(h) h.textContent = title;
    if(p) p.textContent = subtitle;
    if(!box.querySelector('.profile-mini-grid')){
      const pills = document.createElement('div'); pills.className='profile-mini-grid';
      const values = type === 'teacher'
        ? [['Email', data.email], ['Department', data.department], ['Phone', data.phone]]
        : [['Gmail', data.email], ['Phone', data.phone], ['WhatsApp', data.whatsapp], ['Enrollment', data.enrollment]];
      pills.innerHTML = values.filter(v=>v[1]).map(v=>`<span class="profile-pill"><b>${v[0]}:</b> ${v[1]}</span>`).join('');
      box.querySelector('div:last-child')?.appendChild(pills);
    }
  });
}
renderProfileSummaries();

// Live campus time + weather for top strip and footer.
(function(){
  const campusLocation = { label:'Bulandshahr', latitude:28.4069, longitude:77.8498, timezone:'Asia/Kolkata' };
  const weatherNames = {0:'Clear',1:'Mainly clear',2:'Partly cloudy',3:'Cloudy',45:'Fog',48:'Fog',51:'Light drizzle',53:'Drizzle',55:'Heavy drizzle',61:'Light rain',63:'Rain',65:'Heavy rain',71:'Light snow',73:'Snow',75:'Heavy snow',80:'Light showers',81:'Showers',82:'Heavy showers',95:'Thunderstorm',96:'Thunderstorm',99:'Thunderstorm'};
  function setAll(selector, value){ document.querySelectorAll(selector).forEach(el=>{ el.textContent = value; }); }
  function updateTime(){
    try{
      const now = new Date();
      const time = new Intl.DateTimeFormat('en-IN',{timeZone:campusLocation.timezone,hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(now);
      const date = new Intl.DateTimeFormat('en-IN',{timeZone:campusLocation.timezone,weekday:'short',day:'2-digit',month:'short'}).format(now);
      setAll('[data-live-time]', `${time} • ${date}`);
    }catch(e){ setAll('[data-live-time]', new Date().toLocaleTimeString()); }
  }
  async function updateWeather(){
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${campusLocation.latitude}&longitude=${campusLocation.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=${encodeURIComponent(campusLocation.timezone)}`;
    try{
      const res = await fetch(url,{cache:'no-store'});
      if(!res.ok) throw new Error('weather unavailable');
      const data = await res.json();
      const current = data.current || {};
      const temp = Math.round(current.temperature_2m);
      const name = weatherNames[current.weather_code] || 'Live';
      const humidity = current.relative_humidity_2m ? ` • ${current.relative_humidity_2m}% RH` : '';
      setAll('[data-live-weather]', `${campusLocation.label}: ${temp}°C • ${name}${humidity}`);
    }catch(e){
      setAll('[data-live-weather]', `${campusLocation.label}: weather loading`);
    }
  }
  updateTime(); setInterval(updateTime,1000);
  updateWeather(); setInterval(updateWeather,15*60*1000);
})();

// Firebase connection badge and auth-state helpers.
(function(){
  function updateFirebaseBadge(){
    const ready = typeof campus2FirebaseIsReady === 'function' && campus2FirebaseIsReady();
    if(ready && typeof campus2InitFirebase === 'function') campus2InitFirebase();
    document.querySelectorAll('[data-firebase-status]').forEach(el=>{
      const issue = typeof campus2FirebaseEnvironmentIssue === 'function' ? campus2FirebaseEnvironmentIssue() : '';
      el.textContent = ready ? 'Firebase connected' : (issue ? 'Open with localhost' : 'Firebase config needed');
      el.classList.toggle('live', ready);
      el.title = ready ? 'Google Auth, Firestore and Analytics are connected.' : (issue || 'Paste project config in firebase-config.js and enable Google Auth + Firestore.');
    });
  }
  setTimeout(updateFirebaseBadge,300);
})();

// Admission application form: saves to Firestore when Firebase is available, with local fallback for testing.
// It also prepares an email draft to principal@ipcollegebsr.org with the filled application details.
function campus2SendAdmissionMailToPrincipal(application){
  const principalEmail = 'principal@ipcollegebsr.org';
  const subject = `Admission Application - ${application.fullName || 'Student'} - ${application.course || 'Course not selected'}`;

  const labels = [
    ['Full Name', application.fullName],
    ['Gmail / Email', application.email],
    ['Phone Number', application.phone],
    ['WhatsApp Number', application.whatsapp],
    ['Father / Guardian Name', application.guardianName],
    ['Date of Birth', application.dob],
    ['Course Applying For', application.course],
    ['Previous Qualification', application.previousQualification],
    ['10th Percentage', application.tenthPercentage],
    ['12th Percentage', application.twelfthPercentage],
    ['Address', application.address],
    ['Message / Query', application.message],
    ['Submitted At', application.submittedAt]
  ];

  const body = [
    'New admission application received from the college website.',
    '',
    ...labels
      .filter(row => row[1])
      .map(row => `${row[0]}: ${row[1]}`),
    '',
    'Regards,',
    'I.P. (P.G.) College Campus-2 Website'
  ].join('\n');

  const mailtoUrl = `mailto:${principalEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  setTimeout(()=>{ window.location.href = mailtoUrl; }, 450);
}

document.querySelectorAll('.admission-application-form').forEach(form=>{
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const status = form.querySelector('.form-status');
    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.fullName || !data.email || !data.phone || !data.whatsapp || !data.course){
      setPortalStatus(status, 'Please fill name, Gmail, phone, WhatsApp and course.', 'warn');
      return;
    }
    setPortalStatus(status, 'Submitting application...', 'success');
    const application = {...data, type:'admissionApplication', submittedAt:new Date().toLocaleString('en-IN'), status:'Submitted'};
    try{
      const fb = campus2InitFirebase();
      if(fb){
        await fb.firestore().collection('admissionApplications').add({...application, submittedAt:firebase.firestore.FieldValue.serverTimestamp()});
        setPortalStatus(status, 'Application submitted. Email draft is opening for principal@ipcollegebsr.org. Please press Send in your email app.', 'success');
      }else{
        throw new Error('Firebase not ready');
      }
    }catch(err){
      const key='campus2AdmissionApplications';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.push(application);
      localStorage.setItem(key, JSON.stringify(list));
      setPortalStatus(status, 'Application saved. Email draft is opening for principal@ipcollegebsr.org. Please press Send in your email app.', 'warn');
    }

    campus2SendAdmissionMailToPrincipal(application);
    form.reset();
  });
});

// Clickable NAAC/gallery image lightbox.
(function(){
  const items = document.querySelectorAll('[data-gallery-image]');
  if(!items.length) return;

  let lightbox = document.querySelector('.gallery-lightbox');
  if(!lightbox){
    lightbox = document.createElement('div');
    lightbox.className = 'gallery-lightbox';
    lightbox.setAttribute('role','dialog');
    lightbox.setAttribute('aria-modal','true');
    lightbox.innerHTML = `
      <div class="gallery-lightbox-card">
        <div class="gallery-lightbox-top">
          <div class="gallery-lightbox-title"></div>
          <button class="gallery-lightbox-close" type="button" aria-label="Close image preview">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 5 6.4l5.6 5.6L5 17.6 6.4 19l5.6-5.6 5.6 5.6 1.4-1.4-5.6-5.6L19 6.4 17.6 5 12 10.6z"></path></svg>
          </button>
        </div>
        <img alt="" decoding="async"/>
      </div>`;
    document.body.appendChild(lightbox);
  }

  const img = lightbox.querySelector('img');
  const title = lightbox.querySelector('.gallery-lightbox-title');
  const closeBtn = lightbox.querySelector('.gallery-lightbox-close');

  function openLightbox(src, caption){
    img.src = src;
    img.alt = caption || 'Gallery image';
    title.textContent = caption || 'Gallery image';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(()=>{ if(!lightbox.classList.contains('open')) img.removeAttribute('src'); }, 180);
  }

  items.forEach(item=>{
    item.addEventListener('click',()=>{
      openLightbox(item.dataset.galleryImage, item.dataset.galleryTitle);
    });
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click',(event)=>{
    if(event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown',(event)=>{
    if(event.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();

// Student Dashboard editable profile update.
(function(){
  const form = document.querySelector('[data-student-profile-update]');
  if(!form) return;

  const status = form.querySelector('.form-status');

  function readStudentProfile(){
    try{ return JSON.parse(localStorage.getItem('campus2StudentProfile') || '{}') || {}; }
    catch(_e){ return {}; }
  }

  function setValue(name, value){
    const field = form.querySelector(`[name="${name}"]`);
    if(field && value !== undefined && value !== null) field.value = value;
  }

  function prefillProfile(){
    const data = readStudentProfile();
    ['googleUid','fullName','email','phone','whatsapp','enrollment','course','semester','dob','address'].forEach(key=>{
      setValue(key, data[key] || '');
    });
  }

  function refreshStudentSummary(data){
    const box = document.querySelector('[data-profile-summary="student"]');
    if(!box) return;

    const title = data.fullName || data.email || 'Student Profile';
    const subtitle = `${data.email || 'Gmail not added'}${data.course ? ' • '+data.course : ''}${data.phone ? ' • Phone: '+data.phone : ''}${data.whatsapp ? ' • WhatsApp: '+data.whatsapp : ''}`;

    const h = box.querySelector('h3');
    const p = box.querySelector('p');
    if(h) h.textContent = title;
    if(p) p.textContent = subtitle;

    let pills = box.querySelector('.profile-mini-grid');
    if(!pills){
      pills = document.createElement('div');
      pills.className='profile-mini-grid';
      box.querySelector('div:last-child')?.appendChild(pills);
    }

    const values = [
      ['Gmail', data.email],
      ['Phone', data.phone],
      ['WhatsApp', data.whatsapp],
      ['Enrollment', data.enrollment],
      ['Course', data.course],
      ['Semester', data.semester]
    ];

    pills.innerHTML = values
      .filter(item => item[1])
      .map(item => `<span class="profile-pill"><b>${item[0]}:</b> ${item[1]}</span>`)
      .join('');
  }

  prefillProfile();
  refreshStudentSummary(readStudentProfile());

  const googleFill = form.querySelector('[data-fill-profile-from-google]');
  googleFill?.addEventListener('click', async ()=>{
    googleFill.disabled = true;
    setPortalStatus(status, 'Opening Google account...', 'success');
    try{
      const user = await googlePopup();
      setValue('googleUid', user.uid || '');
      setValue('fullName', user.displayName || '');
      setValue('email', user.email || '');
      setPortalStatus(status, 'Google details filled. Add phone/WhatsApp and save profile.', 'success');
    }catch(err){
      setPortalStatus(status, err.message || 'Google details could not be filled.', 'warn');
    }finally{
      googleFill.disabled = false;
    }
  });

  form.addEventListener('submit', async (event)=>{
    event.preventDefault();

    const data = Object.fromEntries(new FormData(form).entries());
    if(!data.fullName || !data.email || !data.phone || !data.whatsapp){
      setPortalStatus(status, 'Please fill full name, Gmail, phone and WhatsApp number.', 'warn');
      return;
    }

    const current = readStudentProfile();
    const updated = {...current, ...data, role:'Student', updatedAt:new Date().toISOString()};

    setPortalStatus(status, 'Saving profile...', 'success');

    try{
      const fb = campus2InitFirebase();
      if(fb){
        let uid = updated.googleUid;
        const currentUser = fb.auth().currentUser;
        if(!uid && currentUser) uid = currentUser.uid;
        const docId = uid || updated.email;
        await fb.firestore().collection('studentProfiles').doc(docId).set(
          {...updated, updatedAt:firebase.firestore.FieldValue.serverTimestamp()},
          {merge:true}
        );
      }

      saveLocalProfile('Student', updated);
      refreshStudentSummary(updated);
      setPortalStatus(status, 'Profile updated successfully.', 'success');
    }catch(err){
      saveLocalProfile('Student', updated);
      refreshStudentSummary(updated);
      setPortalStatus(status, 'Profile saved in browser demo mode. Firebase will save it live after setup.', 'warn');
    }
  });
})();

// Show editable profile only when the student clicks Update Profile.
(function(){
  const section = document.getElementById('updateProfile');
  if(!section) return;

  const openLinks = document.querySelectorAll('a[href="#updateProfile"], [data-open-profile-edit]');
  const cancelBtn = section.querySelector('[data-cancel-profile-edit]');

  function openProfileEdit(event){
    if(event) event.preventDefault();
    section.hidden = false;
    section.classList.add('profile-edit-open');
    setTimeout(()=>section.scrollIntoView({behavior:'smooth', block:'start'}), 30);
  }

  function closeProfileEdit(){
    section.classList.remove('profile-edit-open');
    section.hidden = true;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  openLinks.forEach(link=>link.addEventListener('click', openProfileEdit));
  cancelBtn?.addEventListener('click', closeProfileEdit);
})();

// Replace Login menu with logged-in user name and only Log out option.
(function(){
  const portalLi = document.querySelector('.nav .portal-dd');
  if(!portalLi) return;

  function safeJson(key){
    try{ return JSON.parse(localStorage.getItem(key) || 'null'); }
    catch(_e){ return null; }
  }

  function getSessionUser(){
    const session = safeJson('campus2PortalSession');
    if(!session) return null;

    const roleRaw = (session.role || '').toLowerCase();
    const isTeacher = roleRaw.includes('teacher');
    const profile = safeJson(isTeacher ? 'campus2TeacherProfile' : 'campus2StudentProfile') || {};

    const name =
      profile.fullName ||
      profile.name ||
      session.user ||
      profile.email ||
      (isTeacher ? 'Teacher' : 'Student');

    return {
      name,
      role: isTeacher ? 'Teacher' : 'Student'
    };
  }

  function buildPath(file){
    const isInsideHtml = location.pathname.includes('/html/');
    return isInsideHtml ? file : 'html/' + file;
  }

  function renderLoggedInNav(user){
    portalLi.classList.add('portal-user');
    portalLi.classList.remove('portal-dd');
    portalLi.innerHTML = `
      <a href="${user.role === 'Teacher' ? buildPath('teacher-dashboard.html') : buildPath('student-dashboard.html')}" aria-label="${user.role} profile menu">
        <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-8 9c.4-4.2 3.5-7 8-7s7.6 2.8 8 7z"></path></svg>
        <span>${user.name}</span>
        <svg aria-hidden="true" class="caret" viewBox="0 0 24 24"><path d="M7.4 8.8 12 13.4l4.6-4.6L18 10.2l-6 6-6-6z"></path></svg>
      </a>
      <div class="dropdown portal-menu">
        <a href="#" data-portal-logout>
          <svg aria-hidden="true" class="dd-icon" viewBox="0 0 24 24"><path d="M16 17v-3H9v-4h7V7l5 5zM4 3h9v2H6v14h7v2H4z"></path></svg>
          <span>Log out</span>
        </a>
      </div>
    `;

    portalLi.querySelector('[data-portal-logout]')?.addEventListener('click', async (event)=>{
      event.preventDefault();
      localStorage.removeItem('campus2PortalSession');

      try{
        const fb = typeof campus2InitFirebase === 'function' ? campus2InitFirebase() : null;
        if(fb && fb.auth) await fb.auth().signOut();
      }catch(_e){}

      const isInsideHtml = location.pathname.includes('/html/');
      window.location.href = isInsideHtml ? '../index.html' : 'index.html';
    });
  }

  const user = getSessionUser();
  if(user) renderLoggedInNav(user);
})();

// 10-digit numeric validation for phone and WhatsApp fields.
(function(){
  const selector = 'input[name="phone"], input[name="whatsapp"], input[data-ten-digit-phone]';

  function normalizeNumber(input){
    if(!input) return;
    const clean = (input.value || '').replace(/\D/g,'').slice(0,10);
    if(input.value !== clean) input.value = clean;
  }

  function wireInput(input){
    input.setAttribute('type','tel');
    input.setAttribute('inputmode','numeric');
    input.setAttribute('pattern','[0-9]{10}');
    input.setAttribute('maxlength','10');
    input.setAttribute('minlength','10');
    input.setAttribute('data-ten-digit-phone','');
    input.addEventListener('input',()=>normalizeNumber(input));
    input.addEventListener('paste',()=>setTimeout(()=>normalizeNumber(input),0));
  }

  document.querySelectorAll(selector).forEach(wireInput);

  document.addEventListener('submit',(event)=>{
    const form = event.target;
    if(!form || !form.querySelectorAll) return;

    const fields = [...form.querySelectorAll(selector)];
    if(!fields.length) return;

    for(const field of fields){
      normalizeNumber(field);
      if(field.required || field.value){
        if(!/^\d{10}$/.test(field.value)){
          event.preventDefault();
          event.stopImmediatePropagation();

          const labelText = field.closest('label')?.childNodes?.[0]?.textContent?.trim() || field.name || 'Phone number';
          const status = form.querySelector('.form-status');

          if(typeof setPortalStatus === 'function'){
            setPortalStatus(status, `${labelText} must be exactly 10 digits only.`, 'warn');
          }else if(status){
            status.textContent = `${labelText} must be exactly 10 digits only.`;
          }else{
            alert(`${labelText} must be exactly 10 digits only.`);
          }

          field.focus();
          return false;
        }
      }
    }
  }, true);
})();

// Click-to-open dropdown menu behavior.
(function(){
  const dropdownItems = document.querySelectorAll('.nav .has-dd');

  dropdownItems.forEach(item=>{
    const trigger = item.querySelector(':scope > a');
    const dropdown = item.querySelector(':scope > .dropdown');
    if(!trigger || !dropdown) return;

    trigger.addEventListener('click',(event)=>{
      event.preventDefault();

      const isOpen = item.classList.contains('dropdown-open');

      dropdownItems.forEach(other=>{
        if(other !== item) other.classList.remove('dropdown-open');
      });

      item.classList.toggle('dropdown-open', !isOpen);
    });
  });

  document.addEventListener('click',(event)=>{
    if(!event.target.closest('.nav .has-dd')){
      dropdownItems.forEach(item=>item.classList.remove('dropdown-open'));
    }
  });

  document.addEventListener('keydown',(event)=>{
    if(event.key === 'Escape'){
      dropdownItems.forEach(item=>item.classList.remove('dropdown-open'));
    }
  });

  // When clicking an actual dropdown link, close the mobile menu/dropdown naturally.
  document.querySelectorAll('.nav .dropdown a').forEach(link=>{
    link.addEventListener('click',()=>{
      dropdownItems.forEach(item=>item.classList.remove('dropdown-open'));
      const mainNav = document.getElementById('mainNav');
      mainNav?.classList.remove('open');
    });
  });
})();

// Admission academic percentage validation: values must be between 0 and 100.
(function(){
  document.querySelectorAll('.admission-application-form').forEach(form=>{
    form.addEventListener('submit',(event)=>{
      const fields = [
        form.querySelector('[name="tenthPercentage"]'),
        form.querySelector('[name="twelfthPercentage"]')
      ].filter(Boolean);

      for(const field of fields){
        if(!field.value) continue;
        const value = Number(field.value);
        if(Number.isNaN(value) || value < 0 || value > 100){
          event.preventDefault();
          event.stopImmediatePropagation();
          const label = field.name === 'tenthPercentage' ? '10th percentage' : '12th percentage';
          const status = form.querySelector('.form-status');
          if(typeof setPortalStatus === 'function'){
            setPortalStatus(status, `${label} must be between 0 and 100.`, 'warn');
          }else if(status){
            status.textContent = `${label} must be between 0 and 100.`;
          }
          field.focus();
          return false;
        }
      }
    }, true);
  });
})();
