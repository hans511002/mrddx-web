
package com.ery.meta.web.session;

import java.util.Map;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.commons.collections.MapUtils;
import org.directwebremoting.WebContextFactory;
import com.ery.meta.module.mag.login.LoginLogDAO;


public class LoginEventHandler extends AbstractSessionEvtHandler {
	
	private LoginLogDAO loginLogDAO = new LoginLogDAO();
	/**
	 * @param key
	 */
	public LoginEventHandler(String key) {
		super(key);
	}
	
	public void attributeAdded(HttpSession session) {
        Map<String,Object> userMap = (Map<String, Object>)SessionContext.getValue(session.getId(), super.getKey());
        logIn(session,userMap);
	}

	public void attributeRemoved(HttpSession session) {
		String sid = session.getId();
		if(SessionContext.containsSession(sid)){
			Map<String,Object> sessionMap = SessionContext.getMap(sid);
			if(sessionMap.containsKey(getKey())){
				Map<String,Object> userMap = (Map<String, Object>) sessionMap.get(super.getKey());
                int userId = MapUtils.getIntValue(userMap, "userId");
				if(SessionManager.isLogIn(userId)){
					User user = SessionManager.getUser(userId);
					try{
						loginLogDAO.updateLoginOutTime(user.getLogId());
					}catch(Exception e){
						
					}finally{
						loginLogDAO.close();
					}
					SessionManager.logOut(userId);
				}
			}
		}
	}

	public void attributeReplaced(Object preValue, Object curValue,HttpSession session) {
		attributeRemoved(session);
		logIn(session,(Map<String, Object>)curValue);
	}
	
	public void sessionDestroyed(HttpSession session) {
		attributeRemoved(session);
	}
	
	private void logIn(HttpSession session,Map<String, Object> userMap){
		User user = new User();
		user.setLogInTime(System.currentTimeMillis());
		String sid = session.getId();
		user.setSessionID(sid);
		try {
			HttpServletRequest request = WebContextFactory.get().getHttpServletRequest();
			userMap.put("loginIp", request==null?"":request.getRemoteAddr());
			userMap.put("loginMac",request==null?"":request.getRemoteHost());
		} catch (Exception e) {
			// TODO: handle exception
		}
		user.setUserMap(userMap);
        try {
            if(SessionManager.isLoggedIn(user.getUserID())){
                String tempSessionId = SessionManager.getUser(user.getUserID()).getSessionID();
                HttpSession tempSession = SessionContext.getSession(tempSessionId);
                if(tempSession!=null){
                    tempSession.removeAttribute(getKey());
                }
            }
            if(SessionManager.isLogIn(sid)){
                session.removeAttribute(getKey());
            }
        } catch (Exception e) {
           //移除临时session失效无相关影响。
        }
        user.setLogInTime(System.currentTimeMillis());
		SessionManager.logIn(user);
		try{
			user.setUserMap(userMap);
			int logId = loginLogDAO.insertLoginLog(user);
			user.setLogId(logId);
		}catch(Exception e){
			
		}finally{
			loginLogDAO.close();
		}
	}
}
