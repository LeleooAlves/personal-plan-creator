// Exercise type definition
export interface Exercise {
  id: string;
  name: string;
  description: string;
  videoUrl?: string; // URL do YouTube ou Google Drive
  videoFile?: string; // Base64 encoded video file
  videoType?: 'youtube' | 'drive' | 'file'; // Tipo do vídeo para melhor controle
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
  name: string; // Added workout name field
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

  // Determina o tipo do vídeo
  if (exercise.videoUrl) {
    if (exercise.videoUrl.includes('youtube.com') || exercise.videoUrl.includes('youtu.be')) {
      exercise.videoType = 'youtube';
    } else if (exercise.videoUrl.includes('drive.google.com')) {
      exercise.videoType = 'drive';
    }
  } else if (exercise.videoFile) {
    exercise.videoType = 'file';
  }
  
  const existingIndex = exercises.findIndex(e => e.id === exercise.id);
  
  if (existingIndex >= 0) {
    exercises[existingIndex] = exercise;
  } else {
    exercises.push(exercise);
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (error) {
    // Se houver erro de armazenamento, tenta limpar alguns dados antigos
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      // Remove vídeos em base64 antigos para liberar espaço
      const cleanedExercises = exercises.map(ex => ({
        ...ex,
        videoFile: undefined // Remove apenas o arquivo de vídeo, mantendo URLs
      }));
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(cleanedExercises));
      
      // Tenta salvar novamente
      if (existingIndex >= 0) {
        cleanedExercises[existingIndex] = exercise;
      } else {
        cleanedExercises.push(exercise);
      }
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(cleanedExercises));
    } else {
      throw error;
    }
  }
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
  
  // If no workout name is provided, create a default one
  if (!workout.name || workout.name.trim() === '') {
    workout.name = `Treino de ${workout.studentName}`;
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
      ${exercise?.videoType === 'file' && exercise?.videoFile ? `
        <div class="video-container">
          <video controls playsinline class="workout-video">
            <source src="${exercise.videoFile}" type="video/mp4">
            Seu navegador não suporta a reprodução de vídeos.
          </video>
        </div>
      ` : exercise?.videoUrl ? `
        <div class="video-container">
          <iframe class="workout-video"
            src="${getEmbedUrl(exercise.videoUrl)}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen webkitallowfullscreen mozallowfullscreen playsinline
            ></iframe>
          <div class="video-fallback" style="text-align:center; margin-top:8px;">
            <noscript>Seu navegador não suporta vídeos incorporados. <a href="${exercise.videoUrl}" target="_blank" rel="noopener noreferrer">Ver no YouTube</a></noscript>
            <span style="display:block; font-size:13px; color:#888;">Se o vídeo não aparecer, <a href="${exercise.videoUrl}" target="_blank" rel="noopener noreferrer">clique aqui para abrir no YouTube</a>.</span>
          </div>
        </div>
        ${exercise?.videoType === 'youtube' ? `
          <div class="video-links mt-2">
            <a href="${exercise.videoUrl}" target="_blank" rel="noopener noreferrer" class="video-link">
              Ver no YouTube
            </a>
          </div>
        ` : exercise?.videoType === 'drive' ? `
          <div class="video-links mt-2">
            <a href="${exercise.videoUrl}" target="_blank" rel="noopener noreferrer" class="video-link">
              Ver no Google Drive
            </a>
          </div>
        ` : ''}
      ` : ''}
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${workout.name} - ${workout.studentName} - ${day}</title>
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
        .trainer-info {
          background: #f0f9ff;
          padding: 15px;
          margin-bottom: 20px;
          border-radius: 8px;
          border-left: 4px solid #1E90FF;
        }
        .trainer-info p {
          margin: 5px 0;
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
        .video-container {
          position: relative;
          overflow: hidden;
          margin: 15px 0;
          max-width: 100%;
          width: 100%;
          aspect-ratio: 16/9;
        }
        .workout-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          max-height: none; /* Remove o limite de altura */
        }
        .video-links {
          text-align: center;
        }
        .video-link {
          display: inline-block;
          padding: 8px 16px;
          background-color: #1E90FF;
          color: white;
          text-decoration: none;
          border-radius: 4px;
          margin: 5px;
          transition: background-color 0.2s;
        }
        .video-link:hover {
          background-color: #187bcd;
        }
        @media (max-width: 768px) {
          .workout-video {
            max-height: none; /* Remove o limite de altura em dispositivos móveis */
          }
        }
      </style>
    </head>
    <body>
      <div class="trainer-info">
        <p><strong>${profile.name}</strong></p>
        <p>Contato: ${profile.contact}</p>
        <p>CREF: ${profile.cref}</p>
        <p>Idade: ${profile.age}</p>
      </div>
      
      <h1>${workout.name}</h1>
      <h2>${workout.studentName} - ${getDayName(day)}</h2>
      
      <div class="exercises">
        ${exercisesHTML}
      </div>
    </body>
    </html>
  `;
};

// Helper para URLs do Google Drive
export const getGoogleDriveEmbedUrl = (url: string): string => {
  if (!url.includes('drive.google.com')) return url;
  
  // Extrai o ID do arquivo do Google Drive
  const fileIdMatch = url.match(/\/d\/(.*?)\/|id=(.*?)(&|$)/);
  const fileId = fileIdMatch ? (fileIdMatch[1] || fileIdMatch[2]) : null;
  
  return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
};

// Atualiza a função getEmbedUrl para incluir suporte ao Google Drive
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
  } else if (url.includes('drive.google.com')) {
    return getGoogleDriveEmbedUrl(url);
  }
  
  return url;
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

// Download all workout days
export const downloadAllWorkoutDays = (workout: Workout, exercises: Exercise[]): Promise<void> => {
  return new Promise((resolve) => {
    const days = workout.days;
    
    // Create a delay between downloads to prevent browser blocking
    days.forEach((day, index) => {
      setTimeout(() => {
        try {
          const html = generateWorkoutHTML(workout, day.day, exercises);
          const dayName = day.day.charAt(0).toUpperCase() + day.day.slice(1);
          const filename = `${workout.name.replace(/\s+/g, '_')}_${workout.studentName.replace(/\s+/g, '_')}_${dayName}.html`;
          
          downloadHTML(html, filename);
          
          if (index === days.length - 1) {
            resolve();
          }
        } catch (error) {
          console.error("Error downloading workout day:", error);
          if (index === days.length - 1) {
            resolve();
          }
        }
      }, index * 500); // 500ms delay between downloads
    });
    
    // If there are no days, just resolve
    if (days.length === 0) {
      resolve();
    }
  });
};
