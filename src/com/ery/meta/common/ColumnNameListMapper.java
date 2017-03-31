package com.ery.meta.common;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

import com.ery.base.support.jdbc.mapper.AbstractListMapper;
import com.ery.base.support.jdbc.mapper.AbstractSingleRowMapper;

public class ColumnNameListMapper extends AbstractListMapper<Map<String, Object>> {

	public ColumnNameListMapper(Class<Map<String, Object>> clazz, AbstractSingleRowMapper<Map<String, Object>> mapper) {
		super(clazz, mapper);
	}

	@Override
	public Map<String, Object> convertRow(ResultSet rs) throws SQLException {
		return mapper.convertRow(rs);
	}

}
