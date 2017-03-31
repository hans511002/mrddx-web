package com.ery.meta.module.bigdata.mrddx.log;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.Charset;
import java.util.Properties;

import com.jcraft.jsch.ChannelExec;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import common.Logger;


/**
 *

 * @date 
 *
 */ 
public class SshUtil { 
     
//    private ChannelSftp channelSftp; 
    private ChannelExec channelExec;      
    private Session session = null; 
    private int timeout = 60000; 
    private static final Logger LOG = Logger.getLogger(SshUtil.class); 
     
    public SshUtil(SshConfiguration conf) throws Exception 
    { 
        LOG.info("尝试连接到....host:" + conf.getHost() + ",username:" + conf.getUsername() + ",password:" + conf.getPassword() + ",port:" + conf.getPort()); 
        JSch jsch = new JSch(); // 创建JSch对象  
        session = jsch.getSession(conf.getUsername(), conf.getHost(), conf.getPort()); // 根据用户名,主机ip,端口获取一个Session对象  
        session.setPassword(conf.getPassword()); // 设置密码  
        Properties config = new Properties(); 
        config.put("StrictHostKeyChecking", "no"); 
        session.setConfig(config); // 为Session对象设置properties  
        session.setTimeout(timeout); // 设置timeout时间  
        session.connect(); // 通过Session建立链接  
    } 
     
//    public void download(String src, String dst) throws Exception 
//    { 
//        channelSftp = (ChannelSftp)session.openChannel("sftp"); 
//        channelSftp.connect(); 
//        channelSftp.get(src, dst, new FileProgressMonitor(), ChannelSftp.OVERWRITE); 
//        channelSftp.quit(); 
//    } 
//     
//    public void upload(String src, String dst) throws Exception 
//    { 
//        channelSftp = (ChannelSftp)session.openChannel("sftp"); 
//        channelSftp.connect(); 
//        channelSftp.put(src, dst, new FileProgressMonitor(), ChannelSftp.OVERWRITE); 
//        channelSftp.quit(); 
//    } 
     
    public Boolean runCmd(String cmd, String charset) throws Exception 
    { 
        channelExec = (ChannelExec)session.openChannel("exec"); 
        channelExec.setCommand(cmd); 
        channelExec.setInputStream(null); 
        channelExec.setErrStream(System.err); 
        channelExec.connect(); 
        InputStream in = channelExec.getInputStream(); 
        BufferedReader reader = new BufferedReader(new InputStreamReader(in, Charset.forName(charset))); 
        String buf = null; 
        while ((buf = reader.readLine()) != null) 
        { 
            System.out.println(buf);
        } 
        reader.close(); 
        channelExec.disconnect(); 
        return true;
    } 
     
    public void close() 
    { 
        session.disconnect(); 
    } 
} 