package com.ery.meta.module.mag.favorite;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.meta.common.OprResult;
import com.ery.meta.module.mag.favorite.menu.FavMenuDAO;
import com.ery.meta.sys.code.CodeManager;
import com.ery.meta.sys.code.CodePO;
import com.ery.meta.web.session.SessionManager;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.podo.BaseDAO;
import com.ery.base.support.utils.MapUtils;

/**
 * 

 * @description 收藏夹DwrAction
 * @date 12-3-13 -
 * @modify
 * @modifyDate -
 */
public class FavoriteAction {

	private FavoriteDAO favoriteDAO;
	private FavMenuDAO favMenuDAO;

	/**
	 * 查询用户下所有收藏夹
	 * 
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryAllFavByUserID(int userId) {
		return favoriteDAO.queryAllFavByUserID(userId);
	}

	/**
	 * 查询某用户，某父收藏夹下一级子收藏夹
	 * 
	 * @param userId
	 * @param parentId
	 * @return
	 */
	public List<Map<String, Object>> queryFavoritesByUserAndParent(int userId, int parentId) {
		return favoriteDAO.queryFavoritesByUserAndParent(userId, parentId);
	}

	/**
	 * 查询某用户下分类和目录构成的 收藏分类树
	 * 
	 * @param userId
	 * @return
	 */
	public List<Map<String, Object>> queryFavoriteTypeAndDir(int userId, int typeId) {
		Map<String, Object> cond = new HashMap<String, Object>();
		cond.put("userId", userId);
		if (typeId >= 1) {
			cond.put("favoriteType", typeId);
		}
		List<Map<String, Object>> dirs = favoriteDAO.queryAllFavByCondition(cond);
		for (Map<String, Object> map : dirs) {
			if ("0".equals(String.valueOf(map.get("PARENT_ID")))) {
				map.put("PARENT_ID", "type_" + String.valueOf(map.get("FAVORITE_TYPE")));
			}
			map.put("TYPE_FLAG", 0);
		}
		if (typeId != 2) {
			CodePO[] codes = CodeManager.getCodes("FAVORITE_TYPE");
			for (int i = 0, j = 0; i < codes.length; i++) {
				CodePO code = codes[i];
				if (typeId <= 0 || (typeId >= 1 && code.getCodeValue().equals(String.valueOf(typeId)))) {
					Map<String, Object> type = new HashMap<String, Object>();
					type.put("FAVORITE_ID", "type_" + code.getCodeValue());
					type.put("FAVORITE_TYPE", "-1");
					type.put("PARENT_ID", 0);
					type.put("FAVORITE_NAME", code.getCodeName());
					type.put("TYPE_FLAG", 1);
					dirs.add(j, type);
					j++;
				}
			}
		}
		return dirs;
	}

	/**
	 * 查询某用户某分类下所有子收藏夹 以及每个分类下所有收藏对象
	 * 
	 * @param userId
	 * @param typeId
	 * @return
	 */
	public List<Map<String, Object>> queryAllFavByConditionAndObj(int userId, int typeId) {
		Map<String, Object> cond = new HashMap<String, Object>();
		cond.put("userId", userId);
		cond.put("favoriteType", typeId);
		List<Map<String, Object>> dirs = favoriteDAO.queryAllFavByCondition(cond);
		int cnt = dirs.size();
		if (cnt > 0) {
			int[] favIds = new int[cnt];
			for (int i = 0; i < cnt; i++) {
				Map<String, Object> map = dirs.get(i);
				favIds[i] = MapUtils.getInteger(map, "FAVORITE_ID");
			}
			// 由于需要把不同类型的收藏挂接在一个树上，区分处理；TYPE=1 时为菜单
			if (typeId == FavoriteDAO.TYPE_MENU) {
				List<Map<String, Object>> objs = favMenuDAO.queryFavMenuByFavIds(favIds);
				for (Map<String, Object> obj : objs) {
					Map<String, Object> o = new HashMap<String, Object>();
					o.put("FAVORITE_ID", "menu_" + obj.get("MENU_FAVORITE_ID"));// 菜单节点ID
																				// 加入特殊前缀
																				// MENU_
																				// ，其他报表同理
					o.put("FAVORITE_NAME", obj.get("MENU_NAME")); // 菜单名称
					o.put("USER_ID", obj.get("USER_ID")); // 用户ID
					o.put("PARENT_ID", obj.get("FAVORITE_ID")); // 收藏夹ID
					o.put("FAVORITE_TYPE", typeId); // 收藏类型，1菜单，2报表……
					o.put("FAVORITE_ORDER", obj.get("FAVORITE_MENU_ORDER"));// 排序

					o.put("FAVORITE_OBJ_TIME", obj.get("FAVORITE_MENU_TIME"));// 收藏时间
					o.put("OBJ_TYPE", "menu");// menu菜单，report报表……
					o.put("OBJ_ID", obj.get("MENU_ID")); // 收藏具体对象的ID

					// 下面的参数根据需要不同类型扩展
					o.put("MENU_URL", obj.get("MENU_URL"));
					dirs.add(o);
				}
			} else if (typeId == FavoriteDAO.TYPE_OTHER) {

			}
		}
		return dirs;
	}

	/**
	 * 添加收藏夹
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> insertFavorite(Map<String, Object> data) {
		if (!data.get("favoriteId").toString().equals("0")) {
			return updateFavorite(data);
		}
		OprResult<Integer, Object> result = null;
		if (data.get("userId") != null) {
			data.put("userId", SessionManager.getCurrentUserID());
		}
		Map<String, Object> checkFav = new HashMap<String, Object>();
		checkFav.put("userId", data.get("userId"));
		checkFav.put("favoriteName", data.get("favoriteName"));
		int cnt = favoriteDAO.getFavoritesNumByCondition(checkFav);
		// 验证该用户下某分类收藏夹下 是否有重复
		if (cnt > 0) {
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			return result;
		}
		try {
			int id = favoriteDAO.insertFavorite(data);
			result = new OprResult<Integer, Object>(null, id, OprResult.OprResultType.insert);
		} catch (Exception e) {
			LogUtils.error("添加收藏夹出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改收藏夹
	 * 
	 * @param data
	 * @return
	 */
	public OprResult<?, ?> updateFavorite(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		if (data.get("userId") != null) {
			data.put("userId", SessionManager.getCurrentUserID());
		}
		Map<String, Object> checkFav = new HashMap<String, Object>();
		checkFav.put("userId", data.get("userId"));
		String oldName = String.valueOf(data.get("oldFavoriteName"));
		try {
			int id = 0;
			if (data.get("favoriteName") != null) {
				if (data.get("oldFavoriteName") == null || !String.valueOf(data.get("favoriteName")).equals(oldName)) {
					checkFav.put("favoriteName", data.get("favoriteName"));
					int cnt = favoriteDAO.getFavoritesNumByCondition(checkFav);
					// 验证该用户下某分类收藏夹下 是否有重复
					if (cnt > 0) {
						result = new OprResult<Integer, Object>();
						result.setSid(-1);
						return result;
					}
				}
			}
			BaseDAO.beginTransaction();
			id = favoriteDAO.updateFavorite(data);
			BaseDAO.commit();
			result = new OprResult<Integer, Object>(null, id, OprResult.OprResultType.update);
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("更新收藏夹出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除收藏目录或收藏对象
	 * 
	 * @param id
	 * @param typeId
	 * @param flag =menu,reprot时表示收藏对象，否则为目录 其值为:true/flase 字符 表示是否删除子目录对象
	 * @return
	 */
	public OprResult<?, ?> delFavoriteTypeOrObj(String id, int typeId, String flag) {
		OprResult<Integer, Object> result = null;
		int a = 0;
		try {
			BaseDAO.beginTransaction();
			if ("menu".equals(flag)) {
				a = favMenuDAO.deleteFavoriteMenu(Integer.parseInt(id.replaceAll("menu_", "")));
			} else if ("other".equals(flag)) {

			} else if ("true".equals(flag) || "false".equals(flag)) {
				a = favoriteDAO.deleteFavoriteById(Integer.parseInt(id), typeId, Boolean.getBoolean(flag));
			}
			BaseDAO.commit();
			result = new OprResult<Integer, Object>(null, a, OprResult.OprResultType.delete);
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("删除收藏夹出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 删除收藏夹
	 * 
	 * @param ids
	 * @return
	 */
	public OprResult<?, ?>[] deleteFavorites(int[] ids) {
		OprResult<Integer, Object>[] results = new OprResult[ids.length];
		return results;
	}

	/**
	 * 删除收藏夹
	 * 
	 * @param id
	 * @return
	 */
	public OprResult<?, ?> deleteFavoriteById(int id) {
		OprResult<Integer, Object> result = null;
		return result;
	}

	/**
	 * 收藏对象
	 * 
	 * @param data 参数里面包含 objType（1,2,3,4,5 收藏对象区分1菜单，2报表，3指标，4模型，5其他） objId
	 *            被收藏对象的ID，对应菜单ID，报表ID等 favoriteType 收藏时选择的分类目录ID userId
	 *            用户（可不传，则从session里面去取）
	 * @return 返回对象的 sid>1 时说明已被收藏过，无法重复收藏
	 */
	public OprResult<?, ?> addFavoriteObj(Map<String, Object> data) {
		OprResult<Integer, Object> result = null;
		String type = String.valueOf(data.get("favoriteType"));
		if (type.contains("type_")) {
			result = new OprResult<Integer, Object>();
			result.setSid(-1);
			return result;
		}
		try {
			int id = 0;
			if (data.get("userId") == null) {
				data.put("userId", SessionManager.getCurrentUserID());
			}
			BaseDAO.beginTransaction();
			int objId = Integer.parseInt(String.valueOf(data.get("objId")));
			int favoriteType = MapUtils.getInteger(data, "favoriteType", 0);
			String favoriteTypeName = MapUtils.getString(data, "favoriteTypeName");
			favoriteType = favoriteDAO.insertRptFavorite(MapUtils.getInteger(data, "userId"), favoriteTypeName,
					MapUtils.getInteger(data, "objType"));
			data.put("favoriteType", favoriteType);
			int cnt = 0;
			int userId = MapUtils.getInteger(data, "userId");
			if (String.valueOf(FavoriteDAO.TYPE_MENU).equals(String.valueOf(data.get("objType")))) { // 菜单
				cnt = favMenuDAO.countFavoriteMenuNum(objId, userId);
				if (cnt == 0) {
					id = favMenuDAO.insertFavoriteMenu(data);
				}
			} else if (String.valueOf(FavoriteDAO.TYPE_OTHER).equals(String.valueOf(data.get("objType")))) { // 其他

			}
			BaseDAO.commit();
			result = new OprResult<Integer, Object>(cnt, id, OprResult.OprResultType.insert);
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("添加收藏出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 修改收藏对象 类型
	 * 
	 * @param id 收藏对象的ID（如果来自收藏分类树，则有 menu_ 前缀
	 * @param type 目录ID
	 * @param dirType 目录类型（1菜单，2报表
	 * @return
	 */
	public OprResult<?, ?> updateFavoriteObjType(String id, int type, int dirType) {
		OprResult<Integer, Object> result = null;
		int a = 0;
		boolean taf = id.contains("_");
		try {
			if (FavoriteDAO.TYPE_MENU == dirType) {
				int objId = taf ? Integer.parseInt(id.replaceAll("menu_", "")) : Integer.parseInt(id);
				a = favMenuDAO.updateFavoriteMenuType(objId, type);
			} else if (FavoriteDAO.TYPE_OTHER == dirType) {

			}
			result = new OprResult<Integer, Object>(null, a, OprResult.OprResultType.update);
		} catch (Exception e) {
			LogUtils.error("保存出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	/**
	 * 更新收藏目录或对象的排序
	 * 
	 * @param id 收藏对象的ID（如果来自收藏分类树，则有 menu_ 前缀
	 * @param ot true升序 false降序
	 * @param dirType 目录类型（1菜单，2报表 -为0时表示，此次更新的是收藏目录的order
	 * @return
	 */
	public OprResult<?, ?> updateFavDirOrObjOrder(String id, int pid, boolean ot, int dirType) {
		OprResult<Integer, Object> result = null;
		int a = 0;
		boolean taf = id.contains("_");
		try {
			BaseDAO.beginTransaction();
			if (FavoriteDAO.TYPE_MENU == dirType) {
				int objId = taf ? Integer.parseInt(id.replaceAll("menu_", "")) : Integer.parseInt(id);
				a = favMenuDAO.updateFavoriteMenuOrder(objId, pid, ot);
			} else if (FavoriteDAO.TYPE_OTHER == dirType) {

			} else if (0 == dirType) {
				a = favoriteDAO.updateFavoriteOrder(Integer.parseInt(id), pid, ot);
			}
			result = new OprResult<Integer, Object>(null, a, OprResult.OprResultType.update);
			BaseDAO.commit();
		} catch (Exception e) {
			BaseDAO.rollback();
			LogUtils.error("保存出错", e);
			result = new OprResult<Integer, Object>(null, null, OprResult.OprResultType.error);
		}
		return result;
	}

	public void setFavoriteDAO(FavoriteDAO favoriteDAO) {
		this.favoriteDAO = favoriteDAO;
	}

	public void setFavMenuDAO(FavMenuDAO favMenuDAO) {
		this.favMenuDAO = favMenuDAO;
	}

}
