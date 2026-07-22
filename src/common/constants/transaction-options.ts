import { EntityManager } from 'typeorm';

export const noTransaction = () => ({
  transactionOptions: { useTransaction: false as const },
});

export const withTransaction = (transaction: EntityManager) => ({
  transactionOptions: { useTransaction: true as const, transaction },
});
