import { ThirdPlatformDto } from 'src/auth/third/third.dto';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, Index, DeleteDateColumn } from 'typeorm';

/**
 * 用户第三方授权信息entity
 */
@Entity("users_third_auth")
export class UserThirdAuth extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "varchar",
        comment: "三方平台标识"
    })
    third_platform: ThirdPlatformDto;

    @Column({
        type: "varchar",
        comment: "三方授权信息ID"
    })
    @Index()
    third_openid: string;

    @Column({
        type: "varchar",
        comment: "三方授权信息UNIONID",
        nullable: true
    })
    @Index()
    third_unionid: string;

    @Column({
        type: "uuid",
        comment: "绑定的系统用户id"
    })
    @Index()
    user_id: string;

    @Column({
        comment: "授权昵称"
    })
    name: string;

    @Column({
        comment: "授权头像"
    })
    avatar: string;

    @Column({
        comment: "三方授权信息",
        type: "jsonb",
        nullable: true
    })
    third_info: string;

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
    @Index()
    date_deleted: Date;
}
