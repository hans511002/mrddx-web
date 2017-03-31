package com.ery.meta.module.mag.remind;

import com.ery.meta.module.mag.timer.IMetaTimer;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;

public class ClearSysEmailLogTimer implements IMetaTimer {

	public void init() {
	}

	public void run(String timerName) {
		RemindDAO remindDAO = new RemindDAO();
		try {
			BaseDAO.beginTransaction();
			remindDAO.clearSysEmailLog();
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error(e.getMessage());
		} finally {
			remindDAO.close();
		}

	}
}
