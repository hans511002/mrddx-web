package com.ery.meta.module.mag.user;

/**


 * @description User 常量 <br>
 * @date 2011-09-22
 */
public class UserConstant{
    /**
     * 超级管理员用户ID
     */
    public static final int ADMIN_USERID = 1;
    /**
     * 用户表ETA_MAG_USER中state为1，表示用户有效

     */
    public static final int META_MAG_USER_STATE_ENABLE = 1;
    /**
     * 用户表ETA_MAG_USER中state为0，表示用户无效，已被禁用

     */
    public static final int META_MAG_USER_STATE_DISABLE = 0;

    /**
     * 用户表ETA_MAG_USER中state为2，表示用户正被审核，不能登录
     */
    public static final int META_MAG_USER_STATE_AUDITING = 2;

    /**
     * 用户表ETA_MAG_USER中state为2，表示用户已被锁定，不能登录
     */
    public static final int META_MAG_USER_STATE_LOCK = 3;

    /**
     * 管理员标识是管理员
     */
    public static final int ADMIN_FLAG_IS_ADMIN=1;
    /**
     * 管理员标识非管理员
     */
    public static final int ADMIN_FLAG_ISNOT_ADMIN=0;
    /**
     * 当前系统状态有效
     */
    public static final int META_MENU_GROUP_STATE_ENABLE = 1;
    /**
     * 当前系统已被锁定
     */
    public static final int META_MENU_GROUP_STATE_DISENABLE = 0;
    /**
     * 用户修改类型
     */
    public static  final String META_MAG_USER_CHANGE_TYPE = "USER_CHANGE_TYPE";
    /**
     * 密码删除
     */
    public static final String META_MAG_USER_CHANGE_NAME_DELETEPAS = "1";
    /**
     * 用户状态建立
     */
    public static final String META_MAG_USER_CHANGE_NAME_ADDSTATE = "2";
    /**
     * 用户状态审核通过
     */
    public static final String META_MAG_USER_CHANGE_NAME_AUDITSTATEPASS = "3";
    /**
     * 用户被启用
     */
    public static final String META_MAG_USER_CHANGE_NAME_STARTUSER = "4";
    /**
     * 用户被禁用
     */
    public static final String META_MAG_USER_CHANGE_NAME_DISABLEUSER = "5";
    /**
     * 用户状态删除
     */
    public static final String META_MAG_USER_CHANGE_NAME_DELETESTATE = "6";
    /**
     * 密码建立
     */
    public static final String META_MAG_USER_CHANGE_NAME_ADDPAS = "7";
    /**
     *  密码修改
     */
    public static final String META_MAG_USER_CHANGE_NAME_MODIFYPAS = "8";
    /**
     * 修改类型为服务器自动修改
     */
    public static  final int META_MAG_USER_EDITOR_TYPE_AUTO = 0;
    /**
     * 修改类型为手动修改
     */
    public static  final int META_MAG_USER_EDITOR_TYPE_MANUAL = 1;
    /**
     * 修改类型为申请，此时没有操作人id
     */
    public static final int META_MAG_USER_EDITOR_TYPE_APPLY = -1;
    /**
     * 码表对应的用户状态
     */
    public static final String META_MAG_USER_STATE = "USER_STATE";
}
