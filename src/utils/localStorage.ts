
// Exercise type definition
export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl: string;
  videoFile?: string; // Base64 encoded video file
}

// Workout day configuration
export interface WorkoutDay {
  day: string;
  exercises: WorkoutExercise[];
}

// Workout exercise with sets and reps
export interface WorkoutExercise {
  exerciseId: string;
  sets: number;
  reps: number;
}

// Complete workout definition
export interface Workout {
  id: string;
  studentName: string;
  days: WorkoutDay[];
  createdAt: string;
}

// Profile of the personal trainer
export interface Profile {
  name: string;
  contact: string;
  cref: string;
  age: string;
}

// Local storage keys
const STORAGE_KEYS = {
  EXERCISES: 'exercisesLibrary',
  WORKOUTS: 'savedWorkouts',
  PROFILE: 'adminProfile',
};

// Initialize storage with default values if needed
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.EXERCISES)) {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.WORKOUTS)) {
    localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify([]));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({
      name: '',
      contact: '',
      cref: '',
      age: '',
    }));
  }
};

// Exercise management
export const getAllExercises = (): Exercise[] => {
  const exercises = localStorage.getItem(STORAGE_KEYS.EXERCISES);
  return exercises ? JSON.parse(exercises) : [];
};

export const saveExercise = (exercise: Exercise): void => {
  const exercises = getAllExercises();
  if (!exercise.id) {
    exercise.id = crypto.randomUUID();
  }
  
  const existingIndex = exercises.findIndex(e => e.id === exercise.id);
  
  if (existingIndex >= 0) {
    exercises[existingIndex] = exercise;
  } else {
    exercises.push(exercise);
  }
  
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
};

export const deleteExercise = (id: string): void => {
  const exercises = getAllExercises();
  const updatedExercises = exercises.filter(exercise => exercise.id !== id);
  localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(updatedExercises));
};

// Workout management
export const getAllWorkouts = (): Workout[] => {
  const workouts = localStorage.getItem(STORAGE_KEYS.WORKOUTS);
  return workouts ? JSON.parse(workouts) : [];
};

export const saveWorkout = (workout: Workout): void => {
  const workouts = getAllWorkouts();
  if (!workout.id) {
    workout.id = crypto.randomUUID();
    workout.createdAt = new Date().toISOString();
  }
  
  const existingIndex = workouts.findIndex(w => w.id === workout.id);
  
  if (existingIndex >= 0) {
    workouts[existingIndex] = workout;
  } else {
    workouts.push(workout);
  }
  
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(workouts));
};

export const deleteWorkout = (id: string): void => {
  const workouts = getAllWorkouts();
  const updatedWorkouts = workouts.filter(workout => workout.id !== id);
  localStorage.setItem(STORAGE_KEYS.WORKOUTS, JSON.stringify(updatedWorkouts));
};

// Profile management
export const getProfile = (): Profile => {
  const profile = localStorage.getItem(STORAGE_KEYS.PROFILE);
  return profile ? JSON.parse(profile) : {
    name: '',
    contact: '',
    cref: '',
    age: '',
  };
};

export const saveProfile = (profile: Profile): void => {
  localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
};

// Convert File to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// HTML Generation
export const generateWorkoutHTML = (workout: Workout, day: string, exercises: Exercise[]): string => {
  const profile = getProfile();
  const workoutDay = workout.days.find(d => d.day === day);
  
  if (!workoutDay) return '';
  
  const workoutExercises = workoutDay.exercises.map(we => {
    const exercise = exercises.find(e => e.id === we.exerciseId);
    return {
      ...exercise,
      sets: we.sets,
      reps: we.reps
    };
  }).filter(Boolean);
  
  const exercisesHTML = workoutExercises.map(exercise => `
    <div class="exercise">
      <h3>${exercise?.name || 'Unknown Exercise'}</h3>
      <p>${exercise?.sets} sets x ${exercise?.reps} reps</p>
      <p>${exercise?.description || ''}</p>
      ${exercise?.videoFile ? `
        <div class="video-container">
          <video controls class="workout-video">
            <source src="${exercise.videoFile}" type="video/mp4">
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>
      ` : exercise?.videoUrl ? `
        <div class="video-container">
          <iframe class="workout-video"
            src="${getEmbedUrl(exercise.videoUrl)}"
            frameborder="0" allowfullscreen></iframe>
        </div>
      ` : ''}
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Treino de ${workout.studentName} - ${day}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #1E90FF;
          border-bottom: 2px solid #1E90FF;
          padding-bottom: 10px;
        }
        h2 {
          color: #333;
        }
        .exercise {
          background: #f9f9f9;
          padding: 15px;
          margin-bottom: 15px;
          border-radius: 8px;
          border-left: 4px solid #1E90FF;
        }
        .exercise h3 {
          margin-top: 0;
          color: #1E90FF;
        }
        .footer {
          margin-top: 30px;
          padding-top: 10px;
          border-top: 1px solid #ddd;
          font-size: 0.9em;
          color: #666;
        }
        .video-container {
          position: relative;
          height: 0;
          overflow: hidden;
          margin: 15px 0;
          max-width: 500px;
          width: 100%;
        }
        .workout-video {
          width: 100%;
          max-height: 280px;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <h1>Treino de ${workout.studentName}</h1>
      <h2>${getDayName(day)}</h2>
      
      <div class="exercises">
        ${exercisesHTML}
      </div>
      
      <div class="footer">
        <p><strong>${profile.name}</strong></p>
        <p>Contato: ${profile.contact}</p>
        <p>CREF: ${profile.cref}</p>
        <p>Idade: ${profile.age}</p>
      </div>
    </body>
    </html>
  `;
};

// Helper for YouTube/Vimeo embed URLs
export const getEmbedUrl = (url: string): string => {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    // Extract YouTube video ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = match && match[2].length === 11 ? match[2] : null;
    
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  } else if (url.includes('vimeo.com')) {
    // Extract Vimeo video ID
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    const videoId = match ? match[1] : null;
    
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }
  
  return url; // Return as is if not YouTube or Vimeo
};

// Helper for day names
export const getDayName = (day: string): string => {
  const days: Record<string, string> = {
    'monday': 'Segunda-feira',
    'tuesday': 'Terça-feira',
    'wednesday': 'Quarta-feira',
    'thursday': 'Quinta-feira',
    'friday': 'Sexta-feira',
    'saturday': 'Sábado',
    'sunday': 'Domingo'
  };
  
  return days[day.toLowerCase()] || day;
};

// Helper to download HTML file
export const downloadHTML = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
