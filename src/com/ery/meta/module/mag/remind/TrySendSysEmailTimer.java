package com.ery.meta.module.mag.remind;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.DateUtil;
import com.ery.meta.module.mag.timer.IMetaTimer;
import com.ery.meta.msg.mail.EmailData;
import com.ery.meta.msg.mail.SendMailUtil;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.MapUtils;

public class TrySendSysEmailTimer implements IMetaTimer {
	public void init() {
	}

	public void run(String timerName) {
		RemindDAO remindDAO = new RemindDAO();
		try {
			BaseDAO.beginTransaction();
			List<Map<String, Object>> tryLog = remindDAO.queryTrySendLog();
			String sendTime = DateUtil.getCurrentDay("yyyy-MM-dd HH:mm:ss");
			for (Map<String, Object> lg : tryLog) {
				EmailData emailData = new EmailData();
				emailData.setSubject(MapUtils.getString(lg, "TOPIC"));
				emailData.setContent(MapUtils.getString(lg, "CONTENT"));
				emailData.setRecipients(MapUtils.getString(lg, "EMAIL", "").split(","));
				lg.put("SEND_TIME", sendTime);
				try {
					SendMailUtil.sendEmail(emailData);
					lg.put("IS_SUCCESS", 1);
					lg.put("ERROR_MSG", "");
				} catch (Exception ignored) {
					lg.put("IS_SUCCESS", 0);
					lg.put("ERROR_MSG", ignored.getMessage());
				}
				remindDAO.insertSysEmailLog(lg);
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error(e.getMessage());
			BaseDAO.rollback();
		} finally {
			remindDAO.close();
		}
	}
}
