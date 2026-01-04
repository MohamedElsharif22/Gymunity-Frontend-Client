import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

interface Exercise {
  id: number;
  name: string;
  image?: string;
  sets: number;
  reps: string; // e.g. "6-8" or "8"
  rest: number; // seconds
}

const parseRepOptions = (reps: string): number[] => {
  const cleaned = (reps || '').replace(/x/gi, '').trim();
  const range = cleaned.match(/(\d+)\s*-\s*(\d+)/);
  if (range) {
    const min = parseInt(range[1], 10);
    const max = parseInt(range[2], 10);
    const opts: number[] = [];
    for (let i = min; i <= max; i++) opts.push(i);
    return opts;
  }
  const single = parseInt(cleaned, 10);
  return isNaN(single) ? [] : [single];
};

const WorkoutExecute: React.FC = () => {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);

  const [currentSet, setCurrentSet] = useState(0);
  const [selectedReps, setSelectedReps] = useState<number | null>(null);
  const [repsRemaining, setRepsRemaining] = useState<number | null>(null);
  const [repsPerSet, setRepsPerSet] = useState<number[]>([]);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);

  const restIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!exerciseId) return;
    setLoading(true);
    // Fetch exercise by ID — adapt endpoint as needed
    fetch(`/api/exercises/${exerciseId}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data: Exercise) => {
        setExercise(data);
      })
      .catch(() => {
        // fallback: create minimal object if API not present
        const fallback: Exercise = {
          id: parseInt(exerciseId || '0', 10),
          name: 'Exercise ' + exerciseId,
          sets: 3,
          reps: '6-8',
          rest: 60,
        };
        setExercise(fallback);
      })
      .finally(() => setLoading(false));
  }, [exerciseId]);

  useEffect(() => {
    return () => {
      if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
    };
  }, []);

  if (loading || !exercise) {
    return <div>Loading...</div>;
  }

  const repOptions = parseRepOptions(exercise.reps);

  const chooseReps = (n: number) => {
    if (isResting) return;
    setSelectedReps(n);
    setRepsRemaining(n);
  };

  const tapCounter = () => {
    if (repsRemaining === null || isResting) return;
    if (repsRemaining > 1) {
      setRepsRemaining(repsRemaining - 1);
    } else {
      // reached 0 -> save reps and start rest
      const done = selectedReps ?? 0;
      const next = [...repsPerSet, done];
      setRepsPerSet(next);
      setSelectedReps(null);
      setRepsRemaining(null);

      const nextSetIndex = currentSet + 1;
      if (nextSetIndex >= exercise.sets) {
        // Completed all sets
        const payload = {
          exerciseId: exercise.id,
          setsCompleted: next.length,
          repsPerSet: next,
          totalReps: next.reduce((a, b) => a + b, 0),
          completed: true
        };
        // try to save to backend
        try {
          fetch('/api/client/workouts/exercise', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).finally(() => {
            navigate('/workout');
          });
        } catch (e) {
          // fallback: store in localStorage then navigate
          localStorage.setItem(`exercise_${exercise.id}_result`, JSON.stringify(payload));
          navigate('/workout');
        }
        return;
      }

      // start rest
      setIsResting(true);
      setRestTimer(exercise.rest);
      restIntervalRef.current = window.setInterval(() => {
        setRestTimer(prev => {
          if (prev <= 1) {
            if (restIntervalRef.current) window.clearInterval(restIntervalRef.current);
            restIntervalRef.current = null;
            setIsResting(false);
            setCurrentSet(nextSetIndex);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const manualCompleteSet = () => {
    if (!selectedReps) return;
    setRepsRemaining(0);
    tapCounter();
  };

  return (
    <div className="workout-execute-page">
      <h1>{exercise.name}</h1>
      {exercise.image && <img src={exercise.image} alt={exercise.name} style={{ maxWidth: 400 }} />}
      <div>Sets: {exercise.sets}</div>
      <div>Reps: {exercise.reps}</div>
      <div>Rest: {exercise.rest}s</div>

      <div style={{ marginTop: 16 }}>
        <div>Current Set: {currentSet + 1} / {exercise.sets}</div>

        <div style={{ marginTop: 8 }}>
          <div>Select reps:</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {repOptions.map(r => (
              <button key={r} onClick={() => chooseReps(r)} disabled={isResting || repsRemaining !== null}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          {repsRemaining !== null && (
            <div>
              <div style={{ fontSize: 36, width: 200, height: 200, borderRadius: 100, background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '16px 0' }} onClick={tapCounter}>
                {repsRemaining}
              </div>
              <div style={{ marginTop: 8 }}>
                <button onClick={manualCompleteSet} disabled={isResting}>Complete Set</button>
              </div>
            </div>
          )}
        </div>

        {isResting && (
          <div style={{ marginTop: 12 }}>
            Resting: {restTimer}s
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <div>Sets completed: {repsPerSet.length}</div>
          <div>Reps per set: {JSON.stringify(repsPerSet)}</div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutExecute;
