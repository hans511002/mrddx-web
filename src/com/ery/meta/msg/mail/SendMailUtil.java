package com.ery.meta.msg.mail;

import com.ery.base.support.sys.SystemVariable;


public class SendMailUtil {

	public static final String MAIL_SMTP_HOST = SystemVariable.getString("mail.hostName");
	public static final String MAIL_SMTP_PORT = SystemVariable.getString("mail.port", "25");
	public static final String MAIL_FROM_ADDR = SystemVariable.getString("mail.fromAddr");
	public static final String MAIL_FNAME = SystemVariable.getString("mail.fname");
	public static final String MAIL_FPWD = SystemVariable.getString("mail.fpwd");

	/**
	 * @param emailData 必须包含3种属性 subject：主题 content：内容 recipients：接受者
	 * 
	 *            其他可选如 cc：抄送 fileAddr：附件文件全名（路径） froms：发送者 host，port 主机端口等
	 * 
	 * @return boolean
	 * @throws
	 * @Title: sendEmail
	 * @Description: 邮件发送
	 */
	public static boolean sendEmail(EmailData emailData) throws Exception {
		if (emailData == null)
			return false;
		boolean jud = true;
		// 邮件发送
		SendMail sendMail = new SendMail();
		if (emailData.getSmtpHost() != null && !"".equals(emailData.getSmtpHost())) {
			sendMail.setSmtpHost(emailData.getSmtpHost());
		} else {
			sendMail.setSmtpHost(MAIL_SMTP_HOST);
		}
		if (emailData.getMailPort() != null && !"".equals(emailData.getMailPort())) {
			sendMail.setPort(emailData.getMailPort());
		} else {
			sendMail.setPort(MAIL_SMTP_PORT);
		}

		if (emailData.getFromAddr() != null && !"".equals(emailData.getFromAddr())) {
			sendMail.setNeedAuth(emailData.isNeedAuth());
			jud = sendMail.createMimeMessage(emailData.getFname(), emailData.getFpwd());
			if (!jud)
				throw new Exception("邮件createMimeMessage错误!");
			jud = sendMail.setFrom(emailData.getFromAddr());
			if (!jud)
				throw new Exception("邮件设置发送人错误!");
		} else {
			sendMail.setNeedAuth(true);
			jud = sendMail.createMimeMessage(MAIL_FNAME, MAIL_FPWD);
			if (!jud)
				throw new Exception("邮件createMimeMessage错误!");
			jud = sendMail.setFrom(MAIL_FROM_ADDR);
			if (!jud)
				throw new Exception("邮件设置发送人错误!");
		}
		sendMail.setDate();

		if (!sendMail.setSubject(emailData.getSubject())) {
			throw new Exception("邮件设置主题错误!");
		}
		if (!sendMail.setBody(emailData.getContent(), null)) {
			throw new Exception("邮件设置内容错误!");
		}
		if (!sendMail.setTo(emailData.getRecipients())) {
			throw new Exception("邮件设置接收人错误!");
		}
		sendMail.setCC(emailData.getCc());
		if (emailData.getFromAddr() != null && !"".equals(emailData.getFromAddr()))
			sendMail.addFileAffix(emailData.getFileAddr());
		if (emailData.getAttachfiles() != null && emailData.getAttachfiles().size() > 0)
			sendMail.addAttachFiles(emailData.getAttachfiles());
		if (!sendMail.sendout()) {
			throw new Exception("发送邮件出错!");
		}
		return jud;
	}

}
