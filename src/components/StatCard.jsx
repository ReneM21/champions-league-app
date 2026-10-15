import React from 'react';
import { Card } from '@heroui/react';
import { formatValue } from '../utils/stats';

// Tarjeta de una cifra: etiqueta pequeña, número grande y nota opcional
const StatCard = ({ label, value, note, highlight = false }) => (
  <Card>
    <Card.Content className="gap-1 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${highlight ? 'text-accent' : ''}`}>{formatValue(value)}</p>
      {note && <p className="text-sm text-muted">{note}</p>}
    </Card.Content>
  </Card>
);

export default StatCard;
