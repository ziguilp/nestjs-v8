import { ViewColumn, ViewEntity } from "typeorm";
import { SystemMsg } from "../entity/systemMsg.entity";
import { User } from "../entity/user.entity";

@ViewEntity("view_system_msg", {
    expression: `with u as (
            select id,nickname,avatar from public.users
        )
        SELECT
        msg.*,
        (json_agg(u.*)->>0)::jsonb as user_info
        FROM "public".system_msg msg
        LEFT JOIN u ON (u.id = msg.user_id)
        WHERE msg.date_deleted is null 
        GROUP BY msg.id,
        msg.msg_no,
        msg.user_id,
        msg.title,
        msg.content,
        msg.link,
        msg.readed,
        msg.result,
        msg.date_created,
        msg.date_updated,
        msg.date_deleted
        `,
    dependsOn: [User, SystemMsg],
    synchronize: true
})
export class ViewSystemMsg {
    @ViewColumn()
    id: number;

    @ViewColumn()
    msg_no: string;

    @ViewColumn()
    user_id: string;

    @ViewColumn()
    title: string;

    @ViewColumn()
    content: string;

    @ViewColumn()
    link: string;

    @ViewColumn()
    merchant_id: number;

    @ViewColumn()
    readed: boolean;

    @ViewColumn()
    result: { [key: string]: boolean };

    @ViewColumn()
    user_info: {
        id: string,
        nickname: string,
        avatar: string
    };

    @ViewColumn()
    date_created: Date;

    @ViewColumn()
    date_updated: Date;
}