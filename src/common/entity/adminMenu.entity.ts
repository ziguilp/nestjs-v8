import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';

/**
 * 角色entity
 */
 @Entity("admin_menu")
 export class AdminMenu extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        nullable: true,
        comment: "父级菜单"
    })
    parent_id: number;

    @Column({
        length: 64, 
        comment: "名称"
    })
    name: string;

    @Index({ unique: true })
    @Column({
        length: 255, 
        nullable: true,
        comment: "路由"
    })
    link: string;
    

    @Column({
        length: 255, 
        nullable: true,
        comment: "icon"
    })
    icon: string;

    @CreateDateColumn({
        type: "timestamptz"
    })
    date_created: Date;

    @UpdateDateColumn({
        type: "timestamptz"
    })
    date_updated: Date;

    @Column({
        nullable: true,
        type: "timestamptz"
    })
    date_deleted: Date;
      
    @ManyToOne(type => AdminMenu, admin_menu => admin_menu.children)
    @JoinColumn({name: "parent_id"})
    parent: AdminMenu;

    @OneToMany(type => AdminMenu, admin_menu => admin_menu.parent)
    children: AdminMenu[];
 }
 