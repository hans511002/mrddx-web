package com.ery.meta.util;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.hadoop.hbase.util.HasThread;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.sys.DataSourceManager;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.web.ISystemStart;

public class SystemSeqService extends HasThread implements ISystemStart {
	static HashMap<String, SeqValue> seqMutex = new HashMap<String, SystemSeqService.SeqValue>();
	public static final Log LOG = LogFactory.getLog(SystemSeqService.class.getName());
	static boolean isRuning = true;
	static SystemSeqService seqService = null;

	public SystemSeqService() {
		initSeq();
	}

	static class SeqValue {
		long seq = 0;
		boolean changed = true;
		List<String> USETABLE_FIELDS = new LinkedList<String>();
	}

	@Override
	public void setServletContext(ServletContext servletContext) {
	}

	@Override
	public void init() {
		synchronized (seqMutex) {
			if (seqService == null) {
				seqService = this;
				seqService.setName("seqService");
				seqService.setDaemon(true);
				seqService.start();
			}
		}
	}

	public static long getSeqNextValue(String seqName) {
		SeqValue seqv = null;
		synchronized (seqMutex) {
			if (seqService == null) {
				SystemSeqService seqService = new SystemSeqService();
				seqService.init();
			}
			seqv = seqMutex.get(seqName);
			if (seqv == null) {
				seqv = new SeqValue();
				seqMutex.put(seqName, seqv);
			}
		}
		synchronized (seqv) {
			seqv.changed = true;
			return seqv.seq++;
		}
	}

	public static long getSeqNextValue(String tabFiled, String seqName) {
		SeqValue seqv = null;
		synchronized (seqMutex) {
			if (seqService == null) {
				SystemSeqService seqService = new SystemSeqService();
				seqService.init();
			}
			seqv = seqMutex.get(seqName);
			if (seqv == null) {
				seqv = new SeqValue();
				seqv.USETABLE_FIELDS.add(tabFiled);
				seqMutex.put(seqName, seqv);
			}
		}
		synchronized (seqv) {
			seqv.changed = true;
			return seqv.seq++;
		}
	}

	public static long getSeqValue(String tabFiled, String seqName) {
		SeqValue seqv = null;
		synchronized (seqMutex) {
			if (seqService == null) {
				seqService = new SystemSeqService();
				seqService.init();
			}
			seqv = seqMutex.get(seqName);
			if (seqv == null) {
				seqv = new SeqValue();
				seqv.USETABLE_FIELDS.add(tabFiled);
				seqMutex.put(seqName, seqv);
			}
		}
		return seqv.seq;
	}

	// 初始时读取序列入内存
	public void initSeq() {
		synchronized (seqMutex) {
			try {
				DataAccess access = new DataAccess(DataSourceManager.getConnection(SystemVariable.DSID));
				List<Map<String, Object>> seqs = access
						.queryForList("SELECT SEQ,SEQ_NAME,USETABLE_FIELD FROM SYS_SEQ  ");
				for (Map<String, Object> map : seqs) {
					String seqName = map.get("SEQ_NAME").toString();
					long seq = Convert.toLong(map.get("SEQ"), 1);
					String useTableField = Convert.toString(map.get("USETABLE_FIELD"), "");
					String useTableFields[] = useTableField.split(",");
					if (!useTableField.equals("")) {// 从数据库读取初始化值
						for (String tableField : useTableFields) {
							String sql = "select max(";
							String tmp[] = tableField.split("\\.");
							sql += tmp[1] + ") MAX_ID from " + tmp[0];
							Long sq = access.queryForLongByNvl(sql, 1l);
							if (seq < sq) {
								seq = sq;
							}
						}
					}
					SeqValue seqv = new SeqValue();
					seqv.seq = seq;
					for (String string : useTableFields) {
						seqv.USETABLE_FIELDS.add(string);
					}
					seqMutex.put(seqName, seqv);
				}
			} catch (Exception e) {
				LOG.error("初始化序列异常", e);
				throw e;
			} finally {
				DataSourceManager.destroy();
			}
		}
	}

	@Override
	public void run() {
		while (isRuning) {
			flushSeq();
			ToolUtil.sleep(60000);
		}
	}

	public void flushSeq() {
		try {
			DataAccess access = new DataAccess(DataSourceManager.getConnection(SystemVariable.DSID));
			List<Map<String, Object>> seqs = access.queryForList("SELECT SEQ,SEQ_NAME,USETABLE_FIELD FROM SYS_SEQ  ");
			Map<String, Boolean> existSeqs = new HashMap<String, Boolean>();
			for (Map<String, Object> map : seqs) {
				existSeqs.put(map.get("SEQ_NAME").toString(), true);
			}
			for (String seqName : seqMutex.keySet()) {
				SeqValue seqv = seqMutex.get(seqName);
				if (seqv.changed) {
					if (existSeqs.containsKey(seqName)) {
						String sql = "update SYS_SEQ set seq=? , USETABLE_FIELD=? where SEQ_NAME=?";
						access.execUpdate(sql, seqv.seq, ToolUtil.Join(seqv.USETABLE_FIELDS), seqName);
					} else {
						String sql = "insert into SYS_SEQ (seq,USETABLE_FIELD,SEQ_NAME) values(?,?,?)";
						access.execUpdate(sql, seqv.seq, ToolUtil.Join(seqv.USETABLE_FIELDS), seqName);
					}
				}
				seqv.changed = false;
			}
		} catch (Exception e) {
			LOG.error("更新内存中的序列值到数据库表异常", e);
		} finally {
			DataSourceManager.destroy();
		}
	}

	@Override
	public void destory() {
		flushSeq();
	}

}
