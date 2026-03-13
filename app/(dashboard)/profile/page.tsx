'use client';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { SectionHeader } from '@/components/section-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit2, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { PendingSourceBanner } from '@/components/pending-source-banner';

export default function ProfilePage() {
  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-2xl space-y-6">
        <SectionHeader title="My Profile" />
        <PendingSourceBanner label="Profile data is currently served by typed local fallback data until profile APIs are exposed." />

        {/* Profile Header */}
        <div className="dashboard-panel p-7">
          <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-4xl font-bold text-primary">
              DK
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">Dr. Daniel Kipkemei</h2>
              <p className="text-primary font-medium mt-1">Senior Lecturer</p>
              <p className="text-muted-foreground text-sm mt-2">Mathematics Department</p>
              <div className="flex gap-2 mt-4">
                <Badge className="bg-green-100 text-green-800 border-0">Active</Badge>
                <Badge variant="outline">Verified</Badge>
              </div>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="dashboard-panel p-7">
          <h3 className="text-lg font-semibold text-foreground mb-6">Contact Information</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">kipkemei@university.ke</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">+254 712 345 678</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <MapPin className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Office Location</p>
                <p className="font-medium text-foreground">Mathematics Building, Room 301</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">January 2023</p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="dashboard-panel p-7">
          <h3 className="text-lg font-semibold text-foreground mb-6">Academic Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Courses This Semester</span>
              <span className="text-2xl font-bold text-primary">5</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Total Students</span>
              <span className="text-2xl font-bold text-primary">187</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Average Student Grade</span>
              <span className="text-2xl font-bold text-primary">76.5%</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-muted/30 rounded-lg">
              <span className="font-medium text-foreground">Exams Completed</span>
              <span className="text-2xl font-bold text-primary">12</span>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="dashboard-panel bg-gradient-to-br from-primary/5 to-secondary/40 p-7">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Manage Notifications</Button>
            <Button variant="outline">View Activity Log</Button>
            <Button variant="outline">Download Data</Button>
          </div>
        </div>
      </div>
    </LayoutWrapper>
  );
}
