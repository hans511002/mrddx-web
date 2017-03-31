package com.ery.hadoop.hq.qureyrule.user;

import java.util.List;
import java.util.Map;

import com.ery.base.support.sys.podo.BaseDAO;

public class UserDataDAO extends BaseDAO {

    public List<Map<String, Object>> queryAllUser(){
    	String sql = "SELECT USER_ID, USER_NAME, USER_PASS FROM HB_SERVER_USER WHERE USER_STATE=0";
    	return getDataAccess().queryForList(sql);
    }
    
    public List<Map<String, Object>> queryUser(String userName) {
    	String sql = "SELECT USER_ID, USER_NAME, USER_PASS FROM HB_SERVER_USER WHERE USER_NAME=? AND USER_STATE=0";
    	return getDataAccess().queryForList(sql, userName);
    }
    
    public List<Map<String, Object>> queryAllUserRuleRefList(){
    	String sql = "SELECT B.USER_ID, B.QRY_RULE_ID FROM HB_QRY_RULE A, HB_QRY_RULE_USER_REL B WHERE A.QRY_RULE_ID = B.QRY_RULE_ID AND A.STATE=0";
    	return getDataAccess().queryForList(sql);
    }
    
    public List<Map<String, Object>> queryUserRuleRefList(long ruleId){
    	String sql = "SELECT B.USER_ID, B.QRY_RULE_ID FROM HB_QRY_RULE A, HB_QRY_RULE_USER_REL B WHERE A.QRY_RULE_ID = B.QRY_RULE_ID AND A.QRY_RULE_ID=? AND A.STATE=0";
    	return getDataAccess().queryForList(sql, ruleId);
    }

    public List<Map<String, Object>> queryUserRuleRefList(String userId, String ruleId) {
	String sql = "SELECT USER_ID FROM HB_QRY_RULE_USER_REL WHERE USER_ID=? AND QRY_RULE_ID=?";
	return getDataAccess().queryForList(sql, userId, ruleId);
    }
}
