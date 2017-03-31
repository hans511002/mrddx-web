package com.ery.meta.module.hBaseQuery;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.sql.Blob;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.Page;

import com.ery.hadoop.hq.datasource.DataSourceInit;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.Convert;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.web.init.SystemVariableInit;

/**
 * 

 * 

 * @description 源数据管理的 Action
 * @date 2013-4-22
 */
public class DataSourceAction {

	private DataSourceDao dataSourceDao;

	/**
	 * 查询源数据列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSource() {
		List<Map<String, Object>> list = this.dataSourceDao.queryForDataSource();
		return list;
	}

	/**
	 * 查询源数据列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataSourceList(Map<String, Object> data, Page page) {
		if (page == null) {
			page = new Page(0, 20);
		}
		List<Map<String, Object>> list = this.dataSourceDao.queryForDataSource(data, page);
		return list;
	}

	/**
	 * 通过查询规则ID得到实施信息
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public Map<String, Object> queryDataSourceInfoById(long dataSourceId) {
		return dataSourceDao.queryDataSourceById(dataSourceId);
	}

	/**
	 * 验证数据源ID
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public int queryRuleByDataSourceId(long dataSourceId) {
		return dataSourceDao.queryRuleByDataSourceId(dataSourceId) + dataSourceDao.queryTableInfoByDataId(dataSourceId);
	}

	/**
	 * 查询日志列表
	 * 
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> queryDataLog(Map<String, Object> data, Page page) {
		return this.dataSourceDao.queryForDataLog(data, page);
	}

	/**
	 * 新增数据源
	 * 
	 * @param data 数据源信息
	 * @return
	 */
	public String savedataSourceInfo(Map<String, Object> data) {
		long dataSourceId = -1;
		int flag = -1;
		try {
			Page page = new Page(0, 20);
			Map<String, Object> queryData = new HashMap<String, Object>();
			queryData.put("DATA_SOURCE_ADDRESS", MapUtils.getString(data, "dateSourceAddress"));
			int dateSourceId = Convert.toInt(MapUtils.getString(data, "dateSourceId"), -1);
			List<Map<String, Object>> list = this.dataSourceDao.queryForDataSource(queryData, page);
			if (dateSourceId == -1 && list.size() > 0) {
				flag = 1;
				return "failed2";
			} else {
				for (Map<String, Object> map : list) {
					if (dateSourceId != Convert.toInt(map.get("DATA_SOURCE_ID").toString(), -1)) {
						flag = 1;
						return "failed2";
					}
				}
			}
			queryData.remove("DATA_SOURCE_ADDRESS");
			queryData.put("DATA_SOURCE_NAME", MapUtils.getString(data, "dateSourceName"));
			List<Map<String, Object>> list2 = this.dataSourceDao.queryForDataSource(queryData, page);
			if (dateSourceId == -1 && list2.size() > 0) {
				flag = 1;
				return "failed3";
			} else {
				for (Map<String, Object> map : list2) {
					if (dateSourceId != Convert.toInt(map.get("DATA_SOURCE_ID").toString(), -1)) {
						flag = 1;
						return "failed3";
					}
				}
			}
			BaseDAO.beginTransaction();
			dataSourceId = dataSourceDao.saveSourceInfo(data);
			if (dataSourceId != -1) {
				String sourceName = MapUtils.getString(data, "accRealName");
				File f = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc" + "/" + sourceName);
				if (f.isFile()) {
					f.delete();
				}

				BaseDAO.commit();
				flag = 0;
			} else {
				BaseDAO.rollback();
				flag = 2;
			}
		} catch (Exception e) {
			BaseDAO.rollback();
			flag = 2;
			LogUtils.error("新增数据源出错", e);
		}

		switch (flag) {
		case 0:
			if (dataSourceId != -1) {
				DataSourceInit.reLoadDataSource(dataSourceId);
			}
			return "success";
		case 1:
			return "failed2";
		case 2:
			return "failed";
		default:
			break;
		}

		return "failed";
	}

	/**
	 * 删除数据源
	 * 
	 * @param id 数据源ID
	 * @return
	 */
	public Map<String, Object> deleteData(String id) {
		Map<String, Object> result = new HashMap<String, Object>();
		try {
			if (!dataSourceDao.canDeleteData(id)) {
				BaseDAO.beginTransaction();
				dataSourceDao.deleteData(id);
				BaseDAO.commit();
				result.put("flag", "true");
			} else {
				result.put("flag", "false");
			}
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除数据源出错", e);
			result.put("flag", "error");
		}
		return result;
	}

	/**
	 * 查询用户与ID
	 * 
	 */

	public List<Map<String, Object>> queryUser() {
		return dataSourceDao.getUser();
	}

	/**
	 * 得到下载的file文件
	 * 
	 * @param
	 */

	public File getFile(String path, long dataId) throws Exception {
		// Map<String,Object> dataSourceDao.getFile(dataId);
		if (dataSourceDao == null) {
			dataSourceDao = new DataSourceDao();
		}
		Map<String, Object> map = dataSourceDao.getBlob(dataId);
		Blob blob = (Blob) map.get("HBASE_SITE_XML");
		// byte[] bytes = null;
		// bytes = blob.getBytes(0,(int)blob.length());
		FileOutputStream fileout = null;
		File file = new File(path);
		if (file.exists()) {
			file.delete();
		}
		try {
			byte[] bytes = blobToBytes(blob);
			fileout = new FileOutputStream(file);
			fileout.write(bytes, 0, bytes.length);

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		}
		dataSourceDao.close();
		return file;
	}

	/**
	 * 得到下载的bytes
	 */
	public byte[] getByte(String path, long dataId) {
		if (dataSourceDao == null) {
			dataSourceDao = new DataSourceDao();
		}
		Map<String, Object> map = dataSourceDao.getBlob(dataId);
		Blob blob = (Blob) map.get("HBASE_SITE_XML");
		return blobToBytes(blob);
	}

	/**
	 * 把Blob类型转换为byte数组类型
	 * 
	 * @param blob
	 * @return
	 */
	private byte[] blobToBytes(Blob blob) {

		BufferedInputStream is = null;

		try {
			is = new BufferedInputStream(blob.getBinaryStream());
			byte[] bytes = new byte[(int) blob.length()];
			int len = bytes.length;
			int offset = 0;
			int read = 0;

			while (offset < len && (read = is.read(bytes, offset, len - offset)) >= 0) {
				offset += read;
			}
			return bytes;
		} catch (Exception e) {
			return null;
		} finally {
			try {
				is.close();
				is = null;
			} catch (IOException e) {
				return null;
			}
		}
	}

	/**
	 * 验证数据源下有无配置文件
	 * 
	 * @param dataSourceId
	 * @return
	 */
	public int checkXml(long dataSourceId) {
		return dataSourceDao.checkXml(dataSourceId);

	}

	public void setDataSourceDao(DataSourceDao dataSourceDao) {
		this.dataSourceDao = dataSourceDao;
	}
}
