package com.ery.meta.module.logAnalysis;

import java.awt.Color;
import java.awt.Font;
import java.awt.RenderingHints;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.jfree.chart.ChartFactory;
import org.jfree.chart.ChartUtilities;
import org.jfree.chart.JFreeChart;
import org.jfree.chart.StandardChartTheme;
import org.jfree.chart.axis.CategoryAxis;
import org.jfree.chart.axis.CategoryLabelPositions;
import org.jfree.chart.axis.NumberAxis;
import org.jfree.chart.plot.CategoryPlot;
import org.jfree.chart.plot.PlotOrientation;
import org.jfree.chart.renderer.category.LineAndShapeRenderer;
import org.jfree.data.category.CategoryDataset;
import org.jfree.data.category.DefaultCategoryDataset;

import sun.misc.BASE64Encoder;
import com.ery.meta.common.DateUtil;
import com.ery.meta.common.Page;
import com.ery.meta.module.datarole.UserTypeAction;
import com.ery.meta.util.downloadWord.DocumentHandler;
import com.ery.meta.util.downloadWord.LogAnalysisDetail;
import com.ery.meta.util.downloadWord.LogRule;
import com.ery.meta.util.downloadWord.LogRuleDetail;
import com.ery.meta.util.downloadWord.LogTopAnalysisDetail;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.base.support.utils.MapUtils;
import com.ery.base.support.utils.StringUtils;
import com.ery.base.support.web.init.SystemVariableInit;

/**

 * 

 * @description 日志监控Action
 * @date 2014-01-13
 */
public class LogAnalysisAction {

	private LogAnalysisDAO logAnalysisDAO;

	/**
	 * 获取日志监控配置
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisConfig() {
		return logAnalysisDAO.getLogAnalysisConfig();
	}

	/**
	 * 保存日志监控配置
	 * 
	 * @param data
	 * @param page
	 * @return
	 */
	public Map<String, Object> saveLogAnalysisConfig(List<Map<String, String>> data) {
		logAnalysisDAO.saveLogAnalysisConfig(data);
		return null;
	}

	/**
	 * 获取30天入库趋势
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> getInputLineDetail(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getInputLineDetail(data);
	}

	/**
	 * 获取某天具体入库信息
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getInputDetail(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getInputDetail(data);
	}

	/**
	 * 获取仪表盘数据
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysis(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		List<Map<String, Object>> lstLogAnalysis = logAnalysisDAO.getLogAnalysis(data);
		for (Map<String, Object> map : lstLogAnalysis) {
			double min = MapUtils.getDoubleValue(map, "minvalue");
			double max = MapUtils.getDoubleValue(map, "maxvalue");
			double value = MapUtils.getDoubleValue(map, "value");
			String la = MapUtils.getString(map, "LA_ID");
			if ("LA005".equalsIgnoreCase(la) || "LA006".equalsIgnoreCase(la)) {// 需要小数点后两位
				map.put("minvalue", formatNumber(min, "0.00"));
				map.put("maxvalue", formatNumber(max, "0.00"));
				map.put("value", formatNumber(value, "0.00"));
			} else {
				map.put("minvalue", formatNumber(min, "0"));
				map.put("maxvalue", formatNumber(max, "0"));
				map.put("value", formatNumber(value, "0"));
			}

			map.put("COL_VALUE", value >= min && value <= max ? 1 : 0);
		}
		return lstLogAnalysis;
	}

	/**
	 * 对数字进行格式化，超过10,000用万表示， 超过100,000,000用亿表示， 超过1,000,000,000,000用兆
	 * 
	 * @param i
	 * @return
	 */
	private String formatNumber(double i, String sign) {
		if (i < 10000) {
			return StringUtil.getDoublePoint(i, sign);
		} else if (i > 10000 && i < 100000000) {
			return StringUtil.getDoublePoint(round((double) i / 10000, 2), sign) + "万";
		} else if (i > 100000000 && i < 1000000000000L) {
			return StringUtil.getDoublePoint(round((double) i / 100000000, 2), sign) + "亿";
		} else if (i > 1000000000000L && i < Long.MAX_VALUE) {
			return StringUtil.getDoublePoint(round((double) i / 1000000000000L, 2), sign) + "兆";
		} else if (i > Long.MAX_VALUE) {
			return "超过最大范围值";
		}
		return "";
	}

	/**
	 * 提供精确的小数位四舍五入处理。
	 * 
	 * @param v 需要四舍五入的数字
	 * @param scale 小数点后保留几位
	 * @return 四舍五入后的结果
	 */
	public static double round(double v, int scale) {
		if (scale < 0) {
			throw new IllegalArgumentException("The scale must be a positive integer or zero");
		}
		BigDecimal b = new BigDecimal(Double.toString(v));
		BigDecimal one = new BigDecimal("1");
		return b.divide(one, scale, BigDecimal.ROUND_HALF_UP).doubleValue();
	}

	/**
	 * 获得一个指标24小时的数据
	 * 
	 * @param mapData
	 * @return
	 */
	public List<Map<String, Object>> queryPartRs(Map<String, Object> mapData) {
		List<Map<String, Object>> lstRs = logAnalysisDAO.queryForRsList(mapData);
		return lstRs;
	}

	/**
	 * 查询详情
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisDetail(Map<String, Object> data, Page page) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisDetail(data, page);
	}

	/**
	 * 查询延迟排名
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisTopDetail(Map<String, Object> data, Page page) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisTopDetail(data, page);
	}

	/**
	 * 查询延迟排名
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> getLogAnalysisLineTop(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisLineTop(data);
	}

	/**
	 * 获取30天入库趋势
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> getInputLineDetailM(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getInputLineDetailM(data);
	}

	/**
	 * 获取某天具体入库信息
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getInputDetailM(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getInputDetailM(data);
	}

	/**
	 * 获取仪表盘数据
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisM(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		List<Map<String, Object>> lstLogAnalysisM = logAnalysisDAO.getLogAnalysisM(data);
		for (Map<String, Object> map : lstLogAnalysisM) {
			double min = MapUtils.getDoubleValue(map, "minvalue");
			double max = MapUtils.getDoubleValue(map, "maxvalue");
			double value = MapUtils.getDoubleValue(map, "value");
			String la = MapUtils.getString(map, "LA_ID");
			if ("LA005".equalsIgnoreCase(la) || "LA006".equalsIgnoreCase(la)) {// 需要小数点后两位
				map.put("minvalue", formatNumber(min, "0.00"));
				map.put("maxvalue", formatNumber(max, "0.00"));
				map.put("value", formatNumber(value, "0.00"));
			} else {
				map.put("minvalue", formatNumber(min, "0"));
				map.put("maxvalue", formatNumber(max, "0"));
				map.put("value", formatNumber(value, "0"));
			}
			map.put("COL_VALUE", value >= min && value <= max ? 1 : 0);
		}
		return lstLogAnalysisM;
	}

	/**
	 * 查询详情
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisDetailM(Map<String, Object> data, Page page) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisDetailM(data, page);
	}

	/**
	 * 查询延迟排名
	 * 
	 * @param data
	 * @return
	 */
	public List<Map<String, Object>> getLogAnalysisTopDetailM(Map<String, Object> data, Page page) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisTopDetailM(data, page);
	}

	/**
	 * 查询延迟排名
	 * 
	 * @param data
	 * @return
	 */
	public Map<String, Object> getLogAnalysisLineTopM(Map<String, Object> data) {
		if (logAnalysisDAO == null) {
			logAnalysisDAO = new LogAnalysisDAO();
		}
		return logAnalysisDAO.getLogAnalysisLineTopM(data);
	}

	// 在服务器生成doc文件并返回目录
	public String getPath(Map<String, Object> mapData) throws IOException {
		File fileDir = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc");
		if (!fileDir.exists()) {
			fileDir.mkdirs();
		}
		String newFileName = UUID.randomUUID() + "";
		String path = "../../requireAcc" + "/" + newFileName;
		DocumentHandler dh = new DocumentHandler();
		Map<String, Object> dataMap = getData(mapData);
		dh.createDoc(path, dataMap);
		return path;
	}

	/**
	 * 注意dataMap里存放的数据Key值要与模板中的参数相对应
	 * 
	 * @param dataMap
	 */
	private Map<String, Object> getData(Map<String, Object> mapData) {
		String dataTime = MapUtils.getString(mapData, "dateTime");
		String TypeIdStr = MapUtils.getString(mapData, "lstTypeId");
		int type = MapUtils.getIntValue(mapData, "type");
		Map<String, Object> dataMap = new HashMap<String, Object>();
		dataMap.put("date", dataTime);
		UserTypeAction userTypeAction = new UserTypeAction();
		Map<String, Object> data = new HashMap<String, Object>();
		data.put("USER_ID", mapData.get("USER_ID"));
		List<Map<String, Object>> lstUserType = userTypeAction.queryTypeByUser(data);// 得到业务类型列表
		List<Integer> lstTypeIds = getArrTypeId(TypeIdStr);
		List<Map<String, Object>> lstUserTypeTemp = new ArrayList<Map<String, Object>>();
		for (int i = 0; i < lstUserType.size(); i++) {
			Map<String, Object> map = lstUserType.get(i);
			int typeId = MapUtils.getIntValue(map, "TYPE_ID");
			if (!lstTypeIds.contains(typeId)) {
				lstUserTypeTemp.add(lstUserType.get(i));
			}
		}
		lstUserType.removeAll(lstUserTypeTemp);
		List<LogRule> lstTableRule = new ArrayList<LogRule>();
		if (type == 1) {
			lstTableRule = getDayData(mapData, dataTime, lstUserType);
			dataMap.put("mark", "日");
			dataMap.put("timeLen", "30天");
		} else if (type == 2) {
			lstTableRule = getMonthData(mapData, dataTime, lstUserType);
			dataMap.put("mark", "月");
			dataMap.put("timeLen", "12个月");
		}
		dataMap.put("dataTime", dataTime);
		dataMap.put("lstTable", lstTableRule);
		dataMap.put("image", getImageBase64(""));
		return dataMap;
	}

	/**
	 * 解析出要导出的业务
	 * 
	 * @param typeIdStr
	 * @return
	 */
	private List<Integer> getArrTypeId(String typeIdStr) {
		List<Integer> lstRs = new ArrayList<Integer>();
		String[] arrTypeId = typeIdStr.split("\\-");
		for (int i = 0; i < arrTypeId.length; i++) {
			lstRs.add(Integer.parseInt(arrTypeId[i]));
		}
		return lstRs;
	}

	/**
	 * 得到一天的数据
	 * 
	 * @param mapData
	 * @param dataTime
	 * @param lstUserType
	 * @return
	 */
	private List<LogRule> getDayData(Map<String, Object> mapData, String dataTime, List<Map<String, Object>> lstUserType) {
		String rule = MapUtils.getString(mapData, "rule", "");
		int srule = MapUtils.getIntValue(mapData, "srule", -1);
		String rs = MapUtils.getString(mapData, "rs", "");
		String images = MapUtils.getString(mapData, "image", "");
		int[] arrRs = getArr(rs);
		int[] arrImages = getArr(images);
		int[] arrRule = getArr(rule);
		List<LogRule> lstTableRule = new ArrayList<LogRule>();
		for (Map<String, Object> map : lstUserType) {
			long userType = MapUtils.getLongValue(map, "TYPE_ID", -1);
			String userTypeName = MapUtils.getString(map, "TYPE_NAME");
			if (userType != -1) {
				Map<String, Object> mapDataVar = new HashMap<String, Object>();
				mapDataVar.put("dateNo", dataTime);
				mapDataVar.put("jobType", userType);
				mapDataVar.put("userId", mapData.get("USER_ID"));
				mapDataVar.put("typeName", userTypeName);

				List<Map<String, Object>> lstLogDay = this.getLogAnalysis(mapDataVar);// 得到仪表盘数据
				List<Map<String, Object>> lstDetailDay = (arrImages[1] == 0 ? new ArrayList<Map<String, Object>>()
						: this.getInputDetail(mapDataVar));// 获取某天具体入库信息
				List<Map<String, Object>> lstLogDetailDay = (arrRule[1] == 0 ? new ArrayList<Map<String, Object>>()
						: this.getLogAnalysisDetail(mapDataVar, null));// 当日查询规则详情
				List<Map<String, Object>> lstLogTopDetailDay = (srule == 0 ? new ArrayList<Map<String, Object>>()
						: this.getLogAnalysisTopDetail(mapDataVar, null));// 当日查询慢查询排行

				LogRule tableRule = new LogRule();
				for (Map<String, Object> map2 : lstLogDay) {
					String strName = MapUtils.getString(map2, "NAME", "");
					if (strName.length() > 0 && "总调用次数".equals(strName) && arrRs[0] == 1) {
						tableRule.setTimesDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "调用次数<5秒".equals(strName) && arrRs[1] == 1) {
						tableRule.setFcountDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "快查询占比".equals(strName) && arrRs[3] == 1) {
						tableRule.setFrateDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "慢查询占比".equals(strName) && arrRs[2] == 1) {
						tableRule.setSlowDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "查询平均耗时".equals(strName) && arrRs[4] == 1) {
						tableRule.setAvgDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "查询最大耗时".equals(strName) && arrRs[5] == 1) {
						tableRule.setMaxTimeDay(MapUtils.getString(map2, "value", ""));
						// }else
						// if(strName.length()>0&&"最大并发数".equals(strName)&&arrRs[6]==1){
						// tableRule.setMaxDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"平均并发数".equals(strName)&&arrRs[6]==1){
						// tableRule.setAvgcDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"服务中断次数".equals(strName)&&arrRs[7]==1){
						// tableRule.setServiceStopDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"平台不能提供服务时长".equals(strName)&&arrRs[8]==1){
						// tableRule.setNoTimeDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"写入平均速度".equals(strName)){
						// tableRule.setWavgDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"快查询个数".equals(strName)){
						// tableRule.setCountDay(MapUtils.getString(map2,
						// "value",""));
						// }else
						// if(strName.length()>0&&"慢查询个数".equals(strName)){
						// tableRule.setScountDay(MapUtils.getString(map2,
						// "value",""));
					}
				}
				List<LogRuleDetail> lstRuleDetail = new ArrayList<LogRuleDetail>();
				for (Map<String, Object> mapDetail : lstDetailDay) {
					LogRuleDetail tableRuleDetail = new LogRuleDetail();
					tableRuleDetail.setTableName(MapUtils.getString(mapDetail, "PARAM_VALUE"));
					tableRuleDetail.setWarehouseNumber(MapUtils.getString(mapDetail, "MAP_INPUT_COUNT"));
					lstRuleDetail.add(tableRuleDetail);
				}

				List<LogAnalysisDetail> lstTableLogAnalysisDetail = new ArrayList<LogAnalysisDetail>();
				for (Map<String, Object> mapLogDetailDay : lstLogDetailDay) {
					LogAnalysisDetail tableLogAnalysisDetail = new LogAnalysisDetail();
					tableLogAnalysisDetail.setQryRuleId(MapUtils.getString(mapLogDetailDay, "QRY_RULE_ID"));
					tableLogAnalysisDetail.setQryRuleName(MapUtils.getString(mapLogDetailDay, "QRY_RULE_NAME"));
					tableLogAnalysisDetail.setScount(MapUtils.getString(mapLogDetailDay, "SCOUNT"));
					tableLogAnalysisDetail.setStime(MapUtils.getString(mapLogDetailDay, "STIME"));
					tableLogAnalysisDetail.setQryNum(MapUtils.getString(mapLogDetailDay, "QRY_NUM"));
					tableLogAnalysisDetail.setQrySumNum(MapUtils.getString(mapLogDetailDay, "QRY_SUM_NUM"));
					lstTableLogAnalysisDetail.add(tableLogAnalysisDetail);
				}

				List<LogTopAnalysisDetail> lstTableTopLogAnalysisDetail = new ArrayList<LogTopAnalysisDetail>();
				for (Map<String, Object> mapTopLogDetailDay : lstLogTopDetailDay) {
					LogTopAnalysisDetail tableTopLogAnalysisDetail = new LogTopAnalysisDetail();
					tableTopLogAnalysisDetail.setQryRuleId(MapUtils.getString(mapTopLogDetailDay, "QRY_RULE_ID"));
					tableTopLogAnalysisDetail.setQryRuleName(MapUtils.getString(mapTopLogDetailDay, "QRY_RULE_NAME"));
					tableTopLogAnalysisDetail.setScount(MapUtils.getString(mapTopLogDetailDay, "SCOUNT"));
					tableTopLogAnalysisDetail.setTotalTime(MapUtils.getString(mapTopLogDetailDay, "TOTAL_TIME"));
					tableTopLogAnalysisDetail.setQryNum(MapUtils.getString(mapTopLogDetailDay, "QRY_NUM"));
					tableTopLogAnalysisDetail.setQrySumNum(MapUtils.getString(mapTopLogDetailDay, "QRY_SUM_NUM"));
					tableTopLogAnalysisDetail.setResponseTime(MapUtils.getString(mapTopLogDetailDay, "QRY_START_DATE"));
					lstTableTopLogAnalysisDetail.add(tableTopLogAnalysisDetail);
				}

				// 加入查询标识，0表示LINE,1表示TOP
				mapDataVar.put("flag", 0);
				String imageLineName = getImageName(mapDataVar);
				mapDataVar.put("flag", 1);
				String imageTopName = getImageName(mapDataVar);

				tableRule.setLineChart(arrImages[0] == 1 ? getImageBase64(imageLineName) : "-1");
				tableRule.setTopChart(arrRule[0] == 1 ? getImageBase64(imageTopName) : "-1");
				tableRule.setTableLogAnalysisDetail(lstTableLogAnalysisDetail);
				tableRule.setTableTopLogAnalysisDetail(lstTableTopLogAnalysisDetail);
				tableRule.setLstRuleDetail(lstRuleDetail);
				tableRule.setsName(userTypeName);
				lstTableRule.add(tableRule);
			}
		}
		return lstTableRule;
	}

	/**
	 * 数组分拆
	 * 
	 * @param images
	 * @return
	 */
	private int[] getArr(String images) {
		char[] arr = images.toCharArray();
		if (arr.length <= 0) {
			return null;
		}
		int[] arrInt = new int[arr.length];
		for (int i = 0; i < arr.length; i++) {
			int j = Integer.parseInt(String.valueOf(arr[i]));
			arrInt[i] = j;
		}
		return arrInt;
	}

	/**
	 * 得到一个月的数据
	 * 
	 * @param mapData
	 * @param dataTime
	 * @param lstUserType
	 * @return
	 */
	private List<LogRule> getMonthData(Map<String, Object> mapData, String dataTime,
			List<Map<String, Object>> lstUserType) {
		String rule = MapUtils.getString(mapData, "rule", "");
		int srule = MapUtils.getIntValue(mapData, "srule", -1);
		String rs = MapUtils.getString(mapData, "rs", "");
		String images = MapUtils.getString(mapData, "image", "");
		int[] arrRs = getArr(rs);
		int[] arrImages = getArr(images);
		int[] arrRule = getArr(rule);
		List<LogRule> lstTableRule = new ArrayList<LogRule>();
		for (Map<String, Object> map : lstUserType) {
			long userType = MapUtils.getLongValue(map, "TYPE_ID", -1);
			String userTypeName = MapUtils.getString(map, "TYPE_NAME");
			if (userType != -1) {
				Map<String, Object> mapDataVar = new HashMap<String, Object>();
				mapDataVar.put("dateNo", dataTime);
				mapDataVar.put("jobType", userType);
				mapDataVar.put("userId", mapData.get("USER_ID"));
				mapDataVar.put("typeName", userTypeName);

				List<Map<String, Object>> lstLogDay = this.getLogAnalysisM(mapDataVar);// 得到仪表盘数据
				List<Map<String, Object>> lstDetailDay = (arrImages[1] == 0 ? new ArrayList<Map<String, Object>>()
						: this.getInputDetailM(mapDataVar));// 获取某天具体入库信息
				List<Map<String, Object>> lstLogDetailDay = (arrRule[1] == 0 ? new ArrayList<Map<String, Object>>()
						: this.getLogAnalysisDetailM(mapDataVar, null));// 当日查询规则详情
				List<Map<String, Object>> lstLogTopDetailDay = (srule == 0 ? new ArrayList<Map<String, Object>>()
						: this.getLogAnalysisTopDetailM(mapDataVar, null));// 当日查询慢查询排行

				LogRule tableRule = new LogRule();
				for (Map<String, Object> map2 : lstLogDay) {
					String strName = MapUtils.getString(map2, "NAME", "");
					if (strName.length() > 0 && "总调用次数".equals(strName) && arrRs[0] == 1) {
						tableRule.setTimesDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "调用次数<5秒".equals(strName) && arrRs[1] == 1) {
						tableRule.setFcountDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "快查询占比".equals(strName) && arrRs[3] == 1) {
						tableRule.setFrateDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "慢查询占比".equals(strName) && arrRs[2] == 1) {
						tableRule.setSlowDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "查询平均耗时".equals(strName) && arrRs[4] == 1) {
						tableRule.setAvgDay(MapUtils.getString(map2, "value", ""));
					} else if (strName.length() > 0 && "查询最大耗时".equals(strName) && arrRs[5] == 1) {
						tableRule.setMaxTimeDay(MapUtils.getString(map2, "value", ""));
					}
				}
				List<LogRuleDetail> lstRuleDetail = new ArrayList<LogRuleDetail>();
				for (Map<String, Object> mapDetail : lstDetailDay) {
					LogRuleDetail tableRuleDetail = new LogRuleDetail();
					tableRuleDetail.setTableName(MapUtils.getString(mapDetail, "PARAM_VALUE"));
					tableRuleDetail.setWarehouseNumber(MapUtils.getString(mapDetail, "MAP_INPUT_COUNT"));
					lstRuleDetail.add(tableRuleDetail);
				}

				List<LogAnalysisDetail> lstTableLogAnalysisDetail = new ArrayList<LogAnalysisDetail>();
				for (Map<String, Object> mapLogDetailDay : lstLogDetailDay) {
					LogAnalysisDetail tableLogAnalysisDetail = new LogAnalysisDetail();
					tableLogAnalysisDetail.setQryRuleId(MapUtils.getString(mapLogDetailDay, "QRY_RULE_ID"));
					tableLogAnalysisDetail.setQryRuleName(MapUtils.getString(mapLogDetailDay, "QRY_RULE_NAME"));
					tableLogAnalysisDetail.setScount(MapUtils.getString(mapLogDetailDay, "SCOUNT"));
					tableLogAnalysisDetail.setStime(MapUtils.getString(mapLogDetailDay, "STIME"));
					tableLogAnalysisDetail.setQryNum(MapUtils.getString(mapLogDetailDay, "QRY_NUM"));
					tableLogAnalysisDetail.setQrySumNum(MapUtils.getString(mapLogDetailDay, "QRY_SUM_NUM"));
					lstTableLogAnalysisDetail.add(tableLogAnalysisDetail);
				}

				List<LogTopAnalysisDetail> lstTableTopLogAnalysisDetail = new ArrayList<LogTopAnalysisDetail>();
				for (Map<String, Object> mapTopLogDetailDay : lstLogTopDetailDay) {
					LogTopAnalysisDetail tableTopLogAnalysisDetail = new LogTopAnalysisDetail();
					tableTopLogAnalysisDetail.setQryRuleId(MapUtils.getString(mapTopLogDetailDay, "QRY_RULE_ID"));
					tableTopLogAnalysisDetail.setQryRuleName(MapUtils.getString(mapTopLogDetailDay, "QRY_RULE_NAME"));
					tableTopLogAnalysisDetail.setScount(MapUtils.getString(mapTopLogDetailDay, "SCOUNT"));
					tableTopLogAnalysisDetail.setTotalTime(MapUtils.getString(mapTopLogDetailDay, "TOTAL_TIME"));
					tableTopLogAnalysisDetail.setQryNum(MapUtils.getString(mapTopLogDetailDay, "QRY_NUM"));
					tableTopLogAnalysisDetail.setQrySumNum(MapUtils.getString(mapTopLogDetailDay, "QRY_SUM_NUM"));
					tableTopLogAnalysisDetail.setResponseTime(MapUtils.getString(mapTopLogDetailDay, "QRY_START_DATE"));
					lstTableTopLogAnalysisDetail.add(tableTopLogAnalysisDetail);
				}

				// 加入查询标识，2表示月入库,3表示月排行榜
				mapDataVar.put("flag", 2);
				String imageLineName = getImageName(mapDataVar);
				mapDataVar.put("flag", 3);
				String imageTopName = getImageName(mapDataVar);

				tableRule.setLineChart(arrImages[0] == 1 ? getImageBase64(imageLineName) : "-1");
				tableRule.setTopChart(arrRule[0] == 1 ? getImageBase64(imageTopName) : "-1");
				tableRule.setTableLogAnalysisDetail(lstTableLogAnalysisDetail);
				tableRule.setTableTopLogAnalysisDetail(lstTableTopLogAnalysisDetail);
				tableRule.setLstRuleDetail(lstRuleDetail);
				tableRule.setsName(userTypeName);
				lstTableRule.add(tableRule);
			}
		}

		return lstTableRule;
	}

	/**
	 * 生成图片，返回图片名称
	 * 
	 * @param dataMap
	 * @return
	 */
	@SuppressWarnings("deprecation")
	private String getImageName(Map<String, Object> dataMap) {
		File fileDir = new File(SystemVariableInit.WEB_ROOT_PATH, "../../requireAcc");
		if (!fileDir.exists()) {
			fileDir.mkdirs();
		}
		StandardChartTheme mChartTheme = new StandardChartTheme("CN");
		mChartTheme.setLargeFont(new Font("黑体", Font.BOLD, 14));
		mChartTheme.setExtraLargeFont(new Font("宋体", Font.PLAIN, 12));
		mChartTheme.setRegularFont(new Font("宋体", Font.PLAIN, 12));
		ChartFactory.setChartTheme(mChartTheme);
		int flag = MapUtils.getIntValue(dataMap, "flag", -1);
		Map<String, Object> mapData = new HashMap<String, Object>();
		String yixName = "";
		if (flag == 0) {
			mapData = this.getInputLineDetail(dataMap);// 一天的入库数据
			yixName = "入库条数(条)";
		} else if (flag == 1) {
			mapData = this.getLogAnalysisLineTop(dataMap);// 一天的排行榜数据
			yixName = "";
		} else if (flag == 2) {
			mapData = this.getInputLineDetailM(dataMap);// 12个月的入库数据
			yixName = "入库条数(条)";
		} else if (flag == 3) {
			mapData = this.getLogAnalysisLineTopM(dataMap);// 一个月的排行榜数据
			yixName = "";
		}

		CategoryDataset mDataset = GetDataset(mapData);
		String typeName = MapUtils.getString(mapData, "typeName");
		JFreeChart mChart = ChartFactory.createLineChart(typeName, "", yixName, mDataset, PlotOrientation.VERTICAL,
				true, true, false);

		// 获得plot对象
		CategoryPlot plot = mChart.getCategoryPlot();
		plot.setBackgroundPaint(Color.WHITE);// 设置数据区（中间部分背景色）
		plot.setDomainGridlinePaint(new Color(221, 221, 221)); // 设置横向网格线
		plot.setDomainGridlinesVisible(true); // 设置显示横向网格线
		plot.setRangeGridlinePaint(new Color(221, 221, 221)); // 设置纵向网格线
		plot.setRangeGridlinesVisible(true); // 设置显示纵向网格线

		// 抗锯齿关闭
		mChart.getRenderingHints().put(RenderingHints.KEY_TEXT_ANTIALIASING, RenderingHints.VALUE_TEXT_ANTIALIAS_OFF);

		// 获取X轴的操作
		CategoryAxis categoryaxis = (CategoryAxis) plot.getDomainAxis();
		categoryaxis.setCategoryLabelPositions(CategoryLabelPositions.UP_45);
		categoryaxis.setLowerMargin(0);

		// 获取Y轴的操作
		long maximum = 10;
		maximum = compareRange(mapData, maximum);// 得到较大值做出范围值
		NumberAxis numberaxis = (NumberAxis) plot.getRangeAxis();
		numberaxis.setRange(0, maximum);

		// 绘制单元的设置
		LineAndShapeRenderer lineRender = (LineAndShapeRenderer) plot.getRenderer();
		lineRender.setShapesFilled(Boolean.TRUE);// 在数据点显示实心的小图标
		lineRender.setItemLabelsVisible(true); // series点（即数据点）可见
		lineRender.setShapesVisible(true); // series点（即数据点）间有连线可见
		lineRender.setSeriesPaint(0, new Color(133, 210, 245));

		String newFileName = UUID.randomUUID() + ".jpg";
		String path = "../../requireAcc" + "/" + newFileName;
		// 保存图
		try {
			ChartUtilities.saveChartAsPNG(new File(SystemVariableInit.WEB_ROOT_PATH, path), mChart, 780, 250);
		} catch (IOException e) {
			e.printStackTrace();
		}
		return path;
	}

	/**
	 * 比较出较大值做为范围值
	 * 
	 * @param mapData
	 * @param maximum
	 * @return
	 */
	public long compareRange(Map<String, Object> mapData, long maximum) {
		String[] arrData = (String[]) mapData.get("datas");
		for (int i = 0; i < arrData.length; i++) {
			long dataTemp = Long.parseLong(arrData[i]);
			if (dataTemp > maximum) {
				maximum = dataTemp;
			}
		}
		return maximum;
	}

	/**
	 * 生成图片的数据
	 * 
	 * @return
	 */
	public CategoryDataset GetDataset(Map<String, Object> mapData) {
		String[] arrDatanos = (String[]) mapData.get("datanos");
		String[] arrData = (String[]) mapData.get("datas");
		String typeName = MapUtils.getString(mapData, "typeName");
		DefaultCategoryDataset mDataset = new DefaultCategoryDataset();
		for (int i = 0; i < arrDatanos.length; i++) {
			mDataset.addValue(Long.parseLong(arrData[i]), typeName, arrDatanos[i]);
		}
		return mDataset;
	}

	/**
	 * 删除缓存数据
	 * 
	 * @param path
	 */
	public void delete(String path) {
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, path);
		if (!file.exists()) {
			System.out.println("删除文件失败：" + path + "文件不存在");
		} else {
			if (file.isFile()) {
				deleteFile(file.getAbsolutePath());
			} else {
				deleteDirectory(path);
			}
		}
	}

	/**
	 * 删除单个文件
	 * 
	 * @param fileName 被删除文件的文件名
	 * @return 单个文件删除成功返回true,否则返回false
	 */
	public static boolean deleteFile(String fileNamePath) {
		File file = new File(fileNamePath);
		if (file.isFile() && file.exists()) {
			file.delete();
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 删除目录（文件夹）以及目录下的文件
	 * 
	 * @param dir 被删除目录的文件路径
	 * @return 目录删除成功返回true,否则返回false
	 */
	public static boolean deleteDirectory(String dir) {
		// 如果dir不以文件分隔符结尾，自动添加文件分隔符
		if (!dir.endsWith(File.separator)) {
			dir = dir + File.separator;
		}
		File dirFile = new File(SystemVariableInit.WEB_ROOT_PATH, dir);
		// 如果dir对应的文件不存在，或者不是一个目录，则退出
		if (!dirFile.exists() || !dirFile.isDirectory()) {
			return false;
		}
		boolean flag = deleteFileDirFiles(dir);

		if (!flag) {
			return false;
		}

		// 删除当前目录
		if (dirFile.delete()) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * 删除目录下的文件以及子目录
	 * 
	 * @param dirFilePath
	 * @return
	 */
	public static boolean deleteFileDirFiles(String dirFilePath) {
		boolean flag = true;
		File dirFile = new File(SystemVariableInit.WEB_ROOT_PATH, dirFilePath);
		// 删除文件夹下的所有文件(包括子目录)
		File[] files = dirFile.listFiles();
		for (int i = 0; i < files.length; i++) {
			// 删除子文件
			if (files[i].isFile()) {
				flag = deleteFile(files[i].getAbsolutePath());
				if (!flag) {
					break;
				}
			}
			// 删除子目录
			else {
				flag = deleteDirectory(files[i].getAbsolutePath());
				if (!flag) {
					break;
				}
			}
		}
		return flag;
	}

	/**
	 * 以base64编码图片
	 * 
	 * @return
	 */
	public String getImageBase64(String imagePath) {
		if (imagePath.length() == 0 && "".equals(imagePath)) {
			imagePath = "/meta/resource/dhtmlx/imgs/color.png";
		}
		File imgFile = new File(SystemVariableInit.WEB_ROOT_PATH, imagePath);
		InputStream in = null;
		byte[] data = null;
		try {
			in = new FileInputStream(imgFile);
			data = new byte[in.available()];
			in.read(data);
			in.close();
		} catch (IOException e) {
			e.printStackTrace();
		}
		BASE64Encoder encoder = new BASE64Encoder();
		return encoder.encode(data);
	}

	/**
	 * 获得初始的页面数据
	 * 
	 * @param dataMap
	 * @return
	 */
	public Map<String, Object> showAllData(Map<String, Object> dataMap) {
		Map<String, Object> mapRs = new HashMap<String, Object>();
		Page page = new Page(0, 15);
		List<Map<String, Object>> lstTable = this.getLogAnalysisDetail(dataMap, page);
		List<Map<String, Object>> lstTopTable = this.getLogAnalysisTopDetail(dataMap, page);
		List<Map<String, Object>> lstInputTable = this.getInputDetail(dataMap);
		Map<String, Object> mapLineChart = this.getInputLineDetail(dataMap);
		Map<String, Object> mapLineTopChart = this.getLogAnalysisLineTop(dataMap);
		List<Map<String, Object>> lstZoomChart = this.getLogAnalysis(dataMap);
		UserTypeAction userTypeAction = new UserTypeAction();
		List<Map<String, Object>> lstUserType = userTypeAction.queryTypeByUser(null);// 得到业务类型列表
		List<Map<String, Object>> lstLineChart = new ArrayList<Map<String, Object>>();
		List<Map<String, Object>> lstTopChart = new ArrayList<Map<String, Object>>();
		for (Map<String, Object> map : lstUserType) {
			dataMap.put("jobType", MapUtils.getString(map, "TYPE_ID"));
			dataMap.put("typeName", MapUtils.getString(map, "TYPE_NAME"));
			Map<String, Object> mapLineChartTemp = this.getInputLineDetail(dataMap);
			Map<String, Object> mapLineTopChartTemp = this.getLogAnalysisLineTop(dataMap);
			lstLineChart.add(mapLineChartTemp);
			lstTopChart.add(mapLineTopChartTemp);
		}

		mapRs.put("tempData", lstTable);
		mapRs.put("inputData", lstInputTable);
		mapRs.put("topData", lstTopTable);
		mapRs.put("lineChart", mapLineChart);
		mapRs.put("lineTopChart", mapLineTopChart);
		mapRs.put("zoomChart", lstZoomChart);
		mapRs.put("lstLineChart", lstLineChart);
		mapRs.put("lstTopChart", lstTopChart);

		return mapRs;

	}

	/**
	 * 获得一个指标30天的数据
	 * 
	 * @param mapData
	 * @return
	 */
	public List<Map<String, Object>> queryPartRsM(Map<String, Object> mapData) {
		List<Map<String, Object>> lstRs = logAnalysisDAO.queryForRsMList(mapData);
		// 对数据进行处理
		String checkDate = MapUtils.getString(mapData, "CHECK_DATE");
		List<String> lstMonth = DateUtil.getDataArrByMonth(checkDate);
		List<Map<String, Object>> lstRsTemp = new ArrayList<Map<String, Object>>(lstMonth.size());
		List<String> lstDate = new ArrayList<String>();
		for (Map<String, Object> mapRs : lstRs) {
			String hDate = MapUtils.getString(mapRs, "T_HOUR");
			if (!"".equals(hDate) && hDate.length() > 0)
				lstDate.add(hDate);
		}
		for (int i = 0; i < lstMonth.size(); i++) {
			if (!lstDate.contains(lstMonth.get(i))) {
				Map<String, Object> mapTemp = new HashMap<String, Object>();
				mapTemp.put("T_HOUR", lstMonth.get(i));
				mapTemp.put("T_COUNT", 0);
				lstRsTemp.add(i, mapTemp);
			} else {
				a: for (Map<String, Object> map : lstRs) {
					String strTemp = MapUtils.getString(map, "T_HOUR");
					if (strTemp.equals(lstMonth.get(i))) {
						lstRsTemp.add(i, map);
						break a;
					}
				}
			}
		}
		return lstRsTemp;
	}

	/**
	 * 获得初始的页面数据
	 * 
	 * @param dataMap
	 * @return
	 */
	public Map<String, Object> showAllDataM(Map<String, Object> dataMap) {
		Map<String, Object> mapRs = new HashMap<String, Object>();
		Page page = new Page(0, 15);
		List<Map<String, Object>> lstTable = this.getLogAnalysisDetailM(dataMap, page);
		List<Map<String, Object>> lstTopTable = this.getLogAnalysisTopDetailM(dataMap, page);
		List<Map<String, Object>> lstInputTable = this.getInputDetailM(dataMap);
		Map<String, Object> mapLineChart = this.getInputLineDetailM(dataMap);
		Map<String, Object> mapLineTopChart = this.getLogAnalysisLineTopM(dataMap);
		List<Map<String, Object>> lstZoomChart = this.getLogAnalysisM(dataMap);

		mapRs.put("tempData", lstTable);
		mapRs.put("inputData", lstInputTable);
		mapRs.put("topData", lstTopTable);
		mapRs.put("lineChart", mapLineChart);
		mapRs.put("lineTopChart", mapLineTopChart);
		mapRs.put("zoomChart", lstZoomChart);

		return mapRs;

	}

	public static String encodingFileName(String fileName) {
		String returnFileName = "";
		try {
			returnFileName = URLEncoder.encode(fileName, "ISO8859-1");
			returnFileName = StringUtils.replace(returnFileName, "+", "%20");
			if (returnFileName.length() > 150) {
				returnFileName = new String(fileName.getBytes("GB2312"), "ISO8859-1");
				returnFileName = StringUtils.replace(returnFileName, " ", "%20");
			}
		} catch (UnsupportedEncodingException e) {
			e.printStackTrace();
		}
		return returnFileName;
	}

	public void setLogAnalysisDAO(LogAnalysisDAO logAnalysisDAO) {
		this.logAnalysisDAO = logAnalysisDAO;
	}

}
