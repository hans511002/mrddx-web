package com.ery.meta.module.mag.role;


public class RoleMenuPO {
    /**
     * 角色ID
     */
    Integer roleId;
    /**
     * 菜单ID
     */
    long menuId;
    /**
     * 没有权限的按钮
     */
    String excludeButton;

    /**
     * 是否拥有该菜单,只是一个标示用于参数的传递 1代表有,0或者null代表没有
     * */
    private int  menuExclude;
    
    public Integer getRoleId() {
        return roleId;
    }

    public void setRoleId(Integer roleId) {
        this.roleId = roleId;
    }

    public long getMenuId() {
        return menuId;
    }

    public void setMenuId(long menuId) {
        this.menuId = menuId;
    }

    public String getExcludeButton() {
        return excludeButton;
    }

    public void setExcludeButton(String excludeButton) {
        this.excludeButton = excludeButton;
    }

	public int getMenuExclude() {
		return menuExclude;
	}

	public void setMenuExclude(int menuExclude) {
		this.menuExclude = menuExclude;
	}
}
