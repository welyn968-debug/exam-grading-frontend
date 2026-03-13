'use client';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { SectionHeader } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Eye, Trash2, Calendar } from 'lucide-react';
import { useState } from 'react';
import { PendingSourceBanner } from '@/components/pending-source-banner';

interface Report {
  id: string;
  title: string;
  type: 'performance' | 'compliance' | 'audit' | 'student-progress';
  generatedDate: string;
  generatedBy: string;
  size: string;
  status: 'ready' | 'generating' | 'archived';
}

const reports: Report[] = [
  {
    id: '1',
    title: 'Department Performance Report - Feb 2025',
    type: 'performance',
    generatedDate: 'Feb 24, 2025',
    generatedBy: 'Dept Head - Admin',
    size: '2.4 MB',
    status: 'ready',
  },
  {
    id: '2',
    title: 'Compliance Audit Report - Q1 2025',
    type: 'compliance',
    generatedDate: 'Feb 20, 2025',
    generatedBy: 'Quality Assurance',
    size: '1.8 MB',
    status: 'ready',
  },
  {
    id: '3',
    title: 'Student Progress Summary - Mathematics',
    type: 'student-progress',
    generatedDate: 'Feb 18, 2025',
    generatedBy: 'Dr. Kipkemei',
    size: '892 KB',
    status: 'ready',
  },
  {
    id: '4',
    title: 'Internal Audit Report - Data Integrity',
    type: 'audit',
    generatedDate: 'Feb 15, 2025',
    generatedBy: 'IT Department',
    size: '3.1 MB',
    status: 'ready',
  },
  {
    id: '5',
    title: 'Grade Anomaly Detection Report',
    type: 'performance',
    generatedDate: 'Feb 10, 2025',
    generatedBy: 'System Admin',
    size: '756 KB',
    status: 'archived',
  },
];

const typeConfig = {
  performance: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Performance' },
  compliance: { bg: 'bg-green-100', text: 'text-green-800', label: 'Compliance' },
  audit: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Audit' },
  'student-progress': { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Student Progress' },
};

export default function ReportsPage() {
  const [filter, setFilter] = useState<'all' | 'ready' | 'archived'>('all');

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') return true;
    return report.status === filter;
  });

  return (
    <LayoutWrapper role="department_head">
      <div className="space-y-6">
        <SectionHeader
          title="Reports"
          description="Generate and manage department reports"
          action={
            <Button className="bg-primary hover:bg-primary/90 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Generate Report
            </Button>
          }
        />
        <PendingSourceBanner label="Reports are currently powered by a typed fallback adapter pending backend report endpoints." />

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {['all', 'ready', 'archived'].map((f) => {
            const label = f && typeof f === 'string' ? f.charAt(0).toUpperCase() + f.slice(1) : f;
            return (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Reports List */}
        <div className="space-y-3">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No reports found</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const typeData = typeConfig[report.type] || { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Unknown' };
              return (
                <div key={report.id} className="dashboard-panel p-5 transition-transform hover:-translate-y-0.5">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    {/* Left Content */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{report.title}</h3>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge className={`${typeData?.bg || 'bg-gray-100'} ${typeData?.text || 'text-gray-800'} border-0`}>{typeData?.label || 'Unknown'}</Badge>
                            <Badge variant="outline" className="flex items-center gap-1 rounded-md">
                              <Calendar className="w-3 h-3" />
                              {report.generatedDate}
                            </Badge>
                            <span className="text-xs text-muted-foreground">by {report.generatedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{report.size}</span>
                        <span>
                          Status: <span className="font-medium">{report.status === 'ready' ? '✓ Ready' : 'Archived'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Report Generation Widget */}
        <div className="dashboard-panel bg-gradient-to-br from-primary/5 to-secondary/40 p-7">
          <h3 className="text-lg font-semibold text-foreground mb-4">Generate Custom Report</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Report Type</label>
              <select className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option>Performance Report</option>
                <option>Compliance Report</option>
                <option>Audit Report</option>
                <option>Student Progress Report</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">From Date</label>
                <input type="date" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">To Date</label>
                <input type="date" className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90">Generate Report</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
