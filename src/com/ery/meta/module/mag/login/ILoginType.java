package com.ery.meta.module.mag.login;

import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;



public interface ILoginType{
    /**
     * 定义登录结果枚举类
     */
    public enum LoginResult{
        SUCCESS,//登录成功
        ERROR_DISABLED,//该用户已被禁用
        ERROR_LOCKING,/*该用户已被锁定*/
        ERROR_AUDITING,//该用户正在审核中
        ERROR_USER_PASSWD,//用户名或或者密码错误
        ERROR_NAME_REPEAT,//中文名重复
        ERROR_VALIDATECODE,//验证码错误
        ERROR_VALIDATEOVERDUE,//验证码过期
        ERROR_GROUP_DISENBLE,//用户系统无效
        USER_FIRST_LOGIN,//用户第一次登录
        USER_TIP_MODIFY_PASS,//用户需要提示修改密码
        USER_FORCE_MODIFY_PASS//用户需要强制修改密码
    }

    /**
     * login实现具体方法，用于实现具体登录逻辑
     * @param loginMessage
     * @return
     */
    public LoginResult login(Map<String,Object> loginMessage);

    /**
     * 设置Dao对象。
     * @param loginDAO
     */
    public void setLoginDAO(BaseDAO loginDAO);

    /**
     * 登录成功之后返回用户的数据
     * @return
     */
    public Map<String,Object> getUserData();


}
