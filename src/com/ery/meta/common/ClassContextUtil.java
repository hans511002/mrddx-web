

  
package com.ery.meta.common;



public class ClassContextUtil {
	private ClassContextUtil() {
	}

	private static ClassContextUtil classContext;
	static {
		classContext = new ClassContextUtil();
	}

	public synchronized static ClassContextUtil getInstance() {
		if (classContext == null) {
			classContext = new ClassContextUtil();
		}
		return classContext;
	}

	public String getWebAppRootPath() {
		String result = ClassContextUtil.class.getResource("ClassContextUtil.class").toString();
		int index = result.indexOf("WEB-INF");
		if (index == -1) {
			index = result.indexOf("bin");
		}
		result = result.substring(0, index);
		if (result.startsWith("zip")) {
			result = result.substring(4);
		} else if (result.startsWith("file")) {
												
			result = result.substring(6);
		} else if (result.startsWith("jar")) { 
												
			result = result.substring(10);
		}
		if (result.endsWith("/"))
			result = result.substring(0, result.length() - 1);
		result = result.replace("%20", " ");
		String osname = System.getProperty("os.name");
		if (osname.toLowerCase().startsWith("lin")) {
			result = "/" + result;
		}
		return result;
	}
}
