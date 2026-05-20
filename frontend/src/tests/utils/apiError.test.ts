import { describe, it, expect } from 'vitest';
import { getApiError } from '../../utils/apiError';
import axios from 'axios';

describe('getApiError', () => {
  it('retorna mensaje de error de axios con message', () => {
    const error = {
      isAxiosError: true,
      response: { data: { message: 'Credenciales inválidas' } },
      message: 'Request failed',
    };
    Object.setPrototypeOf(error, axios.AxiosError.prototype);
    expect(getApiError(error)).toBe('Credenciales inválidas');
  });

  it('retorna errores de validación concatenados', () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          errors: {
            campo1: ['Requerido'],
            campo2: ['Muy corto'],
          },
        },
      },
      message: 'Validation error',
    };
    Object.setPrototypeOf(error, axios.AxiosError.prototype);
    expect(getApiError(error)).toBe('Requerido. Muy corto');
  });

  it('retorna mensaje si es instancia de Error', () => {
    const error = new Error('algo salió mal');
    expect(getApiError(error)).toBe('algo salió mal');
  });

  it('retorna Error desconocido si no es reconocible', () => {
    expect(getApiError('string raro')).toBe('Error desconocido');
  });
});