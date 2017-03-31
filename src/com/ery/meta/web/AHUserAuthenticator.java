package com.ery.meta.web;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.jasig.cas.client.validation.Assertion;

import com.ery.meta.module.mag.dept.DeptDAO;
import com.ery.meta.module.mag.group.GroupDAO;
import com.ery.meta.module.mag.login.LoginAction;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.module.mag.station.StationDAO;
import com.ery.meta.module.mag.zone.ZoneDAO;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.tydic.sso.remote.RemoteServiceFactory;
import com.tydic.sso.service.DbpRemoteService;
import com.tydic.sso.service.base.Privilege;
import com.tydic.webpoint.sso.authenticator.SSO;

public class AHUserAuthenticator implements SSO {

	private ZoneDAO zoneDAO;
	private DeptDAO deptDAO;
	private StationDAO stationDAO;
	private GroupDAO groupDAO;

	public String getAuthenticatorUser(HttpServletRequest arg0, String arg1) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	@SuppressWarnings("unchecked")
	public boolean isEnrty(final HttpServletRequest request, final HttpServletResponse response,
			final Assertion assertion) throws Exception {
		HttpSession session = request.getSession();
		Privilege priv = null; // 用户功能权根
		// List<Privilege> priv1 = new ArrayList<Privilege>(); //下一层级用户功能权根
		// String ParentPrivilegeCode = "";
		List menuId = new ArrayList(); // 菜单ID
		String url = SystemVariable.getString("AH_url", "http://134.64.101.174:7001/sso/service/dbpRemoteService");
		if (session.getAttribute(LoginConstant.SESSION_KEY_USER) == null) {
			String userName = assertion.getPrincipal().getName();
			LogUtils.info("已经获取中央服务器认证用户名:{}" + userName);
			DbpRemoteService service = (DbpRemoteService) (new RemoteServiceFactory(url)).getInstance();
			List<Privilege> list = service.getStaffPrivilegeByAcct(userName, "119");
			for (int i = 0; i < list.size(); i++) {
				priv = list.get(i);
				if (null != priv.getExtPropertis()) {
					menuId.add(priv.getExtPropertis());
				}
			}

			/*
			 * for(int i=0;i<list.size();i++){ priv = list.get(i);
			 * if("基础信息数据管理平台".equals(priv.getPrivilegeName())){
			 * ParentPrivilegeCode = Long.toString(priv.getPrivilegeCode()); } }
			 * for(int j=0;j<list.size();j++){ priv = list.get(j); String
			 * getPrivilegeCode = "";
			 * if(ParentPrivilegeCode.equals(Long.toString
			 * (priv.getParentPrivilegeCode()))){ getPrivilegeCode =
			 * Long.toString(priv.getPrivilegeCode());
			 * menuId.add(getPrivilegeCode
			 * .substring(ParentPrivilegeCode.length()
			 * ,getPrivilegeCode.length())); priv1.add(priv); }
			 * 
			 * } for(int k=0;k<priv1.size();k++){ priv = priv1.get(k); String
			 * ParentCode = Long.toString(priv.getPrivilegeCode()); for(int
			 * h=0;h<list.size();h++){ String getPrivilegeCode = ""; Privilege
			 * priv2 = list.get(h);
			 * if(ParentCode.equals(Long.toString(priv2.getParentPrivilegeCode
			 * ()))){ getPrivilegeCode =
			 * Long.toString(priv2.getPrivilegeCode());
			 * menuId.add(getPrivilegeCode
			 * .substring(ParentCode.length(),getPrivilegeCode.length())); } } }
			 */

			Map<String, Object> user = assertion.getPrincipal().getAttributes();
			Map<String, Object> userData = new HashMap<String, Object>();
			AHLoginAction ahLoginAction = new AHLoginAction();
			ahLoginAction.setAhLoginDao(new AHLoginDao());

			// 查询该用户信息
			userData = ahLoginAction.getUserDate(user);

			// 将该用户对应的菜单删除后，重新插入
			ahLoginAction.setMenu(userData, menuId);

			// 对MAP键的格式进行转换
			userData.put("userId", userData.get("USER_ID").toString());
			userData.put("userNamecn", userData.get("USER_NAMECN") == null ? "" : userData.get("USER_NAMECN")
					.toString());
			userData.put("adminFlag", userData.get("ADMIN_FLAG") == null ? 0 : userData.get("ADMIN_FLAG").toString());
			userData.put("userEmail", userData.get("USER_EMAIL") == null ? "" : userData.get("USER_EMAIL").toString());
			userData.put("state", userData.get("STATE") == null ? 1 : userData.get("STATE").toString());
			userData.put("userNameen", userData.get("USER_NAMEEN") == null ? "" : userData.get("USER_NAMEEN")
					.toString());
			userData.put("zoneId", userData.get("ZONE_ID") == null ? "" : userData.get("ZONE_ID").toString());
			userData.put("userMobile", userData.get("USER_MOBILE") == null ? "" : userData.get("USER_MOBILE")
					.toString());
			userData.put("userPass", "96e79218965eb72c92a549dd5a330112");

			session.setAttribute(LoginConstant.SESSION_KEY_USER, userData);
			LoginAction la = new LoginAction();
			la.setZoneDAO(new ZoneDAO());
			la.setDeptDAO(new DeptDAO());
			la.setStationDAO(new StationDAO());
			la.setGroupDAO(new GroupDAO());

			// 安徽SSO初始化SessionManager信息
			la.initSession_AH(session, userData, null);

		}
		return true;
	}

	public void outEnrty(HttpSession arg0, String arg1) throws Exception {
		// TODO Auto-generated method stub

	}

	public ZoneDAO getZoneDAO() {
		return zoneDAO;
	}

	public void setZoneDAO(ZoneDAO zoneDAO) {
		this.zoneDAO = zoneDAO;
	}

	public DeptDAO getDeptDAO() {
		return deptDAO;
	}

	public void setDeptDAO(DeptDAO deptDAO) {
		this.deptDAO = deptDAO;
	}

	public StationDAO getStationDAO() {
		return stationDAO;
	}

	public void setStationDAO(StationDAO stationDAO) {
		this.stationDAO = stationDAO;
	}

	public GroupDAO getGroupDAO() {
		return groupDAO;
	}

	public void setGroupDAO(GroupDAO groupDAO) {
		this.groupDAO = groupDAO;
	}

}
