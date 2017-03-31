package com.ery.meta.common.term;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.MapUtils;

public class TermDataConstantSqlServiceImpl extends TermDataDefaultSerivceImpl {
	@Override
	public Object[][] getData(DataAccess access, Map<String, Object> termControl, TermDataCall call) throws Exception {
		// 获取常量SQL的配置
		List<String> constantSql = (List<String>) MapUtils.getObject(termControl, TermConstant.KEY_CONSTANT_SQL);
		if (constantSql == null || constantSql.size() != 2) {
			throw new IllegalArgumentException("常量SQL配置出错");
		}
		// 获取SQL
		Class constant = Class.forName(constantSql.get(0));
		// 获取字段
		Field field = constant.getField(constantSql.get(1));
		termControl.put(TermConstant.KEY_dataRule, field.get(constant));
		return super.getData(access, termControl, call); // To change body of
															// overridden
															// methods use File
															// | Settings | File
															// Templates.
	}
}
