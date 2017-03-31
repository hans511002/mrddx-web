package com.ery.meta.module.mag.timer;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ery.base.support.jdbc.Column;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.StringUtils;

/**

 * 

 * @description 表META_MAG_TIMER对应实体 <br>
 * @date 2012-03-05
 */
public class MetaTimerPO {
	/**
	 * 定时任务唯一标识
	 */
	@Column("TIMER_ID")
	public String timerID;
	/**
	 * 定时任务类型 1、简单循环定时任务，此类型描述什么时候开始以一定的间隔时间进行定时任务执行。
	 * 2、每天定时执行，此类型描述定时任务在每天的什么时候开始执行。 3、每周定时执行，此类型描述定时任务在每周的星期几什么时间点执行。
	 * 4、每月定时任务，此类型描述定时任务在每月的那天什么时间点定时执行。 5、每年定时任务，此类型描述定时任务在每年的那月那天那个时间点定点执行。
	 * 6、固定时间定时任务，表示在那几个时间点定点执行一次。 7、自定义类型定时器，此类型用于自定义CRON表达式。
	 */
	@Column("TIMER_TYPE")
	public int timerType;

	/**
	 * 定时任务规则，对于不同的任务类型，其规则定义如下： 1、简单循环定时任务，其规则如下存储：
	 * "执行次数,间隔时间,开始时间,结束时间"。开始时间与结束时间格式
	 * ,间隔时间为毫秒为:yyyyMMddHHmmss,如果不存在结束时间可以不写，如：
	 * 3,300,20120909111211,2012090913121 表示从20120909111211间隔300毫秒执行三次 或者
	 * 3,300,20120909111211 2、每天定时执行任务，其规则如下存储: “每天任务执行时间”,时间格为:"HHMISS"
	 * 3、每周定时执行任务，其规则如下存储: “星期数,执行时间”,时间格为:"HHMISS"
	 * 如:3,152121表示每周三，15点21分21秒执行此定时任务 3,5,152121表示每周三、每周五15点21分21秒执行此定时任务
	 * 3-5,152121表示每周三到周五15点21分21秒执行此定时任务 L,152121表示每周末15点21分21秒执行此定时任务
	 * 更多星期字段参考CRON日期字段的取值范围 4、每月定时任务，其规则如下存储: "每月执行天...,执行时间"，时间格为:"HHMISS",,
	 * 天值可以为L，表示每月最后一天，如果每月可以执行多天，以“,”分隔 如："3,152121" 表示每月3号15点21分21秒执行此定时任务，
	 * “L,152121"表示每月最后一天 3号15点21分21秒执行此定时任务 "LW,152121" 表示每月最后一个工作日
	 * 3号15点21分21秒执行此定时任务 "3-5,152121"表示每月3到5号 3号15点21分21秒执行此定时任务
	 * "3,5,6,152121"表示每月3、5、6号 15点21分21秒执行此定时任务 更多日期字段参考CRON日期字段的取值范围
	 * 5、每年定时任务，其规则如下存储:"每年执行月,每年执行天,执行时间"，时间格式为:"HHMISS",,如"3,3,152121"
	 * 表示每年3月月3号15点21分21秒执行此定时任务, 执行月字段值如参考CRON所示，不同的是如果月份值有多个，以"&"代替",";
	 * 执行天字段值如规则4描述,不同的是如果日期值有多个，以"&"代替","; 6、固定时间定时任务，其存储规则如下:"
	 * 具体执行时间1,具体执行时间2,
	 * ...",表示固定点某些时间执行，时间可以多个，时间格式为"yyyyMMddHHmmss",如:'2012121212,2012111111'
	 * 7、自定义类型定时器，参考quartz CRON表达式
	 */
	@Column("TIMER_RULE")
	public String timerRule;

	/**
	 * 定时任务状态
	 */
	@Column("TIMER_STATE")
	public int state;
	/**
	 * 表示实现了接口IMetaTimer的实现类名，每个定时任务必有一个实现类
	 */
	@Column("TIMER_CLASS")
	public String timerClass;
	/**
	 * 定时器描述
	 */
	@Column("TIMER_DESC")
	public String timerDesc;
	/**
	 * 定时器开始时间（yyyyMMdd）
	 */
	@Column("TIMER_START_TIME")
	public String timerStartTime;
	/**
	 * 定时器结束时间（yyyyMMdd）
	 */
	@Column("TIMER_END_TIME")
	public String timerEndTime;

	public String getTimerStartTime() {
		return timerStartTime;
	}

	public void setTimerStartTime(String timerStartTime) {
		this.timerStartTime = timerStartTime;
	}

	public String getTimerEndTime() {
		return timerEndTime;
	}

	public void setTimerEndTime(String timerEndTime) {
		this.timerEndTime = timerEndTime;
	}

	public String getTimerID() {
		return timerID;
	}

	public void setTimerID(String timerID) {
		this.timerID = timerID;
	}

	public int getTimerType() {
		return timerType;
	}

	public void setTimerType(int timerType) {
		this.timerType = timerType;
	}

	public String getTimerRule() {
		return timerRule;
	}

	public void setTimerRule(String timerRule) {
		this.timerRule = timerRule;
	}

	public int getState() {
		return state;
	}

	public void setState(int state) {
		this.state = state;
	}

	public String getTimerClass() {
		return timerClass;
	}

	public void setTimerClass(String timerClass) {
		this.timerClass = timerClass;
	}

	public String getTimerDesc() {
		return timerDesc;
	}

	public void setTimerDesc(String timerDesc) {
		this.timerDesc = timerDesc;
	}

	/**
	 * 获取指定类型的quartz的Cron表达式
	 * 
	 * @return
	 */
	public String[] parseRoleToCron() {
		String[] cron = null;
		String hour = "", minute = "", second = "", month = "", day = "", week = "?", year = "*";
		switch (this.timerType) {
		case TimerConstant.TIMER_TYPE_EVERY_DAY: {// 每天定时任务
			if (StringUtils.isEmpty(this.timerRule) || this.timerRule.length() != 6) {
				LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
			} else {
				hour = formatCronDomain(StringUtils.substring(this.timerRule, 0, 2));
				minute = formatCronDomain(StringUtils.substring(this.timerRule, 2, 4));
				second = formatCronDomain(StringUtils.substring(this.timerRule, 4, 6));
				month = "*";
				day = "*";
				cron = new String[1];
				cron[0] = second + " " + minute + " " + hour + " " + day + " " + month + " " + week + " " + year;
			}
			break;
		}
		case TimerConstant.TIMER_TYPE_EVERY_MONTH: {// 每月定时任务，
			if (StringUtils.isEmpty(this.timerRule)) {
				LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
			} else {
				String time = StringUtils.substringAfterLast(this.timerRule, ",");
				if (StringUtils.isEmpty(time) && time.length() != 6) {
					LogUtils.error("对应规则：[" + this.timerRule + "]时间定义错误，解析CRON表达式失败！");
				}
				hour = formatCronDomain(StringUtils.substring(time, 0, 2));
				minute = formatCronDomain(StringUtils.substring(time, 2, 4));
				second = formatCronDomain(StringUtils.substring(time, 4, 6));
				month = "*";
				day = formatCronDomain(StringUtils.substringBeforeLast(this.timerRule, ","));
				cron = new String[1];
				cron[0] = second + " " + minute + " " + hour + " " + day + " " + month + " " + week + " " + year;
			}
			break;
		}
		case TimerConstant.TIMER_TYPE_EVERY_WEEK: { // 每星期定时任务
			Pattern numberReg = Pattern.compile("(\\d)");
			if (StringUtils.isEmpty(this.timerRule)) {
				LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
			} else {
				String time = StringUtils.substringAfterLast(this.timerRule, ",");
				if (StringUtils.isEmpty(time) && time.length() != 6) {
					LogUtils.error("对应规则：[" + this.timerRule + "]时间定义错误，解析CRON表达式失败！");
				}
				hour = formatCronDomain(StringUtils.substring(time, 0, 2));
				minute = formatCronDomain(StringUtils.substring(time, 2, 4));
				second = formatCronDomain(StringUtils.substring(time, 4, 6));
				month = "*";
				day = "?";
				week = formatCronDomain(StringUtils.substringBeforeLast(this.timerRule, ","));
				// 转换星期
				Matcher m = numberReg.matcher(week);
				StringBuffer sb = new StringBuffer();
				while (m.find()) {
					int tempWeek = Convert.toInt(m.group(1));
					m.appendReplacement(sb, String.valueOf(tempWeek == 7 ? 1 : tempWeek + 1));
				}
				m.appendTail(sb);
				week = sb.toString();
				cron = new String[1];
				cron[0] = second + " " + minute + " " + hour + " " + day + " " + month + " " + week + " " + year;
			}
			break;
		}
		case TimerConstant.TIMER_TYPE_EVERY_YEAR: {
			if (StringUtils.isEmpty(this.timerRule)) {
				LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
			} else {
				String[] splits = StringUtils.split(this.timerRule, ",");
				if (splits == null | splits.length != 3) {
					LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
				}
				if (StringUtils.isEmpty(splits[2]) && splits[2].length() != 6) {
					LogUtils.error("对应规则：[" + this.timerRule + "]时间定义错误，解析CRON表达式失败！");
				}
				// 月份值
				month = formatCronDomain(splits[0]).replaceAll("&", ",");
				day = formatCronDomain(splits[1]).replaceAll("&", ",");
				// 时间解析
				hour = formatCronDomain(StringUtils.substring(splits[2], 0, 2));
				minute = formatCronDomain(StringUtils.substring(splits[2], 2, 4));
				second = formatCronDomain(StringUtils.substring(splits[2], 4, 6));
				cron = new String[1];
				cron[0] = second + " " + minute + " " + hour + " " + day + " " + month + " " + week + " " + year;
			}
			break;
		}
		case TimerConstant.TIMER_TYPE_FIXED: {
			List<String> crons = new ArrayList<String>();
			if (StringUtils.isEmpty(this.timerRule)) {
				LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
			} else {
				String[] splits = StringUtils.split(this.timerRule, ",");
				if (splits == null | splits.length == 0) {
					LogUtils.error("对应规则：[" + this.timerRule + "]定义错误，解析CRON表达式失败！");
				}
				for (int i = 0; i < splits.length; i++) {
					if (splits[i] == null | splits[i].length() != 14) {
						LogUtils.error("对应规则：[" + splits[i] + "]定义错误，解析CRON表达式失败！");
						continue;
					}
					// 月份值
					year = formatCronDomain(StringUtils.substring(splits[i], 0, 4));
					month = formatCronDomain(StringUtils.substring(splits[i], 4, 6));
					day = formatCronDomain(StringUtils.substring(splits[i], 6, 8));
					// 时间解析
					hour = formatCronDomain(StringUtils.substring(splits[i], 8, 10));
					minute = formatCronDomain(StringUtils.substring(splits[i], 10, 12));
					second = formatCronDomain(StringUtils.substring(splits[i], 12, 14));
					crons.add(second + " " + minute + " " + hour + " " + day + " " + month + " " + week + " " + year);
				}
				cron = crons.toArray(new String[crons.size()]);
			}
			break;
		}
		case TimerConstant.TIMER_TYPE_CUSTOM: {
			cron = new String[1];
			cron[0] = this.timerRule;
		}
		default:
			break;
		}
		return cron;
	}

	/**
	 * 转换CRON表达式每个域的值
	 * 
	 * @param domainValue
	 * @return
	 */
	private String formatCronDomain(String domainValue) {
		try {
			return String.valueOf(Convert.toInt(domainValue));
		} catch (Exception e) {
			return domainValue;
		}
	}

	/*    *//**
	 * CRON表达式域指是否符合范围验证
	 * 
	 * @param value 值
	 * @param domain 域 包含：second，minute,hour,month,day,week,year七个域
	 * @return
	 */
	/*
	 * private boolean domainValueVaildate(String value,String domain){
	 * 
	 * }
	 */

}
