import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getAllWorkouts, getAllExercises, generateWorkoutHTML } from '@/utils/localStorage';
import { Workout } from '@/utils/localStorage';

const WorkoutDisplayPage = () => {
  const { workoutId, day } = useParams<{ workoutId: string; day: string }>();
  const [workoutHTML, setWorkoutHTML] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!workoutId || !day) {
      setError('Workout ID or day not provided.');
      return;
    }

    try {
      const workouts = getAllWorkouts();
      const workout = workouts.find(w => w.id === workoutId);

      if (!workout) {
        setError('Workout not found.');
        setWorkoutHTML(null);
        return;
      }

      const workoutDay = workout.days.find(d => d.day.toLowerCase() === day.toLowerCase());

      if (!workoutDay) {
        setError(`Day ${day} not found for this workout.`);
        setWorkoutHTML(null);
        return;
      }

      const exercises = getAllExercises();
      const htmlContent = generateWorkoutHTML(workout, workoutDay.day, exercises);
      setWorkoutHTML(htmlContent);
      setError(null);

    } catch (err) {
      console.error("Error loading workout or generating HTML:", err);
      setError('Error loading workout data.');
      setWorkoutHTML(null);
    }
  }, [workoutId, day]);

  if (error) {
    return <div className="text-red-500 text-center py-12">{error}</div>;
  }

  if (!workoutHTML) {
    return <div className="text-center py-12">Loading workout...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-3xl">
      <div dangerouslySetInnerHTML={{ __html: workoutHTML }} />
    </div>
  );
};

export default WorkoutDisplayPage; 