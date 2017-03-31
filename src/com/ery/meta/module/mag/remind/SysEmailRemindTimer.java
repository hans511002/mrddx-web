package com.ery.meta.module.mag.remind;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ery.meta.common.DateUtil;
import com.ery.meta.module.mag.timer.IMetaTimer;
import com.ery.meta.module.mag.timer.job.MetaTimerAssign;
import com.ery.meta.msg.mail.EmailData;
import com.ery.meta.msg.mail.SendMailUtil;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.utils.StringUtils;


public class SysEmailRemindTimer implements IMetaTimer {

	public void init() {
	}

	public void run(String timerName) {
		String timerId = timerName.replace(MetaTimerAssign.TIMER_NAME_PRIFIX + "MAIL_", "");
		RemindDAO remindDAO = new RemindDAO();
		try {
			BaseDAO.beginTransaction();
			Map<String, Object> data = remindDAO.querySysEmailCfgById(Convert.toInt(timerId));
			if (data != null) {
				String contentSql = MapUtils.getString(data, "CONTENT_SQL");
				String topic = MapUtils.getString(data, "TOPIC");
				String content = MapUtils.getString(data, "CONTENT");
				int tryNum = MapUtils.getInteger(data, "FAILED_TRY_TIMES", 1);
				int targetUserType = MapUtils.getInteger(data, "TARGET_USER_TYPE", 1);
				String targetUser = MapUtils.getString(data, "TARGET_USER").toUpperCase();
				String sendTime = DateUtil.getCurrentDay("yyyy-MM-dd HH:mm:ss");
				String[] emails = null;
				if (targetUser.indexOf("{") == -1) {
					emails = remindDAO.getUserEmails(Convert.toInt(targetUser), targetUserType);
				}
				List<Map<String, Object>> contents = remindDAO.queryContent(contentSql);
				if (contents.size() > 0) {
					int i = 1;
					for (Map<String, Object> con : contents) {
						if (targetUser.indexOf("{") != -1) {
							emails = null;
							String tu = targetUser;
							tu = tu.replace("{", "");
							tu = tu.replace("}", "");
							if (con.containsKey(tu)) {
								tu = MapUtils.getString(con, tu);
								if (StringUtils.isNumeric(tu)) {
									emails = remindDAO.getUserEmails(Convert.toInt(tu), targetUserType);
								} else {
									emails = tu.split(",");
								}
							}
						}
						if (emails == null || emails.length == 0)
							continue;
						String topic_ = dealContent(topic, con);
						String content_ = dealContent(content, con);
						EmailData emailData = new EmailData();
						emailData.setSubject(topic_);
						emailData.setContent(content_);
						emailData.setRecipients(emails);
						Map<String, Object> logData = new HashMap<String, Object>();
						logData.put("CFG_ID", timerId);
						logData.put("TOPIC", topic_);
						logData.put("CONTENT", content_);
						logData.put("EMAIL", StringUtils.join(emails, ","));
						logData.put("SEND_TIME", sendTime);
						logData.put("FIRST_SEND_TIME", sendTime);
						logData.put("SEND_SN", i);
						try {
							SendMailUtil.sendEmail(emailData);
							// 发送成功
							logData.put("IS_SUCCESS", 1);
							logData.put("ERROR_MSG", "");
						} catch (Exception ignored) {
							// 发送失败
							logData.put("IS_SUCCESS", 0);
							logData.put("ERROR_MSG", ignored.getMessage());
						}
						remindDAO.insertSysEmailLog(logData);
						i++;
					}
				}
			}
			BaseDAO.commit();
		} catch (Exception e) {
			LogUtils.error(e.getMessage());
			BaseDAO.rollback();
		} finally {
			remindDAO.close();
		}
	}

	/**
	 * 替换邮件内容中的宏变量
	 * 
	 * @param content
	 * @param dataMap
	 * @return
	 */
	private String dealContent(String content, Map<String, Object> dataMap) {
		Matcher mcher = Pattern.compile("\\{([a-zA-Z0-9_]+)\\}").matcher(content);
		boolean result = mcher.find();
		if (result) {
			StringBuffer sb = new StringBuffer();
			do {
				String str = mcher.group(1).toUpperCase();
				if (dataMap.containsKey(str)) {
					mcher.appendReplacement(sb, MapUtils.getString(dataMap, str));
				}
				result = mcher.find();
			} while (result);
			mcher.appendTail(sb);
			return sb.toString();
		}
		return content;
	}

}
