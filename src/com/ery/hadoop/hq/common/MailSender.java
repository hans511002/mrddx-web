package com.ery.hadoop.hq.common;

public class MailSender {

    /**
     * ֻ����һ��
     * 
     * @param to
     *            ���͵�ַ
     * @param subject
     *            �ʼ�����
     * @param body
     *            �ʼ�����
     * @throws Exception
     */
    public boolean send(String to, String subject, String body) throws Exception {
	Mailer mail = new Mailer(MailConfig.SMTP);
	mail.setNamePass(MailConfig.HOST_MAIL_NAME, MailConfig.HOST_MAIL_PASSWORD);
	mail.setFrom(MailConfig.HOST_MAIL_NAME);
	mail.setSubject(subject);
	mail.setBody(body, false);
	mail.setTo(to);
	mail.setNeedAuth(true);
	return mail.sendout();
    }

    /**
     * Ⱥ��
     * 
     * @param to
     *            ���͵�ַ��һ�飩
     * @param subject
     *            �ʼ�����
     * @param body
     *            �ʼ�����
     * @throws Exception
     */
    public boolean send(String[] to, String subject, String body) throws Exception {
	Mailer mail = new Mailer(MailConfig.SMTP);
	mail.setNamePass(MailConfig.HOST_MAIL_NAME, MailConfig.HOST_MAIL_PASSWORD);
	mail.setFrom(MailConfig.HOST_MAIL_NAME);
	mail.setSubject(subject);
	mail.setBody(body, false);
	for (int i = 0; i < to.length; i++)
	    mail.setTo(to[i]);
	mail.setNeedAuth(true);
	return mail.sendout();
    }

    /**
     * Ⱥ��,����
     * 
     * @param to
     *            ���͵�ַ
     * @param copyTo
     *            ���ͣ�
     * @param subject
     *            �ʼ�����
     * @param body
     *            �ʼ�����
     * @throws Exception
     */
    public boolean send(String to, String[] copyTo, String subject, String body) throws Exception {
	Mailer mail = new Mailer(MailConfig.SMTP);
	mail.setNamePass(MailConfig.HOST_MAIL_NAME, MailConfig.HOST_MAIL_PASSWORD);
	mail.setFrom(MailConfig.HOST_MAIL_NAME);
	mail.setSubject(subject);
	mail.setBody(body, false);
	mail.setTo(to);
	for (int i = 0; i < copyTo.length; i++) {
	    mail.addCopyTo(copyTo[i]);
	}
	mail.setNeedAuth(true);
	return mail.sendout();
    }

}
