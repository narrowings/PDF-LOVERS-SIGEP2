import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormacionAcademicaTab from '../../../components/hv/FormacionAcademicaTab';

vi.mock('../../../services/api', () => ({
  hvApi: {
    createFormacion: vi.fn(),
    updateFormacion: vi.fn(),
    deleteFormacion: vi.fn(),
  },
  uploadApi: {
    uploadDocumento: vi.fn(),
  },
}));

import { hvApi } from '../../../services/api';

describe('FormacionAcademicaTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza mensaje vacío cuando no hay items', () => {
    render(<FormacionAcademicaTab items={[]} onSaved={vi.fn()} />);
    expect(screen.getByText('Formación Académica')).toBeInTheDocument();
    expect(screen.getByText('+ Agregar')).toBeInTheDocument();
  });

  it('muestra la tabla cuando hay items', () => {
    const items = [
      {
        id: '1',
        nivelAcademico: 'PREGRADO',
        tituloObtenido: 'Ingeniero de Sistemas',
        institucion: 'UAO',
        estadoEstudio: 'FINALIZADO',
        verificadoEdFormal: false,
      },
    ];
    render(<FormacionAcademicaTab items={items} onSaved={vi.fn()} />);
    expect(screen.getByText('Ingeniero de Sistemas')).toBeInTheDocument();
    expect(screen.getByText('UAO')).toBeInTheDocument();
  });

  it('abre el formulario al hacer clic en Agregar', () => {
    render(<FormacionAcademicaTab items={[]} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByText('+ Agregar'));
    expect(screen.getByText('Agregar Formación Académica')).toBeInTheDocument();
  });

  it('cierra el formulario al hacer clic en Cancelar', () => {
    render(<FormacionAcademicaTab items={[]} onSaved={vi.fn()} />);
    fireEvent.click(screen.getByText('+ Agregar'));
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByText('Agregar Formación Académica')).not.toBeInTheDocument();
  });

  it('llama a createFormacion al guardar un registro nuevo', async () => {
    vi.mocked(hvApi.createFormacion).mockResolvedValueOnce({ data: {} } as any);
    const onSaved = vi.fn();
    render(<FormacionAcademicaTab items={[]} onSaved={onSaved} />);
    fireEvent.click(screen.getByText('+ Agregar'));

    // Buscar inputs por orden de aparición con getAllByRole
    const textInputs = screen.getAllByRole('textbox');
    fireEvent.change(textInputs[0], { target: { value: 'Universidad del Valle' } }); // Institución
    fireEvent.change(textInputs[1], { target: { value: 'Ingeniero' } }); // Título

    fireEvent.click(screen.getByText('Guardar'));
    await waitFor(() => {
      expect(hvApi.createFormacion).toHaveBeenCalled();
    });
  });

  it('muestra badge Pendiente JTH cuando no está verificado', () => {
    const items = [
      {
        id: '1',
        nivelAcademico: 'PREGRADO',
        tituloObtenido: 'Ingeniero',
        institucion: 'UAO',
        estadoEstudio: 'FINALIZADO',
        verificadoEdFormal: false,
      },
    ];
    render(<FormacionAcademicaTab items={items} onSaved={vi.fn()} />);
    expect(screen.getByText('Pendiente JTH')).toBeInTheDocument();
  });

  it('bloquea edición cuando el registro está verificado', () => {
    const items = [
      {
        id: '1',
        nivelAcademico: 'PREGRADO',
        tituloObtenido: 'Ingeniero',
        institucion: 'UAO',
        estadoEstudio: 'FINALIZADO',
        verificadoEdFormal: true,
      },
    ];
    render(<FormacionAcademicaTab items={items} onSaved={vi.fn()} />);
    expect(screen.getByText('Bloqueado')).toBeInTheDocument();
    expect(screen.queryByText('Editar')).not.toBeInTheDocument();
  });
});