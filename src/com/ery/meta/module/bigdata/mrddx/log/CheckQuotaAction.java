package com.ery.meta.module.bigdata.mrddx.log;

import java.util.List;
import java.util.Map;
import com.ery.meta.common.Page;


public class CheckQuotaAction {

    private CheckQuotaDAO checkQuotaDAO;

    public void setcheckQuotaDAO(CheckQuotaDAO checkQuotaDAO) {
        this.checkQuotaDAO = checkQuotaDAO;
    }
    /**
     * 查询HDFS配额表
     *
     * @param data
     * @param page
     * @return
     */
    public List<Map<String, Object>> queryQuota(Map<String, Object> data, Page page) {
        return checkQuotaDAO.queryQuota(data, page);
    }
    /**
     * 通过HDFS目录名查询HDFS配额表
     *
     * @param data
     * @return
     */
    public List<Map<String, Object>> queryQuotaByfileName(Map<String, Object> data) {
        return checkQuotaDAO.queryQuotaByfileName(data);
    }      
    
    /**
     * 连接SFTP
     * @return
     */
    public Boolean connectSFTP(){
  	  Boolean res = false;
  	  SshConfiguration conf = new SshConfiguration();
	  conf.setHost("133.37.31.201");
	  conf.setUsername("hadoop");
	  conf.setPassword("1qaw2@d2");
	  conf.setPort(22);
	  try {
		  SshUtil sshUitl = new SshUtil(conf);
		  res = sshUitl.runCmd("sh /app/crontab/netlog/shell/get_hdfs_quoto.sh /netlog", "UTF-8");
		  sshUitl.close();
	  } catch (Exception e) {
		  e.printStackTrace();
	  }
	  	
    	return res;
    }
    
    public static void main(String[] args) {

    } 
}
