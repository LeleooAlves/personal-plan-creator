import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAllExercises, saveWorkout, Exercise, Workout, WorkoutDay } from '@/utils/localStorage';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface WorkoutFormProps {
  onWorkoutCreated: () => void;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Segunda' },
  { id: 'tuesday', label: 'Terça' },
  { id: 'wednesday', label: 'Quarta' },
  { id: 'thursday', label: 'Quinta' },
  { id: 'friday', label: 'Sexta' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' },
];

const WorkoutForm = ({ onWorkoutCreated }: WorkoutFormProps) => {
  const [workoutName, setWorkoutName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, Array<{ exerciseId: string; sets: number; reps: number }>>>({});
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Load exercises from localStorage
    const loadedExercises = getAllExercises();
    setExercises(loadedExercises);
    
    // Initialize workoutPlan with empty arrays for each day
    const initialWorkoutPlan: Record<string, Array<{ exerciseId: string; sets: number; reps: number }>> = {};
    DAYS_OF_WEEK.forEach(day => {
      initialWorkoutPlan[day.id] = [];
    });
    setWorkoutPlan(initialWorkoutPlan);
  }, []);
  
  useEffect(() => {
    // Set the active tab to the first selected day when selection changes
    if (selectedDays.length > 0 && (!activeTab || !selectedDays.includes(activeTab))) {
      setActiveTab(selectedDays[0]);
    } else if (selectedDays.length === 0) {
      setActiveTab('');
    }
  }, [selectedDays, activeTab]);
  
  const handleDayToggle = (day: string) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };
  
  const handleAddExercise = (day: string) => {
    setWorkoutPlan(prev => ({
      ...prev,
      [day]: [
        ...prev[day],
        { exerciseId: '', sets: 3, reps: 10 }
      ]
    }));
  };
  
  const handleExerciseChange = (day: string, index: number, field: string, value: string | number) => {
    setWorkoutPlan(prev => {
      const updatedDay = [...prev[day]];
      updatedDay[index] = {
        ...updatedDay[index],
        [field]: value
      };
      return {
        ...prev,
        [day]: updatedDay
      };
    });
  };
  
  const handleRemoveExercise = (day: string, index: number) => {
    setWorkoutPlan(prev => {
      const updatedDay = [...prev[day]];
      updatedDay.splice(index, 1);
      return {
        ...prev,
        [day]: updatedDay
      };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (studentName.trim() === '') {
      toast({
        variant: "destructive",
        title: "Nome do aluno é obrigatório",
        description: "Por favor, informe o nome do aluno para continuar.",
      });
      return;
    }
    
    if (selectedDays.length === 0) {
      toast({
        variant: "destructive",
        title: "Selecione pelo menos um dia",
        description: "É necessário escolher no mínimo um dia da semana.",
      });
      return;
    }
    
    // Check if at least one exercise is selected for each day
    const isValid = selectedDays.every(day => {
      return workoutPlan[day].length > 0 && workoutPlan[day].every(ex => ex.exerciseId);
    });
    
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Exercícios incompletos",
        description: "Certifique-se de adicionar ao menos um exercício para cada dia e preencha todos os campos.",
      });
      return;
    }
    
    // Create the workout object
    const days: WorkoutDay[] = selectedDays.map(day => ({
      day,
      exercises: workoutPlan[day].map(e => ({
        exerciseId: e.exerciseId,
        sets: e.sets,
        reps: e.reps
      }))
    }));
    
    const workout: Workout = {
      id: '',
      name: workoutName.trim(),
      studentName,
      days,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveWorkout(workout);
    
    // Reset form and notify parent
    setWorkoutName('');
    setStudentName('');
    setSelectedDays([]);
    setActiveTab('');
    
    // Reinitialize workout plan
    const initialWorkoutPlan: Record<string, Array<{ exerciseId: string; sets: number; reps: number }>> = {};
    DAYS_OF_WEEK.forEach(day => {
      initialWorkoutPlan[day.id] = [];
    });
    setWorkoutPlan(initialWorkoutPlan);
    
    onWorkoutCreated();
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="workoutName">Nome do Treino</Label>
          <Input
            id="workoutName"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Ex: Treino de Força, Hipertrofia, etc."
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="studentName">Nome do Aluno</Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Ex: João Silva"
            required
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Dias de Treino</Label>
            <span className="text-sm text-muted-foreground">
              {selectedDays.length} de 7 dias selecionados
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <Button
                key={day.id}
                type="button"
                variant={selectedDays.includes(day.id) ? "default" : "outline"}
                className="flex justify-center w-full h-16 sm:h-14"
                onClick={() => handleDayToggle(day.id)}
              >
                {day.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {selectedDays.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="relative">
                <TabsList className="mb-4 overflow-x-auto flex flex-nowrap w-full justify-start pb-1">
                  {selectedDays.map(day => {
                    const dayLabel = DAYS_OF_WEEK.find(d => d.id === day)?.label || day;
                    return (
                      <TabsTrigger 
                        key={day} 
                        value={day}
                        className="flex-shrink-0"
                      >
                        {dayLabel}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </div>
              
              {selectedDays.map(day => (
                <TabsContent key={day} value={day} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">
                      Exercícios para {DAYS_OF_WEEK.find(d => d.id === day)?.label}
                    </h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => handleAddExercise(day)}
                    >
                      Adicionar Exercício
                    </Button>
                  </div>
                  
                  {workoutPlan[day].length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum exercício adicionado. Clique em "Adicionar Exercício".
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {workoutPlan[day].map((exercise, index) => (
                        <div key={index} className={`grid gap-3 p-3 border rounded-md ${isMobile ? 'grid-cols-1' : 'grid-cols-12 items-end'}`}>
                          <div className={isMobile ? 'col-span-1' : 'col-span-12 sm:col-span-6'}>
                            <Label htmlFor={`exercise-${day}-${index}`}>Exercício</Label>
                            <Select
                              value={exercise.exerciseId}
                              onValueChange={(value) => handleExerciseChange(day, index, 'exerciseId', value)}
                            >
                              <SelectTrigger id={`exercise-${day}-${index}`}>
                                <SelectValue placeholder="Selecione um exercício" />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map((ex) => (
                                  <SelectItem key={ex.id} value={ex.id}>
                                    {ex.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className={`grid grid-cols-2 gap-3 ${isMobile ? 'col-span-1' : 'col-span-12 sm:col-span-4'}`}>
                            <div>
                              <Label htmlFor={`sets-${day}-${index}`}>Séries</Label>
                              <Input
                                id={`sets-${day}-${index}`}
                                type="number"
                                min="1"
                                value={exercise.sets}
                                onChange={(e) => handleExerciseChange(day, index, 'sets', parseInt(e.target.value) || 1)}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor={`reps-${day}-${index}`}>Repetições</Label>
                              <Input
                                id={`reps-${day}-${index}`}
                                type="number"
                                min="1"
                                value={exercise.reps}
                                onChange={(e) => handleExerciseChange(day, index, 'reps', parseInt(e.target.value) || 1)}
                              />
                            </div>
                          </div>
                          
                          <div className={isMobile ? 'col-span-1' : 'col-span-12 sm:col-span-2'}>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => handleRemoveExercise(day, index)}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}
      
      <div className="flex justify-end">
        <Button type="submit" className="w-full sm:w-auto">
          Salvar Treino
        </Button>
      </div>
    </form>
  );
};

export default WorkoutForm;
