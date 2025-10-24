/**
 * UsersPage - Página de gestión de usuarios
 * 
 * Características:
 * - Lista de usuarios con roles y estados
 * - Crear nuevo usuario
 * - Editar usuario existente
 * - Activar/desactivar usuarios
 * - Eliminar usuarios
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Users as UsersIcon,
    Shield,
    CheckCircle,
    XCircle,
    UserCheck,
} from 'lucide-react';
import type { User } from '@/types/blog.types';
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    getUsersStats,
} from '@/services/userService';

interface UserFormData {
    email: string;
    displayName: string;
    firstName: string;
    lastName: string;
    userName: string;
    avatar?: string;
    bio?: string;
    role: 'admin' | 'collaborator' | 'user' | 'guest';
    isVerified: boolean;
    isActive: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'collaborator' | 'user' | 'guest'>('all');
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<UserFormData>({
        email: '',
        displayName: '',
        firstName: '',
        lastName: '',
        userName: '',
        avatar: '',
        bio: '',
        role: 'user',
        isVerified: false,
        isActive: true,
    });

    // Cargar datos
    const loadData = async () => {
        setLoading(true);
        try {
            const [allUsers, userStats] = await Promise.all([
                getUsers(),
                getUsersStats(),
            ]);

            setUsers(allUsers);
            setStats(userStats);
        } catch (error) {
            // Error al cargar usuarios
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Filtrar usuarios
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.userName?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = filterRole === 'all' || user.role === filterRole;
        
        return matchesSearch && matchesRole;
    });

    const resetForm = () => {
        setFormData({
            email: '',
            displayName: '',
            firstName: '',
            lastName: '',
            userName: '',
            avatar: '',
            bio: '',
            role: 'user',
            isVerified: false,
            isActive: true,
        });
        setEditingUser(null);
    };

    const handleCreate = async () => {
        try {
            await createUser(formData);
            setIsCreateDialogOpen(false);
            resetForm();
            loadData();
        } catch (error: any) {
            // Error al crear usuario
            alert(`❌ ${error.message || 'Error al crear usuario'}`);
        }
    };

    const handleEdit = async () => {
        if (!editingUser) return;

        try {
            await updateUser(editingUser.id, formData);
            setEditingUser(null);
            resetForm();
            loadData();
        } catch (error: any) {
            // Error al actualizar usuario
            alert(`❌ ${error.message || 'Error al actualizar el usuario'}`);
        }
    };

    const handleDelete = async (user: User) => {
        if (user.role === 'admin') {
            alert('⚠️ No se puede eliminar un usuario administrador.');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar a "${user.displayName}"?`)) {
            return;
        }

        try {
            await deleteUser(user.id);
            loadData();
        } catch (error: any) {
            // Error al eliminar usuario
            alert(`❌ ${error.message || 'Error al eliminar el usuario'}`);
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await toggleUserActive(user.id);
            loadData();
        } catch (error: any) {
            // Error al cambiar estado
            alert(`❌ ${error.message || 'Error al cambiar el estado'}`);
        }
    };

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setFormData({
            email: user.email,
            displayName: user.displayName,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            userName: user.userName || '',
            avatar: user.avatar || '',
            bio: user.bio || '',
            role: user.role,
            isVerified: user.isVerified,
            isActive: user.isActive ?? true, // Usar nullish coalescing para solo usar true si isActive es null o undefined
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
                    <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
                </div>
                <Button onClick={() => {
                    resetForm();
                    setIsCreateDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                </Button>
            </div>

            {/* Estadísticas */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <UsersIcon className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Total</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">{stats.total}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-purple-500" />
                            <h3 className="font-semibold">Admins</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">{stats.admins}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <h3 className="font-semibold">Verificados</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">{stats.verified}</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-blue-500" />
                            <h3 className="font-semibold">Activos</h3>
                        </div>
                        <p className="text-3xl font-bold mt-2">{stats.active}</p>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar usuarios..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={filterRole} onValueChange={(value: any) => setFilterRole(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los roles</SelectItem>
                        <SelectItem value="admin">Administradores</SelectItem>
                        <SelectItem value="collaborator">Colaboradores</SelectItem>
                        <SelectItem value="user">Usuarios</SelectItem>
                        <SelectItem value="guest">Invitados</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabla de usuarios */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead className="text-center">Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">
                                    {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={user.avatar} alt={user.displayName} />
                                                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{user.displayName}</p>
                                                <p className="text-sm text-muted-foreground">@{user.userName}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge 
                                            variant={
                                                user.role === 'admin' ? 'default' : 
                                                user.role === 'user' ? 'secondary' : 
                                                'outline'
                                            }
                                        >
                                            {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-2">
                                            {user.isVerified && (
                                                <Badge variant="outline" className="text-green-600 border-green-600">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Verificado
                                                </Badge>
                                            )}
                                            {user.isActive ? (
                                                <Badge variant="outline" className="text-blue-600 border-blue-600">
                                                    Activo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-gray-600 border-gray-600">
                                                    Inactivo
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(user)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggleActive(user)}
                                                title={user.isActive ? 'Desactivar' : 'Activar'}
                                            >
                                                {user.isActive ? (
                                                    <XCircle className="h-4 w-4 text-orange-500" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(user)}
                                                disabled={user.role === 'admin'}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialog Crear/Editar */}
            <Dialog 
                open={isCreateDialogOpen || editingUser !== null} 
                onOpenChange={(open) => {
                    if (!open) {
                        setIsCreateDialogOpen(false);
                        setEditingUser(null);
                        resetForm();
                    }
                }}
            >
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingUser 
                                ? 'Modifica la información del usuario.' 
                                : 'Completa los datos del nuevo usuario.'}
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Nombre *</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Apellido *</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="displayName">Nombre completo *</Label>
                            <Input
                                id="displayName"
                                placeholder="John Doe"
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="userName">Username *</Label>
                                <Input
                                    id="userName"
                                    placeholder="johndoe"
                                    value={formData.userName}
                                    onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="avatar">Avatar (URL)</Label>
                            <Input
                                id="avatar"
                                placeholder="https://..."
                                value={formData.avatar}
                                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Biografía</Label>
                            <Textarea
                                id="bio"
                                placeholder="Cuéntanos sobre ti..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Rol *</Label>
                            <Select 
                                value={formData.role} 
                                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                    <SelectItem value="collaborator">Colaborador</SelectItem>
                                    <SelectItem value="user">Usuario</SelectItem>
                                    <SelectItem value="guest">Invitado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex gap-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isVerified}
                                    onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                                />
                                <span className="text-sm">Verificado</span>
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <span className="text-sm">Activo</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsCreateDialogOpen(false);
                                setEditingUser(null);
                                resetForm();
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={editingUser ? handleEdit : handleCreate}
                            disabled={!formData.email || !formData.displayName || !formData.userName}
                        >
                            {editingUser ? 'Guardar Cambios' : 'Crear Usuario'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
