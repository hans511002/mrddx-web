package com.ery.meta.module.hBaseQuery;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.hadoop.hq.utils.StringUtil;
import com.ery.hadoop.hq.ws.client.MetaWsClient;
import com.ery.hadoop.hq.ws.client.MetaWsClientProxy;

/**
 * 客户端调用清单查询

 *
 */
public class ClientWSAction {
    private HBQryRuleDao hbQryRuleDao;
    
	static{
		// 初始客户端（系统启动时调用一次）
		MetaWsClient.setAddress("http://127.0.0.1:8080/bigData");
		MetaWsClient.setUsername("test123");
		MetaWsClient.setPassword("111111");
		try {
			MetaWsClient.init();
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
    /**
     * 清单查询
     * @param data
     * @return
     */
   @SuppressWarnings("unchecked")
   public List<Map<String,Object>> listQuery(Map<String,Object> data){
	   List<Map<String,Object>> list = new ArrayList<Map<String,Object>>();
		Object ruleId = data.get("RULEID");
		Object mdn = data.get("MDN");
		Object startDate = data.get("START_DATE");
		Object endDate = data.get("END_DATE");
		
		if (null == ruleId || ruleId.toString().trim().isEmpty() ||
				null == mdn || mdn.toString().trim().isEmpty() ||
				null == startDate || startDate.toString().trim().isEmpty() ||
				null == endDate || endDate.toString().trim().isEmpty()){
			return list;
		}
		
		long ruID = 0;
		try{
			ruID = Long.parseLong(ruleId.toString());
		}catch (Exception e) {
			return list;
		}
		
		String startTime = "";
		String endTime = "";
		try{
			long time = StringUtil.stringToLong(startDate.toString(), StringUtil.DATE_FORMAT_TYPE4);
			startTime = StringUtil.longToString(time, StringUtil.DATE_FORMAT_TYPE3);
			time = StringUtil.stringToLong(endDate.toString(), StringUtil.DATE_FORMAT_TYPE4);
			endTime = StringUtil.longToString(time, StringUtil.DATE_FORMAT_TYPE3);
		}catch (Exception e) {
			return list;
		}
		
		Map<String,Object> qyrRuleInfo = hbQryRuleDao.getQyrRuleInfo(ruID);//规则信息
		if (null == qyrRuleInfo || qyrRuleInfo.size() <= 0){
			return list;
		}
		 
		// 设置请求参数
		MetaWsClientProxy proxy = MetaWsClient.getClientProxy();
		HashMap<String, Object> param = new HashMap<String, Object>();
		param.put("QUERY_RULE_ID", ruID);
		param.put("START_KEY", "86" + mdn.toString()+"-"+startTime);
		param.put("END_KEY", "86" + mdn.toString()+"-"+endTime);
	//	param.put("CURRENT_PAGE", "2");
	//	param.put("PAGE_SIZE", "1");
	//	param.put("ORDERBY_COLUMN", "DU-JC");
	//	param.put("ORDER_DESC", "DU-JC");
		// 发起请求
		Map<?,?> obj = proxy.executeBySimpleMap("hbase01", Map.class, param);	   
		// {"reaults":{"values":[["2013/07/26 09:50:21","2","open.play.cn/api/v1/other/open/emp_info.json?app_id=&package_name=&charge_code=null","521","837","8613308121444","8613308121444-2013/07/26 09:50:21"],["2013/07/26 09:50:24","2","open.play.cn/api/v1/other/open/emp_info.json?app_id=&package_name=&charge_code=null","521","687","8613308121444","8613308121444-2013/07/26 09:50:24"]],"enField":["ATTIME","DATA_TYPE","URL","SEND_TRAFFIC","RECV_TRAFFIC","MDN","ROWID"],"status":"true","chField":[null,null,null,null,null,null,"ROWID"]}}	   
		Object reaultObj = obj.get("reaults");
		String[] fields = null;
		List<Object> lstValues = new ArrayList<Object>();
		if (null != reaultObj && reaultObj instanceof Map<?,?>){
			Map<?,?> map = (Map<?,?>)reaultObj;
			for (Object vals : map.keySet()) {
				if (null != vals && vals instanceof String && "enField".equals(vals)){
					fields = ((List<Object>) map.get(vals)).toArray(new String[0]);//转化成String数组
				}
				
				if (null != vals && vals instanceof String && "values".equals(vals)){
					lstValues = (List<Object>) map.get(vals);
				}
			}
		}
		
		for (Object object : lstValues) {
			if (null != object && object instanceof List<?>){
				List<?> resList = (List<?>)object;
				Map<String,Object> perValue = new HashMap<String, Object>();
				for (int i = 0; i < fields.length; i++) {
					Object objs = resList.get(i);
					if ("MDN".equals(fields[i]) && objs != null){
						String peval = objs.toString();
						String realValue = peval;
						if(peval.startsWith("86") && peval.length()>2){
							realValue = peval.substring(2);
						}else if (peval.startsWith("+86") && peval.length()>3){
							realValue = peval.substring(3);
						}
						perValue.put(fields[i], realValue);
						continue;
					}
					perValue.put(fields[i], resList.get(i));
				}
				list.add(perValue);
			}
		}
		
		// 打印结果
		int index = 0;
		for (Map<String,Object> objMap : list) {
			if (null == objMap){
				System.out.println("error,data exist is null");
				continue;
			}
			index++;
			System.out.println("第"+index+"条数据");
			
			for (String objs : objMap.keySet()) {
				System.out.println(objs+"==>"+objMap.get(objs));
			}
		}
		return list;
   }   
   
   public void setHbQryRuleDao(HBQryRuleDao hbQryRuleDao) {
       this.hbQryRuleDao = hbQryRuleDao;
   }
}
