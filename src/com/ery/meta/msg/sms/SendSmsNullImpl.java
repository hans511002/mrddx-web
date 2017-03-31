package com.ery.meta.msg.sms;

import com.ery.base.support.utils.StringUtils;

public class SendSmsNullImpl extends SendSms {

	public boolean sendSms(String content, String... phones) {
		System.out.println("短信发送默认实现=》号码:" + StringUtils.join(phones, ",") + "，内容:" + content);
		return true;
	}

}
