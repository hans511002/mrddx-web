package com.ery.meta.module.mag.login;

import java.util.Map;


public class LoginWsImpl extends LoginBiMetaImpl{
    /**
     * 返回null代表无先绝性验证。
     * @param loginMessage
     * @return
     */
    public LoginResult beginLogin(Map<String, Object> loginMessage){
        return null;
    }
}
