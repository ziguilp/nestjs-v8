import { EntityManager } from "typeorm";

export class OrderLibContructor {

    protected entityManager: EntityManager;

    constructor(entityManager: EntityManager) {
        this.entityManager = entityManager;
    }
}