package com.ery.meta.module.mag.timer;

import com.ery.meta.common.DateUtil;

/**


 * @description 定时器常量定义 <br>
 * @date 2012-03-05
 */
public class TimerConstant{

    /**
     * 定时类型：简单循环类定时任务
     */
    public final static int TIMER_TYPE_SIMPLE_CYCLE=1;
    /**
     * 定时类型：每天定时任务
     */
    public final static int TIMER_TYPE_EVERY_DAY=2;
    /**
     * 定时类型：每周定时任务
     */
    public final static int TIMER_TYPE_EVERY_WEEK=3;
    /**
     * 定时类型：每月定时任务
     */
    public final static int TIMER_TYPE_EVERY_MONTH=4;
    /**
     * 定时类型：每年定时任务
     */
    public final static int TIMER_TYPE_EVERY_YEAR=5;
    /**
     * 定时类型：固定时间定时任务
     */
    public final static int TIMER_TYPE_FIXED=6;
    /**
     * 定时类型：自定义类型定时器
     */
    public final static int TIMER_TYPE_CUSTOM=7;

    /**
     * 订阅周期类型：一次性
     */
    public final static int SEND_SEQUNCE_ONEOFF = 0;
    /**
     * 订阅周期类型：年
     */
    public final static int SEND_SEQUNCE_YEAR = 1;
    /**
     * 订阅周期类型：半年
     */
    public final static int SEND_SEQUNCE_HALFYEAR = 2;
    /**
     * 订阅周期类型：月
     */
    public final static int SEND_SEQUNCE_MONTH = 3;
    /**
     * 订阅周期类型：周
     */
    public final static int SEND_SEQUNCE_WEEK = 4;
    /**
     * 订阅周期类型：日
     */
    public final static int SEND_SEQUNCE_DAY = 5;
    /**
     * 订阅周期类型：时
     */
    public final static int SEND_SEQUNCE_HOUR = 6;
    
    /**
     * @Title: codeManageMappingTheTimer 
     * @Description: 根据周期类型字段映射到定时器调度类型
     * @param sendSquence 周期类型字段
     * @return int   
     * @throws
     */
    public static int codeManageMappingTheTimer(int sendSquence){
    	if(SEND_SEQUNCE_ONEOFF == sendSquence)
    		return TIMER_TYPE_FIXED;
    	if(SEND_SEQUNCE_YEAR == sendSquence || SEND_SEQUNCE_HALFYEAR == sendSquence)
    		return TIMER_TYPE_EVERY_YEAR;
    	if(SEND_SEQUNCE_MONTH == sendSquence)
    		return TIMER_TYPE_EVERY_MONTH;
    	if(SEND_SEQUNCE_WEEK == sendSquence)
    		return TIMER_TYPE_EVERY_WEEK;
    	if(SEND_SEQUNCE_DAY == sendSquence)
    		return TIMER_TYPE_EVERY_DAY;
    	
    	return -1;
    }
    /**
     * @Title: getTimerRuleBySendSquenceAndTime 
     * @Description: 获取timerRule
     * @param sendSquence
     * @param time
     * @return String   
     * @throws
     */
    public static String getTimerRuleBySendSquenceAndTime(int sendSquence,String time){
    	time = DateUtil.getParamDay(time, "yyyyMMddHHmmss");
    	String str = "";
    	if(SEND_SEQUNCE_ONEOFF == sendSquence){//暂未开出
    		str = "";
    	}
    	if(SEND_SEQUNCE_YEAR == sendSquence || SEND_SEQUNCE_HALFYEAR == sendSquence){
    		int month = Integer.valueOf(time.substring(4,6));
    		int day = Integer.valueOf(time.substring(6,8));
    		str = month + "," + day + "," + time.substring(8,14);
    	}
    	if(SEND_SEQUNCE_MONTH == sendSquence){
    		int day = Integer.valueOf(time.substring(6,8));
    		str = day + "," + time.substring(8,14);
    	}
    	if(SEND_SEQUNCE_WEEK == sendSquence){//周的星期几未处理
    		int day = Integer.valueOf(time.substring(6,8));
    		str = day + "," + time.substring(8,14);
    	}
    	if(SEND_SEQUNCE_DAY == sendSquence){
    		str = time.substring(8,14);
    	}
    	return str;
    }
}
