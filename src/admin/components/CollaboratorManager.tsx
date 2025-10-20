import React, { useState } from 'react';
import { Plus, Trash2, User, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { ProjectCollaborator } from '../../types/admin.types';

interface CollaboratorManagerProps {
  collaborators: ProjectCollaborator[];
  onChange: (collaborators: ProjectCollaborator[]) => void;
}

interface CollaboratorFormData {
  name: string;
  role: string;
  avatar: string;
  bio: string;
  specialties: string;
  contribution: string;
  socialLinks: { platform: string; url: string }[];
}

const CollaboratorManager: React.FC<CollaboratorManagerProps> = ({ collaborators, onChange }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<CollaboratorFormData>({
    name: '',
    role: '',
    avatar: '',
    bio: '',
    specialties: '',
    contribution: '',
    socialLinks: []
  });

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      avatar: '',
      bio: '',
      specialties: '',
      contribution: '',
      socialLinks: []
    });
    setEditingIndex(null);
  };

  const handleAddCollaborator = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCollaborator = (index: number) => {
    const collaborator = collaborators[index];
    setFormData({
      name: collaborator.name,
      role: collaborator.role,
      avatar: collaborator.avatar || '',
      bio: collaborator.bio || '',
      specialties: collaborator.specialties?.join(', ') || '',
      contribution: collaborator.contribution || '',
      socialLinks: collaborator.socialLinks || []
    });
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleRemoveCollaborator = (index: number) => {
    const newCollaborators = collaborators.filter((_, i) => i !== index);
    onChange(newCollaborators);
  };

  const handleSaveCollaborator = () => {
    if (!formData.name.trim() || !formData.role.trim()) {
      alert('Por favor, completa al menos el nombre y rol del colaborador.');
      return;
    }

    const collaborator: ProjectCollaborator = {
      id: editingIndex !== null ? collaborators[editingIndex].id : `collab-${Date.now()}`,
      name: formData.name.trim(),
      role: formData.role.trim(),
      ...(formData.avatar.trim() && { avatar: formData.avatar.trim() }),
      ...(formData.bio.trim() && { bio: formData.bio.trim() }),
      ...(formData.specialties.trim() && { 
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s)
      }),
      ...(formData.contribution.trim() && { contribution: formData.contribution.trim() }),
      ...(formData.socialLinks.length > 0 && { socialLinks: formData.socialLinks })
    };

    let newCollaborators;
    if (editingIndex !== null) {
      newCollaborators = [...collaborators];
      newCollaborators[editingIndex] = collaborator;
    } else {
      newCollaborators = [...collaborators, collaborator];
    }

    onChange(newCollaborators);
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof CollaboratorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: '', url: '' }]
    }));
  };

  const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Colaboradores</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCollaborator}
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? 'Editar Colaborador' : 'Agregar Colaborador'}
              </DialogTitle>
              <DialogDescription>
                Completa la información del colaborador del proyecto.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="collab-name">Nombre *</Label>
                  <Input
                    id="collab-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nombre del colaborador"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collab-role">Rol *</Label>
                  <Input
                    id="collab-role"
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    placeholder="Frontend Developer, Designer, etc."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-avatar">Avatar (URL)</Label>
                <Input
                  id="collab-avatar"
                  value={formData.avatar}
                  onChange={(e) => handleInputChange('avatar', e.target.value)}
                  placeholder="https://ejemplo.com/avatar.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-bio">Biografía</Label>
                <Textarea
                  id="collab-bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder="Breve descripción del colaborador..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-specialties">Especialidades</Label>
                <Input
                  id="collab-specialties"
                  value={formData.specialties}
                  onChange={(e) => handleInputChange('specialties', e.target.value)}
                  placeholder="React, Node.js, UI/UX (separadas por comas)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="collab-contribution">Contribución</Label>
                <Textarea
                  id="collab-contribution"
                  value={formData.contribution}
                  onChange={(e) => handleInputChange('contribution', e.target.value)}
                  placeholder="Descripción de su contribución al proyecto..."
                  rows={3}
                />
              </div>

              {/* Enlaces sociales */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Enlaces Sociales</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSocialLink}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Agregar Enlace
                  </Button>
                </div>
                
                {formData.socialLinks.map((link, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input
                        value={link.platform}
                        onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                        placeholder="GitHub, LinkedIn, etc."
                      />
                    </div>
                    <div className="flex-2">
                      <Input
                        value={link.url}
                        onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                        placeholder="https://github.com/usuario"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSocialLink(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveCollaborator}
              >
                {editingIndex !== null ? 'Actualizar' : 'Agregar'} Colaborador
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de colaboradores */}
      {collaborators.length > 0 && (
        <div className="space-y-3">
          {collaborators.map((collaborator, index) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-3">
                {collaborator.avatar ? (
                  <img
                    src={collaborator.avatar}
                    alt={collaborator.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium text-sm">{collaborator.name}</div>
                  <div className="text-xs text-gray-600">{collaborator.role}</div>
                  {collaborator.specialties && (
                    <div className="text-xs text-blue-600 mt-1">
                      {collaborator.specialties.join(', ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditCollaborator(index)}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemoveCollaborator(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {collaborators.length === 0 && (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
          <User className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm">No hay colaboradores agregados</p>
          <p className="text-xs text-gray-400">Haz clic en "Agregar Colaborador" para comenzar</p>
        </div>
      )}
    </div>
  );
};

export default CollaboratorManager;