<!--
 * @Author: turbo 664120459@qq.com
 * @Date: 2022-11-24 10:44:10
 * @LastEditors: turbo 664120459@qq.com
 * @LastEditTime: 2022-11-24 12:04:42
 * @FilePath: /nestjs-v8/README.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
 

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.


## 中文文档

[nestjs中文文档](https://docs.nestjs.cn/8/introduction)


## Installation

```bash
$ npm install 或者 yarn
```

## Running the app

```bash
# development
$ npm run start 或者 yarn start

# watch mode
$ npm run start:dev 或者 yarn start:dev

# production mode
$ npm run start:prod 或者 yarn start:prod
```

## Test

```bash
# unit tests
$ npm run test 或者 yarn test

# e2e tests
$ npm run test:e2e 或者 yarn test:e2e

# test coverage
$ npm run test:cov 或者 yarn test:cov
```

## 做了以下的基础封装或者实现了一些基础的功能
- 简易的cms管理：可作为常用的简易内容发布管理
- 内容举报/反馈
- app版本管理
- 请求权限验证
- 内置了定时任务/队列的样例
- 内置了基于凌凯的短信通道、极光推送、微信消息发送、邮件发送
- 内置支持了aliOss 和 七牛云存储 的token获取支持，可以提供token给客户端进行直传
- 内置了AWS的cloudWatch的实现，检测到配置后，日志将上传至cloudWatch 

## 基于nestjs 对控制器方法做了一些处理
```JavaScript
/**
 * 权限
 * 访问该方法时需要有相应的权限 get-auth-list 方可访问该方法
 * 
 */ 
@Rights('get-auth-list') 
async test1(){
    
}

/**
 * 请求锁🔐
 * 标志着该方法会被锁定 
 * 以避免同一个用户同时对该方法发起多次请求
 * 注意：此方法不应当作为数据库事务🔐使用
 */
@RequestLock({
    key: string | Function,
    expiresIn: 10
})
async test2(){

}

/**
 * 请求验证码
 * 标注后：该方法要求参数 body 中必须带 相应的参数(见下列格式)
 * 该方法将在验证器中自动完成验证码校验
 * 注意！！！该请求必须为POST
 */
@Captcha(EVENT_NAME) 
async test3(){

}
// 验证码传值格式
// body
{
    // 这种优先级高
    captchaVerifyData: {
        event: '', //验证事件名称
        captcha: '', //验证码
        username: '',//被验证账号手机号或者邮箱
    }
}
// 或者
{
    event: '', //验证事件名称
    captcha: '', //验证码
    username: '',//被验证账号手机号或者邮箱
}

```

## 注意首次启动时，使用pgsql数据库需安装拓展
```sql
create extension "uuid-ossp" ;

```


## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
