package com.ery.hadoop.hq.ws.base;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.sys.podo.BaseDAO;

/**

 * 

 * @description
 * @date 12-10-24 -
 * @modify
 * @modifyDate -
 */
public class MetaWsDAO extends BaseDAO {

	// 返回一个数据库执行接口
	public DataAccess getAccess() {
		return getDataAccess();
	}
}
