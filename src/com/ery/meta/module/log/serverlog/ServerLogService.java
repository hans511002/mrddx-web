package com.ery.meta.module.log.serverlog;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;
import com.ery.base.support.web.init.SystemVariableInit;

public class ServerLogService {

	/**
	 * 读取日志列表
	 * 
	 * @throws FileNotFoundException
	 * */
	public List<String> readLogFileList() {
		List<String> fileList = new ArrayList<String>();
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, SystemVariable.getString("logger.filePath"));
		if (!file.exists()) {
			LogUtils.debug(file.getAbsolutePath());
			String message = "日志文件目录下未有日志文件或日志文件夹不存在,请联系管理员!";
			fileList.add(message);
		} else {
			String logfileName = SystemVariable.getString("logger.fileName");
			Map<String, Long> map = new HashMap<String, Long>();
			File[] fileArr = file.listFiles();
			if (fileArr.length != 0) {
				for (int i = 0; i < fileArr.length; i++) { // 将封装之后的数据放在map中,key为当前修改时间
															// value为包含当前文件信息的字符串,以","分割
					File logFile = fileArr[i];
					if (logFile.getName().endsWith(".log") && logFile.getName().startsWith(logfileName)) {
						try {
							Long modifiedTime = logFile.lastModified();
							String temp = new Timestamp(logFile.lastModified()).toString();
							String fileInfo = null;
							fileInfo = logFile.getName() + ","; // 文件名称
							fileInfo += temp.substring(0, 19) + ",";
							FileInputStream fis = new FileInputStream(logFile);
							fileInfo += String.valueOf(fis.available() / 1000) + "k ,"; // 文件大小
							fileInfo += logFile.getAbsolutePath(); // 文件路径
							map.put(fileInfo, modifiedTime);

						} catch (Exception ex) {
							fileList.add(logFile.getAbsolutePath() + "文件出错");
						}
					}
				}
			}
			Map sortMap = sortByValue(map, true);
			Iterator<String> iterator = sortMap.keySet().iterator();
			while (iterator.hasNext()) {
				fileList.add(iterator.next());
			}
		}
		return fileList;
	}

	private Map sortByValue(Map<String, Long> map, final boolean reverse) {
		List<String> list = new LinkedList(map.entrySet());
		Collections.sort(list, new Comparator<Object>() {

			public int compare(Object o1, Object o2) {
				if (reverse) {
					return -((Comparable) ((Map.Entry) (o1)).getValue()).compareTo(((Map.Entry) (o2)).getValue());
				}
				return ((Comparable) ((Map.Entry) (o1)).getValue()).compareTo(((Map.Entry) (o2)).getValue());
			}
		});

		Map result = new LinkedHashMap();
		for (Iterator it = list.iterator(); it.hasNext();) {
			Map.Entry entry = (Map.Entry) it.next();
			result.put(entry.getKey(), entry.getValue());
		}
		return result;
	}

	public BufferedReader readLogFileInfo(String fileName) {
		BufferedReader reader = null;
		File file = new File(SystemVariableInit.WEB_ROOT_PATH, SystemVariable.getString("logger.filePath") + "/"
				+ fileName);
		if (!file.exists()) {
			LogUtils.debug(file.getName() + "未找到");
		} else {
			try {
				reader = new BufferedReader(new FileReader(file));
			} catch (FileNotFoundException e) {
				e.printStackTrace();
			}
		}
		return reader;
	}

	public File getLogFile(String fileName) {
		File file = null;
		file = new File(SystemVariableInit.WEB_ROOT_PATH, SystemVariable.getString("logger.filePath") + "/" + fileName);
		if (!file.exists()) {
			LogUtils.debug(file.getName() + "未找到");
		}
		return file;
	}
}
