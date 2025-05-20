
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
  const [studentName, setStudentName] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [workoutPlan, setWorkoutPlan] = useState<Record<string, Array<{ exerciseId: string; sets: number; reps: number }>>>({});
  
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
      studentName,
      days,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    saveWorkout(workout);
    
    // Reset form and notify parent
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
          <Label>Dias de Treino</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.id}`}
                  checked={selectedDays.includes(day.id)}
                  onCheckedChange={() => handleDayToggle(day.id)}
                />
                <Label htmlFor={`day-${day.id}`} className="text-sm cursor-pointer">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedDays.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 overflow-x-auto flex flex-nowrap w-full justify-start">
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
                        <div key={index} className="grid grid-cols-12 gap-2 items-end">
                          <div className="col-span-12 sm:col-span-6">
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
                          
                          <div className="col-span-6 sm:col-span-2">
                            <Label htmlFor={`sets-${day}-${index}`}>Séries</Label>
                            <Input
                              id={`sets-${day}-${index}`}
                              type="number"
                              min="1"
                              value={exercise.sets}
                              onChange={(e) => handleExerciseChange(day, index, 'sets', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div className="col-span-6 sm:col-span-2">
                            <Label htmlFor={`reps-${day}-${index}`}>Repetições</Label>
                            <Input
                              id={`reps-${day}-${index}`}
                              type="number"
                              min="1"
                              value={exercise.reps}
                              onChange={(e) => handleExerciseChange(day, index, 'reps', parseInt(e.target.value) || 1)}
                            />
                          </div>
                          
                          <div className="col-span-12 sm:col-span-2 flex justify-end">
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
        <Button type="submit" className="w-full md:w-auto">
          Salvar Treino
        </Button>
      </div>
    </form>
  );
};

export default WorkoutForm;
