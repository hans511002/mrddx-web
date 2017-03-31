

  
package com.ery.meta.msg.mail;


import com.ery.meta.msg.MsgData;

import java.util.ArrayList;
import java.util.List;



public class EmailData extends MsgData{
	private String fromName;  //发件人 名称
    private String fromAddr;//邮箱地址
    private String fname;//发件人邮箱用户名
    private String fpwd;//发件人邮箱密码
    private String[] cc;//抄送人，可以多个
    private String[] bcc;//暗送人，可以多个
    private String subject;  //邮件主题
    private String contentType;  //邮件内容格式(文本或html)
    private String fileName;  //附件文件名(目前只提供一个附件)
    private String smtpHost;//stmp主机
    private boolean needAuth;//身份验证
    private String fileAddr;
    private List<String> attachfiles;//附件文件列表
    private String mailPort;

    public EmailData() {
        super.setType(1);
    }

    public String getMailPort() {
		return mailPort;
	}
	public void setMailPort(String mailPort) {
		this.mailPort = mailPort;
	}
	public String getFileAddr() {
		return fileAddr;
	}
	public void setFileAddr(String fileAddr) {
		this.fileAddr = fileAddr;
	}
	public boolean isNeedAuth() {
		return needAuth;
	}
	public void setNeedAuth(boolean needAuth) {
		this.needAuth = needAuth;
	}
	public String getSmtpHost() {
		return smtpHost;
	}
	public void setSmtpHost(String smtpHost) {
		this.smtpHost = smtpHost;
	}
	public String getFromName() {
		return fromName;
	}
	public void setFromName(String fromName) {
		this.fromName = fromName;
	}
	public String getFromAddr() {
		return fromAddr;
	}
	public void setFromAddr(String fromAddr) {
		this.fromAddr = fromAddr;
	}
	public String getFname() {
		return fname;
	}
	public void setFname(String fname) {
		this.fname = fname;
	}
	public String getFpwd() {
		return fpwd;
	}
	public void setFpwd(String fpwd) {
		this.fpwd = fpwd;
	}

	public String[] getCc() {
		return cc;
	}
	public void setCc(String[] cc) {
		this.cc = cc;
	}
	public String[] getBcc() {
		return bcc;
	}
	public void setBcc(String[] bcc) {
		this.bcc = bcc;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}

	public String getContentType() {
		return contentType;
	}
	public void setContentType(String contentType) {
		this.contentType = contentType;
	}
	public String getFileName() {
		return fileName;
	}
	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

    public List<String> getAttachfiles() {
        if(attachfiles==null)
            attachfiles = new ArrayList<String>();
        return attachfiles;
    }

    public void setAttachfiles(List<String> attachfiles) {
        this.attachfiles = attachfiles;
    }
    
    public void appendAttachFile(String file){
        if(attachfiles==null)
            attachfiles = new ArrayList<String>();
        if(!attachfiles.contains(file))
            attachfiles.add(file);
    }
}
