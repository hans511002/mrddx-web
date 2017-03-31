package com.ery.meta.common.term;

import java.util.Map;

import com.ery.base.support.jdbc.DataAccess;

public class TestComboImpl extends TermDataService {

	public Object[][] getData(DataAccess access, Map<String, Object> params, TermDataCall call) throws Exception {
		Object[][] testobj = new Object[10][2];
		for (int i = 0; i < 10; i++) {
			testobj[i] = new Object[] { i, "测试afsa_" + i };
		}
		// return
		// access.queryForArray("select username a,username b from all_users order by USERNAME",false);
		return testobj;
	}

}
