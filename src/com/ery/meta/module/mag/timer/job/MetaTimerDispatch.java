package com.ery.meta.module.mag.timer.job;

import java.util.HashMap;
import java.util.Map;

import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;

import com.ery.meta.module.mag.timer.IMetaTimer;

import com.ery.base.support.log4j.LogUtils;


public class MetaTimerDispatch implements Job {

	/**
	 * 各定时器的实现缓存
	 */
	private final static Map<String, IMetaTimer> metaTimerMap = new HashMap<String, IMetaTimer>();

	public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
		// 实例化
		String timerName = jobExecutionContext.getJobDetail().getName();
		IMetaTimer metaTimer = null;
		if (!metaTimerMap.containsKey(timerName) || metaTimerMap.get(timerName) == null) {
			JobDataMap jobDataMap = jobExecutionContext.getMergedJobDataMap();
			// 获取执行任务的Class
			String className = (String) jobDataMap.get(MetaTimerAssign.CLASS_KEY);
			// 实例化类
			try {
				metaTimer = (IMetaTimer) (Class.forName(className).newInstance());
				metaTimer.init();
				metaTimerMap.put(timerName, metaTimer);
			} catch (InstantiationException e) {
				LogUtils.error(null, e);
			} catch (IllegalAccessException e) {
				LogUtils.error(null, e);
			} catch (ClassNotFoundException e) {
				LogUtils.error(null, e);
			}
		} else {
			metaTimer = metaTimerMap.get(timerName);
		}
		if (metaTimer == null) {// 如果任务对象为NULL，说明初始化失败，移除此调度器
			MetaTimerAssign.removeTimer(timerName);
		} else {
			LogUtils.info("TIMER RUN START:" + timerName);
			try {
				metaTimer.run(timerName);
			} catch (Throwable e) {
				LogUtils.error(null, e);
			}
			LogUtils.info("TIMER RUN END:" + timerName);
		}
	}
}
