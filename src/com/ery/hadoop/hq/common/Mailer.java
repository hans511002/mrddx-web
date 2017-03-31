package com.ery.hadoop.hq.common;

import java.util.Properties;

import javax.mail.Address;
import javax.mail.BodyPart;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.Multipart;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;
import javax.mail.internet.MimeMultipart;

public class Mailer {

	private MimeMessage mimeMsg;

	private Session session;

	private Properties props;

	private String username = "";

	private String password = "";

	private Multipart mp;

	public Mailer() {
		setSmtpHost("sohu.com");
		createMimeMessage();
	}

	public Mailer(String smtp) {
		setSmtpHost(smtp);
		createMimeMessage();
	}

	public void setSmtpHost(String hostName) {
		if (props == null)
			props = System.getProperties();
		props.put("mail.smtp.host", hostName);
	}

	public boolean createMimeMessage() {
		try {
			session = Session.getDefaultInstance(props, null);
		} catch (Exception e) {
			return false;
		}

		try {

			mimeMsg = new MimeMessage(session);
			mp = new MimeMultipart();
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public void setNeedAuth(boolean need) {
		if (props == null)
			props = System.getProperties();

		if (need) {
			props.put("mail.smtp.auth", "true");
		} else {
			props.put("mail.smtp.auth", "false");
		}
	}

	public void setNamePass(String name, String pass) {
		username = name;
		password = pass;
	}

	public boolean setSubject(String mailSubject) {
		try {
			mimeMsg.setSubject(mailSubject);
			return true;
		} catch (Exception e) {
			System.err.println("�����ʼ��������?");
			return false;
		}
	}

	public boolean setBody(String mailBody, boolean b_html) {
		try {
			BodyPart bp = new MimeBodyPart();
			mailBody = new String(mailBody.getBytes("ISO8859-1"), "UTF-8");
			if (b_html)
				bp.setContent("<meta http-equiv=Content-Type content=text/html; charset=UTF-8>" + mailBody,
						"text/html;charset=UTF-8");
			else
				bp.setText(mailBody);
			mp.addBodyPart(bp);
			return true;
		} catch (Exception e) {
			System.err.println("�����ʼ����ĳ���?" + e);
			return false;
		}
	}

	public boolean setFrom(String from) {
		try {
			mimeMsg.setFrom(new InternetAddress(from));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean setTo(String to) {
		if (to == null)
			return false;

		try {
			mimeMsg.setRecipients(Message.RecipientType.TO, InternetAddress.parse(to));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean addTo(String to) {
		if (to == null)
			return false;

		try {
			mimeMsg.addRecipients(Message.RecipientType.TO, to);
			return true;
		} catch (MessagingException e) {
			e.printStackTrace();
			return false;
		}
	}

	public boolean setCopyTo(String copyto) {
		if (copyto == null)
			return false;
		try {
			mimeMsg.setRecipients(Message.RecipientType.CC, (Address[]) InternetAddress.parse(copyto));
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public boolean addCopyTo(String to) {
		if (to == null)
			return false;

		try {
			mimeMsg.addRecipients(Message.RecipientType.CC, to);
			return true;
		} catch (MessagingException e) {
			e.printStackTrace();
			return false;
		}
	}

	public boolean sendout() {
		try {
			mimeMsg.setContent(mp);
			mimeMsg.saveChanges();
			System.out.println("���ڷ����ʼ�......");
			Session mailSession = Session.getInstance(props, null);
			Transport transport = mailSession.getTransport("smtp");
			transport.connect((String) props.get("mail.smtp.host"), username, password);
			transport.sendMessage(mimeMsg, mimeMsg.getAllRecipients());
			System.out.println("�ʼ����ͳɹ���");
			transport.close();
			return true;
		} catch (Exception e) {
			System.err.println("�ʼ�����ʧ�ܣ�" + e);
			return false;
		}
	}
}
