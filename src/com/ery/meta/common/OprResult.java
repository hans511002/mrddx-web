package com.ery.meta.common;


public class OprResult<T1,T2>{
    /**
     * 操作前原ID
     */
    private T1 sid;

    /**
     * 做数据持久化之后的数据ID
     */
    private T1 tid;

    /**
     * 操作类型，也反映操作结果。
     */
    private OprResultType type;

    /**
     * 操作成功后的数据，此非必要
     */
    private T2 successData;

    /**
     * 操作类型枚举
     */
    public enum  OprResultType{
        insert,//新增
        update,//修改
        
        //谭万昌add  用于校验数据库是否存在名称和序列，为不影响其他代码，在此加入两个变量
        nameExist,//名称存在
        snExist,	//序列存在
        
        delete,//删除
        invalid,//操作出现问题
        error//操作出现错误
    }
    public OprResult(){
    }

    public OprResult(T1 sid, T1 tid, OprResultType type){
        this.sid = sid;
        this.tid = tid;
        this.type = type;
    }

    public T1 getSid(){
        return sid;
    }

    public void setSid(T1 sid){
        this.sid = sid;
    }

    public T1 getTid(){
        return tid;
    }

    public void setTid(T1 tid){
        this.tid = tid;
    }

    public OprResultType getType(){
        return type;
    }

    public void setType(OprResultType type){
        this.type = type;
    }

    public T2 getSuccessData(){
        return successData;
    }

    public void setSuccessData(T2 successData){
        this.successData = successData;
    }
}
