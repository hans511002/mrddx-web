/**   
 * @文件名: TestMail.java
 * @包 com.ery.meta.mail
 * @描述: 

 * @创建日期 2012-4-5 上午09:59:35
 *  
 */

package com.ery.meta.msg.mail;

import java.sql.SQLException;

import com.ery.base.support.jdbc.DataSourceImpl;
import com.ery.base.support.sys.DataSourceManager;
import com.ery.base.support.sys.SystemVariable;
import com.ery.meta.msg.MsgData;
import com.ery.meta.msg.sms.SendSmsUtil;

/**
 * 项目名称：bi-meta 类名称：TestMail 类描述： 创建人：wuxl@ery.com 创建时间：2012-4-5 上午09:59:35 修改人： 修改时间： 修改备注：
 * 
 * @version
 */

public class TestMail {

	/**
	 * @throws SQLException
	 * @Title: main
	 * @Description:
	 * @param @param args
	 * @return void
	 * @throws
	 */

	public static void main(String[] args) throws SQLException {
		initDataSource();
		int type = 1;
		if (type == 1) {
			MsgData msgData = new MsgData();
			msgData.setContent("测试!");
			msgData.setRecipients(new String[] { "15888888888" });
			SendSmsUtil.sendSms(msgData);
		} else {
			// 信息封装
			EmailData data = new EmailData();
			String hostName = "ery.com".toLowerCase();// 202.105.139.115//smtp.ery.com
			data.setSmtpHost(hostName);
			data.setNeedAuth(true);
			String subject = "报表邮件发送功能测试";
			data.setSubject(subject);
			String content = "您好！这是来自系统的一封测试邮件，给您带来不便敬请谅解！<font color=blue>谢谢！</font> ";
			data.setContent(content);
			String[] recipients = new String[] { "tanht@ery.com", "wuxl@ery.com" };// {"tanht@ery.com","wuxl@ery.com"};//{"wxlcdut@163.com"};
			data.setRecipients(recipients);
			String fromAddr = "hans511002@sohu.com";//
			data.setFromAddr(fromAddr);
			String fileAddr = "C:/Users/Administrator/Desktop/报表附件/报表附件测试.xlsx";
			data.setFileAddr(fileAddr);
			String fname = "hans511002@sohu.com";//
			data.setFname(fname);
			String fpwd = "fbd*:via$99";// "840756131";//fbd*:via$99
			data.setFpwd(fpwd);
			String mailPort = SystemVariable.getString("mail.port", "25");
			data.setMailPort(mailPort);
			String[] cc = new String[] { "34954344@qq.com", "hans511002@sohu.com" };
			data.setCc(cc);
			// 邮件发送
			SendMail s = new SendMail();
			s.setSmtpHost(data.getSmtpHost());
			s.setNeedAuth(data.isNeedAuth());
			s.setPort(data.getMailPort());
			if (s.createMimeMessage(data.getFname(), data.getFpwd()) == false)
				return;
			if (s.setSubject(data.getSubject()) == false)
				return;
			s.setDate();
			if (s.setBody(data.getContent(), null) == false)
				return;
			if (s.setTo(data.getRecipients()) == false)
				return;
			s.setCC(data.getCc());
			if (s.setFrom(data.getFromAddr()) == false)
				return;
			s.addFileAffix(data.getFileAddr());
			try {
				if (s.sendout() == false)
					return;
			} catch (Exception e) {
				e.printStackTrace(); // To change body of catch statement use
										// File | Settings | File Templates.
			}
		}
		System.exit(0);
	}

	private static void initDataSource() throws SQLException {
		String user = "meta";
		String password = "meta";
		String driverName = "oracle.jdbc.driver.OracleDriver";
		String url = "jdbc:oracle:thin:@133.37.251.241:1521:ora10";
		DataSourceManager.addDataSource("0", new DataSourceImpl(driverName, url, user, password));
	}
}
