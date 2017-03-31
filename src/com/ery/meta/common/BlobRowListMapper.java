package com.ery.meta.common;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Map;

import com.ery.base.support.jdbc.mapper.AbstractListMapper;


public class BlobRowListMapper extends AbstractListMapper<Map<String, Object>> {

	/**
	 * @param clazz
	 * @param mapper
	 */
	public BlobRowListMapper() {
		super(null, new BlobRowMapper());
	}

	public BlobRowListMapper(String encode) {
		super(null, new BlobRowMapper(encode));
	}

	@Override
	public Map<String, Object> convertRow(ResultSet rs) throws SQLException {
		return mapper.convertRow(rs);
	}
}
