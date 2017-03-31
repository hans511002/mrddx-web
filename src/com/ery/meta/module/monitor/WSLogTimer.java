package com.ery.meta.module.monitor;

import com.ery.meta.module.mag.timer.IMetaTimer;

import com.ery.hadoop.hq.utils.WSLogManager;



public class WSLogTimer implements IMetaTimer{
    public void init() {
    }

    /**
     * 定期器实现任务程序
     * @param timerName timer唯一标识
     */
    public void run(String timerName) {
    	WSLogManager.getInstance().flush();
    }
}
