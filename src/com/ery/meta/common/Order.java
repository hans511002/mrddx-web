package com.ery.meta.common;

import java.util.*;

public class Order {

    public final static String ASC = "ASC";  //升序
    public final static String DESC = "DESC";//降序

    private String orderMode = ASC;  //排序方式默认升序
    private String orderField = "";  //排序字段（实际使用时根据表初始)

    public Order() {
    }

    public Order(String orderMode, String orderField) {
        this.orderMode = orderMode;
        this.orderField = orderField;
    }

    public String getOrderMode() {
        return orderMode;
    }

    public void setOrderMode(String orderMode) {
        this.orderMode = orderMode;
    }

    public String getOrderField() {
        return orderField;
    }

    public void setOrderField(String orderField) {
        this.orderField = orderField;
    }
}
