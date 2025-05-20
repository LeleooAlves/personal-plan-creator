
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { ExternalLink, Edit, Trash2 } from 'lucide-react';
import { Exercise, getAllExercises, saveExercise, deleteExercise, getEmbedUrl } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<Omit<Exercise, 'id'>>({
    name: '',
    description: '',
    videoUrl: ''
  });
  const { toast } = useToast();
  
  useEffect(() => {
    loadExercises();
  }, []);
  
  const loadExercises = () => {
    const savedExercises = getAllExercises();
    setExercises(savedExercises);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description,
      videoUrl: exercise.videoUrl
    });
    setIsDialogOpen(true);
  };
  
  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este exercício?')) {
      deleteExercise(id);
      loadExercises();
      toast({
        title: "Exercício excluído",
        description: "O exercício foi removido com sucesso."
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Nome obrigatório",
        description: "Por favor, informe o nome do exercício."
      });
      return;
    }
    
    const exerciseToSave: Exercise = {
      id: editingExercise?.id || '',
      ...formData
    };
    
    saveExercise(exerciseToSave);
    loadExercises();
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: editingExercise ? "Exercício atualizado" : "Exercício adicionado",
      description: `O exercício foi ${editingExercise ? 'atualizado' : 'adicionado'} com sucesso.`
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      videoUrl: ''
    });
    setEditingExercise(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };
  
  const getVideoThumbnail = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = match && match[2].length === 11 ? match[2] : null;
      
      return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';
    } else if (url.includes('vimeo.com')) {
      // For Vimeo, we'd need an API call which is beyond scope here
      // Just return a placeholder
      return 'https://via.placeholder.com/640x360?text=Vimeo+Video';
    }
    
    return 'https://via.placeholder.com/640x360?text=Video';
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Exercícios</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button>Adicionar Exercício</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingExercise ? 'Editar Exercício' : 'Adicionar Exercício'}
                </DialogTitle>
                <DialogDescription>
                  Preencha os detalhes do exercício abaixo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="videoUrl" className="text-right">
                    URL do Vídeo
                  </Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={formData.videoUrl}
                    onChange={handleInputChange}
                    className="col-span-3"
                    placeholder="YouTube ou Vimeo URL"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Nenhum exercício cadastrado</p>
          <Button onClick={() => setIsDialogOpen(true)}>Adicionar Exercício</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <Card key={exercise.id}>
              <CardHeader className="pb-2">
                <CardTitle>{exercise.name}</CardTitle>
                {exercise.description && (
                  <CardDescription>
                    {exercise.description}
                  </CardDescription>
                )}
              </CardHeader>
              
              {exercise.videoUrl && (
                <CardContent className="p-0">
                  <div className="aspect-video bg-black relative">
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <img
                        src={getVideoThumbnail(exercise.videoUrl)}
                        alt={exercise.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <ExternalLink className="text-white w-10 h-10" />
                      </div>
                    </a>
                  </div>
                </CardContent>
              )}
              
              <CardFooter className="pt-4 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(exercise)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(exercise.id)}>
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExercisesPage;
