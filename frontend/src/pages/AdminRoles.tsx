import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Shield, Search, Users, Key, Save,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
type AdminRole = {
  id: string;
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | string;
  users?: number;
  permissions?: string[];
  color?: string;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

import { useQuery } from '@tanstack/react-query';
import { apiConfig } from '@/api/apiCall';
import { useRoleMutations } from '@/features/admin/hooks';

function useRoles() {
  return useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      const res = await fetch(`${apiConfig.baseUrl}/admin/roles`, {
        headers: {
          'Content-Type': 'application/json',
          ...apiConfig.headers,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch roles');
      return res.json();
    },
  });
}
const PERMISSIONS = [
  { id: 'manage_students', name: 'Manage Students', category: 'Student Management', description: 'Add, edit, delete student records' },
  { id: 'view_students', name: 'View Students', category: 'Student Management', description: 'View student information' },
  { id: 'manage_faculty', name: 'Manage Faculty', category: 'Faculty Management', description: 'Add, edit, delete faculty records' },
  { id: 'view_faculty', name: 'View Faculty', category: 'Faculty Management', description: 'View faculty information' },
  { id: 'manage_courses', name: 'Manage Courses', category: 'Academics', description: 'Create and edit courses' },
  { id: 'view_courses', name: 'View Courses', category: 'Academics', description: 'View course catalog' },
  { id: 'manage_attendance', name: 'Manage Attendance', category: 'Attendance', description: 'Mark and edit attendance' },
  { id: 'view_attendance', name: 'View Attendance', category: 'Attendance', description: 'View attendance records' },
  { id: 'upload_marks', name: 'Upload Marks', category: 'Examinations', description: 'Submit examination marks' },
  { id: 'view_results', name: 'View Results', category: 'Examinations', description: 'View examination results' },
  { id: 'manage_fees', name: 'Manage Fees', category: 'Finance', description: 'Manage fee structures' },
  { id: 'view_transactions', name: 'View Transactions', category: 'Finance', description: 'View payment transactions' },
  { id: 'manage_books', name: 'Manage Books', category: 'Library', description: 'Add and edit books' },
  { id: 'view_reports', name: 'View Reports', category: 'Reports', description: 'Access analytical reports' },
  { id: 'manage_users', name: 'Manage Users', category: 'Administration', description: 'Create and edit users' },
  { id: 'manage_roles', name: 'Manage Roles', category: 'Administration', description: 'Create and edit roles' },
];

const groupedPermissions: Record<string, typeof PERMISSIONS> = {};
for (const perm of PERMISSIONS) {
  if (perm && perm.category) {
    if (!groupedPermissions[perm.category]) {
      groupedPermissions[perm.category] = [];
    }
    groupedPermissions[perm.category]!.push(perm);
  }
}

export default function AdminRoles() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set());

  const roleMutations = useRoleMutations();

  const { data: rolesData } = useRoles();
  const roles = (Array.isArray(rolesData) ? rolesData : []) as AdminRole[];
  const selectedRole = roles.find(role => role.id === selectedRoleId) ?? roles[0] ?? null;

  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePermission = (permId: string) => {
    const newPerms = new Set(rolePermissions);
    if (newPerms.has(permId)) {
      newPerms.delete(permId);
    } else {
      newPerms.add(permId);
    }
    setRolePermissions(newPerms);
  };

  const selectRole = (role: AdminRole) => {
    setSelectedRoleId(role.id);
    setRolePermissions(new Set(role.permissions || []));
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    try {
      await roleMutations.updatePermissions.mutateAsync({
        role: selectedRole.id,
        permissions: Array.from(rolePermissions)
      });
      // Optionally show a success toast here
    } catch (err) {
      console.error(err);
      alert('Failed to save permissions');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b-2 border-border/60 bg-gradient-to-r from-indigo-500/5 via-background to-background">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
          <Wrapper variants={container} initial="hidden" animate="show" className="space-y-5">
            <Wrapper variants={item}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl font-bold tracking-tight">Role-Based Access</h1>
                    <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
                  </div>
                </div>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-4">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Roles</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{roles.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Active Roles</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-success">
                      {roles.filter((r) => r.status === 'active').length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="font-display text-2xl font-bold tabular-nums">
                      {roles.reduce((acc: number, r) => acc + (r.users || 0), 0)}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Permissions</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{PERMISSIONS.length}</p>
                  </CardContent>
                </Card>
              </div>
            </Wrapper>
          </Wrapper>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="border-2 border-border/60">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-display">Roles</CardTitle>
                    <CardDescription>Select from {filteredRoles.length} predefined roles</CardDescription>
                  </div>
                </div>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search roles..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Wrapper variants={container} initial="hidden" animate="show">
                  <div className="space-y-2">
                    {filteredRoles.map((role) => (
                      <motion.button
                        key={role.id}
                        variants={item}
                        onClick={() => selectRole(role)}
                        className={cn(
                          "w-full p-3 rounded-xl border-2 text-left transition-all",
                          selectedRole?.id === role.id
                            ? "border-primary bg-primary/5"
                            : "border-border/60 hover:border-primary/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg", role.color)}>
                            <Shield className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{role.name}</p>
                            <p className="text-xs text-muted-foreground">{role.users} users</p>
                          </div>
                          {role.status === 'active' ? (
                            <CheckCircle className="w-4 h-4 text-success" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </Wrapper>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedRole && (
              <Card className="border-2 border-border/60">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", selectedRole.color)}>
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-display">{selectedRole.name}</CardTitle>
                        <CardDescription>{selectedRole.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="default" size="sm" onClick={handleSavePermissions} disabled={roleMutations.updatePermissions.isPending}>
                        {roleMutations.updatePermissions.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Permissions
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="w-4 h-4 mr-1" /> {selectedRole.users} Users
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Wrapper variants={container} initial="hidden" animate="show">
                    <div className="space-y-6">
                      {Object.entries(groupedPermissions).map(([category, perms]) => (
                        <div key={category}>
                          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
                            <Key className="w-4 h-4 text-muted-foreground" />
                            {category}
                          </h3>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {perms.map((perm) => (
                              <motion.div
                                key={perm.id}
                                variants={item}
                                className={cn(
                                  "flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer",
                                  rolePermissions.has(perm.id) || rolePermissions.has('all')
                                    ? "border-primary/30 bg-primary/5"
                                    : "border-border/60 hover:border-primary/20"
                                )}
                                onClick={() => togglePermission(perm.id)}
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{perm.name}</p>
                                  <p className="text-xs text-muted-foreground">{perm.description}</p>
                                </div>
                                <div className={cn(
                                  "ml-2 p-1 rounded-md transition-colors",
                                  rolePermissions.has(perm.id) || rolePermissions.has('all')
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                                )}>
                                  {rolePermissions.has(perm.id) || rolePermissions.has('all') ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Wrapper>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
