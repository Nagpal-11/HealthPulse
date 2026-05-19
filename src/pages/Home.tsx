import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Search, ShieldCheck, Clock, Video, Star, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const categories = [
  { name: 'General Physician', description: 'Regular health checkups and common diseases.' },
  { name: 'Cardiology', description: 'Heart and blood vessel related issues.' },
  { name: 'Dermatology', description: 'Skin, hair, and nail treatments.' },
  { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents.' },
  { name: 'Neurology', description: 'Disorders related to the nervous system.' },
  { name: 'Orthopedics', description: 'Bone and joint care specialists.' },
];

const stats = [
  { label: 'Verified Doctors', value: '500+' },
  { label: 'Happy Patients', value: '50k+' },
  { label: 'Specialties', value: '45+' },
  { label: 'Consultations', value: '100k+' },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100">
                <ShieldCheck className="h-4 w-4" />
                <span>HIPAA Secure & Certified</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 leading-[1.05] mb-8">
                The modern way to <br />
                <span className="text-primary italic">book care.</span>
              </h1>
              <p className="text-xl text-slate-500 mb-10 max-w-lg leading-relaxed font-medium">
                Connect with world-class specialists in minutes. Verified medical experts available for video or in-person consultations.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button size="lg" className="h-14 px-10 text-base font-bold rounded-xl shadow-xl shadow-primary/20" asChild>
                  <Link to="/search">Find a Specialist</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-base font-bold rounded-xl bg-white">
                  Learn More
                </Button>
              </div>
            </motion.div>
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200 border-[12px] border-white"
              >
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1200&auto=format&fit=crop"
                  alt="Doctor Consultation"
                  className="w-full aspect-[4/5] object-cover"
                />
              </motion.div>
              {/* Floating Badge */}
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 -left-12 bg-white p-6 rounded-3xl shadow-2xl flex items-center space-x-5 z-20 border border-slate-100"
              >
                <div className="bg-green-100 p-3 rounded-2xl text-green-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">Board Certified</div>
                  <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Verified Identity</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-50 rounded-full blur-3xl opacity-50 -z-0" />
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <p className="text-primary font-bold text-xs uppercase tracking-[0.2em] mb-4">Top Specialties</p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900">Find the right specialist</h2>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.name}
                whileHover={{ y: -8 }}
                className="p-10 rounded-3xl border border-slate-200 bg-white hover:border-primary hover:shadow-2xl hover:shadow-slate-200 transition-all cursor-pointer group"
              >
                <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-900 group-hover:bg-primary group-hover:text-white transition-all mb-8 shadow-sm">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{cat.name}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{cat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-5xl font-bold text-slate-900 mb-3 tracking-tighter">{stat.value}</div>
                  <div className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</div>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
}
