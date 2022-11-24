import { Gender } from 'src/auth/third/third.dto';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, RelationId, JoinColumn, Index } from 'typeorm';
import { UserStatusDto } from '../dto/auth.dto';
import { Role } from './role.entity';

/**
 * 用户信息entity
 */
@Entity("users")
export class User extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: 'int4',
        comment: "角色"
    })
    role_id: number;

    @Column({
        length: 64,
        comment: "昵称"
    })
    nickname: string;

    @Column({
        comment: "密码",
    })
    password: string;

    @Column({
        comment: "密码盐",
        nullable: true,
        default: '',
    })
    password_salt: string;

    @Column({
        comment: '性别',
        type: 'int2',
        nullable: true,
        default: Gender.UNKNOWN
    })
    gender: Gender;

    @Column({
        comment: '生日',
        type: 'timestamptz',
        nullable: true,
    })
    birthday: Date;

    @Column({
        comment: "头像",
        nullable: true
    })
    avatar: string;

    @Column({
        nullable: false,
        default: "+86",
        comment: "区号"
    })
    nation_code: string;

    @Column({
        comment: "手机号",
        nullable: true
    })
    @Index()
    mobile: string;

    @Column({
        comment: "邮箱",
        nullable: true
    })
    @Index()
    email: string;

    @Column({
        comment: "状态",
        nullable: true
    })
    @Index()
    status: UserStatusDto;

    @Column({
        type: 'int2',
        comment: "等级",
        nullable: true,
        default: 1
    })
    level: number;

    @Column({
        comment: "常住城市",
        nullable: true,
        default: '北京'
    })
    location: string;

    @Column({
        comment: "简介、个性签名",
        nullable: true,
        default: ``
    })
    intro: string;

    @Column({
        comment: '备注信息',
        nullable: true,
    })
    remark: string;

    @Column({
        comment: "押金余额[分]",
        default: 0
    })
    deposit_amount: number;

    @Column({
        nullable: true,
        comment: "会员过期时间",
        type: "timestamptz"
    })
    vip_expire_time: Date;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date;
}
