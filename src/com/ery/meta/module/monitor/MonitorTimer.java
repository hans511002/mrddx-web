package com.ery.meta.module.monitor;

import java.util.HashMap;
import java.util.Map;

import com.ery.meta.module.mag.timer.IMetaTimer;

import com.ery.base.support.sys.SystemVariable;



public class MonitorTimer implements IMetaTimer {
	private MonitorDAO monitorDAO;
	public static String TimerName = "1";
	private static boolean isFirst;

	public void init() {
		isFirst = SystemVariable.getBoolean("hq.load.mr.monitor", false);
		monitorDAO = new MonitorDAO();
		MonitorData.setMonitorConfig(monitorDAO.getMonitorConfig());
	}

	/**
	 * 定期器实现任务程序
	 * 
	 * @param timerName timer唯一标识
	 */
	public void run(String timerName) {
		if (!isFirst) {
			isFirst = true;
			return;
		}

		if (MonitorData.getMonitorConfig().get("ISAUTOREFRESH").toString().equals("0")) {
			return;
		}
		Map<String, Object> map = new HashMap<String, Object>();
		map = monitorDAO.getMonitorData();
		MonitorData.setData(map);
	}

}
