import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { OperateLogParams } from '../dto/operatelog.dto';
 
/**
 * 操作日志entity
 */
@Entity("operate_log")
export class OperateLog extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'uuid',
        nullable: true,
        comment: "用户ID"
    })
    @Index()
    user_id: string;

    @Column({
        nullable: true,
        comment: "访问路由"
    })
    path: string;
  
    @Column({
        type: 'jsonb', 
        comment: "参数"
    })
    params: OperateLogParams;

    @Column({
        comment: "IP"
    })
    ip: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;
}
