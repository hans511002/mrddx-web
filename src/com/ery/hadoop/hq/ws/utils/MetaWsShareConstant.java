package com.ery.hadoop.hq.ws.utils;

public class MetaWsShareConstant {
    public static String JAR_FILE_PATH = "";// 自实现jar

    public static final int DATA_TYPE_VARCHAR = 0;// 字符
    public static final int DATA_TYPE_NUMBER = 1;// 数字
    public static final int DATA_TYPE_TABLENAME = 2;// 表名
    public static final int DATA_TYPE_FIELDNAME = 3;// 字段名
    public static final int DATA_TYPE_TABLEUSER = 4;// 表用户
    public static final int DATA_TYPE_OTHER = 5;// 其他

    public static final int EXEC_STATE_SUCCESS = 1;// 成功
    public static final int EXEC_STATE_FAILURE = 0;// 失败

    public static final int RETURN_TYPE_VOID = 1;// 无
    public static final int RETURN_TYPE_ARRAY = 2;// 数组
    public static final int RETURN_TYPE_MAP = 3;// 哈希
    public static final int RETURN_TYPE_MAPARRAY = 4;// 哈希对象数组
    public static final int RETURN_TYPE_VAL = 5;// 单值

    public static final int RULE_IMPL_SQL = 0;// SQL 实现方式
    public static final int RULE_IMPL_JAR = 1;// JAR 实现方式
    public static final String RETURN_TYPE_NAME = "RETURN_TYPE"; // 服务返回类型
    public static final String RULE_TYPE_NAME = "WS_RULE_TYPE"; // 服务操作类型
    public static final String RULE_IMPL_TYPE_NAME = "WS_RULE_IMPL_TYPE"; // 服务实现类型
    public static final String RULE_STATE_NAME = "WS_RULE_STATE";
    public static final String USER_STATE_NAME = "WS_USER_STATE";
    public static final String LOG_ISSUCCESS = "LOG_ISSUCCESS";
}
