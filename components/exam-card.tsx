import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Users, CheckCircle2, AlertCircle } from 'lucide-react';

interface ExamCardProps {
  id: string;
  title: string;
  course: string;
  date: string;
  students: number;
  graded: number;
  status: 'pending' | 'in-progress' | 'completed';
  progress?: number;
}

const statusConfig = {
  pending: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Pending' },
  'in-progress': { bg: 'bg-blue-50', text: 'text-blue-700', label: 'In Progress' },
  completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Completed' },
};

export function ExamCard({
  id,
  title,
  course,
  date,
  students,
  graded,
  status,
  progress = 0,
}: ExamCardProps) {
  const config = statusConfig[status];

  return (
    <div className="dashboard-panel p-5 transition-transform hover:-translate-y-0.5">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{course}</p>
        </div>
        <Badge className={`${config.bg} ${config.text} border-0 px-2.5 py-1`}>{config.label}</Badge>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{graded}/{students} graded</span>
        </div>
      </div>

      {progress > 0 && (
        <div className="mb-5">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link href={`/exams/${id}`} className="flex-1">
          <Button variant="outline" className="w-full rounded-xl">
            View Details
          </Button>
        </Link>
        {status !== 'completed' && (
          <Button className="flex-1 rounded-xl bg-primary hover:bg-primary/90">
            {status === 'pending' ? 'Start Setup' : 'Continue'}
          </Button>
        )}
      </div>
    </div>
  );
}
