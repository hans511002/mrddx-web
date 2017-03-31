package com.ery.meta.msg.sms;

import com.ery.meta.msg.MsgData;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.SystemVariable;


public class SendSmsUtil {

	private static final String SMS_IMPL_CLASS = SystemVariable.getString("sms.impl.class",
			"com.ery.meta.msg.sms.SendSmsNullImpl");
	private static SendSms send = null;

	private static boolean createSend() {
		if (send == null) {
			try {
				send = (SendSms) (Class.forName(SMS_IMPL_CLASS).newInstance());
			} catch (Exception e) {
				LogUtils.info("无法创建短信接口实例，请检查local.properties文件sms.impl.class配置！" + e.getMessage());
				return false;
			}
		}
		return true;
	}

	/**
	 * 发送短信
	 * 
	 * @param msgData 消息对象
	 * @return
	 */
	public static boolean sendSms(MsgData msgData) {
		if (createSend()) {
			boolean flag = send.sendSms(msgData.getContent(), msgData.getRecipients());
			send.sendCall(msgData, flag);
			return flag;
		}
		return false;
	}

}
