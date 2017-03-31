package com.ery.meta.common;

public class CodeBean {

    public CodeBean(String type, String showItem, String colItem) {
        this.type = type;
        this.showItem = showItem;
        this.colItem = colItem;
    }

    private String type;//CODE TYPE
    private String showItem;//通过码表转换之后显示的字段名
    private String colItem;//SQL语句中关联码表的字段名

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getShowItem() {
        return showItem;
    }

    public void setShowItem(String showItem) {
        this.showItem = showItem;
    }

    public String getColItem() {
        return colItem;
    }

    public void setColItem(String colItem) {
        this.colItem = colItem;
    }
}
