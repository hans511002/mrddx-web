package com.ery.meta.module.mag.user;

/**

 * All rights reserved.
 * 用户-菜单关联关系表 META_MAG_USER_MENU

 * @date 2011-9-26
 * ----------------------
 * @modify 王晶
 *  添加了姓名是否有拥有该菜单等属性
 *  
 * @modifyDate 2011-9-29
 */
public class UserMenuPO {
    /**
     * 用户ID
     */
    Integer userId;

    /**
     * 菜单ID
     */
    Integer menuId;

    /**
     * 无权限的按钮
     */
    String excludeButton;

    /**
     * 状态
     */
    Integer flag;
    /**
     * 用户姓名
     */
    private String userName;
    /**
     * 用户姓名拼音
     */
    private String userNameCn;
    /**
     * 用户邮箱
     * */
    private String userEmail;
    /**
     * 用户手机
     * */
    private String userMobile;
    /**
     * 地域
     * */
    private String userZone;
    /**
     * 部门
     * */
    private String userDept;
    /**
     * 岗位
     * */
    private String userStation;
    /**
     * 是否拥有该菜单,只是一个标示用于参数的传递 1代表有,0或者null代表没有
     * */
    private int  menuExclude;
    
    public int getMenuExclude() {
		return menuExclude;
	}

	public void setMenuExclude(int menuExclude) {
		this.menuExclude = menuExclude;
	}

	public String getUserName() {
		return userName;
	}

	public void setUserName(String userName) {
		this.userName = userName;
	}

	public String getUserNameCn() {
		return userNameCn;
	}

	public void setUserNameCn(String userNameCn) {
		this.userNameCn = userNameCn;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

	public String getUserMobile() {
		return userMobile;
	}

	public void setUserMobile(String userMobile) {
		this.userMobile = userMobile;
	}

	public String getUserZone() {
		return userZone;
	}

	public void setUserZone(String userZone) {
		this.userZone = userZone;
	}

	public String getUserDept() {
		return userDept;
	}

	public void setUserDept(String userDept) {
		this.userDept = userDept;
	}

	public String getUserStation() {
		return userStation;
	}

	public void setUserStation(String userStation) {
		this.userStation = userStation;
	}

	public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getMenuId() {
        return menuId;
    }

    public void setMenuId(Integer menuId) {
        this.menuId = menuId;
    }

    public String getExcludeButton() {
        return excludeButton;
    }

    public void setExcludeButton(String excludeButton) {
        this.excludeButton = excludeButton;
    }

    public Integer getFlag() {
        return flag;
    }

    public void setFlag(Integer flag) {
        this.flag = flag;
    }
}
