
import React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Exercise } from '@/utils/localStorage';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

const ExerciseSelector = ({
  exercises,
  selectedValue,
  onSelect,
  placeholder = 'Selecione um exercício',
}: ExerciseSelectorProps) => {
  const [open, setOpen] = React.useState(false);
  
  const selectedExercise = exercises.find(ex => ex.id === selectedValue);
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedExercise ? selectedExercise.name : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Buscar exercício..." />
          <CommandEmpty>Nenhum exercício encontrado.</CommandEmpty>
          <CommandGroup>
            {exercises.map((exercise) => (
              <CommandItem
                key={exercise.id}
                value={exercise.id}
                onSelect={() => {
                  onSelect(exercise.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedValue === exercise.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {exercise.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ExerciseSelector;
