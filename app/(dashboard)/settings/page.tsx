'use client';

import { LayoutWrapper } from '@/components/layout-wrapper';
import { SectionHeader } from '@/components/section-header';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Bell, Lock, User } from 'lucide-react';
import { PendingSourceBanner } from '@/components/pending-source-banner';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security'>('profile');
  const [formData, setFormData] = useState({
    firstName: 'Daniel',
    lastName: 'Kipkemei',
    email: 'kipkemei@university.ke',
    department: 'Mathematics',
    phone: '+254712345678',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <SectionHeader title="Settings" description="Manage your account preferences and settings" />
        <PendingSourceBanner label="Settings currently use local typed state until dedicated settings APIs are available." />

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="dashboard-panel max-w-2xl p-7">
              <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />

                <FormField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <FormField
                  label="Department"
                  name="department"
                  as="select"
                  value={formData.department}
                  onChange={handleChange}
                  options={[
                    { value: 'Mathematics', label: 'Mathematics' },
                    { value: 'Physics', label: 'Physics' },
                    { value: 'Chemistry', label: 'Chemistry' },
                    { value: 'Biology', label: 'Biology' },
                  ]}
                />

                <div className="flex gap-3 pt-4">
                  <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="dashboard-panel max-w-2xl space-y-6 p-7">
              <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Exam Reminders</p>
                    <p className="text-xs text-muted-foreground">Get reminded before exam dates</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">Grading Alerts</p>
                    <p className="text-xs text-muted-foreground">Alert when exams need review</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 cursor-pointer">
                  <div>
                    <p className="font-medium text-foreground">System Updates</p>
                    <p className="text-xs text-muted-foreground">Receive system maintenance alerts</p>
                  </div>
                  <input type="checkbox" className="w-4 h-4" />
                </div>
              </div>

              <Button className="bg-primary hover:bg-primary/90">Save Preferences</Button>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="dashboard-panel max-w-2xl space-y-6 p-7">
              <h3 className="text-lg font-semibold text-foreground">Security Settings</h3>

              <div>
                <h4 className="font-medium text-foreground mb-4">Change Password</h4>
                <form className="space-y-4">
                  <FormField
                    label="Current Password"
                    name="currentPassword"
                    type="password"
                  />
                  <FormField
                    label="New Password"
                    name="newPassword"
                    type="password"
                  />
                  <FormField
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                  />
                  <Button className="bg-primary hover:bg-primary/90">Update Password</Button>
                </form>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium text-foreground mb-4">Two-Factor Authentication</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Enhance your account security with two-factor authentication
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="border-t border-border pt-6">
                <h4 className="font-medium text-foreground mb-4">Active Sessions</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Current Device</p>
                      <p className="text-xs text-muted-foreground">Chrome on Mac</p>
                    </div>
                    <span className="text-xs font-medium text-green-600">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </LayoutWrapper>
  );
}
