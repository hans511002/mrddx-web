package com.ery.hadoop.hq.ws.utils;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**

 * 

 * @description
 * @date 12-10-30 -
 * @modify
 * @modifyDate -
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface WsParams {
    WsParam[] value();// 多个参数
}
