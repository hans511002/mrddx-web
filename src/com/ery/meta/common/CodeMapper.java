package com.ery.meta.common;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.base.support.jdbc.mapper.AbstractSingleRowMapper;
import com.ery.base.support.utils.Convert;
import com.ery.meta.sys.code.CodeManager;

public class CodeMapper extends AbstractSingleRowMapper<Map> {
	private static Class<Map> clazz = Map.class;
	private CodeBean cols[];

	public CodeMapper(CodeBean cols[]) {
		super(clazz);
		this.cols = cols;
	}

	/*
	 */
	public Map<String, Object> convertRow(ResultSet resultset) {
		Map<String, Object> map = new HashMap<String, Object>();
		try {
			ResultSetMetaData resultSetMetaData = resultset.getMetaData();
			int colsCount = resultSetMetaData.getColumnCount(); // 取得结果集列数
			List<String> colsNames = new ArrayList<String>(); // 保存结果集列名
			for (int i = 1; i <= colsCount; i++) {
				colsNames.add(resultSetMetaData.getColumnName(i).toUpperCase());
			}
			Object[] colsName = colsNames.toArray();
			for (int i = 1; i <= colsCount; i++) {
				map.put(Convert.toString(colsName[i - 1]), resultset.getObject(i));
				for (CodeBean bean : cols) {
					if (Convert.toString(colsName[i - 1]).equalsIgnoreCase(bean.getColItem())) {// 查出匹配项
						map.put(bean.getShowItem().toUpperCase(),
								CodeManager.getName(bean.getType(), Convert.toString(map.get(bean.getColItem()))));
					}
				}
			}
		} catch (SQLException e) {
			e.printStackTrace(); // To change body of catch statement use File |
									// Settings | File Templates.
		}
		return map; // To change body of implemented methods use File | Settings
					// | File Templates.
	}
}
