package com.ery.meta.sys.code;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.StringUtils;


public class CodeManager {

	/**
	 * 数据库访问操作对象
	 */
	private static CodeDAO codeDAO = new CodeDAO();

	/**
	 * 系统编码上下文容器
	 */
	private static Hashtable<String, List<CodePO>> context = new Hashtable<String, List<CodePO>>();

	/**
	 * 该类不允许实例化
	 */
	private CodeManager() {
	}

	/**
	 * 重新载入系统编码信息,如果在此过程中发生异常,那么自动回滚到重载参数之前,此方法为线程同步。
	 */
	public synchronized static void load() {
		Hashtable<String, List<CodePO>> temp = new Hashtable<String, List<CodePO>>(context);
		try {
			context.clear();
			CodePO[] codeRows = codeDAO.queryAllCode();
			for (CodePO codePO : codeRows) {
				String codeType = codePO.getTypeCode();
				List<CodePO> codeList = null;
				if (context.containsKey(codeType)) {
					codeList = context.get(codeType);
				} else {
					codeList = new ArrayList<CodePO>();
				}
				codeList.add(codePO);
				context.put(codeType, codeList);
			}
		} catch (Exception e) {
			LogUtils.error("重新载入系统编码错误,系统将自动回滚!", e);
			context = temp;
		} finally {
			codeDAO.close();
		}

	}

	/**
	 * 根据系统编码类型的CODE获取一组编码的值,如果不存在此编码类型的值则返回null
	 * 
	 * @param type 系统编码类型的CODE
	 * @return 由CodePO组成的数组对象
	 */
	public static CodePO[] getCodes(String type) {
		CodePO[] codes = null;
		type = type.toUpperCase();
		if (context.containsKey(type)) {
			List<CodePO> codeList = context.get(type);
			codes = new CodePO[] {};
			codes = codeList.toArray(codes);
		}
		return codes;
	}

	/**
	 * 根据系统编码类型的CODE获取一组编码的值,如果不存在此编码类型的值则返回一个长度为0的list
	 * 
	 * @param type 系统编码类型的CODE
	 * @return 
	 *         由Map组成的数组对象，各位为[{name:name1,value:value1},{name:name2,value:value2
	 *         }]
	 */
	public static List<Map<String, String>> getCodeList(String type) {
		List<Map<String, String>> rtnList = new ArrayList<Map<String, String>>();
		type = type.toUpperCase();
		if (context.containsKey(type)) {
			List<CodePO> codeList = context.get(type);
			for (CodePO code : codeList) {
				Map<String, String> map = new HashMap<String, String>();
				map.put("name", code.getCodeName());
				map.put("value", code.getCodeValue());
				rtnList.add(map);
			}
		}
		return rtnList;
	}

	/**
	 * 根据编码类型和编码值获取相对应的名称值,如果不存在则返回null
	 * 
	 * @param type 编码类型
	 * @param value 编码值
	 * @return 编码名称值
	 */
	public static String getName(String type, String value) {
		String name = null;
		type = type.toUpperCase();
		if (StringUtils.isNotEmpty(type) && StringUtils.isNotEmpty(value) && context.containsKey(type)) {
			List<CodePO> codeList = context.get(type);
			for (CodePO code : codeList) {
				if (StringUtils.isNotEmpty(code.getCodeValue()) && code.getCodeValue().equals(value)) {
					name = code.getCodeName();
					break;
				}
			}
		}
		return name;
	}

	/**
	 * 根据编码类型和编码名称获取相对应的编码值,如果不存在则返回null
	 * 
	 * @param type 编码类型
	 * @param value 编码名称
	 * @return 编码值
	 */
	public static String getValue(String type, String name) {
		String value = null;
		type = type.toUpperCase();
		if (StringUtils.isNotEmpty(type) && StringUtils.isNotEmpty(name) && context.containsKey(type)) {
			List<CodePO> codeList = context.get(type);
			for (CodePO code : codeList) {
				if (StringUtils.isNotEmpty(code.getCodeName()) && code.getCodeName().equals(name)) {
					value = code.getCodeValue();
					break;
				}
			}
		}
		return value;
	}

	/**
	 * 将内存中所有的编码信息清空
	 */
	public static void clear() {
		context.clear();
	}
}
