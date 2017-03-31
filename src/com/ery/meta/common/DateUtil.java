/**
 * @文件名: DataUtil.java
 * @包 com.ery.meta.common
 * @描述:

 * @创建日期 2012-2-23 下午03:39:14
 *
 */

package com.ery.meta.common;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;

import com.ery.base.support.utils.StringUtils;

/**
 */

public class DateUtil {
	public static void main(String[] agrs) {
		// System.out.println(getWeekByDay("20120106", "yyyyMMdd"));
		// String str = "20130101";
		// Date tDate = getDateTimeByString(str, "yyyyMMdd");
		// System.out.println(getFirstMonthDay(tDate));
		// System.out.println(getLastMonthDay(tDate));
		List<String> lstT = getDataArrByMonth("201402");
		for (int i = 0; i < lstT.size(); i++) {
			System.out.println(lstT.get(i));
		}
		// List a1=new ArrayList();
		// Map map1=new HashMap();
		// map1.put("1", new int[]{1,2});
		// a1.add(map1);
		//
		// List a2=new ArrayList();
		// Map map2=new HashMap();
		// map2.put("1", new int[]{1,2});
		// a2.add(map2);
		// System.out.println(a1.equals(a2));
		// System.out.println(getParamDay("2012-04-07 11:40:00","yyyyMMddHHmmss"));
		// System.out.println("{MONTH_NO}".replaceAll("\\{MONTH_NO\\}",
		// "2012"));
		// Calendar c = Calendar.getInstance();
		// int week = c.get(Calendar.WEEK_OF_YEAR);//获取是本月的第几周
		// int day = c.get(Calendar.DAY_OF_WEEK);//获致是本周的第几天地, 1代表星期天...7代表星期六
		// System.out.println("今天是本月的第" + Calendar.YEAR + "周");
		// System.out.println("今天是星期" + weeks[day-1]);

		// Date date=getDateTimeByString("20120202","yyyyMMdd");
		// System.out.print(DateUtil.format(getLastMonthDay(date),"yyyy-MM-dd"));

		// String s[] = getCurrentWeekDays("yyyy-MM-dd");
		// System.out.println("星期一："+s[0]);
		// System.out.println("现在："+s[1]);
		// String s[] = getCurrentMonthDays("yyyy-MM-dd");
		// System.out.println("1号：" + s[0]);
		// System.out.println("现在：" + s[1]);
	}

	/**
	 * 通过传入的时间字符串转换成日期格式
	 * 
	 * @param date
	 *            时间字符串
	 * @param dateFormat
	 *            格式
	 * @return
	 */
	public static Date getDateTimeByString(String date, String dateFormat) {
		try {
			if (dateFormat.indexOf("-") == -1)
				date = date.replaceAll("-", "");
			if (dateFormat.indexOf(":") == -1)
				date = date.replaceAll(":", "");
			if (dateFormat.indexOf(" ") == -1)
				date = date.replaceAll(" ", "");
			SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);
			Date dateTime = null;
			dateTime = sdf.parse(date);
			return dateTime;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}
	}

	/**
	 * @param dateFormat
	 *            格式化格式
	 * @return String
	 * @throws
	 * @Title: getParamDay
	 * @Description:
	 * @@param day 传入的日期
	 */
	public static String getParamDay(String day, String dateFormat) {
		if (dateFormat.indexOf("-") == -1)
			day = day.replaceAll("-", "");
		if (dateFormat.indexOf(":") == -1)
			day = day.replaceAll(":", "");
		if (dateFormat.indexOf(" ") == -1)
			day = day.replaceAll(" ", "");
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		String str = "";
		try {
			Date date = sdf.parse(day);
			str = sdf.format(date);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return str;
	}

	/**
	 * @param dateFormat
	 * @return String
	 * @throws
	 * @Title: getCurrentDay
	 * @Description: 获取当前日期
	 */
	public static String getCurrentDay(String dateFormat) {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		// 获取当前日期
		String nowDay = sdf.format(c.getTime());
		return nowDay;
	}

	public static String format(Date date, String dateFormat) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		String nowDay = sdf.format(date);
		return nowDay;
	}

	/**
	 * @param @param dateFormat
	 * @return String[]0:1号日期；1：当前日期
	 * @throws
	 * @Title: getCurrentMonthDays
	 * @Description: 获取当前时间所在月的1号日期与当前日期
	 */
	public static String[] getCurrentMonthDays(String dateFormat) {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		// 获取当前日期
		String nowDay = sdf.format(c.getTime());
		// 获取本月的1号
		String sday = "";
		if (dateFormat.indexOf("-") != -1)
			sday = nowDay.substring(0, 8) + "01";
		else
			sday = nowDay.substring(0, 6) + "01";
		// 保存
		String[] res = new String[] { sday, nowDay };
		return res;
	}

	/**
	 * @param dateFormat日期格式化
	 * @return String[]0：星期一日期；1：当前日期
	 * @throws
	 * @Title: getCurrentWeekDays
	 * @Description: 获取当前日期所在周的星期一与当前日期
	 */
	public static String[] getCurrentWeekDays(String dateFormat) {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());

		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		// 获取当前日期
		String nowDay = sdf.format(c.getTime());
		// 获取星期一的日期
		String monday = getConstraintWeekMonday(dateFormat, nowDay);
		// 保存
		String[] res = new String[] { monday, nowDay };
		return res;
	}

	/**
	 * @param dateFormat
	 * @param @param day
	 * @return String
	 * @throws
	 * @Title: getConstraintWeekMonday
	 * @Description: 获取当前日期所在周的星期一日期
	 */
	public static String getConstraintWeekMonday(String dateFormat, String day) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(day));
		} catch (ParseException e) {
			e.printStackTrace();
		}
		int mondayPlus = getConstraintMondayPlus(dateFormat, day);
		c.add(Calendar.DATE, mondayPlus);
		Date monday = c.getTime();

		String preMonday = sdf.format(monday);
		return preMonday;
	}

	private static int getConstraintMondayPlus(String dateFormat, String day) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(day));
		} catch (ParseException e) {
			e.printStackTrace();
		}
		// 获得今天是一周的第几天，星期日是第一天，星期一是第二天......
		int dayOfWeek = c.get(Calendar.DAY_OF_WEEK) - 1; // 因为按中国礼拜一作为第一天所以这里减1
		if (dayOfWeek <= 1) {
			return 0;
		} else {
			return 1 - dayOfWeek;
		}
	}

	/**
	 * 获取指定日期所处月份的最后一天
	 * 
	 * @param date
	 * @return
	 */
	public static Date getLastMonthDay(Date date) {
		Calendar calendar = new GregorianCalendar();
		calendar.setTime(date);
		calendar.set(Calendar.DATE, calendar.getActualMaximum(Calendar.DATE));
		return calendar.getTime();
	}

	/**
	 * @param value
	 *            当前年值
	 * @param calValue
	 *            计算值
	 * @return String
	 * @throws
	 * @Title: getYearValue
	 * @Description: 根据计算值，计算年值
	 */
	public static String getYearValue(String value, String calValue) {
		int year = Integer.valueOf(value);
		if (StringUtils.isEmpty(calValue))
			calValue = "0";
		return "" + (year + Integer.valueOf(calValue));
	}

	/**
	 * @param value
	 *            当前年值
	 * @param calValue
	 *            计算值
	 * @param dateFormat
	 *            格式化必须是到天，比如：yyyy-MM-dd 或 yyyyMMdd
	 * @return String
	 * @throws
	 * @Title: getMothValue
	 * @Description: 根据计算值，计算月值
	 */
	public static String getMothValue(String value, String calValue, String dateFormat) {
		if (StringUtils.isEmpty(calValue))
			calValue = "0";
		String res = "";
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		if (dateFormat.indexOf("-") != -1 && value.length() == 7)
			value = value + "-01";
		if (dateFormat.indexOf("-") == -1 && value.length() == 6)
			value = value + "01";
		Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(value));
			c.add(Calendar.MONTH, Integer.valueOf(calValue));
			res = sdf.format(c.getTime());
			if (value.length() == 7)
				res = res.substring(0, 7);
			if (value.length() == 6)
				res = res.substring(0, 6);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return res;
	}

	/**
	 * @param value
	 *            当前年值
	 * @param calValue
	 *            计算值
	 * @param dateFormat
	 *            格式化必须是到天，比如：yyyy-MM-dd 或 yyyyMMdd
	 * @return String
	 * @throws
	 * @Title: getWeekValue
	 * @Description: 根据计算值，计算月值
	 */
	public static String getWeekValue(String value, String calValue, String dateFormat) {
		return null;
	}

	/**
	 * @param value
	 *            当前年值
	 * @param calValue
	 *            计算值
	 * @param dateFormat
	 *            格式化必须是到天，比如：yyyy-MM-dd 或 yyyyMMdd
	 * @return String
	 * @throws
	 * @Title: getDayValue
	 * @Description: 根据计算值，计算月值
	 */
	public static String getDayValue(String value, String calValue, String dateFormat) {
		if (StringUtils.isEmpty(calValue))
			calValue = "0";
		if (dateFormat.indexOf("-") == -1)
			value = value.replaceAll("-", "");
		else {
			if (value.indexOf("-") == -1)
				value = value.substring(0, 4) + "-" + value.substring(4, 6) + "-" + value.substring(6, 8);
		}
		String res = "";
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(value));
			c.add(Calendar.DATE, Integer.valueOf(calValue));
			res = sdf.format(c.getTime());
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return res;
	}

	/**
	 * 根据日期值获取其所属的某一周值，比如20120101属于201201周
	 * 
	 * @param day
	 * @param format
	 * @return
	 */
	public static String getWeekByDay(String day, String dateFormat) {
		SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);// 可以方便地修改日期格式
		Calendar c = Calendar.getInstance();
		try {
			c.setTime(sdf.parse(day));
			int week = c.get(Calendar.WEEK_OF_YEAR);
			String res = c.get(Calendar.YEAR) + "" + (week < 10 ? ("0" + week) : week);
			return res;
		} catch (ParseException e) {
			e.printStackTrace();
		}
		return "";
	}

	/**
	 * 获取当前周
	 * 
	 * @return
	 */
	public static String getCurrentWeekByDay() {
		Calendar c = Calendar.getInstance();
		c.setTime(new Date());
		int week = c.get(Calendar.WEEK_OF_YEAR);
		String res = c.get(Calendar.YEAR) + "" + (week < 10 ? ("0" + week) : week);
		return res;
	}

	/**
	 * @param ptime
	 *            减数
	 * @param stime
	 *            被减数
	 * @return long 分钟
	 * @throws
	 * @Title: calTimeDiffBakMinutes
	 * @Description: 计算两个时间差(注意时间格式到秒)
	 */
	public static long calTimeDiffBakMinutes(String ptime, String stime) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		ptime = ptime.replaceAll("-", "");
		ptime = ptime.replaceAll(":", "");
		ptime = ptime.replaceAll(" ", "");

		stime = stime.replaceAll("-", "");
		stime = stime.replaceAll(":", "");
		stime = stime.replaceAll(" ", "");
		long div = 1000 * 60 * 60 * 24;
		try {
			long diff = sdf.parse(stime).getTime() - sdf.parse(ptime).getTime();
			long day = diff / div;
			long hour = (diff / (60 * 60 * 1000) - day * 24);
			long min = ((diff / (60 * 1000)) - day * 24 * 60 - hour * 60);
			return min;
		} catch (ParseException e) {
			e.printStackTrace();
			return -1;
		}
	}

	/**
	 * @param time
	 * @return boolean
	 * @throws
	 * @Title: judTimeIsSameWeek
	 * @Description: 判断参数时间与现在时间是否同周
	 */
	public static boolean judTimeIsSameWeek(String time) {
		Calendar cd = Calendar.getInstance();
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		time = time.replaceAll("-", "");
		time = time.replaceAll(":", "");
		time = time.replaceAll(" ", "");
		while (14 - time.length() > 0) {
			time = time + "0";
		}
		// System.out.println(time);
		// 现在时间
		cd.setTime(new Date());
		// 现在周值
		int nowWeekNum = cd.get(Calendar.DAY_OF_WEEK);
		// 参数周值
		int paraWeekNum = -1;
		try {
			// 参数时间
			cd.setTime(sdf.parse(time));
			paraWeekNum = cd.get(Calendar.DAY_OF_WEEK);
		} catch (ParseException e) {
			e.printStackTrace();
		}
		if (nowWeekNum == paraWeekNum)
			return true;
		else
			return false;
	}

	/**
	 * @param time
	 * @return int
	 * @throws
	 * @Title: calMonthDiff
	 * @Description: 计算参数时间与现在时间的月份数差值
	 */
	public static int calMonthDiff(String time) {
		Calendar cd = Calendar.getInstance();
		time = time.replaceAll("-", "");
		time = time.replaceAll(":", "");
		time = time.replaceAll(" ", "");
		if (time.length() > 6)
			time = time.substring(0, 6);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMM");
		// 现在时间
		cd.setTime(new Date());
		String nowTime = sdf.format(cd.getTime());
		int nowMonth = Integer.valueOf(nowTime.substring(4, 6));
		// 参数
		int paraMonth = Integer.valueOf(time.substring(4, 6));
		int diff = 0;
		if (nowTime.substring(0, 4).equals(time.substring(0, 4))) {
			diff = nowMonth - paraMonth;
		} else {// 年错开
			int yearDiff = Integer.valueOf(nowTime.substring(0, 4)) - Integer.valueOf(time.substring(0, 4)) - 1;
			diff = yearDiff * 12 + nowMonth + (12 - paraMonth);
		}
		return diff;
	}

	/**
	 * @param ptime
	 * @param stime
	 * @return boolean
	 * @throws
	 * @Title: judDoubleTime
	 * @Description: 判断stime>ptime?true:false
	 */
	public static boolean judDoubleTime(String ptime, String stime) {
		SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
		ptime = ptime.replaceAll("-", "");
		ptime = ptime.replaceAll(":", "");
		ptime = ptime.replaceAll(" ", "");
		while (14 - ptime.length() > 0) {
			ptime = ptime + "0";
		}

		stime = stime.replaceAll("-", "");
		stime = stime.replaceAll(":", "");
		stime = stime.replaceAll(" ", "");
		while (14 - stime.length() > 0) {
			stime = stime + "0";
		}

		try {
			long diff = sdf.parse(stime).getTime() - sdf.parse(ptime).getTime();
			if (diff < 0)
				return false;
			else
				return true;
		} catch (ParseException e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * @param timeStamp
	 *            时间戳
	 * @return String
	 * @throws
	 * @Title:
	 * @Description:根据时间戳得到日期
	 */
	public static String getDateforStamp(String timeStamp) {
		Date date = new Date(1);
		SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
		long d = Long.parseLong(timeStamp.toString());
		date.setTime(d);
		return sdf.format(date);
	}

	/**
	 * 
	 * @param month
	 *            ,如：2013-01
	 * @param format
	 * @return
	 */
	public static List<String> getDataArrByMonth(String month) {
		month = month.replaceAll("-", "");
		month = month.replaceAll(":", "");
		month = month.replaceAll(" ", "");
		List<String> lstTemp = new ArrayList<String>();
		Calendar c = new GregorianCalendar();
		// int[] arrTemp = lstTemp.toArray();

		String monthTemp = month + "01";
		Date firstDate = getDateTimeByString(monthTemp, "yyyyMMdd");
		Date lastDate = getLastMonthDay(firstDate);
		lstTemp.add(format(firstDate, "yyyyMMdd"));
		// 当最后一天
		while (lastDate.after(firstDate)) {
			c.setTime(firstDate);
			c.add(Calendar.DATE, 1);
			firstDate = c.getTime();
			lstTemp.add(format(firstDate, "yyyyMMdd"));
		}
		return lstTemp;
	}

	/**
	 * 获取指定日期所处月份的第一天
	 * 
	 * @param date
	 * @return
	 */
	public static Date getFirstMonthDay(Date date) {
		Calendar calendar = new GregorianCalendar();
		calendar.setTime(date);
		calendar.set(Calendar.DATE, calendar.getActualMinimum(Calendar.DATE));
		return calendar.getTime();
	}

}
