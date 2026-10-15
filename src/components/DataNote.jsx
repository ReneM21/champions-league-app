import React from 'react';
import { Card } from '@heroui/react';

// Recuadro "Nota sobre los datos" al pie de los rankings
const DataNote = ({ children }) => (
  <Card variant="secondary" className="mt-6">
    <Card.Header>
      <Card.Title className="text-lg font-semibold text-champions-blue">Nota sobre los datos</Card.Title>
    </Card.Header>
    <Card.Content className="space-y-2 text-sm text-gray-700">{children}</Card.Content>
  </Card>
);

export default DataNote;
