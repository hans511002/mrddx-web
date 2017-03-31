package com.ery.hadoop.hq.utils;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.DecimalFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.ery.base.support.jdbc.BinaryStream;

/**
 * String类型的工具类
 * 

 *             reserved.

 * @createDate 2013-1-14
 * @version v1.0
 */
public class StringUtil {
	public static final String DATE_FORMAT_TYPE1 = "yyyy-MM-dd HH:mm:ss";
	public static final String DATE_FORMAT_TYPE2 = "yyyyMMddHHmmss";
	public static final String DATE_FORMAT_TYPE3 = "yyyy/MM/dd HH:mm:ss";
	public static final String DATE_FORMAT_TYPE4 = "yyyy-MM-dd";
	public static final String DATE_FORMAT_TYPE5 = "HH:mm:ss";
	public static final String DOUBLE_FORMAT_pattern1 = "0";
	public static final String DOUBLE_FORMAT_pattern2 = "0.0";
	public static final String DOUBLE_FORMAT_pattern3 = "0.00";
	public static final String DOUBLE_FORMAT_pattern4 = "#,##0";
	public static final String DOUBLE_FORMAT_pattern5 = "#,##0.0";
	public static final String DOUBLE_FORMAT_pattern6 = "#,##0.00";
	public static final Pattern macroPattern = Pattern.compile("\\{(\\w+)\\}");

	/**
	 * String类型和数字类型比较
	 * 
	 * @param obj1
	 *            对象1
	 * @param obj2
	 *            对象2
	 * @return 返回最大值
	 */
	public static final Object getBigObject(Object obj1, Object obj2) {
		if (null == obj1 && null == obj2) {
			return null;
		}

		if (null != obj1 && null == obj2) {
			return obj1;
		}

		if (null == obj1 && null != obj2) {
			return obj2;
		}

		try {
			if (Double.parseDouble((String) obj1.toString()) > Double.parseDouble((String) obj2.toString())) {
				return obj1;
			} else {
				return obj2;
			}
		} catch (Exception e) {
		}

		// string比较
		if (obj1.toString().compareTo(obj2.toString()) > 0) {
			return obj1;
		} else {
			return obj2;
		}
	}

	/**
	 * String类型和数字类型比较：返回最小值
	 * 
	 * @param obj1
	 *            对象1
	 * @param obj2
	 *            对象2
	 * @return 返回最大值
	 */
	public static final Object getSmallObject(Object obj1, Object obj2) {
		if (null == obj1 && null == obj2) {
			return null;
		}

		if (null != obj1 && null == obj2) {
			return obj1;
		}

		if (null == obj1 && null != obj2) {
			return obj2;
		}

		try {
			if (Double.parseDouble((String) obj1.toString()) > Double.parseDouble((String) obj2.toString())) {
				return obj2;
			} else {
				return obj1;
			}
		} catch (Exception e) {
		}

		// string比较
		if (obj1.toString().compareTo(obj2.toString()) > 0) {
			return obj2;
		} else {
			return obj1;
		}
	}

	public static final String objectToString(Object obj, String defaultValue) {
		if (null == obj) {
			return defaultValue;
		}
		return obj.toString();
	}

	/**
	 * 将String转为int
	 * 
	 * @param obj
	 *            对象
	 * @return int
	 */
	public static final int objectToInt(Object obj) {
		if (null == obj) {
			return 0;
		}
		try {
			if (obj instanceof String) {
				return Integer.parseInt((String) obj);
			} else if (obj instanceof Integer) {
				return (Integer) obj;
			}
		} catch (Exception e) {
			return 0;
		}
		return 0;
	}

	/**
	 * 将String转为int
	 * 
	 * @param obj
	 *            对象
	 * @return int
	 */
	public static final int objectToInt(Object obj, int defaultValue) {
		if (null == obj) {
			return defaultValue;
		}
		try {
			if (obj instanceof String) {
				return Integer.parseInt((String) obj);
			} else if (obj instanceof Integer) {
				return (Integer) obj;
			} else {
				return Integer.parseInt(obj.toString());
			}
		} catch (Exception e) {
			return defaultValue;
		}
	}

	/**
	 * 将String转为double
	 * 
	 * @param obj
	 *            对象
	 * @return double
	 */
	public static final double stringToDouble(Object obj) {
		try {
			if (obj instanceof String) {
				return Double.parseDouble((String) obj);
			}
		} catch (Exception e) {
			return 0.0;
		}
		return 0.0;
	}

	/**
	 * 将String转为double
	 * 
	 * @param obj
	 *            对象
	 * @return double
	 */
	public static final double stringToDouble(Object obj, int defaultValue) {
		try {
			if (obj instanceof String) {
				return Double.parseDouble((String) obj);
			}
		} catch (Exception e) {
			return defaultValue;
		}
		return defaultValue;
	}

	/**
	 * 将String转为int
	 * 
	 * @param obj
	 *            对象
	 * @param defaultValue
	 *            默认值
	 * @return int
	 */
	public static final int stringToInt(String obj, int defaultValue) {
		try {
			return Integer.parseInt(obj);
		} catch (Exception e) {
			return defaultValue;
		}
	}

	public static final long stringToLong(String obj, long defaultValue) {
		try {
			return Long.parseLong(obj);
		} catch (Exception e) {
			return defaultValue;
		}
	}

	public static final long objectToLong(Object obj, long defaultValue) {
		if (obj == null) {
			return defaultValue;
		}
		try {
			return Long.parseLong(obj.toString());
		} catch (Exception e) {
			return defaultValue;
		}
	}

	public static final double objectToDouble(Object obj) {
		try {
			return Double.parseDouble(obj.toString());
		} catch (Exception e) {
			return 0.0;
		}
	}

	/**
	 * 获取时分秒的long型
	 * 
	 * @param mintime
	 *            时间(毫秒)
	 * @return 时分秒的long型
	 * @throws ParseException
	 *             异常
	 */
	public static long getTime(long mintime) throws ParseException {
		Date nowTime = new Date(mintime);
		SimpleDateFormat sdFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String time = sdFormatter.format(nowTime);
		long tims = sdFormatter.parse(time).getTime();
		return tims / 1000;
	}

	/**
	 * 获取月份(yyyyMM)
	 * 
	 * @param date
	 *            日期
	 * @return 月份
	 * @throws ParseException
	 */
	public static String getMonthNo(Date date) throws ParseException {
		SimpleDateFormat sdFormatter = new SimpleDateFormat("yyyyMM");
		return sdFormatter.format(date);
	}

	/**
	 * 获取天(yyyyMMdd)
	 * 
	 * @param date
	 *            日期
	 * @return 天
	 * @throws ParseException
	 *             异常
	 */
	public static String getDateNo(Date date) throws ParseException {
		SimpleDateFormat sdFormatter = new SimpleDateFormat("yyyyMMdd");
		return sdFormatter.format(date);
	}

	/**
	 * 将double转为自定格式的字符串
	 * 
	 * @param d
	 *            double
	 * @return string
	 */
	public static final String doubleToString(Double d, String format) {
		DecimalFormat df = new DecimalFormat(format);
		return df.format(d);
	}

	/**
	 * date类型转换为String类型
	 * 
	 * @param data
	 *            Date类型的时间
	 * @param formatType
	 *            formatType格式为yyyy-MM-dd HH:mm:ss//yyyy年MM月dd日 HH时mm分ss秒
	 * @return String
	 */
	public static String dateToString(Date data, String formatType) {
		if (null == data) {
			return "";
		}

		return new SimpleDateFormat(formatType).format(data);
	}

	/**
	 * date类型转换为String类型
	 * 
	 * @param data
	 *            Date类型的时间
	 * @param formatType
	 *            formatType格式为yyyy-MM-dd HH:mm:ss//yyyy年MM月dd日 HH时mm分ss秒
	 * @return String
	 */
	public static long stringToLong(String date, String formatType, long defaultvalue) {
		if (null == date || date.trim().length() <= 0) {
			return defaultvalue;
		}

		long time = defaultvalue;
		try {
			Date d = stringToDate(date, formatType);
			time = dateToLong(d);
		} catch (Exception e) {
			e.printStackTrace();
		}
		return time;
	}

	/**
	 * date类型转换为String类型
	 * 
	 * @param data
	 *            Date类型的时间
	 * @param formatType
	 *            formatType格式为yyyy-MM-dd HH:mm:ss//yyyy年MM月dd日 HH时mm分ss秒
	 * @return String
	 */
	public static String ObjectToString(Object data, String formatType) {
		if (null == data) {
			return "";
		}

		return new SimpleDateFormat(formatType).format(data);
	}

	/**
	 * ong类型转换为String类型
	 * 
	 * @param currentTime
	 *            要转换的long类型的时间
	 * @param formatType
	 *            要转换的string类型的时间格式
	 * @return String
	 * @throws ParseException
	 *             异常
	 */
	public static String longToString(long currentTime, String formatType) throws ParseException {
		Date date = longToDate(currentTime, formatType); // long类型转成Date类型
		String strTime = dateToString(date, formatType); // date类型转成String
		return strTime;
	}

	/**
	 * string类型转换为date类型
	 * 
	 * @param strTime要转换的string类型的时间
	 *            ，
	 * @param formatType要转换的格式yyyy
	 *            -MM-dd HH:mm:ss//yyyy年MM月dd日 HH时mm分ss秒，
	 *            strTime的时间格式必须要与formatType的时间格式相同
	 * @return date
	 * @throws ParseException
	 */
	public static Date stringToDate(String strTime, String formatType) throws ParseException {
		SimpleDateFormat formatter = new SimpleDateFormat(formatType);
		Date date = null;
		date = formatter.parse(strTime);
		return date;
	}

	/**
	 * long转换为Date类型
	 * 
	 * @param currentTime要转换的long类型的时间
	 * @param formatType要转换的时间格式yyyy
	 *            -MM-dd HH:mm:ss//yyyy年MM月dd日 HH时mm分ss秒
	 * @return date
	 * @throws ParseException
	 *             异常
	 */
	public static Date longToDate(long currentTime, String formatType) throws ParseException {
		Date dateOld = new Date(currentTime); // 根据long类型的毫秒数生命一个date类型的时间
		String sDateTime = dateToString(dateOld, formatType); // 把date类型的时间转换为string
		Date date = stringToDate(sDateTime, formatType); // 把String类型转换为Date类型
		return date;
	}

	/**
	 * string类型转换为long类型
	 * 
	 * @param strTime要转换的String类型的时间
	 * @param formatType时间格式
	 *            ,strTime的时间格式和formatType的时间格式必须相同
	 * @return long
	 * @throws ParseException
	 *             异常
	 */
	public static long stringToLong(String strTime, String formatType) throws ParseException {
		Date date = stringToDate(strTime, formatType); // String类型转成date类型
		if (date == null) {
			return 0;
		} else {
			long currentTime = dateToLong(date); // date类型转成long类型
			return currentTime;
		}
	}

	// date类型转换为long类型
	// date要转换的date类型的时间
	public static long dateToLong(Date date) {
		return date.getTime();
	}

	// date类型转换为long类型
	// date要转换的date类型的时间
	public static long dateToLong(Date date, String formatType) {
		SimpleDateFormat df = new SimpleDateFormat(formatType);// 设置日期格式
		String s = df.format(date);// new Date()为获取当前系统时间
		long l = stringToLong(s, formatType, -1);
		return l;
	}

	/**
	 * 转义正则表达则特殊字符
	 * 
	 * @param splitChar
	 *            字符
	 * @return 特殊字符
	 */
	public static String parseSpecialChar(String splitChar) {
		String res = splitChar;
		if (res.indexOf("|") >= 0) {
			res = res.replaceAll("\\|", "\\|");
		}
		if (res.indexOf("~") >= 0) {
			res = res.replaceAll("\\~", "\\~");
		}
		if (res.indexOf("^") >= 0) {
			res = res.replaceAll("\\^", "\\^");
		}
		if (res.indexOf("[") >= 0) {
			res = res.replaceAll("\\[", "\\[");
		}
		if (res.indexOf("]") >= 0) {
			res = res.replaceAll("\\]", "\\]");
		}
		if (res.indexOf("{") >= 0) {
			res = res.replaceAll("\\{", "\\{");
		}
		if (res.indexOf("}") >= 0) {
			res = res.replaceAll("\\}", "\\}");
		}
		if (res.indexOf("(") >= 0) {
			res = res.replaceAll("\\(", "\\(");
		}
		if (res.indexOf(")") >= 0) {
			res = res.replaceAll("\\)", "\\)");
		}
		return res;
	}

	/**
	 * 将long数组转为字符串数组
	 * 
	 * @param values
	 *            long数组
	 * @return 字符串数组
	 */
	public static String[] valueOfLongToString(long[] values) {
		String reValue[] = new String[values.length];
		for (int i = 0; i < values.length; i++) {
			reValue[i] = String.valueOf(values[i]);
		}

		return reValue;
	}

	/**
	 * 将字符串数组转为long数组
	 * 
	 * @param values
	 *            字符串数组
	 * @return long数组
	 */
	public static long[] valueOfStringToLong(String[] values) {
		if (null == values) {
			return new long[0];
		}

		long reValue[] = new long[values.length];
		for (int i = 0; i < values.length; i++) {
			try {
				reValue[i] = Long.parseLong(values[i]);
			} catch (Exception e) {
				reValue[i] = -1;
			}
		}

		return reValue;
	}

	/**
	 * 将String数组转为为hashmap 例如： a1:12,c1:32,f3:dd 转为 [key=a1,value=12
	 * key=c1,value=32 key=f3,value=dd]
	 * 
	 * @param values
	 *            字符串
	 * @param perSig
	 *            分隔符
	 * @param subSig
	 *            子分隔符
	 * @return 分割后的列表
	 */
	public static Map<String, String> valueOfStringToHashMap(String value, String perSig, String subSig) {
		if (null == value || null == perSig || null == subSig) {
			return null;
		}

		Map<String, String> hashMap = new HashMap<String, String>();
		String keyValue[] = value.split(perSig);
		for (int i = 0; i < keyValue.length; i++) {
			String kv[] = keyValue[i].split(subSig);
			if (kv.length == 2 && null != kv[0] && null != kv[1]) {
				hashMap.put(kv[0], kv[1]);
			}
		}

		return hashMap;
	}

	/**
	 * 拼接字符串数组
	 * 
	 * @param content
	 *            字符串数组
	 * @param sign
	 *            分隔符
	 * @return 拼接后的字符串
	 */
	public static String toString(String[] content, String sign) {
		if (null == content) {
			return null;
		}

		sign = null == sign ? "," : sign;
		StringBuilder strBuilder = new StringBuilder();
		for (int i = 0; i < content.length; i++) {
			strBuilder.append(content[i]);
			if (i < content.length - 1) {
				strBuilder.append(sign);
			}
		}

		return strBuilder.toString();
	}

	/**
	 * 获取异常日志内容
	 * 
	 * @param e
	 *            异常
	 * @return 异常内容
	 */
	public static String stringifyException(Throwable e) {
		StringWriter stm = new StringWriter();
		PrintWriter wrt = new PrintWriter(stm);
		e.printStackTrace(wrt);
		wrt.close();
		return stm.toString();
	}

	/**
	 * 截取查询sql语句 例如: select * from t_user where a=1; 返回'select * from'
	 * 
	 * @param sql
	 *            sql语句
	 * @return 截取的语句
	 */
	public static String subSqlSelectToFrom(String sql) {
		if (null == sql || sql.trim().length() <= 0) {
			return null;
		}

		String tmp = sql.trim().toUpperCase();
		int selectIndex = tmp.indexOf("SELECT");
		int fromIndex = tmp.indexOf("FROM");
		if (selectIndex <= -1 || fromIndex <= 7) {
			return sql = null;
		} else {
			return sql = sql.substring(selectIndex, fromIndex + 4);
		}
	}

	/**
	 * 将list转换为String
	 * 
	 * @param lstContent
	 *            字符串列表
	 * @param sign
	 *            分隔符
	 * @return 拼接后的字符串
	 */
	public static String parseListToString(List<?> lstContent, String sign) {
		StringBuilder strBuilder = new StringBuilder();
		for (int i = 0; i < lstContent.size(); i++) {
			Object obj = lstContent.get(i);
			if (null == obj) {
				strBuilder.append("null");
			} else {
				strBuilder.append(obj.toString());
			}

			if (i != lstContent.size() - 1) {
				strBuilder.append(sign);
			}
		}

		return strBuilder.toString();
	}

	/**
	 * 将String数组转为Set集合
	 * 
	 * @param value
	 *            String数组
	 * @return set集合
	 */
	public static Set<String> parseStringArrayToSet(String[] value) {
		Set<String> set = new HashSet<String>();
		Collections.addAll(set, value);
		return set;
	}

	/**
	 * 将空格( )替换为下划线(_)
	 * 
	 * @param value
	 *            字符串
	 * @return 替换后的字符串
	 */
	public static String changeBlankToUnderline(String value) {
		if (null == value || value.trim().length() <= 0) {
			return "";
		}

		return value.replaceAll(" ", "_");
	}

	/**
	 * 获取唯一号码
	 * 
	 * @return uuid的前10位拼接上当前时间的毫秒数，再加密后的取前10位
	 * @throws NoSuchAlgorithmException
	 *             异常
	 */
	public static String getUniqueId() {
		UUID uuid = UUID.randomUUID();
		MessageDigest md5;
		try {
			md5 = MessageDigest.getInstance("MD5");
			md5.update((uuid.toString() + System.currentTimeMillis()).getBytes());
			return byte2hex(md5.digest()).substring(0, 10);
		} catch (NoSuchAlgorithmException e) {
			e.printStackTrace();
		}

		return uuid.toString().substring(0, 10);
	}

	/**
	 * 字节数组转为字符串
	 * 
	 * @param b
	 *            字节数组
	 * @return 字符串
	 */
	private static String byte2hex(byte[] b) // 二行制转字符串
	{
		String hs = "";
		String stmp = "";
		for (int n = 0; n < b.length; n++) {
			stmp = (java.lang.Integer.toHexString(b[n] & 0XFF));
			if (stmp.length() == 1) {
				hs = hs + "0" + stmp;
			} else {
				hs = hs + stmp;
			}
		}
		return hs.toUpperCase();
	}

	/**
	 * 将String数组转为大写
	 * 
	 * @param value
	 * @return
	 */
	public static String[] changeStringArrayToUpper(String[] value) {
		if (null == value) {
			return null;
		}
		String[] tmp = new String[value.length];
		for (int i = 0; i < value.length; i++) {
			if (null == value[i]) {
				tmp[i] = null;
				continue;
			}
			tmp[i] = value[i].toUpperCase();
		}

		return tmp;
	}

	/**
	 * 判断是否为数字
	 * 
	 * @param str
	 *            字符串对象
	 * @return double
	 */
	public static boolean isNum(String str) {
		if (null == str || str.trim().length() <= 0) {
			return false;
		}
		return str.matches("^[-+]?(([0-9]+)([.]([0-9]+))?|([.]([0-9]+))?)$");
	}

	/**
	 * 判断是否为数字
	 * 
	 * @param str
	 *            字符串对象
	 * @return double
	 */
	public static boolean isIncludeMacroVariable(String value) {
		if (null == value || value.trim().length() <= 0) {
			return false;
		}
		return value.matches("(.*?)\\{(.*?)\\}(.*?)");
	}

	/**
	 * 替换宏变量
	 * 
	 * @param value
	 * @param simpleMap
	 * @return
	 */
	public static String replaceMacroVariable(String value, Map<String, Object> simpleMap) {
		if (null == value || value.trim().length() <= 0 || !isIncludeMacroVariable(value)) {
			return null;
		}
		String result = "";
		String valArray[] = value.split(":");
		switch (valArray.length) {
		case 1:// 单个字段的替换 1、单个字段，分区表名规则为：test_{a}; 替换后的表名为：test_10023
			result = valArray[0];
			Matcher m = macroPattern.matcher(result);
			while (m.find()) {// 查找宏变量
				String mac = m.group(0);
				Object obj = simpleMap.get(undock(mac));
				if (null != obj) {
					result = result.replaceAll("\\{" + undock(mac) + "\\}", obj.toString());
				}
			}
			break;
		default:
			if (valArray.length == 1) {
				return valArray[0];
			}
			result = valArray[0];
			for (int i = 1; i < valArray.length; i++) {
				String temp[] = valArray[i].split("-");
				if (temp.length == 1) {// 多个字段的替换
										// 2、多个字段组合，分区表名规则为：test_$1$2:{a}:{c};
										// 替换后的表名为：test_10023CNG
					Object obj = simpleMap.get(undock(temp[0]));
					result = result.replaceAll("\\$" + i, null == obj ? "" : obj.toString());
				} else if (temp.length == 2) {// 一个或多个字段的区间替换
												// 3、多个字段，每个字段取区间值,分区表名规则为：test_$1$2:{a}-{4,6}:{b}-{6,12};
												// 替换后的表名为：test_23201401
					Object obj = simpleMap.get(undock(temp[0]));
					Object region = undock(temp[1]);
					if (region == null || obj == null) {
						continue;
					}
					String idex[] = region.toString().split(",");
					if (idex.length != 2) {
						continue;
					}
					int begin = objectToInt(idex[0], -1) - 1;
					int end = objectToInt(idex[1], -1) - 1;
					if (begin == -1 || begin == -1 || begin >= end || obj.toString().length() <= end) {
						continue;
					}
					result = result.replaceAll("\\$" + i,
							obj.toString().substring(begin, end) + obj.toString().charAt(end));
				}
			}
			break;
		}
		return result;
	}

	public static String undock(String kvarry) {
		if (null != kvarry && kvarry.startsWith("{") && kvarry.endsWith("}")) {
			return kvarry = kvarry.substring(1, kvarry.length() - 1);
		} else {
			return kvarry;
		}
	}

	public static String convertBLOBtoString(oracle.sql.BLOB BlobContent) {
		byte[] msgContent = BlobContent.getBytes(); // BLOB转换为字节数组

		byte[] bytes; // BLOB临时存储字节数组
		String newStr = ""; // 返回字符串
		int i = 1; // 循环变量
		long BlobLength; // BLOB字段长度
		try {
			BlobLength = BlobContent.length(); // 获取BLOB长度
			if (msgContent == null || BlobLength == 0) // 如果为空，返回空值
			{
				return "";
			} else // 处理BLOB为字符串
			{
				while (i < BlobLength) // 循环处理字符串转换，每次1024；Oracle字符串限制最大4k
				{
					bytes = BlobContent.getBytes(i, 1024);
					i = i + 1024;
					newStr = newStr + new String(bytes, "utf-8");
				}
				return newStr;
			}
		} catch (Exception e) // oracle异常捕获
		{
			e.printStackTrace();
		}
		return newStr;
	}

	public static BinaryStream convertStringtoBinaryStream(Object pluginCode) {
		BinaryStream bs = new BinaryStream();
		InputStream in_nocod;
		try {
			in_nocod = new ByteArrayInputStream(pluginCode.toString().getBytes("UTF-8"));
		} catch (UnsupportedEncodingException e) {
			in_nocod = new ByteArrayInputStream(pluginCode.toString().getBytes());
		}
		bs.setInputStream(in_nocod);
		return bs;
	}

	public static String getDoublePoint(double value, String sign) {
		return subZeroAndDot(new DecimalFormat(sign).format(value).toString());
	}

	/**
	 * 使用java正则表达式去掉多余的.与0
	 * 
	 * @param s
	 * @return
	 */
	public static String subZeroAndDot(String s) {
		if (s.indexOf(".") > 0) {
			s = s.replaceAll("0+?$", "");// 去掉多余的0
			s = s.replaceAll("[.]$", "");// 如最后一位是.则去掉
		}
		return s;
	}
}
