import React, { useState } from 'react';
import { Button } from '@heroui/react';

// Comparte la página actual: menú del sistema en el móvil o copia el enlace
const ShareButton = ({ title, size = 'sm', variant = 'secondary' }) => {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // El usuario canceló o el navegador no lo permite: no hay nada que hacer
    }
  };

  return (
    <Button size={size} variant={variant} onPress={share} aria-live="polite">
      {copied ? 'Enlace copiado' : 'Compartir'}
    </Button>
  );
};

export default ShareButton;
