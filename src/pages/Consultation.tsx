import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare } from 'lucide-react';

export default function Consultation() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const snap = await getDoc(doc(db, 'appointments', id));
      if (snap.exists()) {
        setAppointment(snap.data());
      }
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Loading consultation room...</div>;
  if (!appointment) return <div className="p-12 text-center">Consultation session not found.</div>;

  // Jitsi Meet Integration
  const domain = "meet.jit.si";
  const roomName = `HealthPulse-Consultation-${id}`;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-black">
      <div className="flex-1 relative">
         <iframe
            src={`https://${domain}/${roomName}#config.prejoinPageEnabled=false&interfaceConfig.TOOLBAR_BUTTONS=["microphone","camera","closedcaptions","desktop","fullscreen","fodeviceselection","hangup","profile","chat","recording","livestreaming","etherpad","sharedvideo","settings","raisehand","videoquality","filmstrip","invite","feedback","stats","shortcuts","tileview","videobackgroundblur","download","help","mute-everyone","security"]`}
            className="w-full h-full border-none"
            allow="camera; microphone; display-capture; autoplay; clipboard-write"
         />

         {/* Overlay controls if needed, but Jitsi has its own */}
         <div className="absolute top-6 left-6 flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-3">
               <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
               <span className="text-white text-sm font-medium">Live Session with {appointment.doctorName}</span>
            </div>
         </div>
      </div>

      <div className="bg-neutral-900 h-20 px-8 flex items-center justify-center space-x-6 border-t border-white/5">
          <Button variant="destructive" className="rounded-full h-12 w-12 p-0" onClick={() => navigate('/dashboard')}>
             <PhoneOff className="h-6 w-6" />
          </Button>
          <div className="h-8 w-px bg-white/10 mx-4" />
          <Button variant="ghost" className="text-white hover:bg-white/10 px-8" asChild>
             <a href="/messages"><MessageSquare className="h-5 w-5 mr-2" /> Open Chat</a>
          </Button>
      </div>
    </div>
  );
}
