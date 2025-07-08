
'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldOff, MoreHorizontal, UserCog, Activity, AlertTriangle } from 'lucide-react';
import { type SubAdminPermissions } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


type SubAdminRole = 'Accounts' | 'Marketing' | 'Technical Support' | 'Content Management' | 'Custom';
type SubAdminStatus = 'Active' | 'Inactive';

interface SubAdmin {
  id: string;
  fullName: string;
  email: string;
  password?: string; // Should not be displayed in UI but needed for creation
  role: SubAdminRole;
  title: string;
  status: SubAdminStatus;
  lastLogin: string; // ISO string format
  permissions: SubAdminPermissions;
}

interface ActivityLog {
    id: string;
    timestamp: string;
    adminName: string;
    adminRole: string;
    action: string;
}

const permissionLabels: { key: keyof SubAdminPermissions; label: string }[] = [
    { key: 'canManageQuestions', label: 'Manage Question Bank' },
    { key: 'canViewUsers', label: 'View/Edit User Data' },
    { key: 'canManageEvents', label: 'Create/Manage Events' },
    { key: 'canManageBlogs', label: 'Upload/Manage Blogs' },
    { key: 'canViewRevenue', label: 'View Revenue & Payment Analytics' },
    { key: 'canEditPaymentSettings', label: 'Edit Receiving Account Details' },
    { key: 'canViewAnalytics', label: 'View General Analytics' },
    { key: 'canManageSubAdmins', label: 'Create Other Sub-Admin Accounts' },
    { key: 'canDeleteContent', label: 'Delete or Edit Existing Content' },
];

const initialSubAdminState: Omit<SubAdmin, 'id' | 'lastLogin' | 'status'> = {
    fullName: '',
    email: '',
    password: '',
    role: 'Content Management',
    title: '',
    permissions: {
        canManageQuestions: false,
        canViewUsers: false,
        canManageEvents: false,
        canManageBlogs: false,
        canViewRevenue: false,
        canEditPaymentSettings: false,
        canViewAnalytics: false,
        canManageSubAdmins: false,
        canDeleteContent: false,
    },
};


export default function AdminManagerPage() {
    const { toast } = useToast();
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);
    const [formData, setFormData] = useState<Omit<SubAdmin, 'id' | 'lastLogin' | 'status'>>(initialSubAdminState);

    useEffect(() => {
        try {
            const storedAdmins = localStorage.getItem('smartercat-sub-admins');
            if (storedAdmins) {
                setSubAdmins(JSON.parse(storedAdmins));
            }
        } catch (e) {
            console.error("Failed to parse sub-admins from localStorage", e);
            localStorage.removeItem('smartercat-sub-admins'); // Clear corrupted data
        }
        
        try {
            const storedLogs = localStorage.getItem('smartercat-activity-logs');
            if (storedLogs) {
                setActivityLogs(JSON.parse(storedLogs));
            }
        } catch (e) {
            console.error("Failed to parse activity logs from localStorage", e);
            localStorage.removeItem('smartercat-activity-logs'); // Clear corrupted data
        }
    }, []);

    const saveAdminsToStorage = (admins: SubAdmin[]) => {
        localStorage.setItem('smartercat-sub-admins', JSON.stringify(admins));
        setSubAdmins(admins);
    };

    const handleCreateOrUpdate = () => {
        if (!formData.fullName || !formData.email || (!formData.password && !editingAdmin)) {
            toast({ title: 'Error', description: 'Full Name, Email, and Password are required for new admins.', variant: 'destructive' });
            return;
        }

        // --- Start Validation ---
        const emailExists = subAdmins.some(
            admin => admin.email.toLowerCase() === formData.email.toLowerCase() && admin.id !== editingAdmin?.id
        );

        if (emailExists || formData.email.toLowerCase() === 'admin142@gmail.com') {
            toast({ title: 'Validation Error', description: 'This email address is already in use.', variant: 'destructive' });
            return;
        }
        // --- End Validation ---

        if (editingAdmin) {
            const updatedAdmins = subAdmins.map(admin => {
                if (admin.id === editingAdmin.id) {
                    const updatedData = { ...admin, ...formData };
                    // Only update password if a new one was provided
                    if (formData.password) {
                        updatedData.password = formData.password;
                    } else {
                        updatedData.password = admin.password; // Keep old password
                    }
                    return updatedData;
                }
                return admin;
            });
            saveAdminsToStorage(updatedAdmins);
            toast({ title: 'Success', description: 'Sub-admin updated successfully.' });
        } else {
            const newAdmin: SubAdmin = {
                id: `subadmin-${Date.now()}`,
                ...formData,
                password: formData.password!,
                status: 'Active',
                lastLogin: new Date().toISOString(),
            };
            saveAdminsToStorage([...subAdmins, newAdmin]);
            toast({ title: 'Success', description: 'New sub-admin created successfully.' });
        }
        
        setFormData(prev => ({...prev, password: ''})); // Clear password from form state
        setIsDialogOpen(false);
        setEditingAdmin(null);
    };

    const openEditDialog = (admin: SubAdmin) => {
        setEditingAdmin(admin);
        // Don't load existing password into the form for security
        setFormData({ ...admin, password: '' }); 
        setIsDialogOpen(true);
    };

    const openCreateDialog = () => {
        setEditingAdmin(null);
        setFormData(initialSubAdminState);
        setIsDialogOpen(true);
    };

    const handleStatusToggle = (admin: SubAdmin) => {
        const newStatus: SubAdminStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
        const updatedAdmins = subAdmins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a);
        saveAdminsToStorage(updatedAdmins);
        toast({ title: 'Status Updated', description: `${admin.fullName}'s account is now ${newStatus}.` });
    };

    const handleDelete = (adminId: string) => {
        const updatedAdmins = subAdmins.filter(a => a.id !== adminId);
        saveAdminsToStorage(updatedAdmins);
        toast({ title: 'Admin Deleted', description: 'The sub-admin account has been permanently removed.' });
    };

    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSelectChange = (name: 'role', value: string) => {
        setFormData(prev => ({ ...prev, [name]: value as SubAdminRole }));
    };
    
    const handlePermissionChange = (permissionKey: keyof SubAdminPermissions, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permissionKey]: checked,
            }
        }));
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <UserCog className="h-8 w-8 text-primary" /> Admin Manager
                </h1>
                <Button onClick={openCreateDialog}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Sub-Admin
                </Button>
            </div>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security & Data Notice</AlertTitle>
                <AlertDescription>
                   This Admin Manager module is for demonstration purposes. All data, including passwords, is stored in your browser's local storage and is <strong>not secure</strong>. Do not use real passwords. In a production application, this data must be managed by a secure backend with encrypted password storage.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="admins">
                <TabsList>
                    <TabsTrigger value="admins">Sub-Admin Accounts</TabsTrigger>
                    <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="admins">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Sub-Admin Accounts</CardTitle>
                            <CardDescription>Manage access and permissions for your admin team.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subAdmins.length > 0 ? subAdmins.map(admin => (
                                        <TableRow key={admin.id}>
                                            <TableCell>
                                                <div className="font-medium">{admin.fullName}</div>
                                                <div className="text-sm text-muted-foreground">{admin.email}</div>
                                            </TableCell>
                                            <TableCell>{admin.role}</TableCell>
                                            <TableCell>
                                                <Badge variant={admin.status === 'Active' ? 'default' : 'destructive'} className="bg-opacity-80">
                                                    {admin.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(admin.lastLogin).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => openEditDialog(admin)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleStatusToggle(admin)}>
                                                            {admin.status === 'Active' ? <ShieldOff className="mr-2 h-4 w-4"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                                                            {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                        </DropdownMenuItem>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()}><Trash2 className="mr-2 h-4 w-4 text-destructive"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the admin account for {admin.fullName}. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction onClick={() => handleDelete(admin.id)}>Delete</AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={5} className="text-center h-24">No sub-admins found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="logs">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle>Admin Activity Logs</CardTitle>
                            <CardDescription>A record of actions performed by administrators. This will populate as admins use the system.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {activityLogs.length > 0 ? activityLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell>
                                                <div className="font-medium">{log.adminName}</div>
                                                <div className="text-sm text-muted-foreground">{log.adminRole}</div>
                                            </TableCell>
                                            <TableCell>{log.action}</TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow><TableCell colSpan={3} className="text-center h-24">No activity logs found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>


            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) setEditingAdmin(null);
            }}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAdmin ? 'Edit Sub-Admin' : 'Create New Sub-Admin'}</DialogTitle>
                        <DialogDescription>{editingAdmin ? `Update details and permissions for ${editingAdmin.fullName}.` : 'Fill in the details to create a new admin account.'}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={formData.fullName} onChange={handleFormInputChange}/></div>
                            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleFormInputChange}/></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" placeholder={editingAdmin ? 'Leave blank to keep unchanged' : ''} value={formData.password || ''} onChange={handleFormInputChange}/>
                            </div>
                            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" value={formData.title} onChange={handleFormInputChange} placeholder="e.g. Senior Content Manager"/></div>
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" onValueChange={(value) => handleSelectChange('role', value)} value={formData.role}>
                                <SelectTrigger><SelectValue/></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Content Management">Content Management</SelectItem>
                                    <SelectItem value="Accounts">Accounts</SelectItem>
                                    <SelectItem value="Marketing">Marketing</SelectItem>
                                    <SelectItem value="Technical Support">Technical Support</SelectItem>
                                    <SelectItem value="Custom">Custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-2">Permissions</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-md">
                                {permissionLabels.map(({ key, label }) => (
                                    <div key={key} className="flex items-center space-x-2">
                                        <Checkbox id={key} checked={formData.permissions[key]} onCheckedChange={(checked) => handlePermissionChange(key, !!checked)} />
                                        <Label htmlFor={key} className="font-normal">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleCreateOrUpdate}>{editingAdmin ? 'Save Changes' : 'Create Admin'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
