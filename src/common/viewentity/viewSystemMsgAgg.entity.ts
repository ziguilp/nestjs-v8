import { Gender } from "src/auth/third/third.dto";
import { ViewColumn, ViewEntity } from "typeorm";
import { SystemMsg } from "../entity/systemMsg.entity";

@ViewEntity("view_system_msg_agg", {
    expression: `SELECT
        msg_no,
        title,
        content,
        link,
        count(DISTINCT user_id) as user_count,
        count(DISTINCT user_id) FILTER (WHERE result::text LIKE '%true%' OR pipes::text = '[]' ) as success_count,
        count(DISTINCT user_id) FILTER(WHERE readed = true) as readed_count,
        min(date_created) as date_created
        FROM "public".system_msg 
        GROUP BY msg_no,title,content,link`,
    dependsOn: [SystemMsg],
    synchronize: true
})
export class ViewSystemMsgAgg {

    @ViewColumn()
    msg_no: string;


    @ViewColumn()
    title: string;

    @ViewColumn()
    content: string;

    @ViewColumn()
    link: string;

    @ViewColumn()
    user_count: number;

    @ViewColumn()
    success_count: number;

    @ViewColumn()
    readed_count: number;

    @ViewColumn()
    date_created: Date;
}