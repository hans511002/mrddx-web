package com.ery.meta.module.mag.menu;

import java.io.File;
import java.io.InputStream;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.ery.base.support.utils.FileUtils;
import com.ery.base.support.utils.IOUtils;
import com.ery.base.support.web.init.SystemVariableInit;

public class MetaResourceParse {

	/**
	 * 解析JSP文件里面的I118定义的资源信息
	 * 
	 * @param url
	 *            一个JSP文件地址
	 * @return
	 */
	public static List<Map<String, Object>> parseI118n(String url, int menuId) throws Exception {
		List<Map<String, Object>> rtn = new ArrayList<Map<String, Object>>();
		// String allFileStr = FileUtils.readFileToString(new
		// File("D:\\workspace\\bi-meta\\WebRoot\\meta\\module\\mag\\user\\myinfo.jsp"),"UTF-8");
		String allFileStr = "";
		try {
			allFileStr = FileUtils.readFileToString(new File(url), "UTF-8");
		} catch (Exception e1) {
			try {
				allFileStr = FileUtils.readFileToString(new File(url.substring(0, url.indexOf("?"))), "UTF-8");
			} catch (Exception e2) {
				try {
					String tmpUrl = url.replace(SystemVariableInit.WEB_ROOT_PATH + "\\", "");
					URL urlO = new URL(tmpUrl);
					InputStream in = urlO.openConnection().getInputStream();
					allFileStr = IOUtils.toString(in, "UTF-8");
				} catch (Exception e) {
					// e.printStackTrace(); //To change body of catch statement use File | Settings | File Templates.
				}
			}
		}

		if (!allFileStr.contains("<script")) {
			return new ArrayList<Map<String, Object>>();
		}
		allFileStr = allFileStr.trim().replaceAll("\\r", "").replaceAll("\\n", "").replaceAll("\\t", "");
		allFileStr = allFileStr.substring(allFileStr.indexOf("<script"), allFileStr.lastIndexOf("</script>") + 9);
		allFileStr = cleanUselessBlank(allFileStr);
		List<String> localVars = getLocalVar(allFileStr);
		allFileStr = allFileStr.replaceAll(":\"", ":'").replaceAll("\",", "',");
		for (String localVar : localVars) {
			String tmp = allFileStr
					.substring(allFileStr.indexOf(localVar) + localVar.length() + 2, allFileStr.length());
			String var = tmp.substring(0, tmp.indexOf("}"));
			var = var.substring(0, var.length() - 1);
			String vars[] = var.split("',");
			for (String s : vars) {
				// System.out.println(s.split(":'")[0] + " 值为： " + s.split(":'")[1]);
				Map<String, Object> m = new HashMap<String, Object>();
				m.put("I18N_ITEM_CODE", s.split(":'")[0]);
				m.put("VAL_TEXT", s.split(":'")[1]);
				m.put("MAX_LENGTH", 100);
				m.put("MENU_ID", menuId);
				m.put("I18N_ITEM_ID", -1);
				rtn.add(m);
			}
		}
		return rtn;
	}

	/**
	 * 清楚符号前后无意义的空格，符号包括： "(",")","{","}"
	 * 
	 * @param s
	 * @return
	 */
	private static String cleanUselessBlank(String s) {
		while (s.contains(" (") || s.contains(" )") || s.contains("( ") || s.contains(") ") || s.contains(" {") ||
				s.contains(" }") || s.contains("{ ") || s.contains("} ") || s.contains(" :") || s.contains(" :") ||
				s.contains(": ") || s.contains(": ") || s.contains(" =") || s.contains(" =") || s.contains("= ") ||
				s.contains("= ") || s.contains(" ,") || s.contains(" ,") || s.contains(", ") || s.contains(", ")) {
			s = s.replaceAll(" \\(", "(").replaceAll(" \\)", ")").replaceAll("\\( ", "(").replaceAll("\\) ", ")")
					.replaceAll(" \\{", "{").replaceAll(" \\}", "}").replaceAll("\\{ ", "{").replaceAll("\\} ", "}")
					.replaceAll(" :", ":").replaceAll(" :", ":").replaceAll(": ", ":").replaceAll(": ", ":")
					.replaceAll(" =", "=").replaceAll(" =", "=").replaceAll("= ", "=").replaceAll("= ", "=")
					.replaceAll(" ,", ",").replaceAll(" ,", ",").replaceAll(", ", ",").replaceAll(", ", ",");
		}
		return s;
	}

	/**
	 * 本地化变量取出来
	 * 
	 * @param s
	 * @return
	 */
	private static List<String> getLocalVar(String s) {
		List<String> rtn = new ArrayList<String>();
		while (s.contains("toLocal(")) {
			s = s.substring(s.indexOf("toLocal(") + 8, s.length());
			String tmp = s.substring(0, s.indexOf(")"));
			rtn.add(tmp);
		}
		return rtn;
	}

	public static void main(String args[]) {
		try {
			URL url = new URL("http://www.baidu.com");
			InputStream in = url.openConnection().getInputStream();
			System.out.println(IOUtils.toString(in, "UTF-8"));
		} catch (Exception e) {
			e.printStackTrace(); // To change body of catch statement use File |
									// Settings | File Templates.
		}

	}
}
