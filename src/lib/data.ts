import { collection, doc, setDoc, getDocs, query, limit } from 'firebase/firestore';
import { db } from './firebase';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualifications: string[];
  bio: string;
  rating: number;
  reviewsCount: number;
  price: number;
  avatar: string;
  availability?: any;
}

export const initialDoctors: Doctor[] = [
  {
    id: 'dr_sarah_johnson',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    qualifications: ['MD from Harvard', 'PhD in Cardiology', '12+ Years Experience'],
    bio: 'Specialist in non-invasive cardiology and preventive heart care with over a decade of experience in top hospitals.',
    rating: 4.9,
    reviewsCount: 1240,
    price: 150,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_james_wilson',
    name: 'Dr. James Wilson',
    specialty: 'Dermatology',
    qualifications: ['MD from Stanford', 'Board Certified Dermatologist'],
    bio: 'Expert in medical and cosmetic dermatology, focusing on skin rejuvenation and acne treatments.',
    rating: 4.8,
    reviewsCount: 850,
    price: 120,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1a8?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_emily_chen',
    name: 'Dr. Emily Chen',
    specialty: 'Pediatrics',
    qualifications: ['MD from Johns Hopkins', 'FAAP member'],
    bio: 'Dedicated pediatrician with a focus on newborn care and child development psychology.',
    rating: 4.9,
    reviewsCount: 2100,
    price: 100,
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_michael_ross',
    name: 'Dr. Michael Ross',
    specialty: 'Neurology',
    qualifications: ['MD from Oxford', 'Consultant Neurologist'],
    bio: 'Specialist in treating headaches, migraines, and complex neurological disorders.',
    rating: 4.7,
    reviewsCount: 620,
    price: 180,
    avatar: 'https://images.unsplash.com/photo-1537368910025-4757ee0fd26b?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_robert_lee',
    name: 'Dr. Robert Lee',
    specialty: 'Orthopedics',
    qualifications: ['MD from Yale', 'Sports Medicine Fellowship'],
    bio: 'Specializing in joint replacement and sports-related injuries with a focus on minimally invasive surgery.',
    rating: 4.9,
    reviewsCount: 1540,
    price: 200,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_lisa_park',
    name: 'Dr. Lisa Park',
    specialty: 'Psychiatry',
    qualifications: ['MD from Columbia', 'Psychiatry Board Certified'],
    bio: 'Compassionate psychiatrist helping patients manage anxiety, depression, and stress-related conditions.',
    rating: 4.8,
    reviewsCount: 920,
    price: 140,
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=200&h=200&auto=format&fit=crop',
  },
  {
    id: 'dr_marcus_thorne',
    name: 'Dr. Marcus Thorne',
    specialty: 'General Practice',
    qualifications: ['MD from UCL', 'General Medicine Diploma'],
    bio: 'Experienced family physician providing comprehensive care for all ages with a focus on wellness.',
    rating: 4.6,
    reviewsCount: 430,
    price: 80,
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b1a8?q=80&w=200&h=200&auto=format&fit=crop',
  },
];

export async function seedDoctors() {
  const doctorsRef = collection(db, 'doctors');
  const snap = await getDocs(query(doctorsRef));
  const existingIds = new Set(snap.docs.map(doc => doc.id));

  for (const docData of initialDoctors) {
    if (!existingIds.has(docData.id)) {
       console.log(`Seeding doctor: ${docData.name}...`);
       // Also create a user doc for the doctor
       const userRef = doc(db, 'users', docData.id);
       await setDoc(userRef, {
          userId: docData.id,
          name: docData.name,
          role: 'doctor',
          avatar: docData.avatar,
          createdAt: new Date().toISOString()
       });
       await setDoc(doc(db, 'doctors', docData.id), {
         doctorId: docData.id,
         name: docData.name,
         specialty: docData.specialty,
         qualifications: docData.qualifications,
         bio: docData.bio,
         rating: docData.rating,
         reviewsCount: docData.reviewsCount,
         price: docData.price,
         avatar: docData.avatar,
       });
    }
  }
}
