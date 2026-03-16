'use client';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { SectionHeader } from '@/components/section-header';
import { DataTable } from '@/components/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Mail, Phone, Eye } from 'lucide-react';
import { PendingSourceBanner } from '@/components/pending-source-banner';

interface Lecturer {
  id: string;
  name: string;
  email: string;
  phone: string;
  exams: number;
  students: number;
  avgGrade: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

const lecturers: Lecturer[] = [
  {
    id: '1',
    name: 'Dr. Daniel Kipkemei',
    email: 'kipkemei@university.ke',
    phone: '+254 712 345 678',
    exams: 5,
    students: 187,
    avgGrade: '76.5%',
    joinDate: 'Jan 2023',
    status: 'active',
  },
  {
    id: '2',
    name: 'Dr. Jane Kipkoskei',
    email: 'kipkoskei@university.ke',
    phone: '+254 712 345 679',
    exams: 3,
    students: 124,
    avgGrade: '82.3%',
    joinDate: 'Mar 2023',
    status: 'active',
  },
  {
    id: '3',
    name: 'Prof. Samuel Kiplagat',
    email: 'kiplagat@university.ke',
    phone: '+254 712 345 680',
    exams: 7,
    students: 245,
    avgGrade: '79.1%',
    joinDate: 'Aug 2022',
    status: 'active',
  },
  {
    id: '4',
    name: 'Dr. Mary Kipchoge',
    email: 'kipchoge@university.ke',
    phone: '+254 712 345 681',
    exams: 4,
    students: 156,
    avgGrade: '78.9%',
    joinDate: 'Feb 2023',
    status: 'active',
  },
  {
    id: '5',
    name: 'Dr. Peter Kipkemboi',
    email: 'pkipkemboi@university.ke',
    phone: '+254 712 345 682',
    exams: 2,
    students: 98,
    avgGrade: '81.5%',
    joinDate: 'Nov 2023',
    status: 'inactive',
  },
];

export default function LecturersPage() {
  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <SectionHeader
          title="Department Lecturers"
          description={`Manage ${lecturers.length} lecturers in your department`}
          action={
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Lecturer
            </Button>
          }
        />
        <PendingSourceBanner label="Lecturer directory is currently served by a typed local adapter. Backend endpoint wiring is pending." />

        {/* Lecturers Table */}
        <div className="dashboard-panel p-5">
          <DataTable
            columns={[
              {
                key: 'name',
                label: 'Name',
                width: '20%',
                render: (name: string, row: Lecturer) => (
                  <div>
                    <p className="font-medium text-foreground">{name}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </div>
                ),
              },
              {
                key: 'phone',
                label: 'Contact',
                width: '15%',
                render: (phone: string) => (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-3 h-3" />
                    {phone}
                  </div>
                ),
              },
              { key: 'exams', label: 'Exams', width: '10%' },
              { key: 'students', label: 'Students', width: '10%' },
              { key: 'avgGrade', label: 'Avg Grade', width: '12%' },
              { key: 'joinDate', label: 'Joined', width: '12%' },
              {
                key: 'status',
                label: 'Status',
                width: '12%',
                render: (status: string) => {
                  const label = status && typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : status;
                  return (
                    <Badge className={status === 'active' ? 'bg-green-100 text-green-800 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                      {label}
                    </Badge>
                  );
                },
              },
            ]}
            data={lecturers}
            rowKey="id"
            actions={(row) => (
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-muted rounded transition-colors">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </button>
                <Button variant="outline" size="sm" className="text-xs" asChild>
                  <Link href={`/lecturers/${row.id}`}>
                    <Eye className="w-3 h-3 mr-1" />
                    View
                  </Link>
                </Button>
              </div>
            )}
          />
        </div>

        {/* Department Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="dashboard-panel bg-primary/5 p-5">
            <p className="text-sm text-muted-foreground mb-2">Total Lecturers</p>
            <p className="text-3xl font-bold text-foreground">{lecturers.length}</p>
            <p className="text-xs text-green-600 mt-2">4 active, 1 inactive</p>
          </div>
          <div className="dashboard-panel bg-secondary/35 p-5">
            <p className="text-sm text-muted-foreground mb-2">Total Exams</p>
            <p className="text-3xl font-bold text-foreground">{lecturers.reduce((sum, l) => sum + l.exams, 0)}</p>
            <p className="text-xs text-muted-foreground mt-2">This semester</p>
          </div>
          <div className="dashboard-panel bg-muted/40 p-5">
            <p className="text-sm text-muted-foreground mb-2">Department Average</p>
            <p className="text-3xl font-bold text-foreground">79.7%</p>
            <p className="text-xs text-green-600 mt-2">Above university average</p>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
