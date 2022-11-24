import { Gender } from "src/auth/third/third.dto";
import { ViewColumn, ViewEntity } from "typeorm";
import { UserStatusDto } from "../dto/auth.dto";
import { User } from "../entity/user.entity";

@ViewEntity("view_user", {
    expression: `
        SELECT
        u.*,
        CASE WHEN u.vip_expire_time > now() THEN true
        ELSE false END as is_vip,
        role.name as role_name,
        role.rights as role_rights,
        role.date_deleted as role_date_deleted
        FROM "public".users u
        LEFT JOIN "public"."role" ON ("role".id = u.role_id)
        `,
    dependsOn: [User],
    synchronize: true
})
export class ViewUser {
    @ViewColumn()
    id: string;

    @ViewColumn()
    role_id: number;

    @ViewColumn()
    nickname: string;

    @ViewColumn()
    password: string;

    @ViewColumn()
    password_salt: string;

    @ViewColumn()
    avatar: string;

    @ViewColumn()
    nation_code: string;

    @ViewColumn()
    mobile: string;

    @ViewColumn()
    email: string;

    @ViewColumn()
    birthday: Date;

    @ViewColumn()
    gender: Gender;

    @ViewColumn()
    intro: string;

    @ViewColumn()
    location: string;

    @ViewColumn()
    remark: string | null;

    @ViewColumn()
    role_name: string | null;

    @ViewColumn()
    role_rights: string[] | null;

    @ViewColumn()
    role_date_deleted: Date | null;

    @ViewColumn()
    vip_expire_time: Date;

    @ViewColumn()
    is_vip: boolean;

    @ViewColumn()
    status: UserStatusDto;

    @ViewColumn()
    deposit_amount: number;

    @ViewColumn()
    date_created: Date;

    @ViewColumn()
    date_updated: Date;
}