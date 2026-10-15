import React from 'react';
import { Label, ListBox, Select } from '@heroui/react';

// Selector de orden (Equipos y Temporadas) con el Select de HeroUI.
// options: [{ id, label }]
const SortSelect = ({ label, value, onChange, options }) => (
  <Select className="w-64" value={value} onChange={onChange}>
    <Label>{label}</Label>
    <Select.Trigger>
      <Select.Value />
      <Select.Indicator />
    </Select.Trigger>
    <Select.Popover>
      <ListBox>
        {options.map((option) => (
          <ListBox.Item key={option.id} id={option.id} textValue={option.label}>
            {option.label}
            <ListBox.ItemIndicator />
          </ListBox.Item>
        ))}
      </ListBox>
    </Select.Popover>
  </Select>
);

export default SortSelect;
