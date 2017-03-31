package com.ery.meta.msg.sms;

import java.sql.Connection;
import java.util.ArrayList;
import java.util.List;

import oracle.jdbc.OracleTypes;
import com.ery.meta.common.Common;

import com.ery.base.support.jdbc.DBOutParameter;
import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.log4j.LogUtils;
import com.ery.base.support.sys.DataSourceManager;


public class SendSmsDefImpl extends SendSms {

	public boolean sendSms(String content, String... recipients) {
		return smsSend(Common.join(recipients, ";") + ";", content);
	}

	/**
	 * 发送短信
	 * 
	 * @param phones
	 *            用户列表，以“;”连接,并以“;”结尾
	 * @param content
	 * @return
	 * @throws Exception
	 */
	private static boolean smsSend(String phones, String content) {
		Connection con = null;
		try {
			// 根据数据源获取对应的连接。
			con = DataSourceManager.getConnection("PU_INT", "PSCT_03_IN",
					"jdbc:oracle:thin:@133.37.253.188:1521:puods2");
			DataAccess access = new DataAccess(con);
			access.execQueryCall("{CALL ITSM.P_SEND_MSG@SMS_PLATFORM(42,'ods1234',?,?,?,?)}", phones, content,
					new DBOutParameter(OracleTypes.VARCHAR), new DBOutParameter(OracleTypes.VARCHAR));
			LogUtils.info("写入短信接口[" + phones + "],成功");
			return true;
		} catch (Exception e) {
			LogUtils.debug("写入短信接口[" + phones + "],失败！" + e.getMessage());
			LogUtils.error(null, e);
			if (con != null) {
				List<Connection> cons = new ArrayList<Connection>();
				cons.add(con);
				DataSourceManager.destroy(cons);
			}
			return false;
		}
	}

}
