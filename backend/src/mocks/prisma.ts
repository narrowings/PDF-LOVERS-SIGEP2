import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

jest.mock('../config/database', () => ({
  prisma: prismaMock,
}));

export type MockPrisma = DeepMockProxy<PrismaClient>;