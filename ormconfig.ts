/*
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 12:21:25
 * @FilePath: /nestjs-v8/ormconfig.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
    name: "default",
    type: 'postgres',
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USER || 'nestv8',
    password: process.env.DATABASE_PWD || 'nestv8',
    database: process.env.DATABASE_DB || 'nestv8',
    schema: process.env.DATABASE_SCHEME || 'public',
    autoLoadEntities: true,
    logging: process.env.DATABASE_LOG && process.env.DATABASE_LOG == 'false' ? false : true,
    /*
    指示是否在每次应用程序启动时自动创建数据库架构。 
    请注意此选项，不要在生产环境中使用它，否则将丢失所有生产数据。
    但是此选项在调试和开发期间非常有用。
    作为替代方案，你可以使用 CLI 运行 schema：sync 命令。请注意，对于 MongoDB 数据库，它不会创建模式，因为 MongoDB 是无模式的。相反，它只是通过创建索引来同步。
    */
    synchronize: process.env.TYPEORM_SYNC == 'true' ? true : false,
    cli: {
        entitiesDir: "./src/common/entity",
        migrationsDir: "./src/common/migration",
        subscribersDir: "./src/common/subscriber"
    }
}