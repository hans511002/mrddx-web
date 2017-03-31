package com.ery.meta.common;


public class Page {

    /**
     * 起始行数
     */
    private int posStart=0;
    /**
     * 每页记录数
     */
    private int count=15;
    
    private int total = 0;//总记录数

    public Page() {
    }

    public Page(int posStart, int count) {
        this.posStart = posStart;
        this.count = count;
    }

    //下一页
    public boolean next(){
        if(this.posStart+this.count<this.total){
            this.posStart += this.count;
            return true;
        }
        return false;
    }

    //上一页
    public boolean previous(){
        if(this.posStart>=this.count){
            this.posStart -= this.count;
            return true;
        }
        return false;
    }

    //末页
    public boolean last(){
        if(total>0){
            int pageNum = (this.total+this.count-1)/this.count;
            this.posStart = (pageNum-1)*this.count;
            return true;
        }
        return false;
    }

    //首页
    public boolean first(){
        if(total>0){
            this.posStart = 0;
            return true;
        }
        return false;
    }

    public int getPosStart() {
        return posStart;
    }

    public void setPosStart(int posStart) {
        this.posStart = posStart;
    }

    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }
}
