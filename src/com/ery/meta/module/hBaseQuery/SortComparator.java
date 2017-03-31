package com.ery.meta.module.hBaseQuery;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

public class SortComparator implements Comparator<Map<String, Object>> {
	List<SortBean> sortList = null;

	public SortComparator(List<SortBean> sortList) {
		this.sortList = sortList;
	}

	public int compare(Map<String, Object> o1, Map<String, Object> o2) {
		Map<String, Object> obj1 = (Map<String, Object>) o1;
		Map<String, Object> obj2 = (Map<String, Object>) o2;
		for (int i = 0; i < sortList.size(); i++) {
			// SortBean中sortItem是排序的字段，isSelected是顺序
			SortBean sort = (SortBean) sortList.get(i);
			// 取出DEFINE_CLUSTER_NAME，有升有降
			if (sort.getSortItem().equals("DEFINE_CLUSTER_NAME")) {
				int flag = obj1.get("DEFINE_CLUSTER_NAME").toString().compareTo(obj2.get("DEFINE_CLUSTER_NAME").toString());
				if (flag < 0) {
					if (sort.getSortSign().endsWith("0")) {
						return -1;
					} else {
						return 1;
					}
				} else if (flag > 0) {
					if (sort.getSortSign().endsWith("0")) {
						return 1;
					} else {
						return -1;
					}
				} else {
					continue;
				}
			}
			// DEFINE_EN_COLUMN_NAME，有升有降
			if (sort.getSortItem().equals("DEFINE_EN_COLUMN_NAME")) {
				int flag = obj1.get("DEFINE_EN_COLUMN_NAME").toString().compareTo(obj2.get("DEFINE_EN_COLUMN_NAME").toString());
				if (flag < 0) {
					if (sort.getSortSign().endsWith("0")) {
						return -1;
					} else {
						return 1;
					}
				} else if (flag > 0) {
					if (sort.getSortSign().endsWith("0")) {
						return 1;
					} else {
						return -1;
					}
				} else {
					continue;
				}
			}
			// DEFINE_CH_COLUMN_NAME，有升有降
			if (sort.getSortItem().equals("DEFINE_CH_COLUMN_NAME")) {
				int flag = obj1.get("DEFINE_CH_COLUMN_NAME").toString().compareTo(obj2.get("DEFINE_CH_COLUMN_NAME").toString());
				if (flag < 0) {
					if (sort.getSortSign().endsWith("0")) {
						return -1;
					} else {
						return 1;
					}
				} else if (flag > 0) {
					if (sort.getSortSign().endsWith("0")) {
						return 1;
					} else {
						return -1;
					}
				} else {
					continue;
				}
			}
		}
		return 0;
	}
}
