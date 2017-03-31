package com.ery.meta.common.term;

import java.util.Map;

import com.ery.base.support.jdbc.DataAccess;


public class TestTreeImpl extends TermDataService {

	public Object[][] getData(DataAccess access, Map<String, Object> params, TermDataCall call) throws Exception {
		Object[][] testobj = new Object[5][3];
		for (int i = 1; i <= 5; i++) {
			testobj[i - 1] = new Object[] { i, "测试" + i, 0 };
		}
		call.coverTermAttribute(TermConstant.KEY_dynload, true);// 把树设置成异步加载
		return testobj;
	}

	/**
	 * 一般的下拉框数据，此方法无用，不需要调用 如果是树，并且设置成了动态加载，那么必须重写此方法，实现加载子节点数据
	 * 
	 * @param access
	 * @param params
	 * @param parentID
	 * @param call
	 * @return
	 * @throws Exception
	 */
	public Object[][] getChildData(DataAccess access, Map<String, Object> params, String parentID, TermDataCall call)
			throws Exception {
		Object[][] testobj = new Object[5][3];
		for (int i = 1; i <= 5; i++) {
			String id = parentID + "_" + i;
			testobj[i - 1] = new Object[] { id, "测试" + id, parentID };
		}
		return testobj;
	}

}
