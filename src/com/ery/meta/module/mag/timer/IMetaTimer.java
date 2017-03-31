package com.ery.meta.module.mag.timer;


public interface IMetaTimer{

    /**
     * 第一次初始化调用的方法
     */
    public void init();

    /**
     * 定时任务每次执行调用的方法
     * @param timerName timer唯一标识,如果是数据库中配置的Timer，其TIMER构成表达式为
     * MetaTimerAssign.TIMER_NAME_PRIFIX + TIMERID
     */
    public void run(String timerName);

}
