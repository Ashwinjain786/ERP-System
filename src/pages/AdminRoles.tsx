import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  Shield, Plus, Search, Users, Key, Lock, Unlock, Edit,
  Trash2, CheckCircle, XCircle, Eye, Settings, ChevronDown
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const MOCK_ROLES = [
  { id: 'role-001', name: 'Super Admin', description: 'Full system access', users: 3, permissions: ['all'], status: 'active', color: 'bg-red-500' },
  { id: 'role-002', name: 'Admin', description: 'Administrative access', users: 8, permissions: ['manage_students', 'manage_faculty', 'manage_courses', 'view_reports'], status: 'active', color: 'bg-blue-500' },
  { id: 'role-003', name: 'HOD', description: 'Department head access', users: 15, permissions: ['view_students', 'manage_attendance', 'view_results'], status: 'active', color: 'bg-violet-500' },
  { id: 'role-004', name: 'Faculty', description: 'Teaching staff access', users: 120, permissions: ['view_students', 'mark_attendance', 'upload_marks'], status: 'active', color: 'bg-green-500' },
  { id: 'role-005', name: 'Student', description: 'Student portal access', users: 1850, permissions: ['view_courses', 'view_attendance', 'view_marks', 'pay_fees'], status: 'active', color: 'bg-amber-500' },
  { id: 'role-006', name: 'Finance Officer', description: 'Financial management', users: 5, permissions: ['manage_fees', 'view_transactions', 'generate_reports'], status: 'active', color: 'bg-emerald-500' },
  { id: 'role-007', name: 'Librarian', description: 'Library management', users: 4, permissions: ['manage_books', 'manage_circulation', 'view_fines'], status: 'active', color: 'bg-cyan-500' },
];

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

function PermissionSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 bg-muted rounded-lg" />
      ))}
    </div>
  );
}

export default function AdminRoles() {
  const reduceMotion = useReducedMotion();
  const Wrapper = reduceMotion ? 'div' : motion.div;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(MOCK_ROLES[1]);
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set(MOCK_ROLES[1]?.permissions || []));

  const filteredRoles = MOCK_ROLES.filter(role =>
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description.toLowerCase().includes(searchQuery.toLowerCase())
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

  const selectRole = (role: typeof MOCK_ROLES[0]) => {
    setSelectedRole(role);
    setRolePermissions(new Set(role.permissions));
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
                <Button>
                  <Plus className="w-4 h-4 mr-2" /> Create Role
                </Button>
              </div>
            </Wrapper>

            <Wrapper variants={item}>
              <div className="grid gap-3 sm:grid-cols-4">
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Roles</p>
                    <p className="font-display text-2xl font-bold tabular-nums">{MOCK_ROLES.length}</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Active Roles</p>
                    <p className="font-display text-2xl font-bold tabular-nums text-success">
                      {MOCK_ROLES.filter(r => r.status === 'active').length}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-border/60 bg-card">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Total Users</p>
                    <p className="font-display text-2xl font-bold tabular-nums">
                      {MOCK_ROLES.reduce((acc, r) => acc + r.users, 0)}
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
                    <CardDescription>{filteredRoles.length} roles</CardDescription>
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
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" /> Edit
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
