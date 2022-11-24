import { BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, Index, JoinColumn, PrimaryGeneratedColumn, Tree, TreeChildren, TreeParent, UpdateDateColumn } from "typeorm";

@Entity('auth_rights')
export class AuthRights extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Index({ unique: true })
    @Column({
        comment: "权限key"
    })
    key: string;

    @Index()
    @Column({
        comment: "父级",
        nullable: true
    })
    parent_id: number;

    @Column({
        nullable: true,
        comment: "权限名称"
    })
    name: string;

    @Column({ 
        comment: "路径"
    })
    path: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date;

    @DeleteDateColumn({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;

    @TreeChildren()
    children: AuthRights[];

    @TreeParent()
    @JoinColumn({name: "parent_id"})
    parent: AuthRights;
}