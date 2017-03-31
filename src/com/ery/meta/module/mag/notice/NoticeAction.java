package com.ery.meta.module.mag.notice;

import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.common.Page;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;



public class NoticeAction {
	// 定义事物 DAO
	private NoticeDAO noticeDAO;

	// set 方法
	public void setNoticeDAO(NoticeDAO noticeDAO) {
		this.noticeDAO = noticeDAO;
	}

	/**
	 * 按条件查询出对应的公告
	 * 
	 * @param queryData 查询条件
	 * @param page 分页条件
	 * @return 查询结果
	 */
	public List<Map<String, Object>> queryNotice(Map<String, Object> queryData, Page page) {
		return noticeDAO.queryNotice(queryData, page);
	}

	/**
	 * 新增一条公告
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> insertNotice(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		try {
			result = new OprResult<Integer, Object>(null, Integer.parseInt(noticeDAO.insertNotice(data) + ""),
					OprResult.OprResultType.insert);
			// 查询刚新增的数据
			result.setSuccessData(noticeDAO.queryNoticeById(new Integer[] { Integer
					.parseInt(result.getTid().toString()) }));
		} catch (Exception e) {
			LogUtils.error("新增系统信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除系统公告
	 * 
	 * @param noticeIdStr
	 * @return
	 */
	public OprResult<?, ?>[] deleteNotice(String noticeIdStr) {
		// 前台传入的ID是字符串形式以逗号隔开
		int noticeId[] = new int[noticeIdStr.split(",").length];
		for (int i = 0; i < noticeId.length; i++) {
			noticeId[i] = Integer.parseInt(noticeIdStr.split(",")[i]);
		}
		OprResult<?, ?> result[] = new OprResult[noticeId.length];
		try {
			BaseDAO.beginTransaction();
			noticeDAO.deleteNoticeByNoticeIds(noticeId);
			BaseDAO.commit();
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(noticeId[i], null, OprResult.OprResultType.delete);
			}
			return result;
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除系统信息失败", e);
			for (int i = 0; i < result.length; i++) {
				result[i] = new OprResult<Integer, Object>(noticeId[i], null, OprResult.OprResultType.error);
			}
			return result;
		}
	}

	/**
	 * 修改公告
	 * 
	 * @param data 修改公告数据
	 * @return
	 */
	public OprResult<?, ?> updateNotice(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		try {
			// 公告ID
			int noticeId = data.get("noticeId") == null ? null : Integer.parseInt(data.get("noticeId").toString());
			result = new OprResult<Integer, Object>(null, noticeDAO.updateNotice(data), OprResult.OprResultType.update);
			result.setSuccessData(noticeDAO.queryNoticeById(new Integer[] { noticeId }));
		} catch (Exception e) {
			LogUtils.error("修改系统信息失败", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改公告状态
	 * 
	 * @param noticeIds 公告状态ID
	 * @param noticeState 公告修改后的状态
	 * @return 修改结果
	 */
	public OprResult<?, ?> updateNoticeCtrlr(String noticeIds, String noticeState) {
		OprResult<Integer, Object> result = null;
		try {
			int leng = noticeIds.split(",").length;
			Integer noticeId[] = new Integer[leng];
			for (int i = 0; i < leng; i++) {
				noticeId[i] = Integer.parseInt(noticeIds.split(",")[i]);
			}
			BaseDAO.beginTransaction();
			result = new OprResult<Integer, Object>(null, noticeDAO.noticeStateCtrlr(noticeId,
					Integer.parseInt(noticeState)), OprResult.OprResultType.update);
			BaseDAO.commit();
			result.setSuccessData(noticeDAO.queryNoticeById(noticeId));
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("修改公告状态失败", e);
		}
		return result;
	}
}
