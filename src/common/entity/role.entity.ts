import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, DeleteDateColumn } from 'typeorm';
import { User } from './user.entity';
/**
 * 角色entity
 */
@Entity("role")
export class Role extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        length: 64, 
        comment: "角色名称"
    })
    name: string;

    @Column({
        length: 64, 
        nullable: true,
        comment: "角色解释"
    })
    explain: string;
  
    @Column({
        type: 'jsonb', 
        comment: "角色权限"
    })
    rights: string[];

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date; 

    @DeleteDateColumn({
        type: "timestamptz"
    })
    date_deleted: Date; 
}
