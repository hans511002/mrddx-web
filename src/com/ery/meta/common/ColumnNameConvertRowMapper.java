package com.ery.meta.common;

import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

import com.ery.base.support.jdbc.JdbcException;
import com.ery.base.support.jdbc.mapper.AbstractMutilColumnMapper;

public class ColumnNameConvertRowMapper extends AbstractMutilColumnMapper<Map<String, Object>> {
	public ColumnNameConvertRowMapper() {
		super();
	}

	@Override
	public Map<String, Object> convertToObject(ResultSet resultSet) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			for (String column : super.columnHeaders) {
				Object rs = resultSet.getObject(column);
				map.put(Common.tranColumnToJavaName(column.toUpperCase()), rs);
			}
		} catch (Exception e) {
			throw new JdbcException(e);
		}
		return map;
	}
}
