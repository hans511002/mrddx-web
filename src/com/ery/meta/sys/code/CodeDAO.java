package com.ery.meta.sys.code;

import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.Convert;
import com.ery.meta.common.MetaBaseDAO;

/**
 * 数据表META_SYS_CODE的操作类
 * 
 * @date 2012-2-9
 */
public class CodeDAO extends MetaBaseDAO {

	/**
	 * 查询所有的系统编码
	 * 
	 * @return
	 */
	public CodePO[] queryAllCode() {
		String sql = " SELECT A.CODE_ID,A.CODE_TYPE_ID,A.CODE_NAME,A.CODE_VALUE,A.ORDER_ID,B.TYPE_CODE"
				+ " FROM META_SYS_CODE A,META_SYS_CODE_TYPE B "
				+ " WHERE A.CODE_TYPE_ID=B.CODE_TYPE_ID ORDER BY A.CODE_TYPE_ID ASC,A.ORDER_ID ASC ";
		return getDataAccess().queryForBeanArray(sql, CodePO.class);
	}

	/**
	 * 查询系统目录
	 * 
	 * @return
	 */
	public List<Map<String, Object>> querySysDirInfo() {
		String sql = "SELECT 'dir_' || DIR_ID AS DIR_ID, 'dir_' || PARENT_DIR_ID AS PARENT_DIR_ID, "
				+ " DIR_NAME FROM META_SYS_CODE_TYPE_DIR ";
		return getDataAccess().queryForList(sql);
	}

	/**
	 * 根据DIR取得TYPE信息
	 * 
	 * @param dirId
	 * @return
	 */
	public List<Map<String, Object>> queryTypesByDirId(int dirId) {
		String sql = "SELECT 'type_' || CODE_TYPE_ID AS DIR_ID, 'dir_' || DIR_ID AS PARENT_DIR_ID, "
				+ "TYPE_CODE, CODE_TYPE_NAME AS DIR_NAME, IS_EDITABLE, DESCRIPTION FROM "
				+ "META_SYS_CODE_TYPE WHERE DIR_ID=?";
		return getDataAccess().queryForList(sql, dirId);
	}

	/**
	 * 根据类型ID取编码列表
	 * 
	 * @param typeId
	 * @return
	 */
	public List<Map<String, Object>> querySysCode(int typeId) {
		String sql = "SELECT CODE_ID, CODE_TYPE_ID, CODE_NAME, CODE_VALUE, ORDER_ID FROM META_SYS_CODE "
				+ " WHERE CODE_TYPE_ID = ? ORDER BY ORDER_ID";
		return getDataAccess().queryForList(sql, typeId);
	}

	/**
	 * 修改系统编码
	 * 
	 * @param data
	 */
	public int updateSysCode(Map<String, Object> data, int codeTypeId) {
		String codeQuerySql = "SELECT COUNT(C.CODE_VALUE) CODE_VALUE FROM META_SYS_CODE C WHERE C.CODE_TYPE_ID =? AND C.CODE_ID<>? AND C.CODE_VALUE=?";
		List<Map<String, Object>> list = getDataAccess().queryForList(codeQuerySql, codeTypeId,
				Convert.toInt(data.get("codeId")), Convert.toString(data.get("codeValue")));
		Map<String, Object> map = list.get(0);
		int count = Convert.toInt(map.get("CODE_VALUE"));
		if (count == 0) {
			String sql = "UPDATE META_SYS_CODE SET CODE_NAME=?, CODE_VALUE=? WHERE CODE_ID=?";
			return getDataAccess().execUpdate(sql, Convert.toString(data.get("codeName")),
					Convert.toString(data.get("codeValue")), Convert.toInt(data.get("codeId")));
		}
		return 0;
	}

	/**
	 * 只修改系统编码名称
	 * 
	 * @param data
	 */
	public void updateSysName(Map<String, Object> data) {
		String sql = "UPDATE META_SYS_CODE SET CODE_NAME=? WHERE CODE_ID=?";
		getDataAccess().execUpdate(sql, Convert.toString(data.get("codeName")), Convert.toInt(data.get("codeId")));
	}

	/**
	 * 新增系统编码
	 * 
	 * @param data
	 */
	public boolean insertSysCode(Map<String, Object> data) {
		String querySql = "SELECT C.CODE_VALUE FROM META_SYS_CODE C WHERE C.CODE_VALUE=? AND C.CODE_TYPE_ID=?";
		List<Map<String, Object>> list = getDataAccess().queryForList(querySql,
				Convert.toString(data.get("codeValue")), Convert.toInt(data.get("codeTypeId")));
		if (list != null) {
			int count = list.size();
			if (count == 0) {
				String sql = "INSERT INTO META_SYS_CODE "
						+ "  (CODE_ID, CODE_TYPE_ID, CODE_NAME, CODE_VALUE, ORDER_ID) " + "   VALUES "
						+ "  (?, ?, ?, ?, ?)";
				getDataAccess().execUpdate(sql, Convert.toInt(data.get("codeId")),
						Convert.toInt(data.get("codeTypeId")), Convert.toString(data.get("codeName")),
						Convert.toString(data.get("codeValue")), Convert.toInt(data.get("orderId"), 0));
				return true;
			}
		} else {
			return false;
		}
		return false;
	}

	/**
	 * 根据编码ID取编码信息
	 * 
	 * @param codeId
	 * @return
	 */
	public Map<String, Object> queryByCodeId(int codeId) {
		String sql = "SELECT CODE_ID, CODE_TYPE_ID, CODE_NAME, CODE_VALUE, ORDER_ID FROM META_SYS_CODE "
				+ " WHERE CODE_ID = ?";
		return getDataAccess().queryForMap(sql, codeId);
	}

	/**
	 * 改变序列
	 * 
	 * @param data
	 */
	public void updateSeq(String[][] data) {
		String sql = "UPDATE META_SYS_CODE SET ORDER_ID=? WHERE CODE_ID=? AND CODE_TYPE_ID=? ";
		getDataAccess().execUpdateBatch(sql, data);
	}

	/**
	 * 根据类型ID修改类型的目录
	 * 
	 * @param dirId
	 * @param codeTypeId
	 */
	public void updateDirIdByCodeTypeId(int codeTypeId, int dirId) {
		String sql = "UPDATE META_SYS_CODE_TYPE SET DIR_ID = ? WHERE CODE_TYPE_ID=?";
		getDataAccess().execUpdate(sql, dirId, codeTypeId);
	}

	/**
	 * 根据目录ID修改目录父ID
	 * 
	 * @param parDirId
	 * @param dirId
	 */
	public void updateParDirIdByDirId(int dirId, int parDirId) {
		String sql = "update meta_sys_code_type_dir set parent_dir_id = ? where dir_id=?";
		getDataAccess().execUpdate(sql, parDirId, dirId);
	}

	/**
	 * 批量新增目录
	 * 
	 * @param data
	 */
	public void insertCodeTypeDir(List<Map<String, Object>> data) {
		String sql = "INSERT INTO meta_sys_code_type_dir " + "  (dir_id, parent_dir_id, dir_name) " + "  VALUES "
				+ "  (?, ?, ?)";

		String[][] para = new String[data.size()][];
		for (int i = 0; i < data.size(); i++) {
			para[i] = new String[] { Convert.toString(data.get(i).get("dirId")).replace("dir_", ""),
					Convert.toString(data.get(i).get("parentDirId")).replace("dir_", ""),
					Convert.toString(data.get(i).get("dirName")) };
		}
		getDataAccess().execUpdateBatch(sql, para);
	}

	/**
	 * 根据目录ID修改目录名称
	 * 
	 * @param dirId
	 * @param dirName
	 */
	public void updateDirNameByDirId(int dirId, String dirName) {
		String sql = "update meta_sys_code_type_dir set dir_name = ? where dir_id = " + dirId;
		getDataAccess().execUpdate(sql, dirName);
	}

	/**
	 * 批量删除目录
	 * 
	 * @param data
	 */
	public void deleteDir(List<String> data) {
		String sql = "delete from meta_sys_code_type_dir where dir_id = ?";
		String[][] para = new String[data.size()][];
		for (int i = 0; i < data.size(); i++) {
			String[] tmp = new String[1];
			tmp[0] = Convert.toString(data.get(i).replace("dir_", ""));
			para[i] = tmp;
		}
		getDataAccess().execUpdateBatch(sql, para);
	}

	/**
	 * 删除编码
	 * 
	 * @param codeId
	 */
	public void deleteCode(int codeId) {
		String sql = "delete from meta_sys_code where code_id=" + codeId;
		getDataAccess().execUpdate(sql);
	}

}
