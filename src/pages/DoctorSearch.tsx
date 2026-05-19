import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Doctor, seedDoctors } from '../lib/data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function DoctorSearch() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('All');

  useEffect(() => {
    async function load() {
      try {
        const doctorsRef = collection(db, 'doctors');
        let snap = await getDocs(doctorsRef);
        
        // If empty and signed in, try to seed
        if (snap.empty && auth.currentUser) {
          await seedDoctors();
          snap = await getDocs(doctorsRef);
        }
        
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Doctor));
        setDoctors(docs);
      } catch (err) {
        console.error("Error loading doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = specialtyFilter === 'All' || doctor.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Find Your Specialist</h1>
            <p className="text-slate-500 text-sm font-medium">Book an in-person or remote consultation today.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold border-slate-200">Filter</Button>
            <Button className="rounded-xl font-bold shadow-md shadow-primary/20">Book New</Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-12 bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search specialists, clinics, or symptoms..."
              className="w-full pl-11 pr-4 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            {specialties.map(spec => (
              <Button
                key={spec}
                variant={specialtyFilter === spec ? "default" : "ghost"}
                className={`whitespace-nowrap h-11 px-6 rounded-2xl font-bold ${specialtyFilter === spec ? '' : 'text-slate-500 hover:bg-slate-100'}`}
                onClick={() => setSpecialtyFilter(spec)}
              >
                {spec}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-8">
             {[1, 2, 3, 4].map(i => (
               <div key={i} className="h-64 bg-white border border-slate-100 animate-pulse rounded-[2rem]" />
             ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {filteredDoctors.map((doctor, i) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="group hover:border-primary transition-all duration-300 overflow-hidden border-slate-200 shadow-sm rounded-[2rem] bg-white p-6">
                  <div className="flex gap-6 mb-6">
                    <img src={doctor.avatar} alt={doctor.name} className="w-24 h-24 rounded-[1.5rem] object-cover group-hover:scale-105 transition-transform duration-500 shadow-sm" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[9px] font-bold uppercase tracking-wider border-none rounded-md px-2 py-0.5">
                          Verified Board Certified
                        </Badge>
                        <div className="flex items-center text-amber-500 gap-1">
                          <Star className="h-3 w-3 fill-amber-500" />
                          <span className="text-xs font-bold">{doctor.rating}</span>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
                      <p className="text-sm text-primary font-bold mb-1">{doctor.specialty}</p>
                      <p className="text-xs text-slate-400 font-medium">{doctor.qualifications?.[0]}</p>
                    </div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-none">Next Available</p>
                      <p className="text-sm font-bold text-slate-700">Today, 04:30 PM</p>
                    </div>
                    <Button className="rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors px-6 h-11" asChild>
                      <Link to={`/doctor/${doctor.id}`}>Quick Book</Link>
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[2rem] border border-dashed border-slate-200">
                 <h3 className="text-xl font-bold text-slate-400">No specialists found.</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
