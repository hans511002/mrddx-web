package com.ery.meta.module.monitor;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MonitorData {

	private static List<Map<String, Object>> logoData = new ArrayList<Map<String, Object>>();
	private static Map<String, List<Map<String, Object>>> logoDetailData = new HashMap<String, List<Map<String, Object>>>();
	private static Map<String, Object> MonitorConfig;

	public static int SysMapCount = 0;
	public static int SysReduceCount = 0;

	public static synchronized Map<String, Object> getDetail(
			Map<String, Object> data) {
		String log_id = data.get("LOG_ID_").toString();
		Map<String, Object> mapDetail = new HashMap<String, Object>();
		for (Map<String, Object> logo : logoData) {
			if (logo.get("LOG_ID_").toString().equals(log_id)) {
				mapDetail.put("info", logo);
			}
		}
		List<Map<String, Object>> logoDetail = logoDetailData.get(log_id);
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();

		for (Map<String, Object> map : logoDetail) {
			if (data.containsKey("STATE")
					&& !data.get("STATE").toString().equals("")) {
				if (data.get("STATE").toString().equals("0")) {
					if (map.containsKey("STATUS")
							&& !map.get("STATUS").toString().equals("0")) {
						continue;
					}
				}
				if (data.get("STATE").toString().equals("1")) {
					if (map.containsKey("STATUS")
							&& !map.get("STATUS").toString().equals("1")) {
						continue;
					}
				}
				if (data.get("STATE").toString().equals("2")) {
					if (map.containsKey("STATUS")
							&& !map.get("STATUS").toString().equals("2")) {
						continue;
					}
				}
			}
			list.add(map);
		}

		mapDetail.put("list", list);
		return mapDetail;
	}

	public static synchronized List<Map<String, Object>> getLogoData(
			Map<String, Object> data) {
		List<Map<String, Object>> list = new ArrayList<Map<String, Object>>();

		for (Map<String, Object> map : logoData) {
			if (!data.containsKey("ADMIN_FLAG")
					|| !data.get("ADMIN_FLAG").equals("1")) {
				if (data.containsKey("LOGIN_USER_ID")
						&& !data.get("LOGIN_USER_ID").equals("")) {
					if (!map.get("USER_ID").toString()
							.equals(data.get("LOGIN_USER_ID").toString())) {
						continue;
					}
				}
			}

			if (data.containsKey("SEARCH_WORD")
					&& !data.get("SEARCH_WORD").toString().equals("")) {
				if (map.get("JOB_NAME").toString()
						.indexOf(data.get("SEARCH_WORD").toString()) == -1) {
					if (map.get("USER_NAMECN").toString()
							.indexOf(data.get("SEARCH_WORD").toString()) == -1) {
						continue;
					}
				}
			}
			if (data.containsKey("TASK_TYPE")
					&& !data.get("TASK_TYPE").toString().equals("")) {
				if (!map.get("TASK_TYPE").toString()
						.equals(data.get("TASK_TYPE").toString())) {
					continue;
				}
			}
			if (data.containsKey("JOB_TYPE")
					&& !data.get("JOB_TYPE").toString().equals("")) {
				if (!map.get("JOB_TYPE").toString()
						.equals(data.get("JOB_TYPE").toString())) {
					continue;
				}
			}
			if (data.containsKey("STATE")
					&& !data.get("STATE").toString().equals("")) {
				if (data.get("STATE").toString().equals("0")) {
					if (map.containsKey("FAILURE")
							&& !map.get("FAILURE").toString().equals("0")) {
						continue;
					}
				}
				if (data.get("STATE").toString().equals("1")) {
					if (!map.containsKey("FAILURE")
							|| map.get("FAILURE").toString().equals("0")) {
						continue;
					}
				}
			}
			list.add(map);

		}

		return list;
	}

	public static synchronized Map<String, Integer> getSysResources(
			Map<String, Object> data) {
		Map<String, Integer> sysmap = new HashMap<String, Integer>();
		int ownM = 0;
		int ownR = 0;
		int jobM = 0;
		int jobR = 0;
		if (MonitorData.getMonitorConfig().get("ISAUTOREFRESH").toString()
				.equals("1")
				|| MonitorData.getMonitorConfig().get("ISMANUREFRESH")
						.toString().equals("1")) {
			for (Map<String, Object> map : logoData) {
				if (data.containsKey("LOGIN_USER_ID")
						&& !data.get("LOGIN_USER_ID").equals("")) {
					if (map.get("USER_ID").toString()
							.equals(data.get("LOGIN_USER_ID").toString())) {
						ownM += (Integer) map.get("MAP_RUNING");
						ownR += (Integer) map.get("REDUCE_RUNING");
					}
				}
				jobM += (Integer) map.get("MAP_RUNING");
				jobR += (Integer) map.get("REDUCE_RUNING");
			}
		}
		sysmap.put("SYS_MAP", SysMapCount);
		sysmap.put("SYS_REDUCE", SysReduceCount);
		sysmap.put("JOB_MAP", jobM);
		sysmap.put("JOB_REDUCE", jobR);
		sysmap.put("OWN_MAP", ownM);
		sysmap.put("OWN_REDUCE", ownR);
		return sysmap;
	}

	@SuppressWarnings("unchecked")
	public static synchronized void setData(Map<String, Object> map) {
		if (map.containsKey("LOG_DATA")) {
			logoData = (List<Map<String, Object>>) map.get("LOG_DATA");
		}
		if (map.containsKey("LOG_DETAIL_DATA")) {
			logoDetailData = (Map<String, List<Map<String, Object>>>) map
					.get("LOG_DETAIL_DATA");
		}

	}

	public static synchronized List<Map<String, Integer>> getJobStatusLineData(
			Map<String, Object> data) {
		List<Map<String, Integer>> list = new ArrayList<Map<String, Integer>>();

		for (int i = 0; i < 24; i++) {
			Map<String, Integer> map = new HashMap<String, Integer>();
			map.put("SUCCESS", 0);
			map.put("FAILURE", 0);
			list.add(map);
		}

		for (Map<String, Object> logo : logoData) {
			logo.get("STATUS").equals("1");
		}

		// TODO Auto-generated method stub
		return null;
	}

	public static Map<String, Object> getMonitorConfig() {
		return MonitorConfig;
	}

	public static void setMonitorConfig(Map<String, Object> monitorConfig) {
		try {
			String s = GetPageContent("http://"
					+ monitorConfig.get("HADOOPJOBURL").toString());
			String ss[] = s.split("</td><td>");
			// System.out.println(ss[8]);
			// System.out.println(ss[9]);
			MonitorData.SysMapCount = Integer.valueOf(ss[8]);
			MonitorData.SysReduceCount = Integer.valueOf(ss[9]);
		} catch (Exception e) {
			MonitorData.SysMapCount = 0;
			MonitorData.SysReduceCount = 0;
		}
		MonitorConfig = monitorConfig;
	}

	public static String GetPageContent(String pageURL) {
		String pageContent = "";
		BufferedReader in = null;
		InputStreamReader isr = null;
		InputStream is = null;
		HttpURLConnection huc = null;
		try {
			URL url = new URL(pageURL);
			huc = (HttpURLConnection) url.openConnection();
			is = huc.getInputStream();
			isr = new InputStreamReader(is);
			in = new BufferedReader(isr);
			String line = null;
			while (((line = in.readLine()) != null)) {
				if (line.length() == 0)
					continue;
				pageContent += line;
			}
		} catch (Exception e) {
			
		} finally {
			try {
				is.close();
				isr.close();
				in.close();
				huc.disconnect();
			} catch (Exception e) {
				
			}
		}
		return pageContent;
	}
}
