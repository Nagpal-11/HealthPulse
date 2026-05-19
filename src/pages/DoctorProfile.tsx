import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Doctor } from '../lib/data';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Star, ShieldCheck, Award, Clock, MapPin, CheckCircle, Video, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

export default function DoctorProfile() {
  const { id } = useParams();
  const { user, profile, signIn } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
    '04:00 PM', '04:30 PM'
  ];

  useEffect(() => {
    async function load() {
      if (!id) return;
      const snap = await getDoc(doc(db, 'doctors', id));
      if (snap.exists()) {
        setDoctor({ id: snap.id, ...snap.data() } as Doctor);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      signIn();
      return;
    }
    if (!selectedDate || !selectedTime || !doctor) return;
    setShowConfirmation(true);
  };

  const confirmBooking = async () => {
    if (!user || !selectedDate || !selectedTime || !doctor) return;
    
    setIsBooking(true);
    setShowConfirmation(false);
    try {
      // Create a date object with the selected time
      const [time, period] = selectedTime.split(' ');
      const [hours, minutes] = time.split(':');
      let h = parseInt(hours);
      if (period === 'PM' && h !== 12) h += 12;
      if (period === 'AM' && h === 12) h = 0;
      
      const sessionDate = new Date(selectedDate);
      sessionDate.setHours(h, parseInt(minutes), 0, 0);

      const appointmentData = {
        patientId: user.uid,
        doctorId: doctor.id,
        date: sessionDate.toISOString(),
        status: 'pending',
        paymentStatus: 'unpaid',
        price: doctor.price,
        doctorName: doctor.name,
        doctorAvatar: doctor.avatar,
        createdAt: new Date().toISOString(),
      };

      const docRef = await addDoc(collection(db, 'appointments'), appointmentData);
      navigate(`/payment/${docRef.id}`);
    } catch (err) {
      console.error(err);
      alert('Booking failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  if (loading) return <div className="p-12 text-center h-screen flex items-center justify-center">Loading profile...</div>;
  if (!doctor) return <div className="p-12 text-center">Doctor not found.</div>;

  return (
    <div className="bg-slate-50 min-h-screen">
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowConfirmation(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl relative z-10 border border-slate-200"
            >
              <div className="p-8 pb-0">
                <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Confirm Appointment</h2>
                <p className="text-slate-500 font-bold text-sm">Please review your consultation details below.</p>
              </div>

              <div className="p-8 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Doctor</span>
                    <span className="text-sm font-bold text-slate-900">{doctor.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                    <span className="text-sm font-bold text-slate-900">{selectedDate ? format(selectedDate, 'PPP') : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</span>
                    <span className="text-sm font-bold text-slate-900">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
                    <span className="text-sm font-bold text-primary">${doctor.price}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-200"
                  onClick={() => setShowConfirmation(false)}
                >
                  Back
                </Button>
                <Button 
                  className="flex-1 h-14 rounded-2xl font-bold bg-primary text-white shadow-lg shadow-primary/20"
                  onClick={confirmBooking}
                >
                  Confirm & Pay
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 overflow-hidden relative"
            >
              <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left relative z-10">
                <div className="relative">
                   <img 
                    src={doctor.avatar} 
                    alt={doctor.name} 
                    className="w-48 h-48 rounded-3xl object-cover shadow-xl shadow-slate-200 border-4 border-white shrink-0" 
                   />
                   <div className="absolute -bottom-4 right-4 bg-white p-2 rounded-full shadow-lg border border-slate-100">
                      <ShieldCheck className="h-6 w-6 text-primary fill-primary/10" />
                   </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                     <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 text-[10px] font-bold uppercase tracking-widest px-3 py-1 border-none rounded-md">
                        Top Rated Specialist
                     </Badge>
                     <div className="flex items-center text-amber-500 gap-1 bg-white border border-slate-100 px-2 py-0.5 rounded-md shadow-sm">
                        <Star className="h-3 w-3 fill-amber-500" />
                        <span className="text-xs font-bold">{doctor.rating}</span>
                     </div>
                  </div>
                  <h1 className="text-4xl font-bold text-slate-900 mb-2">{doctor.name}</h1>
                  <p className="text-xl text-primary font-bold mb-4">{doctor.specialty}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-slate-500 font-medium text-sm">
                     <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Johns Hopkins Alumni</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>12+ Years Exp</span>
                     </div>
                  </div>
                </div>
              </div>
              {/* Abstract decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 -z-0" />
            </motion.div>

            <Tabs defaultValue="about" className="w-full">
              <TabsList className="bg-white border border-slate-200 p-1 rounded-2xl h-14 w-fit inline-flex mb-8 shadow-sm">
                <TabsTrigger value="about" className="px-10 rounded-xl font-bold data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 transition-all">About</TabsTrigger>
                <TabsTrigger value="reviews" className="px-10 rounded-xl font-bold data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 transition-all">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-8">
                <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Medical Bio</h2>
                   <p className="text-slate-500 leading-relaxed font-bold mb-10 text-[15px]">{doctor.bio}</p>
                   
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Expertise & Qualifications</h3>
                   <div className="grid md:grid-cols-2 gap-4">
                      {doctor.qualifications?.map((q, i) => (
                        <div key={i} className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary transition-colors">
                           <Award className="h-5 w-5 text-primary shrink-0" />
                           <span className="text-sm font-bold text-slate-700">{q}</span>
                        </div>
                      ))}
                   </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews">
                <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm text-center py-24">
                   <Star className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                   <p className="text-slate-400 font-bold text-sm uppercase tracking-widest px-8">Client feedback is currently being migrated and will be available soon.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-8 lg:sticky lg:top-24 h-fit">
            <Card className="rounded-[2.5rem] border-slate-200 shadow-xl overflow-hidden bg-white">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                 <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1">Consultation Fee</p>
                    <div className="text-3xl font-bold">${doctor.price}<span className="text-sm font-normal text-white/60 font-sans">/session</span></div>
                 </div>
                 <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Video className="h-6 w-6" />
                 </div>
              </div>
              <CardContent className="p-8">
                 <div className="space-y-8">
                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-900 text-sm">Select Date</h3>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider underline cursor-pointer">Modify</span>
                       </div>
                       <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 w-full"
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                       />
                    </div>

                    <div>
                       <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-slate-900 text-sm">Select Time</h3>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedTime || 'None selected'}</span>
                       </div>
                       <div className="grid grid-cols-3 gap-2 overflow-y-auto max-h-48 scrollbar-hide pr-1">
                          {timeSlots.map(time => (
                            <button
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                selectedTime === time 
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:border-primary hover:text-primary hover:bg-white'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                       </div>
                    </div>

                    <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                       <div className="flex items-center gap-2 text-blue-700 mb-2 font-bold text-xs uppercase tracking-widest leading-none">
                          <CheckCircle className="h-4 w-4 shrink-0" />
                          Instant Booking
                       </div>
                       <p className="text-[11px] text-slate-500 leading-relaxed font-bold">Processed immediately via secure link.</p>
                    </div>

                    <Button 
                      className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-white" 
                      onClick={handleBooking}
                      disabled={isBooking || !selectedTime}
                    >
                      {isBooking ? 'Processing...' : selectedTime ? `Book at ${selectedTime}` : 'Select a Time'}
                    </Button>
                 </div>
              </CardContent>
            </Card>

            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 flex items-center space-x-6">
               <div className="h-12 w-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 shadow-sm shadow-orange-100">
                  <MessageCircle className="h-6 w-6" />
               </div>
               <div>
                  <h4 className="font-bold text-slate-900 text-sm">Special Request?</h4>
                  <p className="text-[11px] text-slate-500 font-bold leading-relaxed">Ask our medical team anything.</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
