package com.ery.hadoop.hq.common;

public class ObjArrCmp implements java.util.Comparator<Object[]> {
    public int index = 0;

    public int compare(Object[] a, Object[] b) {
	if (a[index] == null && b[index] == null)
	    return 0;
	else if (a[index] == null)
	    return -1;
	else if (b[index] == null)
	    return 1;
	return a[index].toString().compareTo(b[index].toString());
    }
}
