import { Request, Response } from 'express';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export const getAdmissions = async (req: Request, res: Response) => {
  try {
    const apps = await prisma.admissionApplication.findMany();
    res.json(apps);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateAdmissionStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const app = await prisma.admissionApplication.update({
      where: { id },
      data: { status }
    });
    
    res.json({ message: 'Admission status updated', application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const getRolePermissions = async (req: Request, res: Response) => {
  try {
    const roles = ['student', 'faculty', 'hod', 'admin', 'finance_officer', 'librarian', 'management'];
    const result = [];

    for (const role of roles) {
      const usersCount = await prisma.user.count({ where: { role: role as any } });
      const rolePerms = await prisma.rolePermission.findMany({
        where: { role: role as any },
        include: { permission: true }
      });
      
      const permissions = rolePerms.map(rp => rp.permission.name);
      
      let name = role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ');
      let color = 'bg-slate-500';
      if (role === 'admin') color = 'bg-red-500';
      else if (role === 'student') color = 'bg-blue-500';
      else if (role === 'faculty') color = 'bg-green-500';
      else if (role === 'hod') color = 'bg-purple-500';
      else if (role === 'management') color = 'bg-indigo-500';
      else if (role === 'finance_officer') color = 'bg-yellow-500';
      else if (role === 'librarian') color = 'bg-orange-500';

      result.push({
        id: role,
        name: name,
        description: `${name} access role`,
        status: 'active',
        users: usersCount,
        permissions,
        color
      });
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const updateRolePermissions = async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body; // array of permission ids/names

    if (!role || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ success: false, message: 'Invalid data' });
    }

    // Since we don't have a way to populate Permission table right now if it's empty, 
    // let's ensure the permissions exist or just insert them.
    for (const permName of permissions) {
      await prisma.permission.upsert({
        where: { name: permName },
        update: {},
        create: {
          name: permName,
          category: 'General',
          description: permName
        }
      });
    }

    // Delete existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { role: role as any }
    });

    // Add new permissions
    for (const permName of permissions) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (perm) {
        await prisma.rolePermission.create({
          data: {
            role: role as any,
            permissionId: perm.id
          }
        });
      }
    }

    res.json({ success: true, message: 'Permissions updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



export const createAdminUser = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role } = req.body;
    
    // Validate role
    const validRoles: Role[] = ['admin', 'finance_officer', 'librarian', 'management', 'hod'];
    if (!validRoles.includes(role as Role)) {
      return res.status(400).json({ success: false, message: 'Invalid role for this endpoint' });
    }

    const plainPassword = `${role.split('_')[0]}123`;
    const defaultPassword = await bcrypt.hash(plainPassword, 10);
    const generatedId = `${role.toUpperCase().substring(0,3)}${Math.floor(100 + Math.random() * 900)}`;

    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: defaultPassword,
        role: role as Role,
      }
    });

    res.status(201).json({ success: true, user: created, credentials: { id: generatedId, password: plainPassword } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

