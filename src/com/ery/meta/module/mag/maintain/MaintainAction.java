package com.ery.meta.module.mag.maintain;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.base.support.utils.MapUtils;

/**
 * 

 * @date 2012-05-21
 * @description 维护表操作action
 * 
 */
public class MaintainAction {

	private MaintainDAO maintainDAO;
	private MetaMagTableMaintainDAO metaMagTableMaintainDAO = new MetaMagTableMaintainDAO();
	private MetaMagMaintainQueryDAO metaMagMaintainQueryDAO = new MetaMagMaintainQueryDAO();
	private MetaMagMaintainColumnDAO metaMagMaintainColumnDAO = new MetaMagMaintainColumnDAO();

	/**
	 * 通过维护表id，查询对应的表信息
	 * 
	 * @param maintainId
	 * @return
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> queryTableInfo(int maintainId) {
		Map<String, Object> data = metaMagTableMaintainDAO.queryTableInfo(maintainId);
		if (data != null) {
			// 查询搜索条件数据并添加到返回数据中
			Map<String, Object> searchMap = metaMagMaintainQueryDAO.querySearchList(maintainId);
			List<Map<String, Object>> searchList = (List<Map<String, Object>>) searchMap.get("SHOW_SEARCH_LIST");
			data.put("SHOW_SEARCH_LIST", searchList);
			// 查询所有关联数据
			String queryColumns = MapUtils.getString(data, "QUERY_COLUMNS"); // 显示字段列
			String editColumns = MapUtils.getString(data, "EDIT_COLUMNS"); // 编辑字段列
			String ids = MapUtils.getString(searchMap, "ids"); // 搜索字段列
			String colIds = (!ids.equals("") ? ids + "," : "") + (!queryColumns.equals("") ? queryColumns + "," : "")
					+ (!editColumns.equals("") ? editColumns + "," : "");
			colIds = colIds.substring(0, colIds.length() - 1);
			Map<String, Object> dataFrom = metaMagMaintainColumnDAO.queryAllColumn(colIds);
			data.put("DATA_FROM", dataFrom);
		}
		return data;
	}

	/**
	 * 通过搜索条件，查询对应表信息下的数据
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryTableData(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20); // 按每页20条分页;
		}
		return maintainDAO.queryTableDataById(data, page);
	}

	/**
	 * 通过主键信息，删除数据
	 * 
	 * @param data
	 * @return
	 */
	public boolean deleteData(Map<String, Object> data) {
		try {
			maintainDAO.deleteData(data);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * 新增数据
	 * 
	 * @param data
	 * @return
	 */
	public boolean addData(Map<String, Object> data) {
		try {
			maintainDAO.addData(data);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * 通过主键信息，修改数据
	 * 
	 * @param data
	 * @return
	 */
	public boolean updateData(Map<String, Object> data) {
		try {
			maintainDAO.updateData(data);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	public void setMaintainDAO(MaintainDAO maintainDAO) {
		this.maintainDAO = maintainDAO;
	}
}
