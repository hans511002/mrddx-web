package com.ery.meta.common;

import java.sql.Connection;
import java.util.List;
import java.util.Map;

import com.ery.base.support.common.aop.IAopMethodFilter;
import com.ery.base.support.common.aop.InvokeAdapter;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.jdbc.DataAccessFactory;
import com.ery.base.support.sys.podo.BaseDAO;

public class MetaBaseDAO extends BaseDAO {

	/**
	 * 是否记录操作日志
	 */
	private boolean isWriteLog = true;

	public MetaBaseDAO() {
	}

	public MetaBaseDAO(boolean writeLog) {
		isWriteLog = writeLog;
	}

	/**
	 * 覆盖父类获取dataAcess方法，添加操作日志处理逻辑的access类。
	 * 
	 * @param connection
	 * @return
	 */
	protected DataAccess getDataAccessInstance(Connection connection) {
		if (isWriteLog) {
			DataAccess access = DataAccessFactory.getProxyDataAccess(connection, new InvokeAdapter() {
				/**
				 * 实现此方法用于在方法执行执行记录操作日志。该方法不会引起业务的正常运行，若记录 日志失败，只会简单的处理错误，打印到日志文件中，业务方法会继续运行。
				 * 
				 * @param source
				 *            拦截对象
				 * @param methodName
				 *            运行时方法名。
				 * @param args
				 *            参数集合
				 * @return
				 */
				public boolean beforeInvoke(Object source, String methodName, Object[] args) {
					// 记录日志
					return true;
				}
			}, new String[] { "exec\\w*", "query\\w*", "insert\\w*" },// 要进行拦截的方法正则表达式。
					new IAopMethodFilter() {
						/**
						 * 过滤器，过滤某个方法，返回true表示可以进行AOP拦截，返回false表示不能进行AOP拦截，与AopFactory联合使用
						 * 
						 * @param souceClass
						 * @param methodName
						 * @param paramType
						 * @return
						 */
						public boolean filter(Class<?> souceClass, String methodName, Class<?>[] paramType) {
							if ((methodName.equals("queryForList") || methodName.equals("queryForMap") ||
									methodName.equals("queryForDataTable") || methodName.equals("queryForInt") ||
									methodName.equals("queryForObject") || methodName.equals("queryForObjectArray")) &&
									paramType.length == 1) {
								return false;
							} else if ((methodName.equals("queryForListByRowMapper") || methodName
									.equals("queryByRowHandler")) && paramType.length == 2) {
								return false;
							}
							return true;
						}
					});
			access.setConnection(connection);
			// DataAccess access = DataAccessFactory.getInstance(connection);
			return access;
		}
		return super.getDataAccessInstance(connection);
	}

	/**
	 * 查询序列的下一个值
	 * 
	 * @param scequenceName
	 *            序列名称
	 * @return
	 */
	public long queryForNextVal(String scequenceName) {
		String sql = "SELECT " + scequenceName + ".NEXTVAL FROM DUAL";
		return getDataAccess().queryForLong(sql);
	}

	/**
	 * 验证生成的序列号是否存在
	 * 
	 * @param col_id
	 * @return
	 */
	public boolean checkId(long col_id, String tableName, String column) {
		String sql = "SELECT COUNT(*) FROM " + tableName + " WHERE " + column + " = ?";
		return getDataAccess().queryForInt(sql, col_id) > 0;
	}

	/**
	 * 查询序列的下一个值
	 * 
	 * @param scequenceName
	 *            序列名称
	 * @param configName
	 *            数据源名称
	 * @return
	 */
	public long queryForNextVal(String scequenceName, String configName) {
		String sql = "SELECT " + scequenceName + ".NEXTVAL FROM DUAL";
		return getDataAccess(configName).queryForInt(sql);
	}

	public void setWriteLog(boolean writeLog) {
		isWriteLog = writeLog;
	}

	/**
	 * 
	 * @param sql
	 * @param CodeBeans
	 * @param params
	 * @return
	 */
	public List<Map<String, Object>> queryForListByCodeBean(String sql, CodeBean[] CodeBeans, Object... params) {
		List<Map<String, Object>> list = getDataAccess().queryForList(sql, new CodeMapper(CodeBeans), params);
		return list;
	}
}
