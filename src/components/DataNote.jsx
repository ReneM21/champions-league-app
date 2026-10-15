import React from 'react';
import { Alert } from '@heroui/react';

// Aviso "Sobre los datos" al pie de los rankings
const DataNote = ({ children }) => (
  <Alert className="mt-8">
    <Alert.Indicator />
    <Alert.Content>
      <Alert.Title>Sobre los datos</Alert.Title>
      <Alert.Description className="space-y-2">{children}</Alert.Description>
    </Alert.Content>
  </Alert>
);

export default DataNote;
