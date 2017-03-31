package com.ery.hadoop.hq.datasource;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.servlet.ServletContext;

import org.apache.hadoop.hbase.TableNotEnabledException;
import org.apache.hadoop.hbase.TableNotFoundException;

import com.ery.hadoop.hq.connection.HTableConnectionPool;
import com.ery.hadoop.hq.datasource.manage.DataSourceDAO;
import com.ery.hadoop.hq.datasource.manage.DataSourcePO;
import com.ery.hadoop.hq.qureyrule.QueryRuleColumnPO;
import com.ery.hadoop.hq.qureyrule.QueryRuleConditionPO;
import com.ery.hadoop.hq.qureyrule.QueryRuleDAO;
import com.ery.hadoop.hq.qureyrule.QueryRulePO;
import com.ery.hadoop.hq.qureyrule.user.UserDataDAO;
import com.ery.hadoop.hq.qureyrule.user.UserToken;
import com.ery.hadoop.hq.table.HBaseTableDAO;
import com.ery.hadoop.hq.table.HBaseTablePO;
import com.ery.hadoop.hq.table.action.HBaseDataSourceManager;
import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.web.ISystemStart;

public class DataSourceInit implements ISystemStart {

	@SuppressWarnings("unused")
	private ServletContext servletContext;

	/**
	 * Hbase数据源列表
	 */
	public static Hashtable<String, DataSourcePO> dataSources = new Hashtable<String, DataSourcePO>();

	/**
	 * Hbase表查询规则，对应于Hbase数据源连接池 key:qryId, value:<tablename, HTableConnPO>
	 */
	public static Hashtable<String, Hashtable<String, HTableConnPO>> htableQryRules = new Hashtable<String, Hashtable<String, HTableConnPO>>();

	/**
	 * 用户列表(用户名与用户信息)
	 */
	public static Hashtable<String, UserToken> htableUser = new Hashtable<String, UserToken>();

	/**
	 * 查询规则与用户列表的对应关系(查询规则ID与用户ID列表关系)
	 */
	public static Hashtable<Long, Set<Long>> htableRuleUserList = new Hashtable<Long, Set<Long>>();

	/**
	 * 查询规则信息 queryId,QueryRulePO
	 */
	public static Hashtable<Long, QueryRulePO> htableRuleList = new Hashtable<Long, QueryRulePO>();

	/**
	 * 查询规则ID与表的对应关系 tableID,HBaseTablePO
	 */
	public static Hashtable<Long, HBaseTablePO> ruleIdhtableList = new Hashtable<Long, HBaseTablePO>();

	@Override
	public void setServletContext(ServletContext servletContext) {
		this.servletContext = servletContext;
	}

	@Override
	public void init() {
		// 数据库数据源，方便后续扩展对关系数据库表查询的支撑
		Constant.DATA_SOURCE_ID = SystemVariable.getInt("currentDataSourceId", 0);

		// 查询Hbase源
		DataSourceDAO dataSourceDAO = new DataSourceDAO();
		dataSources.clear();
		List<Map<String, Object>> list = dataSourceDAO.queryDataSource();
		dataSourceDAO.close();
		for (Map<String, Object> map : list) {
			loadDataSource(map);
		}
		HTableScanner.remove();
		htableQryRules.clear();

		boolean isLoad = SystemVariable.getBoolean("hq.load.qry.init", true);
		// 查询初始化Hbase表查询规则
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		list = qryRuleDao.queryQueryRule();
		for (Map<String, Object> map : list) {
			QueryRulePO qryPo = new QueryRulePO(map);
			long qryId = StringUtil.objectToLong(qryPo.getQryRuleId(), -1);
			htableRuleList.put(qryId, qryPo);
			if (!ruleIdhtableList.containsKey(qryPo.getHBTableId())) {
				loadRuleIdHTableList(qryId);
			}
			if (isLoad) {
				HTableConnPO hTableConnPo = loadQryRule(map, null);
				if (hTableConnPo == null)
					continue;
			}
		}
		// 初始化用户与规则的关系
		loadUserInfo();
		// 初始化规则与用户的关系
		loadRuleUserRef();
		qryRuleDao.close();
		System.out.println("Init finished!");
	}

	public synchronized static void reLoadDataSource() {
		DataSourceDAO dataSourceDAO = new DataSourceDAO();
		List<Map<String, Object>> list = dataSourceDAO.queryDataSourceList();
		dataSourceDAO.close();
		for (Map<String, Object> map : list) {
			long dateSourceId = MapUtils.getLong(map, "DATA_SOURCE_ID");
			reLoadDataSource(dateSourceId, true);
		}
	}

	public synchronized static void reLoadDataSource(long id) {
		reLoadDataSource(id, false);
	}

	public synchronized static void reLoadDataSource(long id, boolean onlyDataSource) {
		synchronized (htableQryRules) {
			DataSourceDAO dataSourceDAO = new DataSourceDAO();
			Map<String, Object> map = dataSourceDAO.queryDataSourceById(id);
			if (null == map || map.size() <= 0) {
				dataSourceDAO.close();
				return;
			}
			loadDataSource(map);
			dataSourceDAO.close();
		}
		if (onlyDataSource)
			return;
		String dataSourceId = id + "";
		List<String> subRules = new ArrayList<String>();
		for (String qryID : htableQryRules.keySet()) {
			// modify by 2014-03-26 begin
			Hashtable<String, HTableConnPO> tablePO = htableQryRules.get(qryID);
			boolean notExist = false;
			for (String tablename : tablePO.keySet()) {
				HTableConnPO conp = tablePO.get(tablename);
				if (null != conp && !conp.getDateSourceId().equals(dataSourceId)) {
					notExist = true;
					break;
				}
			}
			if (notExist) {
				continue;
			}
			// modify by 2014-03-26 end
			subRules.add(qryID);
		}
		for (String qyrId : subRules) {
			long qryId = Convert.toLong(qyrId);
			synchronized (htableQryRules) {
				htableQryRules.remove(qyrId);
				HTableScanner.remove(qyrId, null);
			}
			reLoadQueryRule(qryId, null);
		}
	}

	public static void removeQueryRule(String qryId) {
		synchronized (htableQryRules) {
			if (htableQryRules.containsKey(qryId)) {
				htableQryRules.remove(qryId);
				HTableScanner.remove(qryId, null);
			}
		}
	}

	public synchronized static void reLoadQueryRule(long id, String tablename) {
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		loadQryRule(qryRuleDao.queryQueryRuleById(id), tablename);
		qryRuleDao.close();
	}

	// 加载查询规则为有效和无效
	public synchronized static void reLoadQueryRuleAll(long id, String tablename) {
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		loadQryRule(qryRuleDao.queryQueryRuleAllById(id), tablename);
		qryRuleDao.close();
	}

	private static void loadDataSource(Map<String, Object> map) {
		synchronized (dataSources) {
			DataSourcePO dataSourcePO = new DataSourcePO(map);
			HBaseDataSourceManager.getInstance().putConfiguration(dataSourcePO);// 添加到用户DLL操作的资源管理内中
			dataSources.put(dataSourcePO.getDateSourceId(), dataSourcePO);
		}
	}

	/**
	 * tablename是针对存在宏变量的情况，在传入参数时需预先替换， 如果不存在宏变量的表名，传入null即可
	 * 
	 * @param map
	 * @param tablename
	 * @return
	 */
	private synchronized static HTableConnPO loadQryRule(Map<String, Object> map, String tablename) {
		HTableConnPO hTableConnPo = null;
		QueryRulePO qryPo = new QueryRulePO(map);
		String qryMsg = "";
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		String qryId = qryPo.getQryRuleId();
		boolean isTablePartition = StringUtil.isIncludeMacroVariable(qryPo.getHbaseTablePartition());// 表名是否支持宏变量
		int tableId = 0;
		try {
			hTableConnPo = new HTableConnPO(qryPo);
			// modify by 2014-03-26 begin
			// 如果是表名是宏变量，但传入的表名为null，则不加载该规则
			if (null == tablename && isTablePartition) {
				LogUtils.info("=============查询规则[" + qryId + "]，对应的表名存在宏变量，具体查询加载=========");
				if (htableQryRules.containsKey(qryId)) {// 移除规则下所有动态表的tableconn和tablesacnner
					htableQryRules.remove(qryId);
					HTableScanner.remove(qryPo.getQryRuleId(), null);
				}
				return null;
			}

			if (null != tablename) {// 不为空，重新设置表名
				hTableConnPo.getHbaseTable().setHbTableName(tablename);
			}
			// modify by 2014-03-26 end
			LogUtils.info("=============开始加载查询规则[" + qryId + "]=========");
			if (qryId.equals("2780")) {
				System.out.println("=============开始加载查询规则[" + qryId + "]=========");
			}
			tableId = hTableConnPo.getTableId();
			synchronized (htableQryRules) {
				// modify by 2014-03-26 begin
				if (htableQryRules.containsKey(qryId)) {// 移除规则下对应具体表的tableconn和tablesacnner
					Hashtable<String, HTableConnPO> tableConnMap = htableQryRules.get(qryId);
					tableConnMap.remove(hTableConnPo.getTableName());
					HTableScanner.remove(qryPo.getQryRuleId(), hTableConnPo.getTableName());
				}
				Hashtable<String, HTableConnPO> ht = htableQryRules.get(qryId);
				if (null == ht) {
					ht = new Hashtable<String, HTableConnPO>();
					ht.put(hTableConnPo.getTableName(), hTableConnPo);
					htableQryRules.put(qryId, ht);
				} else {
					ht.put(hTableConnPo.getTableName(), hTableConnPo);
				}
				// modify by 2014-03-26 end
			}
			String linkKey = hTableConnPo.getLinkKey();
			qryMsg = linkKey + "[" + hTableConnPo.getLinkName() + "]未能正确添加到数据Hbase表连接池中";
			Hashtable<String, HTableConnectionPool> dataSource = HTableDataSource.getDataSources();
			if (dataSource.containsKey(linkKey)) {
				HTableConnectionPool pool = dataSource.get(linkKey);
				dataSource.remove(linkKey);
				pool.destroy();
			}
			HTableDataSource.addSource(linkKey, hTableConnPo.getConf(), hTableConnPo.getTableName(),
					hTableConnPo.getMinLinkCount(), hTableConnPo.getMaxLinkCount());
			List<Map<String, Object>> cols = qryRuleDao.queryQueryRuleColumn(hTableConnPo.getQryRuleId());
			List<Map<String, Object>> ruleCondition = qryRuleDao.queryQueryRuleCondition(hTableConnPo.getQryRuleId());

			qryRuleDao.close();
			HashMap<String, Integer> nameIndexs = hTableConnPo.getNameIndexs();
			HashMap<String, Integer> nameExpandIndexs = hTableConnPo.nameExpandIndexs;

			QueryRuleColumnPO[] qrCols = new QueryRuleColumnPO[cols.size()];
			int expandLen = 0;
			for (int i = 0; i < cols.size(); i++) {
				Map<String, Object> col = cols.get(i);
				qrCols[i] = new QueryRuleColumnPO(col);
				String[] enName = qrCols[i].getColumnENName();
				for (int c = 0; c < enName.length; c++) {
					nameIndexs.put(enName[c], i);
					nameExpandIndexs.put(enName[c], expandLen++);
				}
			}
			hTableConnPo.setQrCols(qrCols);

			// 规则id和查询条件规则对象的对应关系
			ArrayList<QueryRuleConditionPO> ruleCons = new ArrayList<QueryRuleConditionPO>();
			QueryRuleConditionPO[] ruleConditionRel = new QueryRuleConditionPO[0];
			for (Map<String, Object> condition : ruleCondition) {
				QueryRuleConditionPO cond = new QueryRuleConditionPO(condition);
				if (cond.initExp(hTableConnPo))
					ruleCons.add(cond);
			}
			if (ruleCons.size() > 0)
				ruleConditionRel = ruleCons.toArray(ruleConditionRel);
			hTableConnPo.setRuleConditionRel(ruleConditionRel);
			if (qrCols.length == 0) {
				LogUtils.error("未配置有正确的列簇标签查询，查询规则【" + hTableConnPo.getQryRuleId() + "】不生效");
				synchronized (htableQryRules) {
					htableQryRules.remove(hTableConnPo.getQryRuleId());
				}
			}
			LogUtils.info("=============完成查询规则[" + qryId + "]加载=========");
		} catch (Exception e) {
			if (e instanceof TableNotFoundException && !isTablePartition) {// 更新表状态和对应的查询规则状态
				HBaseTableDAO htDao = new HBaseTableDAO();
				qryRuleDao.updateQueryRuleStatus(qryId, HBaseTablePO.HB_STATUS_INVALID);
				htDao.updateTableStatus(tableId, HBaseTablePO.HB_STATUS_INVALID);
				htDao.close();
			} else if (e instanceof TableNotEnabledException && !isTablePartition) {
				HBaseTableDAO htDao = new HBaseTableDAO();
				htDao.updateTableStatus(tableId, HBaseTablePO.HB_STATUS_NOT_AVAILABLE);
				qryRuleDao.updateQueryRuleStatusByHTableId(tableId, HBaseTablePO.HB_STATUS_INVALID);
				htDao.close();
			}
			LogUtils.error("Hbase查询规则存在配置错误" + qryMsg, e);
			e.printStackTrace();
			// 加载失败,移除链接
			Hashtable<String, HTableConnPO> ht = htableQryRules.get(qryId);
			if (null != ht && null != hTableConnPo && ht.containsKey(hTableConnPo.getTableName())) {
				ht.remove(hTableConnPo.getTableName());
			}
			hTableConnPo = null;
		} finally {
			qryRuleDao.close();
		}
		List<String[]> s = new ArrayList<String[]>();
		return hTableConnPo;
	}

	public static synchronized void loadUserInfo() {
		UserDataDAO qdao = new UserDataDAO();
		List<Map<String, Object>> lstUserTmp = qdao.queryAllUser();
		qdao.close();
		for (int i = 0; i < lstUserTmp.size(); i++) {
			UserToken userToken = new UserToken(lstUserTmp.get(i));
			htableUser.put(userToken.getUsername(), userToken);
		}
	}

	public static synchronized void loadUserInfo(String userName) {
		if (null == userName || userName.trim().length() <= 0) {
			return;
		}
		UserDataDAO qdao = new UserDataDAO();
		List<Map<String, Object>> lstUserTmp = qdao.queryUser(userName);
		qdao.close();
		for (int i = 0; i < lstUserTmp.size(); i++) {
			UserToken userToken = new UserToken(lstUserTmp.get(i));
			htableUser.put(userToken.getUsername(), userToken);
		}
	}

	public static synchronized void removeUserInfo(String userName) {
		if (null == userName || userName.trim().length() <= 0) {
			return;
		}
		long uid = -1l;
		if (htableUser.contains(userName)) {
			UserToken userToken = htableUser.get(userName);
			uid = userToken == null ? -1l : userToken.getUserId();
			htableUser.remove(userName);
		}

		if (-1l == uid) {
			return;
		}

		for (Long ruleid : htableRuleUserList.keySet()) {
			Set<Long> setUserInfo = htableRuleUserList.get(ruleid);
			if (setUserInfo.contains(uid)) {
				setUserInfo.remove(uid);
			}
		}
	}

	public static synchronized void removeRuleIdUserInfo(long qryruleid) {
		if (htableRuleUserList.contains(qryruleid)) {
			htableRuleUserList.remove(qryruleid);
		}
	}

	public static synchronized void loadRuleUserRef() {
		UserDataDAO qdao = new UserDataDAO();
		List<Map<String, Object>> lstUserRefTmp = qdao.queryAllUserRuleRefList();
		qdao.close();
		for (int i = 0; i < lstUserRefTmp.size(); i++) {
			Map<String, Object> tmpMap = lstUserRefTmp.get(i);
			long qryRuleId = MapUtils.getLongValue(tmpMap, "QRY_RULE_ID", -1);
			long userId = MapUtils.getLongValue(tmpMap, "USER_ID", -1);
			if (-1 == qryRuleId || -1 == userId) {
				continue;
			}
			Set<Long> setUser = htableRuleUserList.get(qryRuleId);
			if (null == setUser) {
				setUser = new HashSet<Long>();
				htableRuleUserList.put(qryRuleId, setUser);
			}
			setUser.add(userId);
		}
	}

	public static synchronized void loadRuleUserRef(long ruleId) {
		UserDataDAO qdao = new UserDataDAO();
		List<Map<String, Object>> lstUserRefTmp = qdao.queryUserRuleRefList(ruleId);
		qdao.close();
		Set<Long> setUserTmp = new HashSet<Long>();
		for (int i = 0; i < lstUserRefTmp.size(); i++) {
			Map<String, Object> tmpMap = lstUserRefTmp.get(i);
			long qryRuleId = MapUtils.getLongValue(tmpMap, "QRY_RULE_ID", -1);
			long userId = MapUtils.getLongValue(tmpMap, "USER_ID", -1);
			if (-1 == qryRuleId || -1 == userId) {
				continue;
			}

			setUserTmp.add(userId);
		}
		htableRuleUserList.put(ruleId, setUserTmp);
	}

	// modify by 2014-03-26 begin
	public static synchronized void loadHTableRuleList(long ruleId) {
		QueryRuleDAO qryRuleDao = new QueryRuleDAO();
		Map<String, Object> maprule = qryRuleDao.queryQueryRuleById(ruleId);
		qryRuleDao.close();
		QueryRulePO qryPo = new QueryRulePO(maprule);
		htableRuleList.put(ruleId, qryPo);
	}

	public static synchronized void loadRuleIdHTableList(long ruleId) {
		HBaseTableDAO tableDAO = new HBaseTableDAO();
		Map<String, Object> map = tableDAO.queryTableInfoByQryId(String.valueOf(ruleId));
		tableDAO.close();
		ruleIdhtableList.put(ruleId, new HBaseTablePO(map));
	}

	public static synchronized void removeHTableRule(long ruleId) {
		if (htableRuleList.containsKey(ruleId)) {
			htableRuleList.remove(ruleId);
		}
	}

	public static synchronized void removeRuleIdHTable(long ruleId) {
		if (ruleIdhtableList.containsKey(ruleId)) {
			ruleIdhtableList.remove(ruleId);
		}
	}

	// modify by 2014-03-26 end
	@Override
	public void destory() {
		// TODO Auto-generated method stub
	}
}
