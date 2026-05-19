import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { HeartPulse, Search, Calendar, MessageSquare, User, Video, LogOut } from 'lucide-react';
import Home from '@/src/pages/Home';
import DoctorSearch from '@/src/pages/DoctorSearch';
import DoctorProfile from '@/src/pages/DoctorProfile';
import Dashboard from '@/src/pages/Dashboard';
import Chat from '@/src/pages/Chat';
import Consultation from '@/src/pages/Consultation';
import Payment from '@/src/pages/Payment';

function Navbar() {
  const { user, profile, signIn, logout } = useAuth();

  return (
    <nav className="border-b bg-white border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">HealthPulse</span>
          </Link>

          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search specialists or clinics..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/search" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Find Doctors</Link>
              {user && (
                <>
                  <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Dashboard</Link>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4 border-l pl-6 border-slate-200">
              {user ? (
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-slate-900">{profile?.name || user.displayName}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{profile?.role || 'Patient'}</p>
                  </div>
                  <Link to="/dashboard">
                    <img 
                      src={profile?.avatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                      className="h-10 w-10 rounded-full border border-slate-200 object-cover" 
                      alt="Avatar" 
                    />
                  </Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={logout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button size="sm" className="rounded-lg px-6 font-bold shadow-md shadow-primary/20" onClick={signIn}>Sign In</Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50/50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<DoctorSearch />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/messages" element={<Chat />} />
              <Route path="/consultation/:id" element={<Consultation />} />
              <Route path="/payment/:id" element={<Payment />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
