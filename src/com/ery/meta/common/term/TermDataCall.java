package com.ery.meta.common.term;

import java.util.Map;


public interface TermDataCall {

    /**
     * 添加附加值传回客户端
     * 此值不参与客户端数据绑定，一般用于传回客户端判断回调用，大多是一些状态码
     * 绑定多次时，会覆盖相同的key
     * @param key
     * @param value
     */
    public void appendDataToClient(String key,Object value);

    /**
     * 覆盖客户端条件属性,比如
     * 维度查询时会根据数据量把客户端控件类型变成下拉框或树
     * 时间维度时则会把客户端控件变成日期选择框
     * @param key 其值必须来自TermConstant里面定义的常量，否则无效
     * @param value
     */
    public void coverTermAttribute(String key,Object value);

}
