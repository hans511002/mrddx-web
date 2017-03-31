package com.ery.meta.module.bigdata.mrddx.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;

/**

 * 

 * @description 数据源管理Action
 * @date 2013-04-18
 */
public class BigDataSourceAction {

	private DataSourceDAO dataSourceDAO;

	/**
	 * 通过源类型ID判断：查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryParamBySourceTypeId(Map<String, Object> data) {
		return dataSourceDAO.queryParamBySourceTypeId(data);
	}

	/**
	 * 查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryTypeAll(Map<String, Object> data) {
		return dataSourceDAO.queryTypeAll(data);
	}

	/**
	 * 通过数据源ID判断：查询数据源参数--无分页
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> queryParamByDataSourceId(Map<String, Object> data) {
		List<Map<String, Object>> defaultList = dataSourceDAO.queryDataSourceDefaultParamBySourceDBType(data);
		List<Map<String, Object>> currentList = dataSourceDAO.queryParamByDataSourceId(data);

		// 新增参数
		boolean isEixt = false;
		for (Map<String, Object> lstmap : defaultList) {
			isEixt = false;
			String paramName = (String) lstmap.get("PARAM_NAME");
			for (Map<String, Object> clstmap : currentList) {
				String cparamName = (String) clstmap.get("PARAM_NAME");
				if (paramName.equals(cparamName)) {
					isEixt = true;
					break;
				}
			}

			if (isEixt) {
				continue;
			}

			Map<String, Object> newMap = new HashMap<String, Object>();
			for (String dmap : lstmap.keySet()) {
				newMap.put(dmap, lstmap.get(dmap));
			}
			newMap.put("PARAM_VALUE", "");
			currentList.add(newMap);
		}

		// 删除的参数
		List<Map<String, Object>> lstDeleteTmp = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> clstmap : currentList) {
			isEixt = false;
			String cparamName = (String) clstmap.get("PARAM_NAME");

			for (Map<String, Object> lstmap : defaultList) {
				String paramName = (String) lstmap.get("PARAM_NAME");
				if (paramName.equals(cparamName)) {
					isEixt = true;
					break;
				}
			}

			if (isEixt) {
				continue;
			}
			lstDeleteTmp.add(clstmap);
		}
		for (Map<String, Object> map : lstDeleteTmp) {
			currentList.remove(map);
		}
		return currentList;
	}

	/**
	 * 查询数据源
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSource(Map<String, Object> data, Page page) {

		return dataSourceDAO.queryDataSource(data, page);
	}

	/**
	 * 新增数据源表+数据源参数表
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> saveDataSource(Map<String, Object> data) {
		long dsId = Convert.toLong(data.get("dataSourceId"), 0);
		if (dsId != 0) {
			// 不等于0，标示修改
			return updateDataSource(data);
		}
		Map<String, Object> ret = new HashMap<String, Object>();
		// 获取数据源名称
		String dataSourceName = Convert.toString(data.get("dataSourceName"));
		// 获取数据源类型ID
		String sourceDBType = Convert.toString(data.get("sourceTypeId"));
		String sourceTypeId = "";
		if (sourceDBType != null && !"".equals(sourceDBType)) {
			String tmp[] = sourceDBType.split(":");
			if (tmp.length == 2) {
				sourceTypeId = tmp[1];
			}
		}

		data.put("DATA_SOURCE_NAME", dataSourceName);
		data.put("SOURCE_TYPE_ID", sourceTypeId);
		try {
			// 增加数据源表和数据源参数表
			// 主键、外键关系
			BaseDAO.beginTransaction();
			long dataSourceId = dataSourceDAO.saveDataSource(data);// 先新增数据源表
			// 新增数据源信息
			List<Map<String, Object>> dataInfos = (List<Map<String, Object>>) data.get("dataInfos");
			for (Map<String, Object> dataInfo : dataInfos) {
				if (dataInfo.size() <= 0) {
					continue;
				}
				dataInfo.put("DATA_SOURCE_ID", dataSourceId);
				dataSourceDAO.saveDataSourceParam(dataInfo);
			}
			BaseDAO.commit();
			ret.put("flag", 1);
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
			ret.put("flag", 0);
			ret.put("msg", e.getMessage());
		}
		return ret;
	}

	/**
	 * 通过数据源ID：查询是否存在引用的数据源的ID--无分页
	 * 
	 * @param data
	 * @return
	 */
	public int queryJobId(int data) {
		return dataSourceDAO.queryJobId(data);
	}

	/**
	 * 根据数据源ID删除数据源表+数据源参数表
	 * 
	 * @return
	 */
	public String deleteDataSource(int dataSourceId, int sourceTypeId) {
		try {
			BaseDAO.beginTransaction();
			Integer conut = this.dataSourceDAO.queryJobId(dataSourceId);
			if (null != conut && conut > 0) {
				BaseDAO.commit();
				return "2";
			}
			// 主键、外键关联先删除数据源参数表
			this.dataSourceDAO.deleteDataSourceParam(dataSourceId);
			// 删除成功之后，再删除数据源表
			this.dataSourceDAO.deleteDataSource(dataSourceId);
			BaseDAO.commit();
			return "1";
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
			return "0";
		}
	}

	/**
	 * 修改数据源表+数据源参数表
	 * 
	 * @param data
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> updateDataSource(Map<String, Object> data) {
		Map<String, Object> ret = new HashMap<String, Object>();
		// 获取数据源名称
		String DATA_SOURCE_NAME = Convert.toString(data.get("dataSourceName"));

		// 获取数据源类型ID
		String sourceDBType = Convert.toString(data.get("sourceTypeId"));
		String SOURCE_TYPE_ID = "";
		if (sourceDBType != null && !"".equals(sourceDBType)) {
			String tmp[] = sourceDBType.split(":");
			if (tmp.length == 2) {
				SOURCE_TYPE_ID = tmp[1];
			}
		}

		// 获取数据源ID
		int DATA_SOURCE_ID = Convert.toInt(data.get("dataSourceId"));
		// 获取数据源处理类型
		int SOURCE_CATE = MapUtils.getIntValue(data, "sourceCate");

		data.put("SOURCE_CATE", SOURCE_CATE);
		data.put("DATA_SOURCE_ID", DATA_SOURCE_ID);
		data.put("DATA_SOURCE_NAME", DATA_SOURCE_NAME);
		data.put("SOURCE_TYPE_ID", SOURCE_TYPE_ID);

		try {
			BaseDAO.beginTransaction();
			// 增加数据源表和数据源参数表
			dataSourceDAO.updateDataSource(data);// 先修改数据源表

			// 删除数据源参数表
			dataSourceDAO.deleteDataSourceParam(DATA_SOURCE_ID);

			// 插入操作数据源参数信息
			// 新增数据源信息
			List<Map<String, Object>> dataInfos = (List<Map<String, Object>>) data.get("dataInfos");
			for (Map<String, Object> dataInfo : dataInfos) {
				dataInfo.put("DATA_SOURCE_ID", DATA_SOURCE_ID);
				dataSourceDAO.insertDataSourceParam(dataInfo);
			}
			BaseDAO.commit();
			ret.put("flag", 1);
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
			ret.put("flag", 0);
			ret.put("msg", e.getMessage());
		}
		return ret;
	}

	public void setdataSourceDAO(DataSourceDAO dataSourceDAO) {
		this.dataSourceDAO = dataSourceDAO;
	}
}
