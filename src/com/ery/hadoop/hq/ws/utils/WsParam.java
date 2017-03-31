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
@Target(ElementType.ANNOTATION_TYPE)
public @interface WsParam {
    String name(); // 名称

    Class<?> valueType();// 参数值类型

    String defVal() default "";// 默认值

    String desc() default "";// 描述

    boolean required() default true;// 是必传参数,默认是(都必须传)
}
