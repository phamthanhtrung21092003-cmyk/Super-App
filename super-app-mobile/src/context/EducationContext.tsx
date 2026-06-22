import React, { createContext, useContext, useState, useEffect } from 'react';

export type GradeType = 'QUICK' | 'MIDTERM' | 'FINAL'; // Quick (HS1), Midterm (HS2), Final (HS3)

export interface Subject {
  id: string;
  name: string;
  coefficient: number; // For K-12, usually 1. Can be used for credits in University
  color: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  type: GradeType;
  value: number;
  weight: number; // 1, 2, or 3
  date: number;
}

interface EducationContextData {
  subjects: Subject[];
  grades: Grade[];
  targetGPA: number;
  setTargetGPA: (val: number) => void;
  addGrade: (subjectId: string, type: GradeType, value: number, weight: number) => void;
  deleteGrade: (id: string) => void;
  getSubjectGPA: (subjectId: string) => number | null;
  getOverallGPA: () => number | null;
}

const EducationContext = createContext<EducationContextData | undefined>(undefined);

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'math', name: 'Toán học', coefficient: 1, color: '#3B82F6' }, // Blue
  { id: 'lit', name: 'Ngữ văn', coefficient: 1, color: '#EF4444' }, // Red
  { id: 'eng', name: 'Ngoại ngữ', coefficient: 1, color: '#10B981' }, // Green
  { id: 'phy', name: 'Vật lý', coefficient: 1, color: '#F59E0B' }, // Yellow
  { id: 'che', name: 'Hóa học', coefficient: 1, color: '#8B5CF6' }, // Purple
  { id: 'bio', name: 'Sinh học', coefficient: 1, color: '#EC4899' }, // Pink
  { id: 'it', name: 'Tin học', coefficient: 1, color: '#06B6D4' }, // Cyan
];

const MOCK_GRADES: Grade[] = [
  { id: '1', subjectId: 'math', type: 'QUICK', value: 8, weight: 1, date: Date.now() },
  { id: '2', subjectId: 'math', type: 'MIDTERM', value: 7.5, weight: 2, date: Date.now() },
  { id: '3', subjectId: 'eng', type: 'QUICK', value: 9, weight: 1, date: Date.now() },
  { id: '4', subjectId: 'eng', type: 'MIDTERM', value: 8.5, weight: 2, date: Date.now() },
  { id: '5', subjectId: 'lit', type: 'QUICK', value: 6, weight: 1, date: Date.now() },
];

export const EducationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [grades, setGrades] = useState<Grade[]>(MOCK_GRADES);
  const [targetGPA, setTargetGPA] = useState<number>(8.0);

  const addGrade = (subjectId: string, type: GradeType, value: number, weight: number) => {
    const newGrade: Grade = {
      id: Math.random().toString(36).substring(7),
      subjectId,
      type,
      value,
      weight,
      date: Date.now(),
    };
    setGrades(prev => [...prev, newGrade]);
  };

  const deleteGrade = (id: string) => {
    setGrades(prev => prev.filter(g => g.id !== id));
  };

  const getSubjectGPA = (subjectId: string) => {
    const subjGrades = grades.filter(g => g.subjectId === subjectId);
    if (subjGrades.length === 0) return null;
    
    let totalWeight = 0;
    let totalScore = 0;
    subjGrades.forEach(g => {
      totalScore += g.value * g.weight;
      totalWeight += g.weight;
    });
    return totalWeight > 0 ? Number((totalScore / totalWeight).toFixed(1)) : null;
  };

  const getOverallGPA = () => {
    let totalSubjectCoeff = 0;
    let totalSubjectScore = 0;

    subjects.forEach(subj => {
      const gpa = getSubjectGPA(subj.id);
      if (gpa !== null) {
        totalSubjectScore += gpa * subj.coefficient;
        totalSubjectCoeff += subj.coefficient;
      }
    });

    return totalSubjectCoeff > 0 ? Number((totalSubjectScore / totalSubjectCoeff).toFixed(1)) : null;
  };

  return (
    <EducationContext.Provider value={{
      subjects,
      grades,
      targetGPA,
      setTargetGPA,
      addGrade,
      deleteGrade,
      getSubjectGPA,
      getOverallGPA
    }}>
      {children}
    </EducationContext.Provider>
  );
};

export const useEducation = () => {
  const context = useContext(EducationContext);
  if (!context) {
    throw new Error('useEducation must be used within an EducationProvider');
  }
  return context;
};
