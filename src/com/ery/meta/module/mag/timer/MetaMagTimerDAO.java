package com.ery.meta.module.mag.timer;

import com.ery.meta.common.Common;
import com.ery.meta.common.Constant;
import com.ery.meta.common.MetaBaseDAO;
import java.util.List;


public class MetaMagTimerDAO extends MetaBaseDAO{
    /**
     * 查询有效的定时任务集合
     * @return
     */
    public List<MetaTimerPO> queryVaildTimers(){
        String sql="SELECT TIMER_ID,TIMER_TYPE,TIMER_STATE,TIMER_RULE,TIMER_CLASS," +
                   "TIMER_DESC,TIMER_START_TIME,TIMER_END_TIME FROM META_MAG_TIMER WHERE TIMER_STATE=?";
        return getDataAccess().queryForBeanList(sql,MetaTimerPO.class, Constant.META_ENABLE);
    }
    /**
     * @Title: getTimerPOMesById 
     * @Description: 根据调度ID获取调度信息
     * @param timerId
     * @return MetaTimerPO   
     * @throws
     */
    public MetaTimerPO getTimerPOMesById(String timerId){
    	String sql = "SELECT T.* FROM META_MAG_TIMER T WHERE T.TIMER_ID=?";
    	return getDataAccess().queryForBeanList(sql, MetaTimerPO.class, new Object[]{timerId}).get(0);
    }
    /**
     * @Title: getTimerPOMesByTimerDesc 
     * @Description: 根据timerDesc获取调度信息
     * @param timerDesc ： 报表ID+用户ID组合（肯定唯一）
     * @return MetaTimerPO   
     * @throws
     */
    public MetaTimerPO getTimerPOMesByTimerDesc(String timerDesc){
    	String sql = "SELECT T.* FROM META_MAG_TIMER T WHERE T.TIMER_DESC=?";
    	return getDataAccess().queryForBeanList(sql, MetaTimerPO.class, new Object[]{timerDesc}).get(0);
    }
}
