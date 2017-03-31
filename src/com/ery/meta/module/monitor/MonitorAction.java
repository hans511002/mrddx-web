package com.ery.meta.module.monitor;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;

import com.ery.meta.common.Page;
import com.ery.meta.module.mag.login.LoginConstant;
import com.ery.meta.module.mag.timer.job.MetaTimerAssign;
import com.ery.meta.web.session.SessionManager;


public class MonitorAction {

	private MonitorDAO monitorDao;
	
	/**
	 * 任务业务类型分布
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> getTypeJobData() {
		return monitorDao.getTypeJobData();
	}
	/**
	 * 任务用户分布
	 * 
	 * @param data
	 * @param page
	 * @return
	 */	
	public List<Map<String, Object>> getUserJobData() {
		return monitorDao.getUserJobData();
	}
	/**
	 * 当天任务运行状态
	 * 
	 * @param data
	 * @param page
	 * @return
	 */		
	public List<Map<String, Object>> getJobStatusData() {
		return monitorDao.getJobStatusData();
	}
	
	/**
	 * 当天任务运行数量线形图
	 * 
	 */
	public List<Map<String, Object>> getJobStatusLineData(Map<String,Object> data) {
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
		data.put("LOGIN_USER_ID", formatUser.get("userId").toString());
		data.put("ADMIN_FLAG", formatUser.get("adminFlag").toString());
		return monitorDao.getJobStatusLineData(data);
	}	

	public List<Map<String, Object>> getLogData(Map<String,Object> data){
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
		data.put("LOGIN_USER_ID", formatUser.get("userId").toString());
		data.put("ADMIN_FLAG", formatUser.get("adminFlag").toString());
		if(getMonitorConfig().get("ISMANUREFRESH").toString().equals("1")){
			MonitorData.setData(monitorDao.getMonitorData());
		}
		return MonitorData.getLogoData(data);
	}
	
	/**
	 * 获取当前系统资源
	 * @return
	 */
	public Map<String, Integer> getSysResources(){
		Map<String,Object> data = new HashMap<String, Object>();
		HttpSession session = SessionManager.getCurrentSession();
		@SuppressWarnings("unchecked")
		Map<String, Object> formatUser = (Map<String, Object>)session.getAttribute(LoginConstant.SESSION_KEY_USER);
		data.put("LOGIN_USER_ID", formatUser.get("userId").toString());
		data.put("ADMIN_FLAG", formatUser.get("adminFlag").toString());
		return MonitorData.getSysResources(data);
	}
	
	public Map<String, Object> getLogDetailInfo(Map<String,Object> data){
		//MonitorData.getDetail(data);
		return monitorDao.getLogInfo(data);
	}
	
	public List<Map<String, Object>> getLogDetailData(Map<String,Object> data,Page page){
		//MonitorData.getDetail(data);
		return monitorDao.getLogDetail(data,page);
	}
	
	
	public MonitorDAO getMonitorDAO() {
		return monitorDao;
	}
	
	public void setMonitorDAO(MonitorDAO monitorDao) {
		this.monitorDao = monitorDao;
	}

	public void setMonitorConfig(Map<String,Object> data){
		if(null!=data&&data.containsKey("REPEATINTERVAL")){
			int repeatInterval = Integer.valueOf(data.get("REPEATINTERVAL").toString());
			monitorDao.updateMonitorConfig(data);
			MonitorData.setMonitorConfig(monitorDao.getMonitorConfig());
			MetaTimerAssign.removeTimer(MonitorTimer.TimerName);
			if(data.get("ISAUTOREFRESH").toString().equals("1")){
				MetaTimerAssign.addSimpleTimer(MonitorTimer.TimerName,-1,repeatInterval*1000,null,null,"com.ery.meta.module.monitor.MonitorTimer");
			}
		}
	}
	
	public Map<String,Object> getMonitorConfig(){
		if(null==MonitorData.getMonitorConfig()){
			MonitorData.setMonitorConfig(monitorDao.getMonitorConfig());
		}
		return MonitorData.getMonitorConfig();
	}
}
