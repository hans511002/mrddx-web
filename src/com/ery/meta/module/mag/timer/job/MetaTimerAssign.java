package com.ery.meta.module.mag.timer.job;

import java.text.ParseException;
import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.servlet.ServletContext;

import org.quartz.CronExpression;
import org.quartz.CronTrigger;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleTrigger;
import org.quartz.Trigger;
import org.quartz.impl.StdSchedulerFactory;

import com.ery.meta.common.Common;
import com.ery.meta.common.DateUtil;
import com.ery.meta.module.mag.remind.AnalyzeSysEmailInitTimer;
import com.ery.meta.module.mag.timer.MetaMagTimerDAO;
import com.ery.meta.module.mag.timer.MetaTimerPO;
import com.ery.meta.module.mag.timer.TimerConstant;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.StringUtils;
import com.ery.base.support.web.ISystemStart;

/**

 * 

 * @description META系统注册Quartz的实现类，该类在系统启动时自动调用，查询系统中有效的定时任务，并注册到Quartz中，
 *              所有的调度任务注册的JOB是MetaJobDispatch,此类用于调度任务的执行。<br>
 * @date 2012-03-05
 */
public class MetaTimerAssign implements ISystemStart {

	public static final String TIMER_NAME_PRIFIX = "MTM_";// 定时器名称前缀

	/**
	 * quartz定时调度器。
	 */
	private static Scheduler scheduler = null;

	public void setServletContext(ServletContext servletContext) {

	}

	public final static String CLASS_KEY = "timerClass";

	public void init() {
		// 初始化化Quartz
		// Initiate a Schedule Factory
		StdSchedulerFactory factory = new StdSchedulerFactory();
		// Create the properties to configure the factory
		Properties props = new Properties();
		// required to supply threadpool class and num of threads
		props.put(StdSchedulerFactory.PROP_THREAD_POOL_CLASS, "org.quartz.simpl.SimpleThreadPool");
		props.put("org.quartz.threadPool.threadCount", "10");
		try {
			factory.initialize(props);
			// Retrieve a scheduler from schedule factory
			scheduler = factory.getScheduler();
			scheduler.start();
		} catch (SchedulerException e) {
			LogUtils.error("定时器初始化失败", e);
			return;
		}
		// 查询系统中所有有效的定时任务
		MetaMagTimerDAO metaMagTimerDAO = new MetaMagTimerDAO();
		List<MetaTimerPO> metaTimerPOs = metaMagTimerDAO.queryVaildTimers();
		if (metaTimerPOs != null & metaTimerPOs.size() > 0) {
			for (MetaTimerPO metaTimerPO : metaTimerPOs) {
				try {
					addTimer(metaTimerPO);
				} catch (Exception e) {
					LogUtils.error(null, e);
					LogUtils.error("定时器【" + metaTimerPO.getTimerID() + "】初始化失败！");
				}
			}
		}
		metaMagTimerDAO.close();

		/**
		 * 初始系统邮件定时器
		 */
		AnalyzeSysEmailInitTimer.initSysEmailRemindTimer();
	}

	/**
	 * 新增一个定时任务
	 * 
	 * @param metaTimerPO
	 * @return 返回true代表新增成功，false代表新增失败。
	 */
	public static boolean addTimer(MetaTimerPO metaTimerPO) {
		String jobName = String.valueOf(metaTimerPO.getTimerID());
		if (!jobName.contains(TIMER_NAME_PRIFIX))
			jobName = TIMER_NAME_PRIFIX + jobName;
		String[] rules;
		if (StringUtils.isNotEmpty(metaTimerPO.getTimerRule())) {
			rules = StringUtils.split(metaTimerPO.getTimerRule(), ",");
		} else {
			LogUtils.error("定时任务[" + jobName + "]未定义定时规则，添加失败！");
			return false;
		}
		if (metaTimerPO.getTimerType() == TimerConstant.TIMER_TYPE_SIMPLE_CYCLE) {
			// 执行次数
			int repleatConut = Convert.toInt(rules[0], 0);
			// 执行间隔
			long repeatInterval = Convert.toLong(rules[1]);
			// 开始时间
			Date startTime = rules.length > 2 ? Common.parseDate(rules[2], "yyyyMMddHHmmss") : null;
			// 结束时间
			Date endTime = rules.length > 3 ? Common.parseDate(rules[3], "yyyyMMddHHmmss") : null;
			addSimpleTimer(jobName, repleatConut, repeatInterval, startTime, endTime, metaTimerPO.getTimerClass());
		} else {
			// 获取调度的开始时间和结束时间
			Date startTime = null;
			Date endTime = null;
			if (StringUtils.isNotEmpty(metaTimerPO.getTimerStartTime()))
				startTime = DateUtil.getDateTimeByString(metaTimerPO.getTimerStartTime(), "yyyyMMddHHmmss");
			if (StringUtils.isNotEmpty(metaTimerPO.getTimerEndTime()))
				endTime = DateUtil.getDateTimeByString(metaTimerPO.getTimerEndTime(), "yyyyMMddHHmmss");
			String[] crons = metaTimerPO.parseRoleToCron();
			if (crons != null && crons.length > 0) {
				for (String cron : crons) {
					addCronTimer(jobName, cron, metaTimerPO.getTimerClass(), startTime, endTime);
				}
			}
		}
		return true;
	}

	/**
	 * 新增一个简单的从起始时间执行多少次的定时任务
	 * 
	 * @param timerName 定时任务名称，唯一标识，不能和其他定时任务名称重复
	 * @param repeatCount 重复次数，必须，如果==0表示无限次，直至结束时间。
	 * @param repeatInterval 时间间隔，必须，单位为毫秒
	 * @param startTime 开始时间，可以为null，为null表示为系统启动的时间
	 * @param endTime 结束时间，可以为null，为null表示无结束时间的限制，一直循环下去。
	 * @param timerClassName 定点执行任务的Class名称
	 * @return
	 */
	public static boolean addSimpleTimer(String timerName, int repeatCount, long repeatInterval, Date startTime,
			Date endTime, String timerClassName) {
		String str = timerName;
		if (!str.contains(TIMER_NAME_PRIFIX))
			str = TIMER_NAME_PRIFIX + str;
		Date now = new Date();
		startTime = startTime == null ? now : startTime;
		if (endTime != null) {
			// 如果结束时间《当前的系统时间 ，为失效定时任务，不添加
			if (endTime.compareTo(now) <= 0) {
				LogUtils.info("对于定时任务[" + timerName + "],已过其执行机会，添加失败！");
				return false;
			}
		}
		if (!isExistsTimer(str)) {
			JobDetail jobDetail = new JobDetail(str, Scheduler.DEFAULT_GROUP, MetaTimerDispatch.class);
			JobDataMap dataMap = jobDetail.getJobDataMap();
			dataMap.put(CLASS_KEY, timerClassName);
			Trigger trigger = new SimpleTrigger(str, Scheduler.DEFAULT_GROUP, startTime, endTime, repeatCount,
					repeatInterval);
			try {
				scheduler.scheduleJob(jobDetail, trigger);
			} catch (SchedulerException e) {
				LogUtils.info("定时任务[" + timerName + "]添加失败", e);
				return false;
			}
		}
		return true;
	}

	/**
	 * 新增一个基于quartz cron表达式的timer
	 * 
	 * @param timerName timer名称
	 * @param cron cron表达式
	 * @param timerClassName 定点执行任务的Class名称
	 * @return
	 */
	public static boolean addCronTimer(String timerName, String cron, String timerClassName, Date startTime,
			Date endTime) {
		String str = timerName;
		if (!str.contains(TIMER_NAME_PRIFIX))
			str = TIMER_NAME_PRIFIX + str;
		// 检验cron表达式是否合法
		try {
			CronExpression cronExpression = new CronExpression(cron);
			// 获取当前日期的下一次执行时间
			Date date = cronExpression.getNextValidTimeAfter(new Date());
			if (date == null) {
				LogUtils.error("CRON表达式[" + cron + "]所指示的时间已无触发机会，添加失败！");
				return false;
			}
			if (!isExistsTimer(str)) {
				JobDetail jobDetail = new JobDetail(str, Scheduler.DEFAULT_GROUP, MetaTimerDispatch.class);
				JobDataMap dataMap = jobDetail.getJobDataMap();
				dataMap.put(CLASS_KEY, timerClassName);
				CronTrigger trigger = new CronTrigger(str, null, cron);
				try {
					if (startTime != null)
						trigger.setStartTime(startTime);
					if (endTime != null)
						trigger.setEndTime(endTime);
					scheduler.scheduleJob(jobDetail, trigger);
				} catch (SchedulerException e) {
					LogUtils.error("添加定时器失败！", e);
					return false;
				}
			}
		} catch (ParseException e) {
			LogUtils.error("CRON表达式非法，Timer[" + timerName + "]新增失败！", e);
			return false;
		}
		return true;
	}

	/**
	 * 移除一个定时器
	 * 
	 * @param timerName
	 * @return
	 */
	public static boolean removeTimer(String timerName) {
		try {
			String str = timerName;
			if (!str.contains(TIMER_NAME_PRIFIX))
				str = TIMER_NAME_PRIFIX + str;
			if (isExistsTimer(str)) {
				scheduler.deleteJob(str, Scheduler.DEFAULT_GROUP);
			}
		} catch (SchedulerException e) {
			LogUtils.error("移除定时器失败！", e);
			return false;
		}
		return true;
	}

	/**
	 * 根据MetaTimerPO对象移除对应的定时器
	 * 
	 * @param metaTimerPO
	 * @return
	 */
	public static boolean removeTimer(MetaTimerPO metaTimerPO) {
		String timerName = String.valueOf(metaTimerPO.getTimerID());
		if (metaTimerPO.getTimerType() == TimerConstant.TIMER_TYPE_SIMPLE_CYCLE) {
			return removeTimer(timerName);
		}
		String[] crons = metaTimerPO.parseRoleToCron();
		boolean rs = true;
		if (crons != null && crons.length > 0) {
			for (String cron : crons) {
				rs = rs && removeTimer(timerName + cron);
			}
		}
		return rs;
	}

	/**
	 * 判断是否存在指定名称的定时器
	 * 
	 * @param timerName
	 * @return
	 */
	public static boolean isExistsTimer(String timerName) {
		String str = timerName;
		if (!str.contains(TIMER_NAME_PRIFIX))
			str = TIMER_NAME_PRIFIX + str;
		JobDetail jobDetail = null;
		try {
			jobDetail = scheduler.getJobDetail(timerName, Scheduler.DEFAULT_GROUP);
		} catch (SchedulerException e) {
		}
		return jobDetail != null;
	}

	public void destory() {

	}
}
