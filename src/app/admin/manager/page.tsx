
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, ShieldCheck, ShieldOff, MoreHorizontal, UserCog, Activity, AlertTriangle, Building } from 'lucide-react';
import { type SubAdminPermissions } from '@/hooks/use-auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { logActivity } from '@/lib/activity-log';
import { provinces, citiesByProvince } from '@/lib/pakistan-data';


type SubAdminRole = 'Accounts' | 'Marketing' | 'Technical Support' | 'Content Management' | 'Custom';
type SubAdminStatus = 'Active' | 'Inactive';

interface SubAdmin {
  id: string;
  fullName: string;
  email: string;
  password?: string;
  role: SubAdminRole;
  title: string;
  status: SubAdminStatus;
  lastLogin: string;
  permissions: SubAdminPermissions;
}

interface ActivityLog {
    id: string;
    timestamp: string;
    adminName: string;
    adminRole: string;
    action: string;
}

interface Institution {
    _id: string;
    name: string;
    institutionType: string;
    businessType: string;
    province: string;
    city: string;
    admin: {
        name: string;
        email: string;
    };
    createdAt: string;
}

interface NewInstitutionFormData {
    institutionName: string;
    institutionType: 'Public' | 'Private' | '';
    businessType: 'College' | 'School' | 'Academy' | '';
    province: string;
    city: string;
    adminName: string;
    adminEmail: string;
    password: '';
}

const initialNewInstitutionState: NewInstitutionFormData = {
    institutionName: '',
    institutionType: '',
    businessType: '',
    province: '',
    city: '',
    adminName: '',
    adminEmail: '',
    password: '',
};

const permissionLabels: { key: keyof SubAdminPermissions; label: string }[] = [
    { key: 'canManageQuestions', label: 'Manage Question Bank' },
    { key: 'canViewUsers', label: 'View/Edit User Data' },
    { key: 'canManageEvents', label: 'Create/Manage Events' },
    { key: 'canManageBlogs', label: 'Upload/Manage Blogs' },
    { key: 'canViewAnalytics', label: 'View Analytics' },
    { key: 'canEditPaymentSettings', label: 'Edit Payment Settings' },
    { key: 'canManageSubAdmins', label: 'Create Other Sub-Admins' },
    { key: 'canDeleteContent', label: 'Delete or Edit Content' },
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
        canViewAnalytics: false,
        canEditPaymentSettings: false,
        canManageSubAdmins: false,
        canDeleteContent: false,
    },
};


export default function AdminManagerPage() {
    const { toast } = useToast();
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
    const [institutions, setInstitutions] = useState<Institution[]>([]);
    
    const [isSubAdminDialogOpen, setIsSubAdminDialogOpen] = useState(false);
    const [isInstitutionDialogOpen, setIsInstitutionDialogOpen] = useState(false);

    const [editingAdmin, setEditingAdmin] = useState<SubAdmin | null>(null);
    const [subAdminFormData, setSubAdminFormData] = useState<Omit<SubAdmin, 'id' | 'lastLogin' | 'status'>>(initialSubAdminState);
    const [institutionFormData, setInstitutionFormData] = useState<NewInstitutionFormData>(initialNewInstitutionState);
    const [selectedInstProvince, setSelectedInstProvince] = useState('');
    const availableInstCities = citiesByProvince[selectedInstProvince] || [];

    const loadDataFromStorage = useCallback(() => {
        // Mock data loading
        try {
            const storedAdmins = localStorage.getItem('dojobeacon-sub-admins');
            if (storedAdmins) setSubAdmins(JSON.parse(storedAdmins));
            
            const storedLogs = localStorage.getItem('dojobeacon-activity-logs');
            if (storedLogs) setActivityLogs(JSON.parse(storedLogs));
            
            const storedInstitutions = localStorage.getItem('dojobeacon-institutions-superadmin-mock');
             if (storedInstitutions) setInstitutions(JSON.parse(storedInstitutions));


        } catch (e) {
            console.error("Failed to parse data from localStorage", e);
        }
    }, []);

    useEffect(() => {
        loadDataFromStorage();
    }, [loadDataFromStorage]);
    
    const refreshLogs = () => {
        const storedLogs = localStorage.getItem('dojobeacon-activity-logs');
        setActivityLogs(storedLogs ? JSON.parse(storedLogs) : []);
    };

    const handleSaveSubAdmin = () => {
        if (!subAdminFormData.fullName || !subAdminFormData.email || (!subAdminFormData.password && !editingAdmin)) {
            toast({ title: 'Error', description: 'Full Name, Email, and Password are required for new admins.', variant: 'destructive' });
            return;
        }

        const emailExists = subAdmins.some(
            admin => admin.email.toLowerCase() === subAdminFormData.email.toLowerCase() && admin.id !== editingAdmin?.id
        );
        if (emailExists || subAdminFormData.email.toLowerCase() === 'admin142@gmail.com') {
            toast({ title: 'Validation Error', description: 'This email address is already in use.', variant: 'destructive' });
            return;
        }

        if (editingAdmin) {
            let updatedAdmins = subAdmins.map(admin => 
                admin.id === editingAdmin.id ? { 
                    ...admin, 
                    ...subAdminFormData,
                    password: subAdminFormData.password ? subAdminFormData.password : admin.password 
                } : admin
            );
            setSubAdmins(updatedAdmins);
            localStorage.setItem('dojobeacon-sub-admins', JSON.stringify(updatedAdmins));
            logActivity(`Updated sub-admin: ${subAdminFormData.fullName}`);
            toast({ title: 'Success', description: 'Sub-admin updated successfully.' });
        } else {
            const newAdmin: SubAdmin = {
                id: `subadmin-${Date.now()}`,
                ...subAdminFormData,
                password: subAdminFormData.password!,
                status: 'Active',
                lastLogin: new Date().toISOString(),
            };
            const updatedAdmins = [...subAdmins, newAdmin];
            setSubAdmins(updatedAdmins);
            localStorage.setItem('dojobeacon-sub-admins', JSON.stringify(updatedAdmins));
            logActivity(`Created sub-admin: ${subAdminFormData.fullName}`);
            toast({ title: 'Success', description: 'New sub-admin created successfully.' });
        }
        
        refreshLogs();
        setIsSubAdminDialogOpen(false);
        setEditingAdmin(null);
    };
    
    const handleSaveInstitution = () => {
        // This would be a fetch call to the backend in a real app
        // For now, we'll mock it with localStorage
        const requiredFields: (keyof NewInstitutionFormData)[] = ['institutionName', 'institutionType', 'businessType', 'province', 'city', 'adminName', 'adminEmail', 'password'];
        if (requiredFields.some(field => !institutionFormData[field])) {
            toast({ title: "Missing Information", description: "Please fill out all fields for the new institution.", variant: "destructive" });
            return;
        }
        
        const newInstitution = {
            _id: `inst-mock-${Date.now()}`,
            name: institutionFormData.institutionName,
            institutionType: institutionFormData.institutionType,
            businessType: institutionFormData.businessType,
            province: institutionFormData.province,
            city: institutionFormData.city,
            admin: {
                name: institutionFormData.adminName,
                email: institutionFormData.adminEmail,
            },
            createdAt: new Date().toISOString(),
        };

        const updatedInstitutions = [...institutions, newInstitution];
        setInstitutions(updatedInstitutions);
        localStorage.setItem('dojobeacon-institutions-superadmin-mock', JSON.stringify(updatedInstitutions));
        logActivity(`Created institution: ${institutionFormData.institutionName}`);
        toast({ title: 'Success', description: 'New institution created successfully (mock).' });
        setIsInstitutionDialogOpen(false);
    };

    const openEditDialog = (admin: SubAdmin) => {
        setEditingAdmin(admin);
        setSubAdminFormData({ ...admin, password: '' }); 
        setIsSubAdminDialogOpen(true);
    };

    const openCreateSubAdminDialog = () => {
        setEditingAdmin(null);
        setSubAdminFormData(initialSubAdminState);
        setIsSubAdminDialogOpen(true);
    };

    const openCreateInstitutionDialog = () => {
        setInstitutionFormData(initialNewInstitutionState);
        setSelectedInstProvince('');
        setIsInstitutionDialogOpen(true);
    };

    const handleStatusToggle = (admin: SubAdmin) => {
        const newStatus: SubAdminStatus = admin.status === 'Active' ? 'Inactive' : 'Active';
        const updatedAdmins = subAdmins.map(a => a.id === admin.id ? { ...a, status: newStatus } : a);
        setSubAdmins(updatedAdmins);
        localStorage.setItem('dojobeacon-sub-admins', JSON.stringify(updatedAdmins));
        logActivity(`Set status of ${admin.fullName} to ${newStatus}`);
        refreshLogs();
        toast({ title: 'Status Updated', description: `${admin.fullName}'s account is now ${newStatus}.` });
    };

    const handleDelete = (adminId: string, adminName: string) => {
        const updatedAdmins = subAdmins.filter(a => a.id !== adminId);
        setSubAdmins(updatedAdmins);
        localStorage.setItem('dojobeacon-sub-admins', JSON.stringify(updatedAdmins));
        logActivity(`Deleted sub-admin: ${adminName}`);
        refreshLogs();
        toast({ title: 'Admin Deleted', description: 'The sub-admin account has been permanently removed.' });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <UserCog className="h-8 w-8 text-primary" /> Admin & Institution Manager
                </h1>
            </div>

            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Security & Data Notice</AlertTitle>
                <AlertDescription>
                   This module is for demonstration purposes. All data, including passwords, is stored in your browser's local storage and is <strong>not secure</strong>. In a production application, this data must be managed by a secure backend.
                </AlertDescription>
            </Alert>

            <Tabs defaultValue="admins">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="admins">Sub-Admin Accounts</TabsTrigger>
                    <TabsTrigger value="institutions">Manage Institutions</TabsTrigger>
                    <TabsTrigger value="logs">Activity Logs</TabsTrigger>
                </TabsList>
                <TabsContent value="admins" className="mt-4">
                    <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Sub-Admin Accounts</CardTitle>
                                    <CardDescription>Manage access and permissions for your admin team.</CardDescription>
                                </div>
                                <Button onClick={openCreateSubAdminDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Sub-Admin
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last Login</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {subAdmins.length > 0 ? subAdmins.map(admin => (
                                        <TableRow key={admin.id}>
                                            <TableCell><div className="font-medium">{admin.fullName}</div><div className="text-sm text-muted-foreground">{admin.email}</div></TableCell>
                                            <TableCell>{admin.role}</TableCell>
                                            <TableCell><Badge variant={admin.status === 'Active' ? 'default' : 'destructive'} className="bg-opacity-80">{admin.status}</Badge></TableCell>
                                            <TableCell>{new Date(admin.lastLogin).toLocaleString()}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
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
                                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(admin.id, admin.fullName)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No sub-admins found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="institutions" className="mt-4">
                     <Card className="shadow-lg">
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle>Institutions</CardTitle>
                                    <CardDescription>Create, view, and manage institutional accounts.</CardDescription>
                                </div>
                                <Button onClick={openCreateInstitutionDialog}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Create Institution
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Institution</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Admin</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {institutions.length > 0 ? institutions.map(inst => (
                                        <TableRow key={inst._id}>
                                            <TableCell className="font-medium">{inst.name}</TableCell>
                                            <TableCell><Badge variant="secondary">{inst.institutionType}</Badge> <Badge variant="outline">{inst.businessType}</Badge></TableCell>
                                            <TableCell><div>{inst.admin.name}</div><div className="text-xs text-muted-foreground">{inst.admin.email}</div></TableCell>
                                            <TableCell>{inst.city}, {inst.province}</TableCell>
                                            <TableCell>{new Date(inst.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm">Details</Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : <TableRow><TableCell colSpan={6} className="text-center h-24">No institutions found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="logs" className="mt-4">
                     <Card className="shadow-lg">
                        <CardHeader><CardTitle>Admin Activity Logs</CardTitle><CardDescription>A record of actions performed by administrators.</CardDescription></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Admin</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {activityLogs.length > 0 ? activityLogs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                            <TableCell><div className="font-medium">{log.adminName}</div><div className="text-sm text-muted-foreground">{log.adminRole}</div></TableCell>
                                            <TableCell>{log.action}</TableCell>
                                        </TableRow>
                                    )).sort((a,b) => new Date(b.props.children[0].props.children).getTime() - new Date(a.props.children[0].props.children).getTime())
                                    : <TableRow><TableCell colSpan={3} className="text-center h-24">No activity logs found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                     </Card>
                </TabsContent>
            </Tabs>

            <Dialog open={isSubAdminDialogOpen} onOpenChange={(open) => { if (!open) setEditingAdmin(null); setIsSubAdminDialogOpen(open); }}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingAdmin ? 'Edit Sub-Admin' : 'Create New Sub-Admin'}</DialogTitle>
                        <DialogDescription>{editingAdmin ? `Update details for ${editingAdmin.fullName}.` : 'Fill in the details for the new admin account.'}</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="fullName">Full Name</Label><Input id="fullName" name="fullName" value={subAdminFormData.fullName} onChange={e => setSubAdminFormData({...subAdminFormData, fullName: e.target.value})}/></div>
                            <div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={subAdminFormData.email} onChange={e => setSubAdminFormData({...subAdminFormData, email: e.target.value})}/></div>
                        </div>
                        {editingAdmin && (
                            <div>
                                <Label>Current Password (Visible for Super Admin)</Label>
                                <Input type="text" value={editingAdmin.password || ''} readOnly className="font-mono bg-muted border-dashed"/>
                                <p className="text-xs text-muted-foreground mt-1">This is visible for demonstration. In a real app, passwords must be encrypted and never displayed.</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="password">{editingAdmin ? 'Set New Password' : 'Password'}</Label>
                                <Input id="password" name="password" type="password" placeholder={editingAdmin ? 'Leave blank to keep unchanged' : '••••••••'} value={subAdminFormData.password || ''} onChange={e => setSubAdminFormData({...subAdminFormData, password: e.target.value})}/>
                            </div>
                            <div><Label htmlFor="title">Title</Label><Input id="title" name="title" value={subAdminFormData.title} onChange={e => setSubAdminFormData({...subAdminFormData, title: e.target.value})} placeholder="e.g. Senior Content Manager"/></div>
                        </div>
                        <div>
                            <Label htmlFor="role">Role</Label>
                            <Select name="role" onValueChange={(value) => setSubAdminFormData({...subAdminFormData, role: value as SubAdminRole})} value={subAdminFormData.role}>
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
                                        <Checkbox id={key} checked={subAdminFormData.permissions[key]} onCheckedChange={(checked) => setSubAdminFormData(prev => ({ ...prev, permissions: { ...prev.permissions, [key]: !!checked } }))} />
                                        <Label htmlFor={key} className="font-normal">{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={() => setIsSubAdminDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSubAdmin}>{editingAdmin ? 'Save Changes' : 'Create Admin'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
            
            <Dialog open={isInstitutionDialogOpen} onOpenChange={setIsInstitutionDialogOpen}>
                 <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Building className="h-6 w-6 text-primary"/>Create New Institution</DialogTitle>
                        <DialogDescription>Fill in the details for the new institution and its primary administrator account.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                         <h3 className="text-md font-semibold text-muted-foreground border-b pb-1">Institution Details</h3>
                        <div><Label htmlFor="inst-name">Institution Name</Label><Input id="inst-name" name="institutionName" value={institutionFormData.institutionName} onChange={e => setInstitutionFormData({...institutionFormData, institutionName: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <Label htmlFor="inst-type">Institution Type</Label>
                                <Select name="institutionType" value={institutionFormData.institutionType} onValueChange={(value) => setInstitutionFormData({...institutionFormData, institutionType: value as NewInstitutionFormData['institutionType']})}>
                                    <SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger>
                                    <SelectContent><SelectItem value="Public">Public</SelectItem><SelectItem value="Private">Private</SelectItem></SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="inst-business-type">Business Type</Label>
                                <Select name="businessType" value={institutionFormData.businessType} onValueChange={(value) => setInstitutionFormData({...institutionFormData, businessType: value as NewInstitutionFormData['businessType']})}>
                                    <SelectTrigger><SelectValue placeholder="Select Type"/></SelectTrigger>
                                    <SelectContent><SelectItem value="College">College</SelectItem><SelectItem value="School">School</SelectItem><SelectItem value="Academy">Academy</SelectItem></SelectContent>
                                </Select>
                            </div>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                           <div>
                                <Label htmlFor="inst-province">Province</Label>
                                <Select name="province" value={institutionFormData.province} onValueChange={(value) => {setInstitutionFormData({...institutionFormData, province: value, city: ''}); setSelectedInstProvince(value);}}>
                                    <SelectTrigger><SelectValue placeholder="Select Province"/></SelectTrigger>
                                    <SelectContent>{provinces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                                </Select>
                           </div>
                            <div>
                                <Label htmlFor="inst-city">City</Label>
                                <Select name="city" value={institutionFormData.city} onValueChange={(value) => setInstitutionFormData({...institutionFormData, city: value})} disabled={!selectedInstProvince}>
                                    <SelectTrigger><SelectValue placeholder="Select City"/></SelectTrigger>
                                    <SelectContent>{availableInstCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>

                        <h3 className="text-md font-semibold text-muted-foreground border-b pb-1 pt-4">Administrator Account</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><Label htmlFor="admin-name">Admin Full Name</Label><Input id="admin-name" name="adminName" value={institutionFormData.adminName} onChange={e => setInstitutionFormData({...institutionFormData, adminName: e.target.value})} /></div>
                             <div><Label htmlFor="admin-email">Admin Email</Label><Input id="admin-email" name="adminEmail" type="email" value={institutionFormData.adminEmail} onChange={e => setInstitutionFormData({...institutionFormData, adminEmail: e.target.value})} /></div>
                        </div>
                        <div>
                            <Label htmlFor="admin-password">Password</Label>
                            <Input id="admin-password" name="password" type="password" value={institutionFormData.password} onChange={e => setInstitutionFormData({...institutionFormData, password: e.target.value})} />
                        </div>
                    </div>
                     <DialogFooter>
                        <Button variant="outline" onClick={() => setIsInstitutionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveInstitution}>Create Institution</Button>
                    </DialogFooter>
                 </DialogContent>
            </Dialog>

        </div>
    );
}
