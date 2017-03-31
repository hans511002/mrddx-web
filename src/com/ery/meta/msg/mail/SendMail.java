

package com.ery.meta.msg.mail;

import java.util.Date;
import java.util.List;
import java.util.Properties;

import javax.activation.DataHandler;
import javax.activation.FileDataSource;
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
import javax.mail.internet.MimeUtility;

import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.utils.StringUtils;



public class SendMail {
	private MimeMessage mimeMsg; // MIME邮件对象
	private Session session; // 邮件会话对象
	private Properties props; // 系统属性
	@SuppressWarnings("unused")
	private boolean needAuth = false; // SMTP是否需要认证
	private String username = ""; // smtp认证用户名和密码
	private String password = "";
	private Multipart mp; // Multipart对象,邮件内容,标题,附件等内容均添加到其中后再生成MimeMessage对象

	/***
	 * 设置SMTP主机
	 * 
	 * @param hostName
	 */
	public void setSmtpHost(String hostName) {
		// Log.debug("设置系统属性：mail.smtp.host = " + hostName);
		if (props == null)
			props = System.getProperties(); // 获得系统属性对象
		props.put("mail.smtp.host", hostName); // 设置SMTP主机 　　}
	}

	/***
	 * 创建MIME邮件对象
	 * 
	 * @return Boolean
	 */
	public boolean createMimeMessage(String username, String password) {
		try {
			// Log.debug("准备获取邮件会话对象！");
			SimpleAuthenticator authenticator = new SimpleAuthenticator(username, password);
			session = Session.getDefaultInstance(props, authenticator); // 获得邮件会话对象
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}

		// Log.debug("准备创建MIME邮件对象！");
		try {
			mimeMsg = new MimeMessage(session); // 创建MIME邮件对象
			mp = new MimeMultipart(); // mp 一个multipart对象
			// Multipart is a container that holds multiple body parts
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/***
	 * 设置是否需要smtp身份认证
	 * 
	 * @param need
	 */
	public void setNeedAuth(boolean need) {
		// Log.debug("设置smtp身份认证：mail.smtp.auth = " + need);
		if (props == null)
			props = System.getProperties();
		if (need) {
			props.put("mail.smtp.auth", "true");
		} else {
			props.put("mail.smtp.auth", "false");
		}
	}

	/***
	 * 设置smtp认证时的用户名和密码
	 * 
	 * @param name
	 * @param pass
	 */
	public void setNamePass(String name, String pass) {
		// Log.debug("程序得到用户名与密码");
		username = name;
		password = pass;
	}

	/***
	 * 设置邮件主题
	 * 
	 * @param mailSubject
	 * @return
	 */
	public boolean setSubject(String mailSubject) {
		// Log.debug("设置邮件主题！");
		try {
			mimeMsg.setSubject(mailSubject);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/***
	 * 设置邮件体
	 * 
	 * @param mailBody
	 * @param formatType
	 * @return
	 */
	public boolean setBody(String mailBody, String formatType) {
		try {
			// Log.debug("设置邮件体格式");
			BodyPart bp = new MimeBodyPart();
			if (StringUtils.isEmpty(formatType) || "HTML".equals(formatType))// 默认为html格式
				bp.setContent("<meta http-equiv=Content-Type content=text/html; charset=gb2312>" + mailBody,
						"text/html;charset=GB2312");
			mp.addBodyPart(bp);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/***
	 * 增加邮件附件
	 * 
	 * @param filename
	 * @return
	 */
	public boolean addFileAffix(String filename) {
		// Log.debug("增加邮件附件：" + filename);
		try {
			BodyPart bp = new MimeBodyPart();
			FileDataSource fileds = new FileDataSource(filename);
			bp.setDataHandler(new DataHandler(fileds));
			bp.setFileName(MimeUtility.encodeWord(fileds.getName()));
			mp.addBodyPart(bp);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/***
	 * 增加邮件附件
	 * 
	 * @param files
	 * @return
	 */
	public boolean addAttachFiles(List<String> files) {
		// Log.debug("增加邮件附件：" + filename);
		try {
			for (String filename : files) {
				BodyPart bp = new MimeBodyPart();
				FileDataSource fileds = new FileDataSource(filename);
				bp.setDataHandler(new DataHandler(fileds));
				bp.setFileName(MimeUtility.encodeWord(fileds.getName()));
				mp.addBodyPart(bp);
			}
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/***
	 * 设置发信人
	 * 
	 * @param from
	 * @return
	 */
	public boolean setFrom(String from) {
		// Log.debug("设置发信人！");
		try {
			mimeMsg.setFrom(new InternetAddress(from)); // 设置发信人
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	/***
	 * 设置收信人
	 * 
	 * @param to
	 * @return
	 */
	public boolean setTo(String to[]) {
		// Log.debug("设置收信人");
		if (to == null)
			return false;
		try {
			Address[] tos = null;
			tos = new InternetAddress[to.length];
			for (int i = 0; i < to.length; i++) {
				tos[i] = new InternetAddress(to[i]);
			}
			mimeMsg.setRecipients(Message.RecipientType.TO, tos);
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * @Title: setCC
	 * @Description: 设置抄送人
	 * @param toCC
	 * @return boolean
	 * @throws
	 */
	public boolean setCC(String toCC[]) {
		// Log.debug("设置抄送人");
		if (toCC != null && toCC.length > 0) {
			try {
				Address[] ccAdresses = new InternetAddress[toCC.length];
				for (int i = 0; i < toCC.length; i++) {
					ccAdresses[i] = new InternetAddress(toCC[i]);
				}
				// 将抄送者信息设置到邮件信息中，注意类型为Message.RecipientType.CC
				mimeMsg.setRecipients(Message.RecipientType.CC, ccAdresses);
				return true;
			} catch (Exception e) {
				e.printStackTrace();
				return false;
			}
		} else
			return true;
	}

	/***
	 * 发送附件到
	 * 
	 * @param copyto
	 * @return
	 */
	public boolean setCopyTo(String copyto) {
		// Log.debug("发送附件到");
		if (copyto == null)
			return false;
		try {
			mimeMsg.setRecipients(Message.RecipientType.CC, (Address[]) InternetAddress.parse(copyto));
			return true;
		} catch (Exception e) {
			e.printStackTrace();
			return false;
		}
	}

	/**
	 * @Title: setPort
	 * @Description: 设置端口号
	 * @param portNum
	 * @return void
	 * @throws
	 */
	public void setPort(String portNum) {
		if (props == null)
			props = System.getProperties();
		if (StringUtils.isEmpty(portNum))
			props.put("mail.smtp.port", "25");
		else
			props.put("mail.smtp.port", portNum);
	}

	/**
	 * @Title: setDate
	 * @Description: 设置日期
	 * @param
	 * @return void
	 * @throws
	 */
	public void setDate() {
		try {
			mimeMsg.setSentDate(new Date());
		} catch (MessagingException e) {
			e.printStackTrace();
		}
	}

	/***
	 * 发送邮件
	 * 
	 * @return true or false
	 */
	@SuppressWarnings("static-access")
	public boolean sendout() throws Exception {
		try {
			mimeMsg.setContent(mp);
			mimeMsg.saveChanges();
			LogUtils.debug("正在发送邮件....");
			// Transport transport = session.getTransport("smtp"); //
			// 发送邮件
			Transport.send(mimeMsg);
			LogUtils.debug("发送邮件成功！");
			// transport.close();
			return true;
		} catch (Exception e) {
			throw e;
		}
	}
}
