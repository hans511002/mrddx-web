package com.ery.hadoop.hq.ws;

import java.util.HashMap;
import java.util.Map;

public class Constant {
	public static enum ERROR {
		error_user(1000, "用户信息认证失败!"), error_type(1001, "参数类型错误(应该为map)!"), error_ruleId_type(1002, "查询规则id类型错误!"), error_param(1003,
				"simpleMap参数错误,为空或者参数数量为0!"), error_noruleCode(1004, "请求数据中没有编码[ruleCode]!"), error_ruleCode(1005, "请求数据中规则编码[ruleCode]错误!"), error_noqryrule(
				1006, "不存在请求的查询规则!"), error_noauthority(1007, "此用户对规则无访问权限!"), error_decoderule(1008, "规则解析失败!"), error_paramvalid(1009,
				"参数有效性错误!"), error_noqryruleCode(1010, "请求数据中没有编码[QUERY_RULE_ID]!"), ERROR_HB_TABLE_NAME(1010, "表名称不正确!"), ERROR_DATA_SOURCE_ID(
				1011, "数据源不正确!"), ERROR_QUERY_RETURN_COUNT(1012, "取值范围不正确!"),  ERROR_QUERY_RULE_ERROR(1013, "规则不存在或者规则加载无效!"), ERROR_MODIFY_HB_TABLE_DATA(1020, "修改数据不能为空!"), ERROR_MODIFY_HB_TABLE_DATA_TYPE(
				1021, "修改数据josn格式不正确!"), ERROR_MODIFY_HB_TABLE_DATA_FIAL(1022, "修改数据失败!"), ERROR_MODIFY_HB_TABLE_DATA_OTHER(1023,
				"修改数据，其他错误!"), ERROR_ADD_HB_TABLE_DATA(1030, "新增数据不能为空!"), ERROR_ADD_HB_TABLE_DATA_TYPE(1031, "新增数据josn格式不正确!"), ERROR_ADD_HB_TABLE_DATA_FIAL(
				1032, "新增数据失败!"), ERROR_ADD_HB_TABLE_DATA_OTHER(1033, "新增数据，其他错误!"), error_other(10000, "其他错误!"),error_tablename(10000, "表名错误"),

		;

		public int code;
		public String msg;

		ERROR(int code, String msg) {
			this.code = code;
			this.msg = msg;
		}

		public String toString() {
			return "[" + code + "]" + msg;
		}

	};

	// 对表参数名称
	public static final String HT_NAME = "HT_NAME";
	public static final String SOURCE_ID = "SOURCE_ID";
	public static final String START_KEY = "START_KEY";
	public static final String END_KEY = "END_KEY";
	public static final String COUNT = "COUNT";

	// 修改数据参数
	public static final String ITEM_DATA = "ITEM_DATA";
	public static final String VALUES = "VALUES";
	public static final String STATUS = "STATUS";
	public static final String CODE = "CODE";

	// 响应参数名称
	public static String RESULT_NAME = "result";
	public static String VALUES_NAME = "values";
	public static String ENFIELD_NAME = "enField";
	public static String CHFIELD_NAME = "chField";
	public static String ROWKEY_NAME = "ROWID";
	public static String CURRENTCOUNT_NAME = "currentCount";
	public static String RESPONSE_CODE = "code";
	public static String RESPONSE_STATUS = "status";

	public static final int QUERY_RETURN_DEFAULT_COUNT = 50; //

	// // 查询
	// public static final String ERROR_HB_TABLE_NAME = "1010";// 表名称不正确
	// public static final String ERROR_DATA_SOURCE_ID = "1011";// 表名称不正确
	// public static final String ERROR_QUERY_RETURN_COUNT = "1012";// 取值范围不正确
	//
	// // 修改
	// public static final String ERROR_MODIFY_HB_TABLE_DATA = "1020";// 修改数据不能为空
	// public static final String ERROR_MODIFY_HB_TABLE_DATA_TYPE = "1021";// 修改数据josn格式不正确
	// public static final String ERROR_MODIFY_HB_TABLE_DATA_FIAL = "1022";// 修改数据失败
	// public static final String ERROR_MODIFY_HB_TABLE_DATA_OTHER = "1023";// 修改数据，其他错误
	//
	// // 新增
	// public static final String ERROR_ADD_HB_TABLE_DATA = "1030";// 新增数据不能为空
	// public static final String ERROR_ADD_HB_TABLE_DATA_TYPE = "1031";// 新增数据josn格式不正确
	// public static final String ERROR_ADD_HB_TABLE_DATA_FIAL = "1032";// 新增数据失败
	// public static final String ERROR_ADD_HB_TABLE_DATA_OTHER = "1033";// 新增数据，其他错误

	// // public static final String error_user = "1000";// 用户信息认证失败!
	// public static final String error_type = "1001";// 参数类型错误(应该为map)
	// public static final String error_ruleId_type = "1002";// 查询规则id类型错误
	// public static final String error_param = "1003";// simpleMap参数错误,为空或者参数数量为0
	// public static final String error_noruleCode = "1004";// 请求数据中没有编码[ruleCode]
	// public static final String error_ruleCode = "1005";// 请求数据中规则编码[ruleCode]错误
	// public static final String error_noauthority = "1006";// "此用户对规则无访问权限!"
	// public static final String error_decoderule = "1007";// 规则解析失败
	// public static final String error_paramvalid = "1008";// 参数有效性错误
	// public static final String error_other = "10000";// 其他错误

	public static Map<String, Object> getRequetErrorMsg(ERROR code) {
		Map<String, Object> mapValue = new HashMap<String, Object>();
		Map<String, Object> value = new HashMap<String, Object>();
		value.put("code", code.code);
		value.put("msg", code.msg);
		value.put("status", "false");
		mapValue.put("result", value);
		return mapValue;
	}
}
