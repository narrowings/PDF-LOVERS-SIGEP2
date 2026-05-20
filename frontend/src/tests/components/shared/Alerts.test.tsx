import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Alert from '../../../components/shared/Alert';

describe('Alert', () => {
  it('renderiza mensaje de error', () => {
    render(<Alert type="error" message="Ocurrió un error" />);
    expect(screen.getByText('Ocurrió un error')).toBeInTheDocument();
  });

  it('renderiza mensaje de éxito', () => {
    render(<Alert type="success" message="Guardado correctamente" />);
    expect(screen.getByText('Guardado correctamente')).toBeInTheDocument();
  });

  it('llama onClose al hacer clic en cerrar', () => {
    const onClose = vi.fn();
    render(<Alert type="error" message="Error" onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Cerrar'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('no muestra botón cerrar si no se pasa onClose', () => {
    render(<Alert type="info" message="Info" />);
    expect(screen.queryByLabelText('Cerrar')).not.toBeInTheDocument();
  });
});