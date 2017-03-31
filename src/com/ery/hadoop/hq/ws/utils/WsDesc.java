package com.ery.hadoop.hq.ws.utils;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**

 * 

 * @description 类说明
 * @date 12-11-5 -
 * @modify
 * @modifyDate -
 */
@Documented
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
public @interface WsDesc {
    String value() default "";
}
