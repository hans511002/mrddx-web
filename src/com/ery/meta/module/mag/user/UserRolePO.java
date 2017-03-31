package com.ery.meta.module.mag.user;


public class UserRolePO {
    /**
     * 用户ID
     */
    Integer userId = 0;
    /**
     * 角色ID
     */
    Integer roleId = 0;
    /**
     * 对角色是否有赋予权限
     */
    Integer grantFlag = 0;
    /**
     * 对角色是否有管理权限
     */
    Integer magFlag = 0;

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public Integer getGrantFlag() {
        return grantFlag;
    }

    public void setGrantFlag(Integer grantFlag) {
        this.grantFlag = grantFlag;
    }

    public Integer getMagFlag() {
        return magFlag;
    }

    public void setMagFlag(Integer magFlag) {
        this.magFlag = magFlag;
    }
}
