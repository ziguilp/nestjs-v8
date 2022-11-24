import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, DeleteDateColumn, Index } from 'typeorm';
import { NotifyPipe } from '../dto/base.dto';
/**
 * 系统消息
 */
@Entity("system_msg")
export class SystemMsg extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        comment: '消息的批次号',
        nullable: false
    })
    @Index()
    msg_no: string;

    @Column({
        type: 'uuid',
        comment: '接收方'
    })
    @Index()
    user_id: string;

    @Column({
        length: 64,
        comment: "消息标题"
    })
    @ApiProperty({
        name: 'title',
    })
    @IsNotEmpty({
        message: '消息标题不得为空'
    })
    @Length(1, 64, {
        message: '消息标题字数应在1~64'
    })
    title: string;

    @Column({
        length: 255,
        comment: "消息内容"
    })
    @ApiProperty({
        name: 'content',
    })
    @IsNotEmpty({
        message: '消息内容不得为空'
    })
    @Length(1, 255, {
        message: '消息内容字数应在1~255'
    })
    content: string;

    @Column({
        type: 'jsonb',
        nullable: true,
        comment: "通知发送渠道，为空则不发送通知"
    })
    pipes: NotifyPipe[];

    @Column({
        type: 'jsonb',
        comment: "通知发送结果",
        default: '{}'
    })
    result: { [key: string]: boolean };

    @Column({
        comment: "点击消息触发的链接地址",
        default: ''
    })
    link: string;

    @Column({
        type: 'boolean',
        comment: '是否已读',
        default: false
    })
    readed: boolean

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
