package com.ery.meta.msg.sms;

import com.ery.meta.msg.MsgData;

import com.ery.base.support.log4j.LogUtils;


public abstract class SendSms {

	/**
	 * 短信发送接口
	 * 
	 * @param content 内容
	 * @param phones 接收者号码
	 * @return
	 */
	public abstract boolean sendSms(String content, String... phones);

	/**
	 * 发送完成回调，可以扩展实现，记录日志等!
	 * 
	 * @param msgData 消息对象
	 * @param flag 发送成功标识,true表示成功
	 */
	public void sendCall(MsgData msgData, boolean flag) {
		if (flag)
			LogUtils.debug("发送成功!");
		else
			LogUtils.debug("发送失败!");
	}

}
