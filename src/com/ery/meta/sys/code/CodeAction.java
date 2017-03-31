package com.ery.meta.sys.code;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.commons.collections.ListUtils;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;

/**

 * 
 * 作用(Ctrlr:具体功能作用,DAO:针对表,PO：针对的表)
 * 

 * @date 2012-2-9
 */
public class CodeAction {

	private CodeDAO codeDAO;

	/**
	 * 查询分类树
	 * 
	 * @return
	 */
	public List<Map<String, Object>> queryTypeTree() {
		List<Map<String, Object>> dirList = codeDAO.querySysDirInfo();
		// 使用AOP实现树数据
		List<Map<String, Object>> treeList = new ArrayList<Map<String, Object>>();
		treeList = ListUtils.union(treeList, dirList);
		for (int i = 0; i < dirList.size(); i++) {
			Map<String, Object> dirMap = dirList.get(i);
			String dirId = Convert.toString(dirMap.get("DIR_ID"));
			// 根据dirId取Type列表，并且加入同级
			List<Map<String, Object>> typeList = codeDAO.queryTypesByDirId(Convert.toInt(
					dirId.substring(4, dirId.length()), 0));
			treeList = ListUtils.union(treeList, typeList);
		}
		return treeList;
	}

	/**
	 * 修改系统编码
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> updateSysCode(Map<String, Object> data, int codeTypeId) {
		Map<String, Object> map = null;
		try {
			int count = codeDAO.updateSysCode(data, codeTypeId);
			if (count != 0) {
				map = codeDAO.queryByCodeId(Convert.toInt(data.get("codeId")));
				CodeManager.clear();
				CodeManager.load();
			}
			return map;
		} catch (Exception e) {
			LogUtils.error("", e);
			return null;
		}
	}

	/**
	 * 新增系统编码
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> insertSysCode(Map<String, Object> data) {
		Map<String, Object> map = null;
		try {
			int codeId = Convert.toInt(codeDAO.queryForNextVal("SEQ_SYS_CODE_ID"));
			data.put("codeId", codeId);
			boolean b = codeDAO.insertSysCode(data);
			if (b) {
				map = codeDAO.queryByCodeId(codeId);
				CodeManager.clear();
				CodeManager.load();
			}
			return map;
		} catch (Exception e) {
			LogUtils.error("", e);
			return null;
		}
	}

	/**
	 * 改变序列
	 * 
	 * @param ids
	 * @param codeTypeId
	 * @return
	 */
	public boolean changeSeq(String ids, int codeTypeId) {
		try {
			String id[] = ids.split(",");
			String[][] data = new String[id.length][];
			for (int i = 0; i < id.length; i++) {
				String[] row = { (i + 1) + "", id[i], codeTypeId + "" };
				data[i] = row;
			}
			codeDAO.updateSeq(data);
			return true;
		} catch (Exception e) {
			LogUtils.error("", e);
			return false;
		}
	}

	/**
	 * 根据类型ID取编码列表
	 * 
	 * @param typeId
	 * @return
	 */
	public List<Map<String, Object>> querySysCode(int typeId) {
		return codeDAO.querySysCode(typeId);
	}

	/**
	 * 改变目录树结构
	 * 
	 * @param data
	 * @return
	 */
	public boolean changeTreeStru(Map<String, Object> data) {
		try {
			BaseDAO.beginTransaction();
			for (String dataKey : data.keySet()) {
				String parId = Convert.toString(data.get(dataKey));
				if (dataKey.startsWith("dir_")) {
					codeDAO.updateParDirIdByDirId(Convert.toInt(dataKey.substring(4, dataKey.length())),
							parId.equals("0") ? 0 : Convert.toInt(parId.substring(4, parId.length())));
				} else if (dataKey.startsWith("type_")) {
					codeDAO.updateDirIdByCodeTypeId(Convert.toInt(dataKey.substring(5, dataKey.length())),
							parId.equals("0") ? 0 : Convert.toInt(parId.substring(4, parId.length())));
				}
			}
			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			LogUtils.error("", e);
			BaseDAO.rollback();
			return false;
		}
	}

	/**
	 * 保存修改后的树信息
	 * 
	 * @param data
	 * @return
	 */
	public boolean saveTree(Map<String, Object> data) {
		try {
			// 树结构Data
			Map<String, Object> struData = (Map<String, Object>) data.get("struData");
			// 新增目录数据
			List<Map<String, Object>> newDirData = (List<Map<String, Object>>) data.get("newDirData");
			// 被修改的目录数据
			Map<String, Object> modifyDirData = (Map<String, Object>) data.get("modifyDirData");
			// 被删除的目录数据
			List<String> deleteDirData = (List<String>) data.get("deleteDirData");

			Map<String, String> newIdMach = new HashMap<String, String>();
			for (int i = 0; i < newDirData.size(); i++) {
				String newId = "dir_" + Convert.toString(codeDAO.queryForNextVal("SEQ_SYS_CODE_TYPE_DIR_ID"));
				newIdMach.put(Convert.toString(newDirData.get(i).get("dirId")), newId);
				newDirData.get(i).put("dirId", newId);
			}

			for (int i = 0; i < newDirData.size(); i++) {
				if (Convert.toString(newDirData.get(i).get("parentDirId")).startsWith("newDir_")) {
					String oldPid = Convert.toString(newDirData.get(i).get("parentDirId")) + "";
					newDirData.get(i).put("parentDirId", newIdMach.get(oldPid));
				}
			}

			for (int i = 0; i < deleteDirData.size(); i++) {
				if (deleteDirData.get(i).startsWith("newDir_")) {
					deleteDirData.set(i, newIdMach.get(deleteDirData.get(i)));
				}
			}

			for (String dataKey : struData.keySet()) {
				if (dataKey.startsWith("newDir_")) {
					String tmpVal = Convert.toString(struData.get(dataKey));
					struData.remove(dataKey);
					struData.put(newIdMach.get(dataKey), tmpVal);
				}
				if (Convert.toString(struData.get(dataKey)).startsWith("newDir_")) {
					struData.put(dataKey, newIdMach.get(Convert.toString(struData.get(dataKey))));
				}

			}

			for (String dataKey : modifyDirData.keySet()) {
				if (dataKey.startsWith("newDir_")) {
					String tmpVal = Convert.toString(modifyDirData.get(dataKey));
					modifyDirData.remove(dataKey);
					modifyDirData.put(newIdMach.get(dataKey), tmpVal);
				}
				if (Convert.toString(modifyDirData.get(dataKey)).startsWith("newDir_")) {
					modifyDirData.put(dataKey, newIdMach.get(Convert.toString(modifyDirData.get(dataKey))));
				}
			}

			BaseDAO.beginTransaction();
			// 第一步：先保存新增
			codeDAO.insertCodeTypeDir(newDirData);
			// 第二步：执行修改
			for (String dataKey : modifyDirData.keySet()) {
				int dirId = Convert.toInt(dataKey.replaceAll("dir_", ""));
				codeDAO.updateDirNameByDirId(dirId, Convert.toString(modifyDirData.get(dataKey)));
			}
			// 第三步：执行删除
			codeDAO.deleteDir(deleteDirData);
			// 最后一步：改变结构
			for (String dataKey : struData.keySet()) {
				String parId = Convert.toString(struData.get(dataKey));
				if (dataKey.startsWith("dir_")) {
					codeDAO.updateParDirIdByDirId(Convert.toInt(dataKey.substring(4, dataKey.length())),
							parId.equals("0") ? 0 : Convert.toInt(parId.substring(4, parId.length())));
				} else if (dataKey.startsWith("type_")) {
					codeDAO.updateDirIdByCodeTypeId(Convert.toInt(dataKey.substring(5, dataKey.length())),
							parId.equals("0") ? 0 : Convert.toInt(parId.substring(4, parId.length())));
				}
			}

			BaseDAO.commit();
			return true;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("", e);
			return false;
		}
	}

	public void setCodeDAO(CodeDAO codeDAO) {
		this.codeDAO = codeDAO;
	}
}
