import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, QrCode, ShieldCheck, Clock, CheckCircle, Smartphone, ArrowLeft, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Payment() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'qr'>('qr');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed' | 'expired'>('pending');

  useEffect(() => {
    if (!id) return;

    const unsub = onSnapshot(doc(db, 'appointments', id), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setAppointment({ id: snap.id, ...data });
        
        if (data.paymentStatus === 'paid') {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 3000);
        }

        // Fetch doctor details
        const docSnap = await getDoc(doc(db, 'doctors', data.doctorId));
        if (docSnap.exists()) {
          setDoctor(docSnap.data());
        }
      }
      setLoading(false);
    });

    return () => unsub();
  }, [id, navigate]);

  useEffect(() => {
    if (status !== 'pending') return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSimulatePayment = async () => {
    if (!id) return;
    setIsProcessing(true);
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      await updateDoc(doc(db, 'appointments', id), {
        paymentStatus: 'paid',
        status: 'confirmed'
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <RefreshCcw className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <h1 className="text-2xl font-bold text-slate-900 mb-4">Payment Not Found</h1>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 max-w-sm w-full"
        >
          <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Payment Successful!</h1>
          <p className="text-slate-500 font-medium mb-8">Your appointment with {doctor?.name || 'the doctor'} is confirmed.</p>
          <Button className="w-full h-14 rounded-2xl font-bold bg-slate-900" onClick={() => navigate('/dashboard')}>
            View Appointments
          </Button>
          <p className="mt-4 text-xs text-slate-400">Redirecting to dashboard in a moment...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-xl border border-slate-100 max-w-sm w-full">
          <div className="h-24 w-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <Clock className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Session Expired</h1>
          <p className="text-slate-500 font-medium mb-8">The 5-minute payment window has elapsed. Please try booking again.</p>
          <Button variant="outline" className="w-full h-14 rounded-2xl font-bold mb-3" onClick={() => navigate('/search')}>
            Back to Search
          </Button>
          <Button className="w-full h-14 rounded-2xl font-bold" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-8 font-bold text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </button>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-3 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-200 overflow-hidden shadow-sm">
              <CardHeader className="bg-white border-b border-slate-100 p-8">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl font-bold text-slate-900">Secure Payment</CardTitle>
                  <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-xl border border-red-100 animate-pulse">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="flex gap-4 p-2 bg-slate-100/50 rounded-2xl">
                  <button 
                    onClick={() => setPaymentMethod('qr')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all ${
                      paymentMethod === 'qr' ? 'bg-white shadow-md text-primary' : 'text-slate-500'
                    }`}
                  >
                    <QrCode className="h-5 w-5" />
                    Scan QR
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-sm transition-all ${
                      paymentMethod === 'upi' ? 'bg-white shadow-md text-primary' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="h-5 w-5" />
                    UPI / Mobile
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {paymentMethod === 'qr' ? (
                    <motion.div 
                      key="qr"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex flex-col items-center justify-center py-6"
                    >
                      <div className="p-6 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-sm mb-6">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=healthpulse@upi&pn=HealthPulse%20Medical&am=${appointment.price || 0}&tr=${appointment.id}&cu=USD`}
                          alt="Payment QR"
                          className="h-48 w-48"
                        />
                      </div>
                      <p className="text-slate-500 text-sm font-medium text-center">
                        Scan this QR with any UPI app to pay <br />
                        <span className="font-bold text-slate-900">${appointment.price}</span>
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="upi"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4 py-4"
                    >
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Popular Apps</label>
                          <div className="grid grid-cols-2 gap-3">
                            {['Google Pay', 'PhonePe', 'Paytm', 'Amazon Pay'].map(app => (
                              <button key={app} className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-primary transition-colors text-left group">
                                <div className="h-8 w-8 bg-white rounded-lg border border-slate-200 flex items-center justify-center group-hover:border-primary">
                                  <Smartphone className="h-4 w-4 text-slate-400 group-hover:text-primary" />
                                </div>
                                <span className="text-sm font-bold text-slate-700">{app}</span>
                              </button>
                            ))}
                          </div>
                       </div>

                       <div className="relative flex items-center gap-4 py-2">
                          <div className="flex-1 h-px bg-slate-200"></div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or enter UPI ID</span>
                          <div className="flex-1 h-px bg-slate-200"></div>
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">UPI ID</label>
                          <input 
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-4 text-sm font-bold focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="username@bank"
                          />
                       </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-4 border-t border-slate-100">
                  <Button 
                    className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary text-white"
                    onClick={handleSimulatePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <RefreshCcw className="h-5 w-5 animate-spin" />
                        Verifying Payment...
                      </span>
                    ) : (
                      `Complete Payment of $${appointment.price}`
                    )}
                  </Button>
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    100% Encrypted & Secure Payments
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-[2.5rem] border-slate-200 shadow-sm">
              <CardHeader className="p-8">
                <CardTitle className="text-lg font-bold">Appointment Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="flex items-center gap-4">
                  <img 
                    src={doctor?.avatar} 
                    className="h-16 w-16 rounded-2xl object-cover" 
                    alt={doctor?.name} 
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{doctor?.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{doctor?.specialty}</p>
                  </div>
                </div>

                <div className="space-y-3 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Date</span>
                    <span className="text-slate-900 font-bold">{new Date(appointment.date).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Time</span>
                    <span className="text-slate-900 font-bold">{new Date(appointment.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium">
                    <span className="text-slate-500">Duration</span>
                    <span className="text-slate-900 font-bold">30 mins</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Consultation Fee</span>
                    <span className="text-slate-900 font-bold">${appointment.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Service Tax</span>
                    <span className="text-slate-900 font-bold">$0.00</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 mt-2 border-t border-slate-100">
                    <span className="text-slate-900 font-bold">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">${appointment.price}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
               <div className="flex items-start gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-blue-100">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 text-sm mb-1">HealthPulse Protection</h5>
                    <p className="text-[11px] text-blue-700/70 font-medium leading-relaxed">
                      Payments are processed securely. Your booking is protected by our refund policy if the doctor cancels.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
