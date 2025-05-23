import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Download, Link } from 'lucide-react';
import { getAllWorkouts, downloadHTML, generateWorkoutHTML, getAllExercises, deleteWorkout, downloadAllWorkoutDays } from '@/utils/localStorage';
import { Workout } from '@/utils/localStorage';
import { useToast } from '@/hooks/use-toast';
import WorkoutForm from '@/components/WorkoutForm';
import { useIsMobile } from '@/hooks/use-mobile';

const WorkoutsPage = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    loadWorkouts();
  }, []);
  
  const loadWorkouts = () => {
    const savedWorkouts = getAllWorkouts();
    setWorkouts(savedWorkouts.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };
  
  const handleGenerateLink = (workout: Workout, day: string) => {
    const baseUrl = 'https://treinos-wine.vercel.app';
    const workoutLink = `${baseUrl}/treinos/${workout.id}/${day}`;
    
    // Get exercises to generate HTML
    const exercises = getAllExercises();
    const htmlContent = generateWorkoutHTML(workout, day, exercises);

    // Create a Blob and a URL for the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link element and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${workout.studentName}_${day.toLowerCase()}.html`; // Suggest a filename
    document.body.appendChild(link); // Required for Firefox
    link.click();

    // Clean up by revoking the object URL and removing the link
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Download iniciado!",
      description: `Baixando arquivo para ${getDayTranslation(day)}.`,
    });
  };
  
  const handleGenerateAllLinks = (workout: Workout) => {
    toast({
      title: "Gerando arquivos para todos os dias...",
      description: "Os downloads serão iniciados em sequência.",
    });

    const exercises = getAllExercises(); // Get exercises once

    workout.days.forEach((day, index) => {
      setTimeout(() => {
        // const baseUrl = 'https://treinos-wine.vercel.app'; // Not needed for download
        // const workoutLink = `${baseUrl}/treinos/${workout.id}/${day.day}`; // Not needed for download
        
        // Generate HTML content for the day
        const htmlContent = generateWorkoutHTML(workout, day.day, exercises);

        // Create a Blob and a URL for the HTML content
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        // Create a temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${workout.studentName}_${day.day.toLowerCase()}.html`; // Suggest a filename
        document.body.appendChild(link); // Required for Firefox
        link.click();

        // Clean up by revoking the object URL and removing the link
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: `Download de ${getDayTranslation(day.day)}`,
          description: `Arquivo ${workout.studentName}_${day.day.toLowerCase()}.html baixado com sucesso.`, // Updated description
        });
      }, index * 500); // Add a small delay between downloads
    });
  };
  
  const handleDownloadAll = async (workout: Workout) => {
    try {
      const exercises = getAllExercises();
      
      toast({
        title: "Preparando downloads...",
        description: `Iniciando download de ${workout.days.length} arquivos de treino.`,
      });
      
      await downloadAllWorkoutDays(workout, exercises);
      
      toast({
        title: "Downloads concluídos!",
        description: `Todos os treinos de ${workout.studentName} foram gerados com sucesso.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao gerar arquivos",
        description: "Ocorreu um problema ao criar os arquivos HTML.",
      });
    }
  };
  
  const handleDeleteWorkout = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este treino?')) {
      deleteWorkout(id);
      loadWorkouts();
      toast({
        title: "Treino excluído",
        description: "O treino foi removido com sucesso.",
      });
    }
  };
  
  const handleWorkoutCreated = () => {
    loadWorkouts();
    setActiveTab('list');
    toast({
      title: "Treino salvo!",
      description: "O novo treino foi adicionado com sucesso.",
    });
  };
  
  const getDayTranslation = (day: string) => {
    const translations: Record<string, string> = {
      'monday': 'Segunda',
      'tuesday': 'Terça',
      'wednesday': 'Quarta',
      'thursday': 'Quinta',
      'friday': 'Sexta',
      'saturday': 'Sábado',
      'sunday': 'Domingo'
    };
    
    return translations[day.toLowerCase()] || day;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Treinos</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="list">Lista de Treinos</TabsTrigger>
          <TabsTrigger value="create">Criar Treino</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {workouts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">Nenhum treino encontrado</p>
              <Button onClick={() => setActiveTab('create')}>Criar Novo Treino</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workouts.map((workout) => (
                <Card key={workout.id} className="overflow-hidden h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{workout.name || `Treino de ${workout.studentName}`}</CardTitle>
                        <CardDescription>
                          {workout.studentName} - Criado em {formatDate(workout.createdAt)}
                        </CardDescription>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <div className="flex flex-wrap gap-2 my-2">
                      {workout.days.map((day) => (
                        <Badge key={day.day} variant="outline">
                          {getDayTranslation(day.day)}
                        </Badge>
                      ))}
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="text-sm mt-4">
                      <h4 className="font-semibold mb-2">Downloads disponíveis:</h4>
                      <div className="flex flex-wrap gap-2">
                        {workout.days.map((day) => (
                          <Button 
                            key={day.day}
                            variant="outline" 
                            size="sm"
                            className="gap-2"
                            onClick={() => handleGenerateLink(workout, day.day)}
                          >
                            <Link size={16} />
                            {getDayTranslation(day.day)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-2 flex justify-center">
                    <Button 
                      variant="default"
                      size="sm" 
                      className="w-full"
                      onClick={() => handleGenerateAllLinks(workout)}
                    >
                      <Link size={16} className="mr-2" />
                      Gerar Links para Todos os Treinos
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="create">
          <WorkoutForm onWorkoutCreated={handleWorkoutCreated} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutsPage;
