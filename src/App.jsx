import { useEffect, useMemo, useState } from 'react';
import {
  BrowserRouter,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';

const USERS_KEY = 'learnwave_users';
const ACTIVE_USER_KEY = 'learnwave_active_user';

const defaultUsers = [
  { name: 'Demo Student', email: 'student@learn.com', password: '123456' },
];

const attendanceData = [
  { day: 'Mon', date: 'Jan 8', status: 'Present' },
  { day: 'Tue', date: 'Jan 9', status: 'Late' },
  { day: 'Wed', date: 'Jan 10', status: 'Present' },
  { day: 'Thu', date: 'Jan 11', status: 'Absent' },
  { day: 'Fri', date: 'Jan 12', status: 'Present' },
  { day: 'Mon', date: 'Jan 15', status: 'Present' },
  { day: 'Tue', date: 'Jan 16', status: 'Present' },
];

const examData = [
  { subject: 'Mathematics', date: 'Feb 2 · 9:00 AM', type: 'Quiz', status: 'Scheduled', score: '-' },
  { subject: 'Biology', date: 'Feb 5 · 10:30 AM', type: 'Unit Test', status: 'Study', score: '-' },
  { subject: 'English', date: 'Jan 28 · 8:30 AM', type: 'Reading', status: 'Completed', score: '92%' },
  { subject: 'Physics', date: 'Jan 20 · 11:00 AM', type: 'Lab', status: 'Completed', score: '88%' },
];

const workbookData = [
  { title: 'Algebra Practice Set', chapter: 'Chapter 4', due: 'Due in 2 days', progress: 70, completed: true },
  { title: 'Essay Outline Draft', chapter: 'Writing Skills', due: 'Due tomorrow', progress: 45, completed: false },
  { title: 'Science Lab Worksheet', chapter: 'Forces & Motion', due: 'Due Friday', progress: 85, completed: true },
  { title: 'Vocabulary Review', chapter: 'English Unit 5', due: 'New', progress: 20, completed: false },
];

const materialData = [
  { title: 'Math Formula Cheat Sheet', type: 'PDF', topic: 'Algebra', size: '2.4 MB' },
  { title: 'Biology Revision Notes', type: 'Notes', topic: 'Cells', size: '1.1 MB' },
  { title: 'English Reading Guide', type: 'Guide', topic: 'Comprehension', size: '840 KB' },
  { title: 'Chemistry Lab Video', type: 'Video', topic: 'Acids & Bases', size: '12 min' },
];

const getLocalUsers = () => {
  const saved = localStorage.getItem(USERS_KEY);
  if (!saved) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
};

const saveLocalUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const formatStatus = (status) => {
  const statusMap = {
    Present: 'present',
    Late: 'late',
    Absent: 'absent',
    Scheduled: 'scheduled',
    Study: 'study',
    Completed: 'completed',
  };

  return statusMap[status] || 'default';
};

function ProtectedRoute({ user, children }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children || <Outlet />;
}

function PublicRoute({ user, children }) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

function Layout({ user, onLogout }) {
  const navItems = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Attendance', to: '/attendance' },
    { label: 'Exams', to: '/exams' },
    { label: 'Workbook', to: '/workbook' },
    { label: 'Materials', to: '/materials' },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-mark">LW</div>
          <div>
            <h1>LearnWave</h1>
            <p>Student portal</p>
          </div>
        </div>

        <nav className="nav-menu">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="profile-card">
          <div className="profile-avatar">{user.name.charAt(0)}</div>
          <div>
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        </div>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

function DashboardPage({ user }) {
  const attendanceRate = Math.round(
    ((attendanceData.filter((item) => item.status === 'Present').length / attendanceData.length) * 100)
  );

  const completedWork = workbookData.filter((item) => item.completed).length;
  const upcomingExams = examData.filter((item) => item.status !== 'Completed').length;

  const statCards = [
    { title: 'Attendance', value: `${attendanceRate}%`, note: 'This week' },
    { title: 'Upcoming Exams', value: String(upcomingExams), note: 'Next 7 days' },
    { title: 'Workbook Progress', value: `${completedWork}/${workbookData.length}`, note: 'Tasks done' },
    { title: 'Materials', value: String(materialData.length), note: 'Available resources' },
  ];

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>Hi {user.name.split(' ')[0]}!</h2>
        </div>
        <button className="primary-button">View timetable</button>
      </header>

      <section className="stats-grid">
        {statCards.map((card) => (
          <div key={card.title} className="stat-card">
            <p>{card.title}</p>
            <h3>{card.value}</h3>
            <span>{card.note}</span>
          </div>
        ))}
      </section>

      <section className="content-grid two-column">
        <div className="panel">
          <div className="panel-header">
            <h3>Attendance this week</h3>
            <span className="badge badge-primary">Healthy</span>
          </div>

          <div className="mini-list">
            {attendanceData.slice(0, 5).map((entry, index) => (
              <div key={`${entry.day}-${index}`} className="list-item-row">
                <div>
                  <strong>{entry.day}</strong>
                  <span>{entry.date}</span>
                </div>
                <span className={`status-pill ${formatStatus(entry.status)}`}>{entry.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Exam focus</h3>
            <span className="badge badge-warning">3 tasks</span>
          </div>

          <div className="mini-list">
            {examData.slice(0, 3).map((exam) => (
              <div key={exam.subject} className="list-item-row">
                <div>
                  <strong>{exam.subject}</strong>
                  <span>{exam.date}</span>
                </div>
                <span className={`status-pill ${formatStatus(exam.status)}`}>{exam.status}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function AttendancePage() {
  const presentCount = attendanceData.filter((item) => item.status === 'Present').length;
  const lateCount = attendanceData.filter((item) => item.status === 'Late').length;

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Progress</p>
          <h2>Attendance Tracker</h2>
        </div>
      </header>

      <section className="summary-row">
        <div className="summary-box">
          <span>Present</span>
          <strong>{presentCount}</strong>
        </div>
        <div className="summary-box">
          <span>Late</span>
          <strong>{lateCount}</strong>
        </div>
        <div className="summary-box accent">
          <span>Rate</span>
          <strong>{Math.round((presentCount / attendanceData.length) * 100)}%</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h3>Weekly record</h3>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.map((item, index) => (
                <tr key={`${item.date}-${index}`}>
                  <td>{item.day}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`status-pill ${formatStatus(item.status)}`}>{item.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ExamsPage() {
  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Assessments</p>
          <h2>Exam Schedule</h2>
        </div>
      </header>

      <section className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {examData.map((exam) => (
                <tr key={exam.subject}>
                  <td>{exam.subject}</td>
                  <td>{exam.type}</td>
                  <td>{exam.date}</td>
                  <td>
                    <span className={`status-pill ${formatStatus(exam.status)}`}>{exam.status}</span>
                  </td>
                  <td>{exam.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function WorkbookPage() {
  const [tasks, setTasks] = useState(workbookData);

  const toggleTask = (title) => {
    setTasks((current) =>
      current.map((task) =>
        task.title === title ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Assignments</p>
          <h2>Workbook</h2>
        </div>
      </header>

      <section className="workbook-grid">
        {tasks.map((task) => (
          <div key={task.title} className="workbook-card">
            <div className="workbook-header">
              <div>
                <h3>{task.title}</h3>
                <span>{task.chapter}</span>
              </div>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.title)}
                aria-label={`Mark ${task.title} as complete`}
              />
            </div>

            <p className="task-due">{task.due}</p>
            <div className="progress-bar">
              <span style={{ width: `${task.progress}%` }}></span>
            </div>
            <div className="progress-meta">
              <strong>{task.progress}%</strong>
              <small>{task.completed ? 'Completed' : 'In progress'}</small>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function MaterialsPage() {
  return (
    <div>
      <header className="page-header">
        <div>
          <p className="eyebrow">Resources</p>
          <h2>Study Materials</h2>
        </div>
        <button className="primary-button">Add resource</button>
      </header>

      <section className="materials-grid">
        {materialData.map((item) => (
          <div key={item.title} className="material-card">
            <div className="material-icon">{item.type.slice(0, 1)}</div>
            <div>
              <h3>{item.title}</h3>
              <p>{item.topic}</p>
            </div>
            <div className="material-meta">
              <span>{item.type}</span>
              <strong>{item.size}</strong>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onLogin(form.email, form.password);

    if (result && result.error) {
      setError(result.error);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark large">LW</div>
          <h2>Welcome back</h2>
          <p>Sign in to your student account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="student@learn.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button full-width">
            Sign in
          </button>
        </form>

        <p className="auth-switch">
          New here? <a href="/signup">Create an account</a>
        </p>
      </div>
    </div>
  );
}

function SignupPage({ onSignup }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const result = onSignup(form.name, form.email, form.password);

    if (result && result.error) {
      setError(result.error);
      return;
    }

    navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-mark large">LW</div>
          <h2>Create account</h2>
          <p>Build your learning profile</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ali Johnson"
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </label>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="primary-button full-width">
            Sign up
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <a href="/">Login</a>
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [users, setUsers] = useState(() => getLocalUsers());

  const handleLogin = (email, password) => {
    const account = users.find(
      (item) => item.email.toLowerCase() === String(email).trim().toLowerCase() && item.password === password
    );

    if (!account) {
      return { error: 'Invalid email or password.' };
    }

    const activeUser = { name: account.name, email: account.email };
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
    setUser(activeUser);
    return activeUser;
  };

  const handleSignup = (name, email, password) => {
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!name || !normalizedEmail || password.length < 6) {
      return { error: 'Please fill all fields correctly.' };
    }

    if (users.some((item) => item.email.toLowerCase() === normalizedEmail)) {
      return { error: 'This email is already registered.' };
    }

    const newUser = { name: name.trim(), email: normalizedEmail, password };
    const updatedUsers = [newUser, ...users];
    saveLocalUsers(updatedUsers);
    setUsers(updatedUsers);

    const activeUser = { name: newUser.name, email: newUser.email };
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(activeUser));
    setUser(activeUser);
    return activeUser;
  };

  const handleLogout = () => {
    localStorage.removeItem(ACTIVE_USER_KEY);
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute user={user}>
              <LoginPage onLogin={handleLogin} />
            </PublicRoute>
          }
        />

        <Route
          path="/signup"
          element={
            <PublicRoute user={user}>
              <SignupPage onSignup={handleSignup} />
            </PublicRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute user={user}>
              <Layout user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage user={user} />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/exams" element={<ExamsPage />} />
          <Route path="/workbook" element={<WorkbookPage />} />
          <Route path="/materials" element={<MaterialsPage />} />
        </Route>

        <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
