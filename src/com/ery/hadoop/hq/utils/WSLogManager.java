package com.ery.hadoop.hq.utils;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

import com.ery.hadoop.hq.log.HQLog;
import com.ery.hadoop.hq.log.HQLogDAO;
import com.ery.base.support.sys.SystemVariable;

public class WSLogManager {
	public static final WSLogManager INSTANCE = new WSLogManager();
	public int perwritelognumber;
	public List<HQLog> lstLog;

	private WSLogManager() {
		this.lstLog = Collections.synchronizedList(new LinkedList<HQLog>());
		this.perwritelognumber = SystemVariable.getInt("hq.log.per.write.number", 1000);
	}

	public static WSLogManager getInstance() {
		return INSTANCE;
	}

	/**
	 * 清空指定条数的日志
	 * 
	 * @param lstLog
	 */
	public void add(HQLog log) {
		synchronized (this.lstLog) {
			this.lstLog.add(log);
			if (this.lstLog.size() >= this.perwritelognumber) {
				final List<HQLog> subList = new ArrayList<HQLog>();
				for (int i = 0; i < this.perwritelognumber; i++) {
					subList.add(this.lstLog.remove(0));
				}
				new Thread() {
					public void run() {
						WSLogManager.this.writeLog(subList);
					};
				}.start();
			}
		}
	}

	/**
	 * 写日志
	 * 
	 * @param lstLog
	 */
	public void writeLog(List<HQLog> lstLog) {
		HQLogDAO hqLogdao = new HQLogDAO();
		hqLogdao.outputHBLogBatch(lstLog);
		hqLogdao.close();
	}

	/**
	 * 清空日志
	 */
	public void flush() {
		synchronized (this.lstLog) {
			if (this.lstLog.size() <= 0) {
				return;
			}
			final int l = this.lstLog.size();
			final List<HQLog> subList = new ArrayList<HQLog>();
			for (int i = 0; i < l; i++) {
				subList.add(this.lstLog.remove(0));
			}
			new Thread() {
				public void run() {
					if (subList.size() <= 0) {
						return;
					}

					WSLogManager.this.writeLog(subList);
				};
			}.start();
		}
	}
}
