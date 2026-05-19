import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Calendar, Clock, Video, MessageSquare, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { Link, useSearchParams } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newName, setNewName] = useState(profile?.name || '');
  const [newAvatar, setNewAvatar] = useState(profile?.avatar || '');
  const [searchParams] = useSearchParams();
  const success = searchParams.get('booking') === 'success';

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'appointments'),
      where(profile?.role === 'doctor' ? 'doctorId' : 'patientId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAppointments(docs);
      setLoading(false);
    });

    return unsub;
  }, [user, profile]);

  useEffect(() => {
    if (profile) {
      setNewName(profile.name || '');
      setNewAvatar(profile.avatar || '');
    }
  }, [profile]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name: newName,
        avatar: newAvatar,
      });
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile.');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
    } catch (err) {
      console.error(err);
    }
  };

  const setMeetLink = async (id: string) => {
    const link = prompt('Enter the video consultation URL:');
    if (link) {
      try {
        await updateDoc(doc(db, 'appointments', id), { meetLink: link });
      } catch (err) {
        console.error(err);
        alert('Failed to update meeting link. Ensure the appointment is confirmed.');
      }
    }
  };

  if (!user) return <div className="p-12 text-center h-screen flex flex-col items-center justify-center">
    <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
    <h2 className="text-2xl font-bold mb-4">Please log in to view your dashboard</h2>
    <Button onClick={() => window.location.href = '/'}>Go Home</Button>
  </div>;

  const requestNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted.');
        }
      });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Patient Dashboard</h1>
            <p className="text-slate-500 text-sm font-medium">Manage your medical appointments and consultations.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold border-slate-200" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </Button>
            <Button variant="outline" className="rounded-xl font-bold border-slate-200" onClick={requestNotifications}>
              Enable Notifications
            </Button>
            <Button className="rounded-xl font-bold shadow-md shadow-primary/20" asChild>
              <Link to="/search">New Appointment</Link>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isEditingProfile && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-3xl border border-slate-200 p-8 mb-10 overflow-hidden shadow-sm"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="relative group cursor-pointer" onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) setNewAvatar(url);
                }}>
                  <img 
                    src={newAvatar || user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
                    className="h-24 w-24 rounded-2xl border-4 border-slate-50 object-cover shadow-lg transition-transform group-hover:scale-105" 
                    alt="Current profile"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                  </div>
                </div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Avatar URL</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                        value={newAvatar}
                        onChange={(e) => setNewAvatar(e.target.value)}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button onClick={handleUpdateProfile} className="rounded-xl px-8 font-bold shadow-lg shadow-primary/20">
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border border-primary/10 text-primary p-4 rounded-2xl flex items-center space-x-3 mb-10"
          >
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-bold text-sm">Appointment booked successfully!</span>
          </motion.div>
        )}

        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="bg-white border border-slate-200 p-1 mb-10 rounded-2xl h-14 w-fit inline-flex shadow-sm">
            <TabsTrigger value="upcoming" className="px-10 rounded-xl font-bold data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="px-10 rounded-xl font-bold data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all">Past</TabsTrigger>
            <TabsTrigger value="cancelled" className="px-10 rounded-xl font-bold data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none transition-all">Cancelled</TabsTrigger>
          </TabsList>

          {['upcoming', 'past', 'cancelled'].map(tab => (
             <TabsContent key={tab} value={tab}>
                <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                   <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                         <thead className="bg-slate-50 border-b border-slate-200">
                            <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                               <th className="px-8 py-4">Specialist</th>
                               <th className="px-8 py-4 text-center">Date & Time</th>
                               <th className="px-8 py-4 text-center">Type</th>
                               <th className="px-8 py-4 text-center">Payment</th>
                               <th className="px-8 py-4 text-center">Status</th>
                               <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {appointments
                              .filter(a => {
                                if (tab === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
                                if (tab === 'past') return a.status === 'completed';
                                if (tab === 'cancelled') return a.status === 'cancelled';
                                return false;
                              })
                              .map((appt) => (
                                 <tr key={appt.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-6">
                                       <div className="flex items-center space-x-4">
                                          <img src={profile?.role === 'doctor' ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${appt.patientId}` : appt.doctorAvatar} className="h-10 w-10 rounded-xl border border-slate-200 shadow-sm object-cover" alt="User" />
                                          <div>
                                             <div className="font-bold text-slate-800 text-base">{profile?.role === 'doctor' ? (appt.patientName || 'Patient') : appt.doctorName}</div>
                                             <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{appt.id.slice(0, 8)}</div>
                                          </div>
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <div className="font-bold text-slate-700">{format(new Date(appt.date), 'MMM d, yyyy')}</div>
                                       <div className="text-xs text-slate-400 font-medium">{format(new Date(appt.date), 'p')}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <Badge variant="secondary" className="rounded-md px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border-none">
                                          Video Call
                                       </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <Badge 
                                         variant="secondary" 
                                         className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase border-none ${
                                           appt.paymentStatus === 'paid' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                         }`}
                                       >
                                          {appt.paymentStatus || 'unpaid'}
                                       </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                       <div className={`flex items-center justify-center gap-1.5 font-bold text-xs ${
                                          appt.status === 'confirmed' ? 'text-primary' : 
                                          appt.status === 'cancelled' ? 'text-destructive' : 'text-slate-400'
                                       }`}>
                                          <div className={`w-1.5 h-1.5 rounded-full ${
                                             appt.status === 'confirmed' ? 'bg-primary' : 
                                             appt.status === 'cancelled' ? 'bg-destructive' : 'bg-slate-400'
                                          }`} />
                                          {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
                                       </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                       <div className="flex items-center justify-end space-x-2">
                                          {appt.paymentStatus === 'unpaid' && appt.status !== 'cancelled' && profile?.role !== 'doctor' && (
                                             <Button asChild size="sm" className="rounded-lg h-9 font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
                                                <Link to={`/payment/${appt.id}`}>Pay Now</Link>
                                             </Button>
                                          )}
                                          {appt.status === 'confirmed' && profile?.role === 'doctor' && (
                                            <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold border-slate-200" onClick={() => setMeetLink(appt.id)}>
                                               {appt.meetLink ? 'Edit Link' : 'Set Link'}
                                            </Button>
                                          )}
                                          {appt.status !== 'cancelled' && (
                                             <Button variant="outline" size="sm" className="rounded-lg h-9 font-bold border-slate-200" asChild>
                                                <Link to={appt.meetLink || `/consultation/${appt.id}`} target={appt.meetLink ? "_blank" : "_self"}>
                                                   {appt.meetLink ? 'Open Link' : 'Join Room'}
                                                </Link>
                                             </Button>
                                          )}
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-slate-400 hover:text-primary" asChild>
                                             <Link to="/messages"><MessageSquare className="h-4 w-4" /></Link>
                                          </Button>
                                          {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                                             <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-lg text-slate-400 hover:text-destructive"
                                                onClick={() => updateStatus(appt.id, 'cancelled')}
                                             >
                                                <XCircle className="h-4 w-4" />
                                             </Button>
                                          )}
                                       </div>
                                    </td>
                                 </tr>
                              ))}
                         </tbody>
                      </table>
                      {appointments.filter(a => {
                        if (tab === 'upcoming') return a.status === 'confirmed' || a.status === 'pending';
                        if (tab === 'past') return a.status === 'completed';
                        if (tab === 'cancelled') return a.status === 'cancelled';
                        return false;
                      }).length === 0 && !loading && (
                        <div className="py-24 text-center bg-white px-8">
                           <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                           <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-widest">No matching appointments</p>
                           <Button variant="secondary" className="rounded-lg font-bold" asChild>
                              <Link to="/search">Book a New Session</Link>
                           </Button>
                        </div>
                      )}
                   </div>
                </div>
             </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
