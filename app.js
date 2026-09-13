/* SCHOLAR's-LINK — BENBRIDGE INT. */
const KEY = 'scholars_link_db_v1';
const SESSION = 'scholars_link_session';

const seed = {
  users: [
    { id: 'ADM-0001', name: 'System Administrator', email: 'admin@benbridge.edu', role: 'admin', password: 'Admin@123', status: 'Active' },
    { id: 'TCH-1001', name: 'Grace Mensah', email: 'grace@benbridge.edu', role: 'teacher', password: 'Teacher@123', status: 'Active', classes: ['JHS 2A'] },
    { id: 'ACC-1001', name: 'Daniel Owusu', email: 'accountant@benbridge.edu', role: 'accountant', password: 'Account@123', status: 'Active' },
    { id: 'PAR-1001', name: 'Michael Asare', email: 'parent@benbridge.edu', role: 'parent', password: 'Parent@123', status: 'Active', wards: ['STU-2001'] },
    { id: 'STU-2001', name: 'Ama Asare', role: 'student', password: 'Student@123', status: 'Active', class: 'JHS 2A' }
  ],
  classes: [
    { id: 'CLS-01', name: 'JHS 2A', teacher: 'TCH-1001', subjects: ['Mathematics', 'English Language', 'Integrated Science', 'ICT'] },
    { id: 'CLS-02', name: 'JHS 1A', teacher: null, subjects: ['Mathematics', 'English Language', 'Integrated Science', 'ICT'] }
  ],
  subjects: ['Mathematics', 'English Language', 'Integrated Science', 'ICT'],
  fees: [
    { studentId: 'STU-2001', term: '2026/2027 Term 1', amount: 2400, paid: 1800, status: 'Part Payment', due: '2026-10-15' }
  ],
  attendance: [
    { studentId: 'STU-2001', date: '2026-09-08', status: 'Present' },
    { studentId: 'STU-2001', date: '2026-09-09', status: 'Present' },
    { studentId: 'STU-2001', date: '2026-09-10', status: 'Absent' },
    { studentId: 'STU-2001', date: '2026-09-11', status: 'Present' }
  ],
  scores: [
    { studentId: 'STU-2001', subject: 'Mathematics', ca: 24, exam: 58, term: 'Term 1' },
    { studentId: 'STU-2001', subject: 'English Language', ca: 28, exam: 62, term: 'Term 1' },
    { studentId: 'STU-2001', subject: 'Integrated Science', ca: 26, exam: 65, term: 'Term 1' }
  ],
  assignments: [
    { id: 'ASM-001', teacherId: 'TCH-1001', class: 'JHS 2A', subject: 'Mathematics', title: 'Fractions and percentages', instructions: 'Solve exercises 1 to 10 and show your working.', due: '2026-09-18' }
  ],
  submissions: [],
  assignmentMarks: [],
  announcements: [
    { title: 'Welcome to SCHOLAR\'s-LINK', body: 'All members should use only their assigned identity and role portal.', date: '2026-09-12' },
    { title: 'Continuous Assessment', body: 'Teachers should submit updated scores before the reporting deadline.', date: '2026-09-12' }
  ],
  transactions: [
    { id: 'TXN-001', studentId: 'STU-2001', type: 'School Fees', amount: 1800, date: '2026-09-05', status: 'Verified' }
  ]
};

function db() {
  const raw = localStorage.getItem(KEY);
  if (!raw) {
    localStorage.setItem(KEY, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }
  try {
    const data = JSON.parse(raw);
    let changed = false;
    ['users', 'classes', 'subjects', 'fees', 'attendance', 'scores', 'assignments', 'submissions', 'assignmentMarks', 'announcements', 'transactions'].forEach((collection) => {
      if (!Array.isArray(data[collection])) {
        data[collection] = JSON.parse(JSON.stringify(seed[collection] || []));
        changed = true;
      }
    });
    data.users.forEach((user) => {
      if (user.role === 'student' && user.email) {
        delete user.email;
        changed = true;
      }
    });
    if (changed) save(data);
    return data;
  } catch (error) {
    localStorage.removeItem(KEY);
    localStorage.setItem(KEY, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }
}

function save(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function currentUser() {
  const id = sessionStorage.getItem(SESSION);
  const all = db();
  return all.users.find((user) => user.id === id && user.status === 'Active') || null;
}

function visibleAnnouncements(user, data) {
  return data.announcements.filter((item) => !item.class || user.role !== 'student' || item.class === user.class);
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (match) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[match]));
}

function money(value) {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', maximumFractionDigits: 2 }).format(Number(value || 0));
}

function initials(name) {
  return String(name || '').split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function roleName(role) {
  return ({ admin: 'Administrator', teacher: 'Teacher', accountant: 'Accountant', parent: 'Parent', student: 'Student' }[role] || role);
}

function toast(message) {
  const toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 2800);
}

function navFor(role) {
  return {
    admin: [['dashboard', 'Dashboard'], ['users', 'Identity & Users'], ['classes', 'Classes & Teachers'], ['subjects', 'Subjects'], ['assignments', 'Assignments'], ['fee-overview', 'Fee Overview'], ['reports', 'Reports'], ['settings', 'System']],
    teacher: [['dashboard', 'Dashboard'], ['class', 'My Classes'], ['attendance', 'Attendance'], ['scores', 'Scores'], ['assignments', 'Assignments'], ['announcements', 'Announcements']],
    accountant: [['dashboard', 'Dashboard'], ['fees', 'Fees & Payments'], ['transactions', 'Transactions'], ['reports', 'Financial Reports']],
    parent: [['dashboard', 'Dashboard'], ['ward', 'My Ward'], ['attendance', 'Attendance'], ['scores', 'Scores'], ['fees', 'School Fees'], ['reports', 'Reports']],
    student: [['dashboard', 'Dashboard'], ['attendance', 'My Attendance'], ['scores', 'My Scores'], ['fees', 'My Fees'], ['activities', 'Activities'], ['profile', 'My Profile']]
  }[role] || [];
}

function login() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="auth">
      <section class="auth-hero">
        <img class="brandmark" src="imgs/scholar.jpg" alt="SCHOLAR's-LINK logo">
        <h1>SCHOLAR's-LINK</h1>
        <h2>BENBRIDGE INT.</h2>
        <p>A secure digital school management platform connecting administrators, teachers, accountants, parents and students.</p>
        <div class="features">
          <div class="feature"><b>Identity-first access</b><br><small>Every user has a unique school identity.</small></div>
          <div class="feature"><b>Role-based portals</b><br><small>Users see only functions assigned to them.</small></div>
          <div class="feature"><b>Academic records</b><br><small>Attendance, scores and reports in one place.</small></div>
          <div class="feature"><b>Digital finance</b><br><small>Fees and payment records by student.</small></div>
        </div>
      </section>
      <section class="auth-panel">
        <form class="auth-card" id="loginForm">
          <h2>Sign in</h2>
          <p class="muted">Use your BENBRIDGE INT. identity credentials.</p>
          <div class="field">
            <label>School ID or Email</label>
            <input id="identity" name="identity" required autocomplete="username" placeholder="e.g. STU-2001">
          </div>
          <div class="field">
            <label>Password</label>
            <input id="password" name="password" type="password" required autocomplete="current-password" placeholder="Enter password">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Sign in securely</button>
          <div class="demo">
            <b>Demo identities</b><br>
            Admin: admin@benbridge.edu / Admin@123<br>
            Teacher: grace@benbridge.edu / Teacher@123<br>
            Accountant: accountant@benbridge.edu / Account@123<br>
            Parent: parent@benbridge.edu / Parent@123<br>
            Student: STU-2001 / Student@123
          </div>
          <p class="muted" style="font-size:11px;margin-top:16px">Production note: this demo stores data locally and must be replaced with secure server-side authentication in production.</p>
        </form>
      </section>
    </div>
  `;

  document.getElementById('loginForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const identity = document.getElementById('identity').value.trim().toLowerCase();
    const password = document.getElementById('password').value;
    const data = db();
    const user = data.users.find((item) => {
      const credential = item.role === 'student' ? item.id.toLowerCase() === identity : item.email?.toLowerCase() === identity;
      return credential && item.password === password;
    });

    if (!user || user.status !== 'Active') {
      toast('Invalid identity or password.');
      return;
    }

    sessionStorage.setItem(SESSION, user.id);
    layout();
  });
}

function layout() {
  const user = currentUser();
  if (!user) {
    login();
    return;
  }

  const app = document.getElementById('app');
  if (!app) return;

  const nav = navFor(user.role);
  app.innerHTML = `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="logo"><img class="logo-icon" src="imgs/scholar.jpg" alt=""><span>SCHOLAR's-LINK</span></div>
        <nav class="nav">
          ${nav.map(([id, label]) => `<button type="button" data-page="${id}"><span>◆</span> ${label}</button>`).join('')}
        </nav>
        <button type="button" class="btn logout" id="logout"><span>↪ </span>Logout</button>
      </aside>
      <main class="main">
        <header class="topbar">
          <button type="button" class="mobile-toggle" onclick="toggleSidebar()" aria-label="Open navigation">☰</button>
          <div><strong>BENBRIDGE INT.</strong><div class="muted" style="font-size:11px">Digital School Management</div></div>
          <div class="user-chip">
            <div><strong style="font-size:13px">${esc(user.name)}</strong><div class="muted" style="font-size:11px">${roleName(user.role)} • ${user.id}</div></div>
            <div class="avatar">${initials(user.name)}</div>
          </div>
        </header>
        <section class="content" id="view"></section>
      </main>
    </div>
    <div class="modal-backdrop" id="modal"></div>
  `;

  document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
      render(button.dataset.page);
      closeSidebar();
    });
  });

  document.getElementById('logout').addEventListener('click', () => {
    sessionStorage.removeItem(SESSION);
    login();
  });

  render('dashboard');
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  const open = !sidebar.classList.contains('open');
  sidebar.classList.toggle('open', open);
  sidebar.style.display = open ? 'block' : '';
  sidebar.style.position = open ? 'fixed' : '';
  sidebar.style.inset = open ? '0 auto 0 0' : '';
  sidebar.style.width = open ? 'min(280px, 85vw)' : '';
  sidebar.style.zIndex = open ? '20' : '';
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  sidebar.classList.remove('open');
  sidebar.removeAttribute('style');
}

function setActive(page) {
  document.querySelectorAll('[data-page]').forEach((button) => {
    button.classList.toggle('active', button.dataset.page === page);
  });
}

function render(page) {
  const user = currentUser();
  if (!user) {
    login();
    return;
  }

  const data = db();
  const view = document.getElementById('view');
  if (!view) return;

  const pages = {
    dashboard,
    users: usersPage,
    classes: classesPage,
    subjects: subjectsPage,
    assignments: assignmentsPage,
    'fee-overview': feeOverviewPage,
    fees: feesPage,
    reports: reportsPage,
    class: teacherClassPage,
    attendance: attendancePage,
    scores: scoresPage,
    announcements: announcementsPage,
    transactions: transactionsPage,
    ward: wardPage,
    activities: activitiesPage,
    profile: profilePage,
    settings: settingsPage
  };

  setActive(page);
  view.innerHTML = (pages[page] || dashboard)(user, data);
  window.scrollTo(0, 0);
}

function stat(label, value, icon) {
  return `<div class="card stat"><div><div class="muted" style="font-size:12px">${label}</div><div class="value">${value}</div></div><div class="icon">${icon}</div></div>`;
}

function annCard(data) {
  const user = currentUser();
  const announcements = user ? visibleAnnouncements(user, data) : data.announcements;
  return `<div class="card"><div class="section-head"><h3>Announcements</h3></div>${announcements.slice(0, 3).map((item) => `<div style="padding:10px 0;border-bottom:1px solid var(--line)"><b>${esc(item.title)}</b>${item.class ? `<span class="badge info">${esc(item.class)}</span>` : ''}<div class="muted" style="font-size:12px">${esc(item.body)}</div></div>`).join('') || '<div class="empty">No announcements for your class.</div>'}</div>`;
}

function feeTable(data, rows = data.fees) {
  return `<table class="table"><thead><tr><th>Student</th><th>Term</th><th>Amount</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>${rows.map((item) => {
    const student = data.users.find((entry) => entry.id === item.studentId);
    const balance = Number(item.amount || 0) - Number(item.paid || 0);
    return `<tr><td>${esc(student?.name || item.studentId)}</td><td>${esc(item.term)}</td><td>${money(item.amount)}</td><td>${money(item.paid)}</td><td>${money(balance)}</td><td><span class="badge ${item.status === 'Paid' ? 'success' : 'warning'}">${esc(item.status)}</span></td></tr>`;
  }).join('') || '<tr><td colspan="6" class="empty">No records found.</td></tr>'}</tbody></table>`;
}

function attendanceRate(data, studentId) {
  const items = data.attendance.filter((entry) => entry.studentId === studentId);
  if (!items.length) return 0;
  return Math.round(items.filter((entry) => entry.status === 'Present').length / items.length * 100);
}

function avgScore(data, studentId) {
  const items = data.scores.filter((entry) => entry.studentId === studentId);
  if (!items.length) return 0;
  const total = items.reduce((sum, entry) => sum + Number(entry.ca || 0) + Number(entry.exam || 0), 0);
  return Math.round(total / items.length);
}

function grade(score) {
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'E';
}

function denied() {
  return '<div class="card"><h2>Access restricted</h2><p class="muted">Your school identity does not have permission to access this portal.</p></div>';
}

function dashboard(user, data) {
  if (user.role === 'admin') {
    return `
      <div class="page-title"><div><h1>Good day, ${esc(user.name.split(' ')[0])}</h1><p class="muted">Your administrator portal</p></div></div>
      <div class="grid grid-4">${stat('Users', data.users.length, 'ID')} ${stat('Classes', data.classes.length, 'CL')} ${stat('Fee Records', data.fees.length, '₵')} ${stat('Announcements', data.announcements.length, '!')}</div>
      <div class="grid grid-2" style="margin-top:18px"><div class="card"><div class="section-head"><h3>Identity security</h3><span class="badge success">Active</span></div><p class="muted">Each account has a unique identity and a role-scoped portal.</p></div>${annCard(data)}</div>
    `;
  }

  if (user.role === 'teacher') {
    const assigned = data.classes.filter((item) => item.teacher === user.id);
    const studentCount = data.users.filter((student) => student.role === 'student' && data.classes.some((cls) => cls.teacher === user.id && cls.name === student.class)).length;
    return `
      <div class="page-title"><div><h1>Good day, ${esc(user.name.split(' ')[0])}</h1><p class="muted">Your teacher portal</p></div></div>
      <div class="grid grid-4">${stat('Assigned Classes', assigned.length, 'C')} ${stat('Students', studentCount, 'S')} ${stat('Attendance', '92%', 'A')} ${stat('Pending Scores', '2', '!')}</div>
      <div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>Teaching assignment</h3>${assigned.length ? assigned.map((item) => `<p><b>${esc(item.name)}</b><br><span class="muted">${item.subjects.join(' • ')}</span></p>`).join('') : '<div class="empty">No class assigned.</div>'}</div>${annCard(data)}</div>
    `;
  }

  if (user.role === 'accountant') {
    const total = data.fees.reduce((sum, item) => sum + Number(item.amount || 0), 0);
    const paid = data.fees.reduce((sum, item) => sum + Number(item.paid || 0), 0);
    return `
      <div class="page-title"><div><h1>Good day, ${esc(user.name.split(' ')[0])}</h1><p class="muted">Your accountant portal</p></div></div>
      <div class="grid grid-4">${stat('Billed', money(total), '₵')} ${stat('Collected', money(paid), '₵')} ${stat('Outstanding', money(total - paid), '₵')} ${stat('Transactions', data.transactions.length, 'T')}</div>
      <div class="card" style="margin-top:18px"><h3>Recent payments</h3>${feeTable(data, data.fees.slice(0, 5))}</div>
    `;
  }

  if (user.role === 'parent') {
    const wardUser = data.users.find((person) => person.id === user.wards?.[0]);
    const fee = data.fees.find((item) => item.studentId === wardUser?.id);
    return `
      <div class="page-title"><div><h1>Good day, ${esc(user.name.split(' ')[0])}</h1><p class="muted">Your parent portal</p></div></div>
      <div class="grid grid-4">${stat('Ward', wardUser?.name || '—', 'W')} ${stat('Attendance', attendanceRate(data, wardUser?.id) + '%', 'A')} ${stat('Average', avgScore(data, wardUser?.id) + '%', 'S')} ${stat('Fee Balance', money((fee?.amount || 0) - (fee?.paid || 0)), '₵')}</div>
      <div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>Ward profile</h3><p><b>${esc(wardUser?.name)}</b><br>${esc(wardUser?.id)} • ${esc(wardUser?.class)}</p><span class="badge info">Only linked ward records are visible</span></div>${annCard(data)}</div>
    `;
  }

  const fee = data.fees.find((item) => item.studentId === user.id);
  return `
    <div class="page-title"><div><h1>Good day, ${esc(user.name.split(' ')[0])}</h1><p class="muted">Your student portal</p></div></div>
    <div class="grid grid-4">${stat('Attendance', attendanceRate(data, user.id) + '%', 'A')} ${stat('Average', avgScore(data, user.id) + '%', 'S')} ${stat('Paid', money(fee?.paid || 0), '₵')} ${stat('Balance', money((fee?.amount || 0) - (fee?.paid || 0)), '₵')}</div>
    <div class="grid grid-2" style="margin-top:18px"><div class="card"><h3>My academic standing</h3><div class="progress"><span style="width:${avgScore(data, user.id)}%"></span></div><p class="muted">Your academic and financial records are scoped to your identity.</p></div>${annCard(data)}</div>
  `;
}

function usersPage(user, data) {
  if (user.role !== 'admin') return denied();
  return `
    <div class="page-title"><div><h1>Identity & Users</h1><p class="muted">Create and manage unique school identities.</p></div><button type="button" class="btn btn-primary" onclick="openUser()">+ Register identity</button></div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Identity</th><th>Name</th><th>Email</th><th>Password</th><th>Role</th><th>Class</th><th>Status</th><th>Action</th></tr></thead><tbody>${data.users.map((person) => `<tr><td><b>${esc(person.id)}</b></td><td>${esc(person.name)}</td><td>${esc(person.email || 'Not applicable')}</td><td><code>${esc(person.password)}</code></td><td><span class="badge info">${roleName(person.role)}</span></td><td>${esc(person.class || '—')}</td><td><span class="badge ${person.status === 'Active' ? 'success' : 'warning'}">${person.status}</span></td><td><button type="button" class="btn ${person.status === 'Active' ? 'btn-danger' : 'btn-secondary'}" onclick="toggleUserStatus('${person.id}')">${person.status === 'Active' ? 'Deactivate' : 'Enable'}</button></td></tr>`).join('')}</tbody></table></div>
  `;
}

function classesPage(user, data) {
  if (user.role !== 'admin') return denied();
  return `
    <div class="page-title"><div><h1>Classes & Teacher Assignments</h1><p class="muted">Assign teachers to classes and control teaching scope.</p></div><button type="button" class="btn btn-primary" onclick="openClass()">+ Add class</button></div>
    <div class="grid grid-2">${data.classes.map((item) => {
      const teacher = data.users.find((person) => person.id === item.teacher);
      return `<div class="card"><div class="section-head"><h3>${esc(item.name)}</h3><span class="badge info">${item.id}</span></div><p>Teacher: <b>${esc(teacher?.name || 'Unassigned')}</b></p><p class="muted">${item.subjects.join(' • ')}</p><button type="button" class="btn btn-secondary" onclick="assignTeacher('${item.id}')">Assign teacher</button></div>`;
    }).join('')}</div>
  `;
}

function subjectsPage(user, data) {
  if (user.role !== 'admin') return denied();
  return `
    <div class="page-title"><div><h1>Subjects</h1><p class="muted">Create the subjects available for class assignments.</p></div><button type="button" class="btn btn-primary" onclick="openSubject()">+ Create subject</button></div>
    <div class="card"><div class="grid grid-3">${(data.subjects || []).map((subject) => `<div class="notice"><b>${esc(subject)}</b></div>`).join('') || '<div class="empty">No subjects created yet.</div>'}</div></div>
  `;
}

function assignmentsPage(user, data) {
  if (!['admin', 'teacher'].includes(user.role)) return denied();
  const visible = user.role === 'teacher'
    ? (data.assignments || []).filter((assignment) => assignment.teacherId === user.id)
    : (data.assignments || []);
  return `
    <div class="page-title"><div><h1>Assignments</h1><p class="muted">${user.role === 'admin' ? 'View assignments posted by teachers. Editing is restricted.' : 'Post work for students in your assigned classes.'}</p></div>${user.role === 'teacher' ? '<button type="button" class="btn btn-primary" onclick="openTeacherAssignment()">+ Post assignment</button>' : ''}</div>
    <div class="grid grid-2">${visible.map((assignment) => `<div class="card"><div class="section-head"><h3>${esc(assignment.title)}</h3><span class="badge info">${esc(assignment.subject)}</span></div><p class="muted">Class: ${esc(assignment.class)} • Due ${esc(assignment.due)}</p><p>${esc(assignment.instructions)}</p>${assignment.fileName ? `<p class="muted">Attachment: ${esc(assignment.fileName)}</p>` : ''}${user.role === 'teacher' ? `<button type="button" class="btn btn-secondary" onclick="openAssignmentMarks('${esc(assignment.id)}')">Grade submissions</button>` : '<span class="badge success">View only</span>'}</div>`).join('') || '<div class="card empty">No assignments have been posted.</div>'}</div>
  `;
}

function feesPage(user, data) {
  if (!['admin', 'accountant', 'parent', 'student'].includes(user.role)) return denied();
  let rows = data.fees;
  if (user.role === 'student') rows = rows.filter((item) => item.studentId === user.id);
  if (user.role === 'parent') rows = rows.filter((item) => user.wards?.includes(item.studentId));
  return `
    <div class="page-title"><div><h1>${user.role === 'student' || user.role === 'parent' ? 'School Fees' : 'Fees Management'}</h1><p class="muted">${user.role === 'accountant' ? 'Record and verify school fee payments.' : user.role === 'admin' ? 'View fee records. Payment recording is restricted to accountants.' : 'View only the fee records linked to your identity.'}</p></div>${user.role === 'accountant' ? '<button type="button" class="btn btn-primary" onclick="openFee()">+ Record payment</button>' : ''}</div>
    <div class="card table-wrap">${feeTable(data, rows)}</div>
  `;
}

function feeOverviewPage(user, data) {
  if (user.role !== 'admin') return denied();
  const rows = data.classes.map((classEntry) => {
    const students = data.users.filter((person) => person.role === 'student' && person.class === classEntry.name);
    const fees = students.map((student) => ({ student, fee: data.fees.find((item) => item.studentId === student.id) }));
    const paid = fees.filter(({ fee }) => Number(fee?.paid || 0) > 0);
    const unpaid = fees.filter(({ fee }) => Number(fee?.paid || 0) <= 0);
    const amount = paid.reduce((sum, { fee }) => sum + Number(fee?.paid || 0), 0);
    return `<div class="card"><div class="section-head"><h3>${esc(classEntry.name)}</h3><span class="badge info">${students.length} students</span></div><p><b>Fees paid:</b> ${money(amount)}<br><b>Paid students:</b> ${paid.length}<br><b>Not paid:</b> ${unpaid.length}</p><div class="grid grid-2"><div><b>Paid</b>${paid.map(({ student }) => `<p class="muted">${esc(student.name)} • ${esc(student.id)}</p>`).join('') || '<p class="muted">None</p>'}</div><div><b>Not paid</b>${unpaid.map(({ student }) => `<p class="muted">${esc(student.name)} • ${esc(student.id)}</p>`).join('') || '<p class="muted">None</p>'}</div></div><span class="badge success">View only</span></div>`;
  }).join('');
  return `<div class="page-title"><div><h1>Fees by Class</h1><p class="muted">Read-only payment summary. Only accountants can record payments.</p></div></div><div class="grid grid-2">${rows || '<div class="card empty">No classes created yet.</div>'}</div>`;
}

function reportsPage(user, data) {
  if (!['admin', 'accountant', 'parent'].includes(user.role)) return denied();
  let rows = data.scores;
  if (user.role === 'parent') rows = rows.filter((entry) => user.wards?.includes(entry.studentId));
  return `
    <div class="page-title"><div><h1>Reports</h1><p class="muted">Academic and administrative reporting.</p></div></div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Student</th><th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Term</th></tr></thead><tbody>${rows.map((entry) => {
      const student = data.users.find((person) => person.id === entry.studentId);
      return `<tr><td>${esc(student?.name || entry.studentId)}</td><td>${esc(entry.subject)}</td><td>${entry.ca}</td><td>${entry.exam}</td><td><b>${Number(entry.ca || 0) + Number(entry.exam || 0)}</b></td><td>${esc(entry.term)}</td></tr>`;
    }).join('')}</tbody></table></div>
  `;
}

function teacherClassPage(user, data) {
  if (user.role !== 'teacher') return denied();
  const assigned = data.classes.filter((item) => item.teacher === user.id);
  return `
    <div class="page-title"><div><h1>My Classes</h1><p class="muted">Classes assigned to your teacher identity.</p></div></div>
    ${assigned.map((item) => `<div class="card"><h3>${esc(item.name)}</h3><p class="muted">Subjects: ${item.subjects.join(', ')}</p><span class="badge success">Assigned to you</span></div>`).join('') || '<div class="card empty">No classes assigned yet.</div>'}
  `;
}

function attendancePage(user, data) {
  const scope = user.role === 'teacher'
    ? data.users.filter((student) => student.role === 'student' && data.classes.some((item) => item.teacher === user.id && item.name === student.class)).map((student) => student.id)
    : user.role === 'parent'
      ? user.wards || []
      : [user.id];

  const rows = data.attendance.filter((entry) => scope.includes(entry.studentId));
  return `
    <div class="page-title"><div><h1>${user.role === 'student' ? 'My Attendance' : 'Attendance'}</h1><p class="muted">Attendance records within your permitted scope.</p></div>${user.role === 'teacher' ? '<button type="button" class="btn btn-primary" onclick="openAttendance()">+ Mark attendance</button>' : ''}</div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Date</th><th>Student</th><th>Status</th></tr></thead><tbody>${rows.map((entry) => {
      const student = data.users.find((person) => person.id === entry.studentId);
      return `<tr><td>${entry.date}</td><td>${esc(student?.name)}</td><td><span class="badge ${entry.status === 'Present' ? 'success' : 'danger'}">${entry.status}</span></td></tr>`;
    }).join('') || '<tr><td colspan="3" class="empty">No attendance records.</td></tr>'}</tbody></table></div>
  `;
}

function scoresPage(user, data) {
  const scope = user.role === 'teacher'
    ? data.users.filter((student) => student.role === 'student' && data.classes.some((item) => item.teacher === user.id && item.name === student.class)).map((student) => student.id)
    : user.role === 'parent'
      ? user.wards || []
      : [user.id];

  const rows = data.scores.filter((entry) => scope.includes(entry.studentId));
  return `
    <div class="page-title"><div><h1>${user.role === 'student' ? 'My Scores' : 'Scores'}</h1><p class="muted">Continuous assessment and examination results.</p></div>${user.role === 'teacher' ? '<button type="button" class="btn btn-primary" onclick="openScore()">+ Enter score</button>' : ''}</div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Student</th><th>Subject</th><th>SBA / 30</th><th>Exam / 70</th><th>Total / 100</th><th>Grade</th></tr></thead><tbody>${rows.map((entry) => {
      const student = data.users.find((person) => person.id === entry.studentId);
      const sba = weightedSba(data, entry.studentId, Number(entry.ca || 0));
      const total = sba + Number(entry.exam || 0);
      return `<tr><td>${esc(student?.name)}</td><td>${esc(entry.subject)}</td><td>${sba.toFixed(1)}</td><td>${entry.exam}</td><td><b>${total.toFixed(1)}</b></td><td><span class="badge ${total >= 70 ? 'success' : total >= 50 ? 'info' : 'warning'}">${grade(total)}</span></td></tr>`;
    }).join('')}</tbody></table></div>
  `;
}

function weightedSba(data, studentId, fallback = 0) {
  const marks = (data.assignmentMarks || []).filter((item) => item.studentId === studentId);
  if (!marks.length) return fallback;
  return marks.reduce((sum, item) => sum + Number(item.mark || 0), 0) / marks.length * 0.3;
}

function announcementsPage(user, data) {
  const announcements = user.role === 'student' ? visibleAnnouncements(user, data) : data.announcements;
  return `
    <div class="page-title"><div><h1>Announcements</h1><p class="muted">School communication centre.</p></div>${['admin', 'teacher'].includes(user.role) ? '<button type="button" class="btn btn-primary" onclick="openAnnouncement()">+ New announcement</button>' : ''}</div>
    <div class="grid grid-2">${announcements.map((item) => `<div class="card"><span class="badge info">${item.date}</span>${item.class ? `<span class="badge info">${esc(item.class)}</span>` : ''}<h3>${esc(item.title)}</h3><p class="muted">${esc(item.body)}</p></div>`).join('') || '<div class="card empty">No announcements for your class.</div>'}</div>
  `;
}

function transactionsPage(user, data) {
  if (user.role !== 'accountant') return denied();
  return `
    <div class="page-title"><div><h1>Transactions</h1><p class="muted">Verified financial transactions.</p></div></div>
    <div class="card table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Student</th><th>Type</th><th>Amount</th><th>Date</th><th>Status</th><th>Receipt</th></tr></thead><tbody>${data.transactions.map((entry) => {
      const student = data.users.find((person) => person.id === entry.studentId);
      return `<tr><td>${entry.id}</td><td>${esc(student?.name)}</td><td>${entry.type}</td><td>${money(entry.amount)}</td><td>${entry.date}</td><td><span class="badge success">${entry.status}</span></td><td><button type="button" class="btn btn-secondary" onclick="downloadReceipt('${entry.id}')">Download receipt</button></td></tr>`;
    }).join('')}</tbody></table></div>
  `;
}

function wardPage(user, data) {
  if (user.role !== 'parent') return denied();
  const wardUser = data.users.find((person) => person.id === user.wards?.[0]);
  return `
    <div class="page-title"><div><h1>My Ward</h1><p class="muted">The student identity linked to your parent account.</p></div></div>
    <div class="card"><h2>${esc(wardUser?.name)}</h2><p class="muted">${wardUser?.id} • ${wardUser?.class}</p><div class="notice">Your parent identity is linked to this ward only. Other students' records are not exposed.</div></div>
  `;
}

function activitiesPage(user) {
  if (user.role !== 'student') return denied();
  return `
    <div class="page-title"><div><h1>Student Activities</h1><p class="muted">Digital school activities available to you.</p></div></div>
    <div class="grid grid-3"><div class="card"><h3>Assignment centre</h3><p class="muted">View assigned work and submission deadlines.</p><button type="button" class="btn btn-secondary" onclick="openAssignments()">Open</button></div><div class="card"><h3>School announcements</h3><p class="muted">Keep up with notices from BENBRIDGE INT.</p><button type="button" class="btn btn-secondary" onclick="render('announcements')">View notices</button></div><div class="card"><h3>Digital profile</h3><p class="muted">Your school identity and class information.</p><button type="button" class="btn btn-secondary" onclick="render('profile')">View profile</button></div></div>
  `;
}

function openAssignments() {
  const user = currentUser();
  if (!user || user.role !== 'student') {
    toast('Only students can open the assignment centre.');
    return;
  }

  const data = db();
  const assignments = (data.assignments || []).filter((assignment) => assignment.class === user.class);
  modal('Assignment centre', assignments.length ? assignments.map((assignment) => {
    const submission = (data.submissions || []).find((item) => item.assignmentId === assignment.id && item.studentId === user.id);
    return `<div class="card" style="margin-bottom:12px"><div class="section-head"><h3>${esc(assignment.title)}</h3><span class="badge ${submission ? 'success' : 'warning'}">${submission ? 'Submitted' : 'Pending'}</span></div><p class="muted">${esc(assignment.subject)} • Due ${esc(assignment.due)}</p><p>${esc(assignment.instructions)}</p>${assignment.fileData ? `<p><a class="btn btn-secondary" href="${esc(assignment.fileData)}" download="${esc(assignment.fileName || 'assignment-file')}">Download assignment</a></p>` : ''}${submission ? `<p class="muted">Submitted on ${esc(submission.date)}${submission.fileName ? ` • ${esc(submission.fileName)}` : ''}</p>` : `<form class="assignment-form" data-assignment="${esc(assignment.id)}"><div class="field"><label>Your response</label><textarea name="response" rows="4"></textarea></div><div class="field"><label>Upload completed assignment</label><input name="file" type="file" accept=".pdf,.doc,.docx,.txt,image/*"></div><button type="submit" class="btn btn-primary">Submit assignment</button></form>`}</div>`;
  }).join('') : '<div class="empty">No assignments have been published for your class.</div>');

  document.querySelectorAll('.assignment-form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const response = String(new FormData(event.target).get('response') || '').trim();
      const assignmentId = event.target.dataset.assignment;
      const file = event.target.file.files[0];
      if (!response && !file) {
        toast('Write a response or choose an assignment file.');
        return;
      }

      const saveSubmission = (fileData = '') => {
        const fresh = db();
        fresh.submissions = fresh.submissions || [];
        fresh.submissions.push({ assignmentId, studentId: user.id, response, fileName: file?.name || '', fileData, date: new Date().toISOString().slice(0, 10) });
        save(fresh);
        closeModal();
        toast('Assignment submitted successfully.');
      };

      if (!file) {
        saveSubmission();
        return;
      }
      const reader = new FileReader();
      reader.onload = () => saveSubmission(String(reader.result || ''));
      reader.onerror = () => toast('The assignment file could not be read.');
      reader.readAsDataURL(file);
    });
  });
}

function profilePage(user) {
  return `
    <div class="page-title"><div><h1>My Profile</h1><p class="muted">Your digital school identity.</p></div></div>
    <div class="card"><div class="profile-image-wrap">${user.profileImage ? `<img src="${user.profileImage}" alt="Profile" class="profile-image">` : `<div class="avatar" style="width:70px;height:70px">${initials(user.name)}</div>`}</div><h2>${esc(user.name)}</h2><p><b>Identity:</b> ${esc(user.id)}</p><p><b>Role:</b> ${roleName(user.role)}</p><p><b>Email:</b> ${esc(user.email)}</p><p><b>Status:</b> <span class="badge success">${user.status}</span></p>${user.class ? `<p><b>Class:</b> ${esc(user.class)}</p>` : ''}<div class="actions-row"><button type="button" class="btn btn-secondary" onclick="openUpload()">Upload photo</button></div></div>
  `;
}

function settingsPage(user) {
  if (user.role !== 'admin') return denied();
  return `
    <div class="page-title"><div><h1>System Settings</h1><p class="muted">Core SCHOLAR's-LINK controls.</p></div></div>
    <div class="grid grid-2"><div class="card"><h3>School identity</h3><p><b>School:</b> BENBRIDGE INT.</p><p><b>PWA:</b> SCHOLAR's-LINK</p><p><b>Access model:</b> Role-based</p></div><div class="card"><h3>Data protection</h3><p class="muted">This browser build demonstrates the access model. A production system must use secure authentication, encrypted transport, hashed passwords and database security controls.</p><button type="button" class="btn btn-danger" onclick="if(confirm('Reset this browser demo to seed data?')){localStorage.removeItem(KEY);location.reload()}">Reset demo data</button></div></div>
  `;
}

function modal(title, content) {
  const modalEl = document.getElementById('modal');
  if (!modalEl) return;
  modalEl.innerHTML = `<div class="modal"><div class="modal-head"><h2>${title}</h2><button type="button" class="close" onclick="closeModal()">×</button></div>${content}</div>`;
  modalEl.classList.add('show');
}

function closeModal() {
  const modalEl = document.getElementById('modal');
  if (!modalEl) return;
  modalEl.classList.remove('show');
  modalEl.innerHTML = '';
}

function openSubject() {
  if (currentUser()?.role !== 'admin') {
    toast('Only the system administrator can create subjects.');
    return;
  }
  modal('Create subject', `<form id="subjectForm"><div class="field"><label>Subject name</label><input name="subject" required maxlength="80"></div><button type="submit" class="btn btn-primary btn-block">Create subject</button></form>`);
  document.getElementById('subjectForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const subject = String(new FormData(event.target).get('subject') || '').trim();
    const data = db();
    data.subjects = data.subjects || [];
    if (!subject || data.subjects.some((item) => item.toLowerCase() === subject.toLowerCase())) {
      toast('Enter a new subject name.');
      return;
    }
    data.subjects.push(subject);
    save(data);
    closeModal();
    render('subjects');
    toast('Subject created.');
  });
}

function openTeacherAssignment() {
  const teacher = currentUser();
  if (!teacher || teacher.role !== 'teacher') {
    toast('Only teachers can post assignments.');
    return;
  }
  const data = db();
  const classes = data.classes.filter((item) => item.teacher === teacher.id);
  if (!classes.length) {
    toast('You have no assigned classes.');
    return;
  }
  const subjects = data.subjects || [];
  modal('Post assignment', `<form id="assignmentPostForm"><div class="field"><label>Class</label><select name="class" required>${classes.map((item) => `<option value="${esc(item.name)}">${esc(item.name)}</option>`).join('')}</select></div><div class="field"><label>Subject</label><select name="subject" required>${subjects.map((subject) => `<option value="${esc(subject)}">${esc(subject)}</option>`).join('')}</select></div><div class="field"><label>Title</label><input name="title" required maxlength="120"></div><div class="field"><label>Instructions</label><textarea name="instructions" rows="4" required></textarea></div><div class="field"><label>Upload assignment file</label><input name="file" type="file" accept=".pdf,.doc,.docx,.txt,image/*"></div><div class="field"><label>Due date</label><input name="due" type="date" required></div><button type="submit" class="btn btn-primary btn-block">Post assignment</button></form>`);
  document.getElementById('assignmentPostForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = event.target.file.files[0];
    const assignment = { id: `ASM-${String((data.assignments || []).length + 1).padStart(3, '0')}`, teacherId: teacher.id, class: String(form.get('class') || ''), subject: String(form.get('subject') || ''), title: String(form.get('title') || '').trim(), instructions: String(form.get('instructions') || '').trim(), due: String(form.get('due') || ''), fileName: file?.name || '', fileData: '' };
    if (!assignment.title || !assignment.instructions || !assignment.due) {
      toast('Complete all assignment fields.');
      return;
    }
    const finish = (fileData = '') => {
      assignment.fileData = fileData;
      data.assignments = data.assignments || [];
      data.assignments.push(assignment);
      save(data);
      closeModal();
      render('assignments');
      toast('Assignment posted.');
    };
    if (!file) {
      finish();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => finish(String(reader.result || ''));
    reader.onerror = () => toast('The assignment file could not be read.');
    reader.readAsDataURL(file);
  });
}

function openAssignmentMarks(assignmentId) {
  const teacher = currentUser();
  const data = db();
  const assignment = data.assignments.find((item) => item.id === assignmentId && item.teacherId === teacher?.id);
  if (!assignment) {
    toast('You can only grade your own assignments.');
    return;
  }
  const students = data.users.filter((student) => student.role === 'student' && student.class === assignment.class);
  modal(`Grade: ${esc(assignment.title)}`, `<form id="marksForm">${students.map((student) => { const submission = (data.submissions || []).find((item) => item.assignmentId === assignmentId && item.studentId === student.id); const existing = (data.assignmentMarks || []).find((item) => item.assignmentId === assignmentId && item.studentId === student.id); const submissionDetails = submission ? `<div class="notice"><b>Submitted ${esc(submission.date)}</b>${submission.response ? `<p>${esc(submission.response)}</p>` : ''}${submission.fileData ? `<a class="btn btn-secondary" href="${esc(submission.fileData)}" download="${esc(submission.fileName || `${student.id}-submission`)}">Download ${esc(submission.fileName || 'submission')}</a>` : ''}</div>` : '<div class="muted">Not submitted</div>'; return `<div class="field"><label>${esc(student.name)} (${esc(student.id)})</label>${submissionDetails}<input name="mark-${esc(student.id)}" type="number" min="0" max="100" step="0.01" value="${existing?.mark ?? ''}" ${submission ? '' : 'disabled'} placeholder="SBA mark 0-100"></div>`; }).join('') || '<div class="empty">No students are assigned to this class.</div>'}<button type="submit" class="btn btn-primary btn-block">Save SBA marks</button></form>`);
  document.getElementById('marksForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    data.assignmentMarks = data.assignmentMarks || [];
    students.forEach((student) => {
      const value = String(form.get(`mark-${student.id}`) || '');
      if (!value) return;
      const mark = Number(value);
      if (!Number.isFinite(mark) || mark < 0 || mark > 100) return;
      const existing = data.assignmentMarks.find((item) => item.assignmentId === assignmentId && item.studentId === student.id);
      if (existing) existing.mark = mark;
      else data.assignmentMarks.push({ assignmentId, studentId: student.id, mark });
    });
    save(data);
    closeModal();
    render('assignments');
    toast('SBA marks saved and weighted to 30%.');
  });
}

async function downloadReceipt(transactionId) {
  if (currentUser()?.role !== 'accountant') {
    toast('Only accountants can download receipts.');
    return;
  }
  const data = db();
  const transaction = data.transactions.find((entry) => entry.id === transactionId);
  if (!transaction) return;
  const student = data.users.find((person) => person.id === transaction.studentId);
  const pdfApi = window.jspdf?.jsPDF;
  if (!pdfApi) {
    toast('Receipt PDF library is still loading. Try again.');
    return;
  }
  const pdf = new pdfApi();
  pdf.setFillColor(15, 61, 145);
  pdf.rect(0, 0, 210, 34, 'F');
  try {
    const response = await fetch('imgs/scholar.jpg');
    const imageBlob = await response.blob();
    const imageData = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(imageBlob); });
    pdf.addImage(imageData, 'JPEG', 14, 6, 24, 18);
  } catch (error) {
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text('S', 24, 18, { align: 'center' });
  }
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text("BENBRIDGE INT.", 44, 15);
  pdf.setFontSize(9);
  pdf.text("SCHOLAR's-LINK PAYMENT RECEIPT", 44, 23);
  pdf.setTextColor(20, 33, 61);
  pdf.setFontSize(11);
  pdf.text('Payment details', 14, 50);
  pdf.setDrawColor(228, 233, 241);
  pdf.line(14, 54, 196, 54);
  const paidDate = new Date(transaction.paidAt || `${transaction.date}T00:00:00`).toLocaleString('en-GH');
  const details = [['Receipt reference', transaction.id], ['Student name', student?.name || transaction.studentId], ['Student ID', transaction.studentId], ['Payment type', transaction.type], ['Term', transaction.term || 'School fees'], ['Amount paid', money(transaction.amount)], ['Date and time paid', paidDate], ['Status', transaction.status]];
  pdf.setFontSize(10);
  details.forEach(([label, value], index) => { const y = 66 + index * 14; pdf.setTextColor(104, 117, 139); pdf.text(label, 18, y); pdf.setTextColor(20, 33, 61); pdf.text(String(value), 86, y); });
  pdf.setFontSize(9);
  pdf.setTextColor(104, 117, 139);
  pdf.text('Created from SCHOLAR\'s-LINK • BENBRIDGE INT.', 14, 190);
  pdf.text('This receipt confirms the payment recorded in the school finance register.', 14, 198);
  pdf.save(`${transaction.id}-receipt.pdf`);
  toast('PDF receipt downloaded.');
}

function openUser() {
  modal('Register school identity', `
    <form id="userForm">
      <div class="grid grid-2"><div class="field"><label>Full name</label><input name="name" required></div><div class="field" id="emailField"><label>Email for sign in</label><input name="email" id="registrationEmail" type="email"><small class="muted">Required for staff and parents. Students use their generated ID.</small></div></div>
      <div class="grid grid-2"><div class="field"><label>Role</label><select name="role" id="registrationRole"><option value="student">Student</option><option value="teacher">Teacher</option><option value="accountant">Accountant</option><option value="parent">Parent</option><option value="admin">Admin</option></select></div><div class="field"><label>Initial password</label><input name="password" type="password" required minlength="8"></div></div>
      <div class="field" id="classField"><label>Student class</label><select name="class" id="registrationClass"><option value="">Select a class</option>${db().classes.map((item) => `<option value="${esc(item.name)}">${esc(item.name)}</option>`).join('')}</select></div>
      <button type="submit" class="btn btn-primary btn-block">Create identity</button>
    </form>
  `);

  document.getElementById('userForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = db();
    const role = String(form.get('role') || 'student');
    const prefix = { student: 'STU', teacher: 'TCH', accountant: 'ACC', parent: 'PAR', admin: 'ADM' }[role];
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const className = String(form.get('class') || '').trim();
    const password = String(form.get('password') || '');

    if (!name || !password || (role === 'student' ? !className : !email)) {
      toast('Please complete all required fields.');
      return;
    }

    if (email && data.users.some((user) => user.email?.toLowerCase() === email.toLowerCase())) {
      toast('This email is already in use.');
      return;
    }

    let number = 1001;
    while (data.users.some((user) => user.id === `${prefix}-${number}`)) {
      number += 1;
    }

    const identityId = `${prefix}-${number}`;
    data.users.push({ id: identityId, name, ...(email ? { email } : {}), role, password, status: 'Active', ...(role === 'student' ? { class: className } : {}) });
    save(data);
    closeModal();
    render('users');
    toast(`Identity registered: ${identityId}`);
  });

  const roleSelect = document.getElementById('registrationRole');
  const emailInput = document.getElementById('registrationEmail');
  const classField = document.getElementById('classField');
  const classInput = document.getElementById('registrationClass');
  const updateRegistrationFields = () => {
    const student = roleSelect.value === 'student';
    emailInput.required = !student;
    classInput.required = student;
    document.getElementById('emailField').style.display = student ? 'none' : '';
    classField.style.display = student ? '' : 'none';
  };
  roleSelect.addEventListener('change', updateRegistrationFields);
  updateRegistrationFields();
}

function toggleUserStatus(id) {
  if (id === 'ADM-0001') {
    toast('The primary administrator cannot be disabled.');
    return;
  }

  const data = db();
  const user = data.users.find((item) => item.id === id);
  if (!user) return;
  user.status = user.status === 'Active' ? 'Inactive' : 'Active';
  save(data);
  render('users');
  toast(`Identity ${user.status === 'Active' ? 'enabled' : 'deactivated'}.`);
}

function openClass() {
  modal('Create class', `
    <form id="classForm">
      <div class="field"><label>Class name</label><input name="name" required placeholder="e.g. JHS 3A"></div>
      <div class="field"><label>Subjects</label><input name="subjects" required placeholder="Mathematics, English Language, ICT"></div>
      <button type="submit" class="btn btn-primary btn-block">Create class</button>
    </form>
  `);

  document.getElementById('classForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = db();
    const name = String(form.get('name') || '').trim();
    const subjects = String(form.get('subjects') || '').split(',').map((part) => part.trim()).filter(Boolean);

    if (!name || !subjects.length) {
      toast('Enter a class name and at least one subject.');
      return;
    }

    data.classes.push({ id: 'CLS-' + String(data.classes.length + 1).padStart(2, '0'), name, teacher: null, subjects });
    save(data);
    closeModal();
    render('classes');
    toast('Class created.');
  });
}

function assignTeacher(classId) {
  const data = db();
  const teachers = data.users.filter((user) => user.role === 'teacher' && user.status === 'Active');
  if (!teachers.length) {
    toast('There are no active teachers to assign.');
    return;
  }

  modal('Assign teacher', `
    <form id="assignForm">
      <div class="field"><label>Select teacher</label><select name="teacher" required>${teachers.map((teacher) => `<option value="${teacher.id}">${esc(teacher.name)} — ${teacher.id}</option>`).join('')}</select></div>
      <button type="submit" class="btn btn-primary btn-block">Save assignment</button>
    </form>
  `);

  document.getElementById('assignForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const selectedTeacherId = String(form.get('teacher') || '');
    const fresh = db();
    const classEntry = fresh.classes.find((item) => item.id === classId);
    if (!classEntry) {
      toast('Class not found.');
      return;
    }

    const previousTeacher = fresh.users.find((user) => user.id === classEntry.teacher);
    const nextTeacher = fresh.users.find((user) => user.id === selectedTeacherId);

    if (previousTeacher) {
      previousTeacher.classes = (previousTeacher.classes || []).filter((name) => name !== classEntry.name);
    }

    classEntry.teacher = selectedTeacherId;
    if (nextTeacher) {
      nextTeacher.classes = nextTeacher.classes || [];
      if (!nextTeacher.classes.includes(classEntry.name)) {
        nextTeacher.classes.push(classEntry.name);
      }
    }

    save(fresh);
    closeModal();
    render('classes');
    toast('Teacher assigned to class.');
  });
}

function openFee() {
  if (currentUser()?.role !== 'accountant') {
    toast('Only the accountant can record payments.');
    return;
  }
  const data = db();
  const students = data.users.filter((user) => user.role === 'student');
  modal('Record fee payment', `
    <form id="feeForm">
      <div class="field"><label>Student</label><select name="studentId">${students.map((student) => `<option value="${student.id}">${esc(student.name)} — ${student.id}</option>`).join('')}</select></div>
      <div class="field"><label>Payment amount (GHS)</label><input name="amount" type="number" min="0" step="0.01" required></div>
      <div class="field"><label>Term</label><input name="term" value="2026/2027 Term 1" required></div>
      <button type="submit" class="btn btn-primary btn-block">Record payment</button>
    </form>
  `);

  document.getElementById('feeForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = db();
    const studentId = String(form.get('studentId') || '');
    const amount = Number(form.get('amount'));
    const term = String(form.get('term') || '').trim();

    if (!students.length || !studentId || !term || !Number.isFinite(amount) || amount <= 0) {
      toast('Enter a valid payment amount.');
      return;
    }

    let fee = data.fees.find((item) => item.studentId === studentId);
    if (fee) {
      fee.paid = Math.min(Number(fee.amount || 0), Number(fee.paid || 0) + amount);
      fee.status = fee.paid >= fee.amount ? 'Paid' : 'Part Payment';
      fee.term = term;
    } else {
      data.fees.push({ studentId, term, amount, paid: amount, status: 'Paid', due: '' });
    }

    const paidAt = new Date().toISOString();
    data.transactions.push({ id: 'TXN-' + String(data.transactions.length + 1).padStart(3, '0'), studentId, type: 'School Fees', amount, date: paidAt.slice(0, 10), paidAt, term, status: 'Verified' });
    save(data);
    closeModal();
    render('fees');
    toast('Payment recorded and verified.');
  });
}

function openAttendance() {
  const data = db();
  const teacher = currentUser();
  const students = data.users.filter((student) => student.role === 'student' && data.classes.some((item) => item.teacher === teacher?.id && item.name === student.class));
  if (!students.length) {
    toast('No students are assigned to your classes yet.');
    return;
  }

  modal('Mark attendance', `
    <form id="attForm">
      <div class="field"><label>Student</label><select name="studentId">${students.map((student) => `<option value="${student.id}">${esc(student.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Date</label><input name="date" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div>
      <div class="field"><label>Status</label><select name="status"><option value="Present">Present</option><option value="Absent">Absent</option></select></div>
      <button type="submit" class="btn btn-primary btn-block">Save attendance</button>
    </form>
  `);

  document.getElementById('attForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = db();
    data.attendance.push({ studentId: String(form.get('studentId') || ''), date: String(form.get('date') || ''), status: String(form.get('status') || 'Present') });
    save(data);
    closeModal();
    render('attendance');
    toast('Attendance saved.');
  });
}

function openScore() {
  const data = db();
  const teacher = currentUser();
  const students = data.users.filter((student) => student.role === 'student' && data.classes.some((item) => item.teacher === teacher?.id && item.name === student.class));
  if (!students.length) {
    toast('No students are assigned to your classes yet.');
    return;
  }

  modal('Enter academic score', `
    <form id="scoreForm">
      <div class="field"><label>Student</label><select name="studentId">${students.map((student) => `<option value="${student.id}">${esc(student.name)}</option>`).join('')}</select></div>
      <div class="field"><label>Subject</label><input name="subject" required></div>
      <div class="grid grid-2"><div class="field"><label>CA (0–30)</label><input name="ca" type="number" min="0" max="30" required></div><div class="field"><label>Exam (0–70)</label><input name="exam" type="number" min="0" max="70" required></div></div>
      <button type="submit" class="btn btn-primary btn-block">Save score</button>
    </form>
  `);

  document.getElementById('scoreForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const data = db();
    const studentId = String(form.get('studentId') || '');
    const subject = String(form.get('subject') || '').trim();
    const ca = Number(form.get('ca'));
    const exam = Number(form.get('exam'));

    if (!studentId || !subject || !Number.isFinite(ca) || !Number.isFinite(exam) || ca < 0 || ca > 30 || exam < 0 || exam > 70) {
      toast('Complete the score form correctly.');
      return;
    }

    data.scores.push({ studentId, subject, ca, exam, term: 'Term 1' });
    save(data);
    closeModal();
    render('scores');
    toast('Score saved.');
  });
}

function openAnnouncement() {
  const publisher = currentUser();
  if (!publisher || !['admin', 'teacher'].includes(publisher.role)) {
    toast('Only administrators and teachers can publish announcements.');
    return;
  }
  const data = db();
  const classes = publisher.role === 'teacher' ? data.classes.filter((item) => item.teacher === publisher.id) : [];
  modal('New announcement', `
    <form id="annForm">
      <div class="field"><label>Title</label><input name="title" required></div>
      <div class="field"><label>Message</label><textarea name="body" rows="5" required></textarea></div>
      ${publisher.role === 'teacher' ? `<div class="field"><label>Visible to class</label><select name="class" required>${classes.map((item) => `<option value="${esc(item.name)}">${esc(item.name)}</option>`).join('')}</select></div>` : ''}
      <button type="submit" class="btn btn-primary btn-block">Publish</button>
    </form>
  `);

  document.getElementById('annForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.target);
    const title = String(form.get('title') || '').trim();
    const body = String(form.get('body') || '').trim();
    const className = String(form.get('class') || '').trim();

    if (!title || !body || (publisher.role === 'teacher' && !className)) {
      toast('Provide both title and announcement text.');
      return;
    }

    data.announcements.unshift({ title, body, class: className, date: new Date().toISOString().slice(0, 10) });
    save(data);
    closeModal();
    render('announcements');
    toast('Announcement published.');
  });
}

function openUpload() {
  const user = currentUser();
  if (!user) {
    toast('Please sign in first.');
    return;
  }

  modal('Upload profile photo', `
    <form id="uploadForm">
      <div class="field"><label>Select image</label><input type="file" name="photo" accept="image/*" required></div>
      <button type="submit" class="btn btn-primary btn-block">Upload</button>
    </form>
  `);

  document.getElementById('uploadForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const file = event.target.photo.files[0];
    if (!file) {
      toast('Choose an image to upload.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = db();
      const userRecord = data.users.find((entry) => entry.id === user.id);
      if (userRecord) {
        userRecord.profileImage = String(reader.result || '');
        save(data);
      }
      closeModal();
      render('profile');
      toast('Profile photo uploaded.');
    };
    reader.readAsDataURL(file);
  });
}

function start() {
  currentUser() ? layout() : login();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=15').catch(() => {});
  }
}

start();
