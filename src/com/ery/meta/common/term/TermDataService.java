package com.ery.meta.common.term;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.jdbc.DataAccess;


public abstract class TermDataService {

	/**
	 * 条件实现类必须实现此方法
	 * 
	 * @param access 传入数据访问接口
	 * @param params 条件参数 可通过此参数取得客户端条件控件的所有状态信息 取值的key参考TermControlAction的常量
	 * @return
	 */
	public Object[][] getData(DataAccess access, Map<String, Object> params, TermDataCall call) throws Exception {
		return new Object[0][];
	}

	/**
	 * 默认实现一般的下拉框不需要实现此方法，异步加载树时则需要重写此方法 异步下拉树加载时
	 * 在getData的实现里面调用call.coverTermAttribute(TermControl.KEY_dynload,true)
	 * 实现异步加载
	 * 
	 * @param access
	 * @param params
	 * @param call
	 * @return
	 * @throws Exception
	 */
	public Object[][] getChildData(DataAccess access, Map<String, Object> params, String parentID, TermDataCall call)
			throws Exception {
		return null;
	}

	/**
	 * 查询数据表格
	 * 
	 * @param access 数据库连接
	 * @param termControl 条件对象
	 * @return
	 * @throws Exception
	 */
	public List<Map<String, Object>> queryDataTable(DataAccess access, Map<String, Object> termControl, Page page)
			throws Exception {
		return null;
	}

}
