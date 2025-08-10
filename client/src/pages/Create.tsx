import React from 'react';
import { RealCreateStudio } from '@/components/ui/real-create-studio';
import { ProtectedRoute } from '@/components/ui/protected-route';

export default function Create() {
  return (
    <ProtectedRoute requireAuth={true}>
      <RealCreateStudio />
    </ProtectedRoute>
  );
}