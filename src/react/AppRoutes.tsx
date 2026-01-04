import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WorkoutExecute from './WorkoutExecute';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/workout/execute/:exerciseId" element={<WorkoutExecute />} />
    </Routes>
  );
};

export default AppRoutes;
