package com.ery.meta.msg;

import java.io.Serializable;

public class MsgData implements Serializable{

	private static final long serialVersionUID = 634769583168462100L;
	private String[] recipients;//接受者，如果是短信则是phone，如果是邮件则是mail
    private String content;//内容
    private int type = 0;//0短信，1邮件

    public String[] getRecipients() {
        return recipients;
    }

    public void setRecipients(String[] recipients) {
        this.recipients = recipients;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }
}
