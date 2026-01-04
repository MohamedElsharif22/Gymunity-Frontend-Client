import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface Exercise {
  id: number;
  name: string;
  image?: string;
  sets: number;
  reps: string; // e.g. "6-8"
  rest: number; // seconds
}

interface Props {
  exercise: Exercise;
}

const ExerciseCard: React.FC<Props> = ({ exercise }) => {
  const navigate = useNavigate();

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        <h3>{exercise.name}</h3>
      </div>
      <div className="exercise-media">
        {exercise.image ? <img src={exercise.image} alt={exercise.name} /> : null}
      </div>
      <div className="exercise-meta">
        <div>Sets: {exercise.sets}</div>
        <div>Reps: {exercise.reps}</div>
        <div>Rest: {exercise.rest}s</div>
      </div>

      <div className="exercise-actions">
        <button
          className="execute-btn"
          onClick={() => navigate(`/workout/execute/${exercise.id}`)}
        >
          Execute Exercise
        </button>
      </div>
    </div>
  );
};

export default ExerciseCard;
