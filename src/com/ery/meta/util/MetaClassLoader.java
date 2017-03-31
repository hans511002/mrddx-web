package com.ery.meta.util;

import java.io.File;
import java.io.IOException;
import java.net.URL;
import java.net.URLClassLoader;

import com.ery.base.support.log4j.LogUtils;


public class MetaClassLoader extends URLClassLoader {

	private boolean ignoreConflict = false;// 是否忽略冲突

	public boolean isIgnoreConflict() {
		return ignoreConflict;
	}

	/**
	 * 设置忽略冲突 （默认为false）
	 * 
	 * @param ignoreConflict true：忽略，与系统类发生冲突时，忽略冲突，返回系统类
	 *            false:不忽略，则当动态加载类时发现冲突会抛异常
	 */
	public void setIgnoreConflict(boolean ignoreConflict) {
		this.ignoreConflict = ignoreConflict;
	}

	public MetaClassLoader() {
		this(getSystemClassLoader());
	}

	public MetaClassLoader(ClassLoader parent) {
		super(new URL[] {}, parent);
	}

	/**
	 * 向加载器添加文件URL
	 * 
	 * @param urls
	 */
	public void addURL(URL... urls) {
		if (urls != null) {
			for (URL url : urls) {
				super.addURL(url);
			}
		}
	}

	/**
	 * 向加载器添加文件（*.jar,*.zip,*.class)
	 * 
	 * @param files
	 * @throws IOException
	 */
	public void addFile(File... files) throws IOException {
		if (files != null) {
			for (File file : files) {
				if (file != null) {
					super.addURL(file.toURI().toURL());
				}
			}
		}
	}

	/**
	 * 通过加载器载入一个类
	 * 
	 * @param name
	 * @return
	 * @throws Exception
	 */
	public Class<?> getClassByLoad(String name) throws Exception {
		Class<?> c = null;
		try {
			c = super.findSystemClass(name);
		} catch (ClassNotFoundException e) {
			return super.loadClass(name);
		}
		if (ignoreConflict) {
			LogUtils.warn("需载入的类[" + name + "]与系统类冲突,忽略冲突,返回系统类！");
			return c;
		} else {
			throw new Exception("需载入的类[" + name + "]与系统类冲突!");
		}
	}

}
