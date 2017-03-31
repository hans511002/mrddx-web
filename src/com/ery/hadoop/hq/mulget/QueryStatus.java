package com.ery.hadoop.hq.mulget;

import java.util.Map;

public class QueryStatus {
	public final long queryRuleId;
	public final String rowkey[];
	public boolean isError = false;
	public int endCount = 0;
	public boolean[] flag = null;
	public int parallelCount = 0;
	public final QuerySubStatus[] subStatus;
	public int subMaxRowCount = 1000;
	public final Map<String, String> macroVariableMap;
	// ///////////////////////////////////////////////////////////////
	public String[] enField;
	public String[] chField;
	public int threadNum = 0;
	private int pos = 0;

	public QueryStatus(long queryRuleId, String rowkey[], Map<String, String> macroVariableMap) {
		this.queryRuleId = queryRuleId;
		this.rowkey = rowkey;
		this.macroVariableMap = macroVariableMap;
		subStatus = new QuerySubStatus[rowkey.length];
		flag = new boolean[rowkey.length];
		for (int i = 0; i < rowkey.length; i++) {
			QuerySubStatus st = new QuerySubStatus(this, i);
			subStatus[i] = st;
			st.init(rowkey[i]);
			if (st.msg != null) {
				this.isError = true;
				return;
			}
			flag[i] = false;
		}
	}

	public boolean isStartAll() {
		for (int i = 0; i < flag.length; i++) {
			if (!flag[i]) {
				return false;
			}
		}
		return true;
	}

	public QuerySubStatus getNext() {
		for (int i = 0; i < flag.length; i++) {
			if (!flag[i]) {
				return subStatus[i];
			}
		}
		return null;
	}

	public QuerySubStatus getGetNext() {
		for (int i = 0; i < flag.length; i++) {
			if (!flag[i] && this.subStatus[i].isGet) {
				return subStatus[i];
			}
		}
		return null;
	}

	public Object getResult(int index) {
		return subStatus[index].result;
	}

	public String getError() {
		StringBuffer sb = new StringBuffer();
		for (int i = 0; i < subStatus.length; i++) {
			if (subStatus[i].msg != null && !subStatus[i].msg.equals("")) {
				sb.append("rowkey:");
				sb.append(this.rowkey[i]);
				sb.append(" query error:");
				sb.append(subStatus[i].msg);
				sb.append(";");
			}
		}
		return sb.toString();
	}

	public String getError(int index) {
		return subStatus[index].msg;
	}

	public void startFlag(QuerySubStatus querySubStatus) {
		this.flag[querySubStatus.index] = true;
	}

	public static class QuerySubStatus {
		final QueryStatus qs;
		public final int index;
		public long qryTime;
		String msg = null;// 错误消息
		Object result = null;
		String skey = null, ekey = null;
		boolean isGet = true;

		QuerySubStatus(QueryStatus qs, int index) {
			this.qs = qs;
			this.index = index;
		}

		public void init(String rowkey) {
			if (rowkey == null || rowkey.equals("")) {// 不允许查全部
				this.msg = "get rowkey mast not null";
			} else {
				String tmp[] = rowkey.split(";");
				this.skey = tmp[0];
				if (tmp.length > 1)
					this.ekey = tmp[1];
				if ((this.skey == null || this.equals("")) && (this.ekey == null || this.ekey.equals(""))) {
					this.msg = "scan startkey and endkey mast not all null";
				}
				if (this.ekey != null)
					isGet = false;
			}
		}
	}

}
