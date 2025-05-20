import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExternalLink, Edit, Trash2, Upload, FileVideo } from 'lucide-react';
import { Exercise, getAllExercises, saveExercise, deleteExercise, getEmbedUrl, fileToBase64 } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';

const ExercisesPage = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState<Omit<Exercise, 'id'>>({
    name: '',
    description: '',
    videoUrl: '',
    videoFile: undefined
  });
  const [videoUploadType, setVideoUploadType] = useState<'url' | 'file'>('url');
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
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      // Check file size (limit to 10MB to prevent localStorage quota issues)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 10MB para evitar problemas de armazenamento."
        });
        return;
      }
      
      const base64Video = await fileToBase64(file);
      setFormData(prev => ({
        ...prev,
        videoFile: base64Video,
        videoUrl: '' // Clear URL when file is uploaded
      }));
      
      toast({
        title: "Vídeo carregado",
        description: "O vídeo foi carregado com sucesso."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar vídeo",
        description: "Não foi possível processar o arquivo."
      });
    }
  };
  
  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      description: exercise.description,
      videoUrl: exercise.videoUrl || '',
      videoFile: exercise.videoFile
    });
    setVideoUploadType(exercise.videoFile ? 'file' : 'url');
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
    
    try {
      const exerciseToSave: Exercise = {
        id: editingExercise?.id || '',
        ...formData,
        // Clear the unused video field based on upload type
        videoUrl: videoUploadType === 'url' ? formData.videoUrl : '',
        videoFile: videoUploadType === 'file' ? formData.videoFile : undefined
      };
      
      saveExercise(exerciseToSave);
      loadExercises();
      resetForm();
      setIsDialogOpen(false);
      
      toast({
        title: editingExercise ? "Exercício atualizado" : "Exercício adicionado",
        description: `O exercício foi ${editingExercise ? 'atualizado' : 'adicionado'} com sucesso.`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar exercício",
        description: "Ocorreu um problema ao salvar. O arquivo pode ser muito grande para o armazenamento local."
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      videoUrl: '',
      videoFile: undefined
    });
    setVideoUploadType('url');
    setEditingExercise(null);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };
  
  const getVideoThumbnail = (exercise: Exercise) => {
    if (exercise.videoFile) {
      return exercise.videoFile;
    } else if (exercise.videoUrl) {
      if (exercise.videoUrl.includes('youtube.com') || exercise.videoUrl.includes('youtu.be')) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = exercise.videoUrl.match(regExp);
        const videoId = match && match[2].length === 11 ? match[2] : null;
        
        return videoId ? `https://img.youtube.com/vi/${videoId}/0.jpg` : '';
      } else if (exercise.videoUrl.includes('vimeo.com')) {
        // For Vimeo, we'd need an API call which is beyond scope here
        // Just return a placeholder
        return 'https://via.placeholder.com/640x360?text=Vimeo+Video';
      }
    }
    
    return 'https://via.placeholder.com/640x360?text=No+Video';
  };
  
  const hasVideo = (exercise: Exercise): boolean => {
    return Boolean(exercise.videoUrl || exercise.videoFile);
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
                
                <div className="space-y-2">
                  <Label className="block text-center mb-2">Vídeo</Label>
                  <Tabs value={videoUploadType} onValueChange={(val) => setVideoUploadType(val as 'url' | 'file')}>
                    <TabsList className="grid grid-cols-2 w-full">
                      <TabsTrigger value="url">URL (YouTube/Vimeo)</TabsTrigger>
                      <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="url" className="space-y-4 pt-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="videoUrl" className="text-right">
                          URL
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
                    </TabsContent>
                    
                    <TabsContent value="file" className="space-y-4 pt-4">
                      <div className="grid items-center gap-4">
                        <Label htmlFor="videoFile" className="text-center">
                          Arquivo de Vídeo
                        </Label>
                        <div className="flex items-center justify-center">
                          <Label htmlFor="videoFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <Upload className="w-8 h-8 mb-2 text-gray-500" />
                              <p className="mb-2 text-sm text-gray-500">
                                <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                              </p>
                              <p className="text-xs text-gray-500">MP4, WebM, Ogg (Máx. 30MB)</p>
                            </div>
                            <Input 
                              id="videoFile" 
                              type="file"
                              accept="video/mp4,video/webm,video/ogg"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                          </Label>
                        </div>
                        
                        {formData.videoFile && (
                          <div className="mt-2">
                            <Label className="block text-center mb-2">Vídeo carregado:</Label>
                            <div className="flex justify-center">
                              <div className="flex items-center space-x-2 p-2 bg-green-50 text-green-700 rounded">
                                <FileVideo size={20} />
                                <span>Vídeo pronto para upload</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
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
              
              {hasVideo(exercise) && (
                <CardContent className="p-0">
                  <div className="aspect-video bg-black relative">
                    {exercise.videoFile ? (
                      <video 
                        src={exercise.videoFile} 
                        controls 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <a
                        href={exercise.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <img
                          src={getVideoThumbnail(exercise)}
                          alt={exercise.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <ExternalLink className="text-white w-10 h-10" />
                        </div>
                      </a>
                    )}
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
