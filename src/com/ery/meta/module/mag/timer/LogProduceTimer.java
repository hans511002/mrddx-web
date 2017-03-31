package com.ery.meta.module.mag.timer;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import com.ery.meta.module.mag.login.LoginReportDAO;

import com.ery.base.support.sys.SystemVariable;

public class LogProduceTimer implements IMetaTimer {
	private LoginReportDAO loginReportDAO;

	public void init() {

	}

	public void run(String timerName) {
		loginReportDAO = new LoginReportDAO();
		String[] menuName = SystemVariable.getString("menuId", "10,11,12,13,294,443").toString().split(",");
		String dropTableSql = loginReportDAO.isExistTable("TB_B_DATA_VISIT1");
		if (dropTableSql != null && !dropTableSql.trim().equals("")) {
			loginReportDAO.createTable(dropTableSql);
		}
		StringBuffer createSql = new StringBuffer(" CREATE TABLE TB_B_DATA_VISIT1 ( "
				+ "ZONE_ID               NUMBER(18,0)  NULL , " + "ZONE_PAR_ID           NUMBER(18,0)  NULL , "
				+ "ZONE_NAME             VARCHAR2(100)  NULL , " + "VISIT_DATE            VARCHAR2(30)  NULL , "
				+ "LOGIN_NUM             NUMBER(9,0)  NULL , ");
		for (String menuId : menuName) {
			createSql.append("VISIT_ID_" + menuId + "   NUMBER(9,0) NULL, ");
			createSql.append("VISIT_NUM" + menuId + "   NUMBER(9,0) NULL,");

		}
		createSql.deleteCharAt(createSql.length() - 1);
		createSql.append(" )");
		boolean result = loginReportDAO.createTable(createSql.toString());
		String hideStation = SystemVariable.getString("hidden.stations", "22");
		if (result) {
			boolean isExisit = false;
			// 统计从昨年的这个时候到现在的访问量
			java.util.Date date1 = new java.util.Date();
			java.util.Date date2 = new java.util.Date(date1.getYear(), date1.getMonth() - 1, date1.getDate());
			while (date2.before(date1)) {
				String beginTime = new SimpleDateFormat("yyyyMMdd").format(date2);
				// 查询出来某一天所有地市的访问量
				List<Map<String, Object>> resultForDay = loginReportDAO.queryLogNumForDay(beginTime, hideStation);
				// 开始组装一条记录
				for (String menuId : menuName) {
					List<Map<String, Object>> menuVisit = loginReportDAO.queryMenuNum(beginTime, menuId, hideStation);
					for (int i = 0; i < resultForDay.size(); i++) {
						isExisit = false;
						for (int j = 0; j < menuVisit.size(); j++) {
							if (Integer.parseInt(resultForDay.get(i).get("ZONE_ID").toString()) == Integer
									.parseInt(menuVisit.get(j).get("ZONE_ID").toString())) {
								resultForDay.get(i).put("VISIT_ID_" + menuId, menuId);
								resultForDay.get(i).put("VISIT_NUM" + menuId, menuVisit.get(j).get("VISITNUM"));
								isExisit = true;
							}
						}
						if (!isExisit) {
							resultForDay.get(i).put("VISIT_ID_" + menuId, menuId);
							resultForDay.get(i).put("VISIT_NUM" + menuId, 0);
						}
						// Map<String, Object> map = resultForDay.get(i);
						// int menuVisit =
						// loginReportDAO.queryMenuNum(beginTime,queryMenuList,hideStation);
						// resultForDay.get(i).put("VISIT_ID_"+menuId,menuId);
						// resultForDay.get(i).put("VISIT_NUM"+menuId,menuVisit);
					}
				}

				Map<String, Map<String, Object>> map1 = new HashMap<String, Map<String, Object>>();
				Map<String, List<Map<String, Object>>> map2 = new HashMap<String, List<Map<String, Object>>>();
				for (int j = 0; j < resultForDay.size(); j++) {
					map1.put(resultForDay.get(j).get("ZONE_ID").toString(), resultForDay.get(j));
					if (map2.containsKey(resultForDay.get(j).get("ZONE_PAR_ID").toString())) {
						map2.get(resultForDay.get(j).get("ZONE_PAR_ID").toString()).add(resultForDay.get(j));
					} else {
						List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();
						list.add(resultForDay.get(j));
						map2.put(resultForDay.get(j).get("ZONE_PAR_ID").toString(), list);
					}
				}

				Map.Entry<String, String> param;
				Iterator iter = map2.entrySet().iterator();
				while (iter.hasNext()) {
					param = (Map.Entry<String, String>) iter.next();
					if (map1.containsKey(param.getKey())) {
						for (int m = 0; m < map2.get(param.getKey()).size(); m++) {
							if ((map1.get(param.getKey()).get("ZONE_NAME").toString() + "市公司部门").equals(map2
									.get(param.getKey()).get(m).get("ZONE_NAME").toString())
									|| map2.get(param.getKey()).get(m).get("ZONE_NAME").toString().equals("康定市公司部门")) {
								map1.get(map2.get(param.getKey()).get(m).get("ZONE_ID").toString())
										.put("LOGIN_NUM",
												(Integer.parseInt(map1.get(param.getKey()).get("LOGIN_NUM").toString()) + Integer
														.parseInt(map2.get(param.getKey()).get(m).get("LOGIN_NUM")
																.toString())));
								for (String menuId : menuName) {
									map1.get(map2.get(param.getKey()).get(m).get("ZONE_ID").toString()).put(
											"VISIT_NUM" + menuId,
											(Integer.parseInt(map1.get(param.getKey()).get("VISIT_NUM" + menuId)
													.toString()) + Integer.parseInt(map2.get(param.getKey()).get(m)
													.get("VISIT_NUM" + menuId).toString())));
								}
							}
						}
					}
				}
				if (map1.containsKey("1")) {
					// 省公司
					Map<String, Object> param1 = new HashMap<String, Object>();
					param1.put("LOGIN_NUM", map1.get("1").get("LOGIN_NUM"));
					param1.put("ZONE_ID", "666666");
					param1.put("ZONE_PAR_ID", "1");
					param1.put("ZONE_NAME", "省公司");
					param1.put("VISIT_TIME", map1.get("1").get("VISIT_TIME"));
					for (int i = 0; i < menuName.length; i++) {
						param1.put("VISIT_ID_" + menuName[i], menuName[i]);
						param1.put("VISIT_NUM" + menuName[i], map1.get("1").get("VISIT_NUM" + menuName[i]));
					}
					map1.put("666666", param1);
					// map1.get("1").put("ZONE_ID","1");
					// map1.get("666666").put("ZONE_ID","666666");
					// param1.put("ZONE_ID","1");
					// param1.put("ZONE_PAR_ID","0");
					// param1.put("ZONE_NAME","四川省");
				}
				if (map1.containsKey("19")) {
					// 省公司
					Map<String, Object> param2 = new HashMap<String, Object>();
					param2.put("LOGIN_NUM", map1.get("19").get("LOGIN_NUM"));
					param2.put("ZONE_ID", "888888");
					param2.put("ZONE_PAR_ID", "19");
					param2.put("ZONE_NAME", "凉山市公司部门");
					param2.put("VISIT_TIME", map1.get("19").get("VISIT_TIME"));
					for (int i = 0; i < menuName.length; i++) {
						param2.put("VISIT_ID_" + menuName[i], menuName[i]);
						param2.put("VISIT_NUM" + menuName[i], map1.get("19").get("VISIT_NUM" + menuName[i]));
					}
					map1.put("888888", param2);
				}

				resultForDay.clear();
				Iterator it = map1.entrySet().iterator();
				while (it.hasNext()) {
					Map.Entry<String, Map<String, Object>> params = (Map.Entry<String, Map<String, Object>>) it.next();
					resultForDay.add(params.getValue());
				}
				/*
				 * for (int j=0; j<resultForDay.size(); j++){ Map<String,Object>
				 * oneVisit1 = resultForDay.get(j); for (int k=0;
				 * k<resultForDay.size(); k++){ Map<String,Object> oneVisit2 =
				 * resultForDay.get(k);
				 * if((oneVisit1.get("ZONE_NAME").toString()
				 * +"市公司部门").equals(oneVisit2.get("ZONE_NAME").toString()) &&
				 * Integer
				 * .parseInt(oneVisit1.get("ZONE_ID").toString())==Integer
				 * .parseInt(oneVisit2.get("ZONE_PAR_ID").toString())){ int
				 * visitNum =
				 * Convert.toInt(resultForDay.get(j).get("VISITNUM").toString())
				 * +
				 * Convert.toInt(resultForDay.get(k).get("VISITNUM").toString())
				 * ;
				 * 
				 * } } }
				 */

				// 把resultForDay数据插入TB_B_DATA_VISIT1表中
				loginReportDAO.insertLog(resultForDay, menuName);
				date2.setDate(date2.getDate() + 1);
			}
		}
		loginReportDAO.close();
	}
}
