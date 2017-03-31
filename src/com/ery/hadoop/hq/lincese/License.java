package com.ery.hadoop.hq.lincese;

import license.CheckLicense;

/**
 * @version v1.0
 */
public class License {

    public static void check(String[] args) {
	try {
	    CheckLicense.setAppName("HQ");
	    if (CheckLicense.checkLicense()) {
		throw new Exception("");
	    }
	} catch (Exception localException) {
	    localException.printStackTrace();
	}
    }

}
