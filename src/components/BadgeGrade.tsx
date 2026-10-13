interface BadgeGradeProps {
  grade: 'GRADE_A' | 'GRADE_B';
}

export default function BadgeGrade({ grade }: BadgeGradeProps) {
  const isGradeA = grade === 'GRADE_A';
  return (
    <span className={`inline-block px-2.5 py-1 text-xs font-semibold rounded-full ${
      isGradeA ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
    }`}>
      {isGradeA ? 'Grade A (Super)' : 'Grade B (Standar)'}
    </span>
  );
}