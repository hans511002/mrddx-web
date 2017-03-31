package com.ery.hadoop.hq.datasource;

import java.util.Date;

import com.ery.hadoop.hq.common.Common;
import com.ery.base.support.utils.Convert;

public class HTableDataSortCmp implements java.util.Comparator<Object[]> {
	public int index = 0;
	public int cmpType = 0;
	public int orderDesc = 0;
	public static String dateFormat = "yyyy-MM-dd hh:mm:ss";

	public int compare(Object[] a, Object[] b) {
		if (a[index] == null && b[index] == null)
			return 0;
		if (a[index] == null) {
			if (orderDesc == 0)
				return -1;
			else
				return 1;
		}
		if (b[index] == null) {
			if (orderDesc == 0)
				return 1;
			else
				return -1;
		}
		// 0:整数 1:小数 2:字符串 3:时间
		switch (cmpType) {
		case 0: {
			long a0 = Convert.toLong(a[index]);
			long b0 = Convert.toLong(b[index]);
			if (a0 == b0)
				return 0;
			if (a0 > b0) {
				if (orderDesc == 0)
					return 1;
				else
					return -1;
			} else {
				if (orderDesc == 0)
					return -1;
				else
					return 1;
			}
		}
		case 1: {
			double a0 = Convert.toDouble(a[index]);
			double b0 = Convert.toDouble(b[index]);
			if (a0 == b0)
				return 0;
			if (a0 > b0) {
				if (orderDesc == 0)
					return 1;
				else
					return -1;
			} else {
				if (orderDesc == 0)
					return -1;
				else
					return 1;
			}
		}
		case 2: {
			int r = a[index].toString().compareTo(b[index].toString());
			if (r == 0)
				return 0;
			if (r > 0) {
				if (orderDesc == 0)
					return 1;
				else
					return -1;
			} else {
				if (orderDesc == 0)
					return -1;
				else
					return 1;
			}
		}
		case 3: {
			Date a0 = Common.toDate(a[index].toString(), dateFormat);
			Date b0 = Common.toDate(b[index].toString(), dateFormat);
			if (a0 == b0)
				return 0;
			if (a0.before(b0)) {
				if (orderDesc == 0)
					return 1;
				else
					return -1;
			} else {
				if (orderDesc == 0)
					return -1;
				else
					return 1;
			}
		}
		default:
			return a[index].toString().compareTo(b[index].toString());
		}
	}
}
