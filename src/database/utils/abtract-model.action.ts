import { DeepPartial, EntityManager, EntityTarget, FindOptionsWhere, Repository } from "typeorm";

export abstract class AbstractModelAction<T extends { id: string }> {
    protected readonly repository: Repository<T>;
    protected readonly entityClass: EntityTarget<T>;

    constructor(repository: Repository<T>, entityClass: EntityTarget<T>) {
        this.repository = repository;
        this.entityClass = entityClass;
    }

    async get(opts: {
        identifierOptions: FindOptionsWhere<T>;
        relations?: Record<string, any>;
    }): Promise<T | null> {
        return this.repository.findOne({
            where: opts.identifierOptions,
            relations: opts.relations,
        });
    }

    async list(opts: {
        filterRecordOptions?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
        paginationPayload?: { page: number; limit: number; };
        relations?: Record<string, any>;
        order?: Record<string, 'ASC' | 'DESC'>;
    }): Promise<{ payload: T[]; paginationMeta: PaginationMeta }> {
        const page = opts.paginationPayload?.page ?? 1;
        const limit = opts.paginationPayload?.limit ?? 20;

        const [payload, total] = await this.repository.findAndCount({
            where: opts.filterRecordOptions,
            relations: opts.relations,
            order: opts.order as any,
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            payload,
            paginationMeta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrevious: page > 1,
            },
        };
    }

    async create(opts: {
        createPayload: DeepPartial<T>;
        transactionOptions: TransactionOptions;
    }): Promise<T> {
        const manager = resolveManager(this.repository, opts.transactionOptions);
        const entity = manager.create(this.entityClass, opts.createPayload);
        return manager.save(this.entityClass, entity);
    }

    async update(opts: {
        identifierOptions: FindOptionsWhere<T>;
        updatePayload: DeepPartial<T>;
        transactionOptions: TransactionOptions;
    }): Promise<T | null> {
        const manager = resolveManager(this.repository, opts.transactionOptions);
        await manager.update(this.entityClass, opts.identifierOptions, opts.updatePayload as any);
        return this.get({ identifierOptions: opts.identifierOptions });
    }

    async delete(opts: {
        identifierOptions: FindOptionsWhere<T>;
        transactionOptions: TransactionOptions;
    }): Promise<void> {
        const manager = resolveManager(this.repository, opts.transactionOptions);
        await manager.softDelete(this.entityClass, opts.identifierOptions);
    }
}

type TransactionOptions = 
    | { useTransaction: false }
    | { useTransaction: true; transaction: EntityManager };

function resolveManager<T extends { id: string }>(repo: Repository<T>, opts: TransactionOptions,): EntityManager {
    return opts.useTransaction ? opts.transaction : repo.manager;
}

interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}