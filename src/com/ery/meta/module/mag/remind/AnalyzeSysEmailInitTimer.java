package com.ery.meta.module.mag.remind;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.module.mag.timer.MetaTimerPO;
import com.ery.meta.module.mag.timer.TimerConstant;
import com.ery.meta.module.mag.timer.job.MetaTimerAssign;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;


public class AnalyzeSysEmailInitTimer {

	public static void initSysEmailRemindTimer() {
		RemindDAO remindDAO = new RemindDAO();
		Map<String, Object> cond = new HashMap<String, Object>();
		cond.put("STATE", RemindConstant.STATE_OK);
		List<Map<String, Object>> list = remindDAO.querySysEmailCfg(cond);
		for (Map<String, Object> map : list) {
			MetaTimerPO timerPO = new MetaTimerPO();
			timerPO.setTimerID("MAIL_" + MapUtils.getString(map, "CFG_ID"));
			int cycleType = MapUtils.getInteger(map, "CYCLE_TYPE", 0);
			String cycelRule = MapUtils.getString(map, "CYCLE_RULE");
			timerPO.setTimerType(TimerConstant.TIMER_TYPE_CUSTOM);
			timerPO.setTimerClass("com.ery.meta.module.mag.remind.SysEmailRemindTimer");
			try {
				timerPO.setTimerRule(getTimerRule(cycleType, cycelRule));
				MetaTimerAssign.addTimer(timerPO); // 每个配置启动一个定时器
			} catch (Exception e) {
				LogUtils.error(e.getMessage());
			}
		}
		remindDAO.close();

		// 添加重试发送定时器
		long repeatInterval = SystemVariable.getLong("trySendSysEmail.repeatInterval", 300000);
		MetaTimerAssign.addSimpleTimer("trySendEmail", 0, repeatInterval, null, null,
				"com.ery.meta.module.mag.remind.TrySendSysEmailTimer");
	}

	/**
	 * 变更定时器状态（启用或禁用）
	 * 
	 * @param cfg
	 * @param flag 真-启用，假-禁用
	 * @return
	 */
	public static boolean changeTimerState(Map<String, Object> cfg, boolean flag) {
		MetaTimerPO timerPO = new MetaTimerPO();
		timerPO.setTimerID("MAIL_" + MapUtils.getString(cfg, "CFG_ID"));
		int cycleType = MapUtils.getInteger(cfg, "CYCLE_TYPE", 0);
		String cycelRule = MapUtils.getString(cfg, "CYCLE_RULE");
		timerPO.setTimerType(TimerConstant.TIMER_TYPE_CUSTOM);
		timerPO.setTimerClass("com.ery.meta.module.mag.remind.SysEmailRemindTimer");
		if (flag) {
			try {
				timerPO.setTimerRule(getTimerRule(cycleType, cycelRule));
				return MetaTimerAssign.addTimer(timerPO);
			} catch (Exception e) {
				LogUtils.error(e.getMessage());
			}
		} else {
			return MetaTimerAssign.removeTimer(timerPO.getTimerID());
		}
		return false;
	}

	/**
	 * 根据周期类型和规则，解析出 Timer需要的定时规则
	 * 
	 * @param cycleType 类型
	 * @param rule 规则字符串。{起始时间}#{周期值}#{时间细化}。时间细化根据类型不同，定义也不同 1， 20#2#30
	 *            20分开始执行，每隔2分钟，30秒时执行 2， 2#2#40:30 2点开始执行，每隔2小时，40分30秒时执行 3，
	 *            2#2#2,18:30:00 每隔两周，周2下午18:30分执行 （特殊，起始时间无效） 4， 2#2#21:20:00
	 *            每月2号开始执行，每隔2天，晚上9点20执行 5， 2#2#10,08:30:00
	 *            每年2月开始执行，每隔两个月，10号上午8点30分执行
	 * @return
	 */
	private static String getTimerRule(int cycleType, String rule) {
		// 0起始时间，1间隔，发送时间细化
		String[] rules = rule.split("#");
		String rule_ = rules[2];
		String sec = "0";// 秒 （0-59） ,- * /
		String min = " 0";// 分 （0-59） ,- * /
		String hour = " 0-23";// 时 （0-23） ,- * /
		String dd = " *";// 日期 （1-31） , - * ? / L W C
		String mon = " *";// 月份 （1-12） , - * /
		String wk = " ?";// 星期 （1-7：日-六） , - * ? / L C #
		// String yr = " 0";//年 （1970-2099可选） , - * /
		String[] tm = rule_.split(":");
		switch (cycleType) {
		case RemindConstant.CYCLE_TYPE_MINUTE:
			sec = tm[0];
			min = " " + rules[0] + "/" + rules[1];
			break;
		case RemindConstant.CYCLE_TYPE_HOUR:
			sec = tm.length == 2 ? (tm[1] + " ") : "0 ";
			min = tm[0];
			hour = " " + rules[0] + "-23/" + rules[1];
			break;
		case RemindConstant.CYCLE_TYPE_DAY:
			sec = tm.length == 3 ? (tm[2] + " ") : "0 ";
			min = tm.length >= 2 ? (tm[1] + " ") : "0 ";
			hour = tm[0];
			dd = " " + rules[0] + "/" + rules[1];
			break;
		case RemindConstant.CYCLE_TYPE_WEEK:
			sec = tm.length == 3 ? (tm[2] + " ") : "0 ";
			min = tm.length >= 2 ? (tm[1] + " ") : "0 ";
			String[] _d = tm[0].split(",");
			hour = _d[1];
			dd = " ?";
			int satwk = Convert.toInt(_d[0]);
			if (satwk == 7)
				satwk = 1;
			else
				satwk = satwk + 1;
			wk = " " + satwk + "/" + rules[1];
			break;
		case RemindConstant.CYCLE_TYPE_MONTH:
			sec = tm.length == 3 ? (tm[2] + " ") : "0 ";
			min = tm.length >= 2 ? (tm[1] + " ") : "0 ";
			String[] d_ = tm[0].split(",");
			hour = d_[1];
			dd = " " + d_[0];
			mon = " " + rules[0] + "/" + rules[1];
			break;
		}
		return sec + min + hour + dd + mon + wk;
	}

}
