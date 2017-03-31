package com.ery.meta.common;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.sql.Blob;
import java.sql.Clob;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

import com.ery.base.support.jdbc.JdbcException;
import com.ery.base.support.jdbc.mapper.AbstractMutilColumnMapper;

public class BlobRowMapper extends AbstractMutilColumnMapper<Map<String, Object>> {

	private String encode = "utf-8";

	public BlobRowMapper() {
		super();
	}

	public BlobRowMapper(String encode) {
		super();
		this.encode = encode;
	}

	@Override
	public Map<String, Object> convertToObject(ResultSet resultSet) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			for (String column : super.columnHeaders) {
				Object rs = resultSet.getObject(column);
				if (rs instanceof Clob) {
					rs = ((Clob) rs).getSubString(1, (int) ((Clob) rs).length());
				} else if (rs instanceof Blob) {
					Blob blob = (Blob) rs;
					InputStreamReader in = new InputStreamReader(blob.getBinaryStream(), encode);
					BufferedReader bin = new BufferedReader(in);
					String res = "";
					while (true) {
						String tmp = bin.readLine();
						if (tmp == null)
							break;
						res += tmp + "\n";
					}
					rs = res;
					bin.close();
				}
				map.put(column, rs);
			}
		} catch (Exception e) {
			throw new JdbcException(e);
		}
		return map;
	}
}
