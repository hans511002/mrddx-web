package com.ery.meta.module.datarole;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class UserTypeData {

	public static List<Map<String, String>> GET_ACTION_TYPE_LIST(){
		List<Map<String, String>> ACTION_TYPE_LIST = new ArrayList<Map<String,String>>();
		Map<String,String> M1001 = new HashMap<String, String>();
		M1001.put("ACTION_ID", "1001");
		M1001.put("ACTION_NAME", "采集新增下载");
		M1001.put("ACTION_MEMO", "采集新增下载");
		M1001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M1001);
		Map<String,String> M2001 = new HashMap<String, String>();
		M2001.put("ACTION_ID", "2001");
		M2001.put("ACTION_NAME", "采集新增上传");
		M2001.put("ACTION_MEMO", "采集新增上传");
		M2001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M2001);
		Map<String,String> M3001 = new HashMap<String, String>();
		M3001.put("ACTION_ID", "3001");
		M3001.put("ACTION_NAME", "数据处理新增");
		M3001.put("ACTION_MEMO", "数据处理新增");
		M3001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M3001);
		Map<String,String> M4001 = new HashMap<String, String>();
		M4001.put("ACTION_ID", "4001");
		M4001.put("ACTION_NAME", "数据服务规则新增");
		M4001.put("ACTION_MEMO", "数据服务规则新增");
		M4001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M4001);
		Map<String,String> M5001 = new HashMap<String, String>();
		M5001.put("ACTION_ID", "5001");
		M5001.put("ACTION_NAME", "采集下载查看所有(全局)");
		M5001.put("ACTION_MEMO", "采集下载查看所有(全局)");
		M5001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M5001);
		Map<String,String> M6001 = new HashMap<String, String>();
		M6001.put("ACTION_ID", "6001");
		M6001.put("ACTION_NAME", "采集上传查看所有(全局)");
		M6001.put("ACTION_MEMO", "采集上传查看所有(全局)");
		M6001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M6001);
		Map<String,String> M7001 = new HashMap<String, String>();
		M7001.put("ACTION_ID", "7001");
		M7001.put("ACTION_NAME", "数据处理查看所有(全局)");
		M7001.put("ACTION_MEMO", "数据处理查看所有(全局)");
		M7001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M7001);
		Map<String,String> M8001 = new HashMap<String, String>();
		M8001.put("ACTION_ID", "8001");
		M8001.put("ACTION_NAME", "数据服务规则查看所有(全局)");
		M8001.put("ACTION_MEMO", "数据服务规则查看所有(全局)");
		M8001.put("FLAG", "0");
		ACTION_TYPE_LIST.add(M8001);
		return ACTION_TYPE_LIST;
	}
}
