
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, MoreHorizontal, Newspaper, Calendar, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Blog {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Silent';
  createdAt: string;
}

interface Event {
    id: string;
    title: string;
    description: string;
    date: string;
    status: 'Active' | 'Silent';
    createdAt: string;
}

const initialBlogState: Omit<Blog, 'id' | 'createdAt' | 'status'> = { title: '', description: '' };
const initialEventState: Omit<Event, 'id' | 'createdAt' | 'status'> = { title: '', description: '', date: '' };


export default function AdminContentPage() {
    const { toast } = useToast();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [isBlogDialogOpen, setIsBlogDialogOpen] = useState(false);
    const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);
    const [blogFormData, setBlogFormData] = useState(initialBlogState);
    const [eventFormData, setEventFormData] = useState(initialEventState);

    const loadContent = useCallback(() => {
        const storedBlogs = localStorage.getItem('path2med-blogs');
        const storedEvents = localStorage.getItem('path2med-events');
        setBlogs(storedBlogs ? JSON.parse(storedBlogs) : []);
        setEvents(storedEvents ? JSON.parse(storedEvents) : []);
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    // Blog Handlers
    const handleSaveBlog = () => {
        if (!blogFormData.title || !blogFormData.description) {
            toast({ title: 'Error', description: 'Title and Description are required.', variant: 'destructive' });
            return;
        }

        let updatedBlogs;
        if (editingBlog) {
            updatedBlogs = blogs.map(b => b.id === editingBlog.id ? { ...editingBlog, ...blogFormData } : b);
            toast({ title: 'Success', description: 'Article updated successfully.' });
        } else {
            const newBlog: Blog = {
                id: `blog-${Date.now()}`,
                ...blogFormData,
                status: 'Active',
                createdAt: new Date().toISOString(),
            };
            updatedBlogs = [newBlog, ...blogs];
            toast({ title: 'Success', description: 'New article created.' });
        }
        localStorage.setItem('path2med-blogs', JSON.stringify(updatedBlogs));
        setBlogs(updatedBlogs);
        setIsBlogDialogOpen(false);
    };

    const openEditBlogDialog = (blog: Blog) => {
        setEditingBlog(blog);
        setBlogFormData({ title: blog.title, description: blog.description });
        setIsBlogDialogOpen(true);
    };

    const openCreateBlogDialog = () => {
        setEditingBlog(null);
        setBlogFormData(initialBlogState);
        setIsBlogDialogOpen(true);
    };
    
    const handleToggleBlogStatus = (blog: Blog) => {
        const newStatus = blog.status === 'Active' ? 'Silent' : 'Active';
        const updatedBlogs = blogs.map(b => b.id === blog.id ? { ...b, status: newStatus } : b);
        localStorage.setItem('path2med-blogs', JSON.stringify(updatedBlogs));
        setBlogs(updatedBlogs);
        toast({ title: 'Status Updated', description: `Article is now ${newStatus}.` });
    };

    const handleDeleteBlog = (blogId: string) => {
        const updatedBlogs = blogs.filter(b => b.id !== blogId);
        localStorage.setItem('path2med-blogs', JSON.stringify(updatedBlogs));
        setBlogs(updatedBlogs);
        toast({ title: 'Article Deleted', description: 'The article has been removed.' });
    };

    // Event Handlers
    const handleSaveEvent = () => {
        if (!eventFormData.title || !eventFormData.date) {
            toast({ title: 'Error', description: 'Event Title and Date are required.', variant: 'destructive' });
            return;
        }
        let updatedEvents;
        if (editingEvent) {
            updatedEvents = events.map(e => e.id === editingEvent.id ? { ...editingEvent, ...eventFormData } : e);
            toast({ title: 'Success', description: 'Event updated.' });
        } else {
            const newEvent: Event = {
                id: `event-${Date.now()}`,
                ...eventFormData,
                status: 'Active',
                createdAt: new Date().toISOString(),
            };
            updatedEvents = [newEvent, ...events];
            toast({ title: 'Success', description: 'New event created.' });
        }
        localStorage.setItem('path2med-events', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        setIsEventDialogOpen(false);
    };

     const openEditEventDialog = (event: Event) => {
        setEditingEvent(event);
        setEventFormData({ title: event.title, description: event.description, date: event.date });
        setIsEventDialogOpen(true);
    };

    const openCreateEventDialog = () => {
        setEditingEvent(null);
        setEventFormData(initialEventState);
        setIsEventDialogOpen(true);
    };
    
    const handleToggleEventStatus = (event: Event) => {
        const newStatus = event.status === 'Active' ? 'Silent' : 'Active';
        const updatedEvents = events.map(e => e.id === event.id ? { ...e, status: newStatus } : e);
        localStorage.setItem('path2med-events', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        toast({ title: 'Status Updated', description: `Event is now ${newStatus}.` });
    };

    const handleDeleteEvent = (eventId: string) => {
        const updatedEvents = events.filter(e => e.id !== eventId);
        localStorage.setItem('path2med-events', JSON.stringify(updatedEvents));
        setEvents(updatedEvents);
        toast({ title: 'Event Deleted', description: 'The event has been removed.' });
    };


  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Newspaper className="h-8 w-8 text-primary" /> Manage Content
        </h1>
      </div>
       <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Demonstration Mode</AlertTitle>
            <AlertDescription>
               Content is stored in your browser's local storage and will not persist across different browsers or devices.
            </AlertDescription>
        </Alert>

       <Tabs defaultValue="blogs">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="blogs">Blogs & Articles</TabsTrigger>
                <TabsTrigger value="events">Events & Announcements</TabsTrigger>
            </TabsList>

            <TabsContent value="blogs" className="mt-4">
                 <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Manage Blogs & Articles</CardTitle>
                            <Button onClick={openCreateBlogDialog}><PlusCircle className="mr-2 h-4 w-4"/>Add Article</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {blogs.length > 0 ? blogs.map(blog => (
                                    <TableRow key={blog.id}>
                                        <TableCell className="font-medium max-w-sm truncate">{blog.title}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch id={`status-${blog.id}`} checked={blog.status === 'Active'} onCheckedChange={() => handleToggleBlogStatus(blog)}/>
                                                <Label htmlFor={`status-${blog.id}`}><Badge variant={blog.status === 'Active' ? 'default' : 'secondary'}>{blog.status}</Badge></Label>
                                            </div>
                                        </TableCell>
                                        <TableCell>{new Date(blog.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => openEditBlogDialog(blog)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Delete Article?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the article. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteBlog(blog.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No articles found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="events" className="mt-4">
                 <Card className="shadow-lg">
                    <CardHeader>
                         <div className="flex justify-between items-center">
                            <CardTitle>Manage Events & Announcements</CardTitle>
                            <Button onClick={openCreateEventDialog}><PlusCircle className="mr-2 h-4 w-4"/>Add Event</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Event Date</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                            <TableBody>
                                 {events.length > 0 ? events.map(event => (
                                    <TableRow key={event.id}>
                                        <TableCell className="font-medium max-w-sm truncate">{event.title}</TableCell>
                                        <TableCell>{event.date ? new Date(event.date).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                             <div className="flex items-center space-x-2">
                                                <Switch id={`status-${event.id}`} checked={event.status === 'Active'} onCheckedChange={() => handleToggleEventStatus(event)}/>
                                                <Label htmlFor={`status-${event.id}`}><Badge variant={event.status === 'Active' ? 'default' : 'secondary'}>{event.status}</Badge></Label>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => openEditEventDialog(event)}><Edit className="mr-2 h-4 w-4"/>Edit</DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild><DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4"/>Delete</DropdownMenuItem></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Delete Event?</AlertDialogTitle><AlertDialogDescription>This will permanently remove the event. This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteEvent(event.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No events found.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
       </Tabs>


        <Dialog open={isBlogDialogOpen} onOpenChange={(open) => { if (!open) setEditingBlog(null); setIsBlogDialogOpen(open); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingBlog ? 'Edit Article' : 'Create New Article'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div><Label htmlFor="blog-title">Title</Label><Input id="blog-title" value={blogFormData.title} onChange={e => setBlogFormData({...blogFormData, title: e.target.value})} /></div>
                    <div><Label htmlFor="blog-desc">Description / Content</Label><Textarea id="blog-desc" rows={6} value={blogFormData.description} onChange={e => setBlogFormData({...blogFormData, description: e.target.value})} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBlogDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveBlog}>{editingBlog ? 'Save Changes' : 'Create Article'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        <Dialog open={isEventDialogOpen} onOpenChange={(open) => { if (!open) setEditingEvent(null); setIsEventDialogOpen(open); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div><Label htmlFor="event-title">Title</Label><Input id="event-title" value={eventFormData.title} onChange={e => setEventFormData({...eventFormData, title: e.target.value})} /></div>
                    <div><Label htmlFor="event-date">Date</Label><Input id="event-date" type="date" value={eventFormData.date} onChange={e => setEventFormData({...eventFormData, date: e.target.value})} /></div>
                    <div><Label htmlFor="event-desc">Description</Label><Textarea id="event-desc" value={eventFormData.description} onChange={e => setEventFormData({...eventFormData, description: e.target.value})} /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEvent}>{editingEvent ? 'Save Changes' : 'Create Event'}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}

    