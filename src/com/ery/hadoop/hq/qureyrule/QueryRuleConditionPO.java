package com.ery.hadoop.hq.qureyrule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.googlecode.aviator.AviatorEvaluator;
import com.googlecode.aviator.Expression;
import com.ery.hadoop.hq.datasource.HTableConnPO;
import com.ery.base.support.utils.MapUtils;

/**
 * 数据查询列规则条件对象
 * 

 *             reserved.

 * @createDate 2013-3-8
 * @version v1.0
 */
public class QueryRuleConditionPO {
	public long filterId;
	public long queryRuleId;
	public int conditonType; // 0表示条件类型，1表示正则表达式类型

	public String regexExp; // 匹配语句（只存放正则表达式类型的表达式语句）支持宏变量
	public Pattern pattern;

	public String matchExStr; // 表达式语句（存放条件语句、正则表达式与语句），支持宏变量
	public String expr; // 表达式语句（存放条件语句、正则表达式匹配语句），支持宏变量
	public Expression execExp = null;// 编译后的表达式对象

	public int patternType; // 0:匹配条件保留, 1:不匹配条件保留

	public static final int PATTERN_TYPE_MATCH = 0; // 匹配条件保留
	public static final int PATTERN_TYPE_NOT_MATCH = 1; // 不匹配条件保留
	public static final int CONDITON_TYPE_EXPR = 0; // 条件类型
	public static final int CONDITON_TYPE_REGEX = 1; // 正则表达式类型
	public static final Pattern macroPattern = Pattern.compile("\\{(\\w+)\\}");
	public static final Pattern valPartsRegex = Pattern.compile("\\$(\\d+)");

	public String[] regexVar = null;// 正则宏变量
	public String[] exprVar = null;// 条件宏变量
	public int[] regexVarIndex = null;// 索引，-1表示动态参数宏变量
	public int[] exprVarIndex = null;
	public int[] regDindex = null;// 正则计算变量索引

	public QueryRuleConditionPO() {
	}

	public QueryRuleConditionPO(Map<String, Object> map) {
		this.filterId = MapUtils.getIntValue(map, "FILTER_ID");
		this.queryRuleId = MapUtils.getIntValue(map, "QRY_RULE_ID");
		this.regexExp = MapUtils.getString(map, "MATCH_CONDITION");
		this.conditonType = MapUtils.getIntValue(map, "CONDITION_TYPE");
		this.expr = MapUtils.getString(map, "EXPRE_CONDITION");
		this.patternType = MapUtils.getIntValue(map, "PATTERN_TYPE");

	}

	public boolean initExp(HTableConnPO hTableConnPo) {
		try {
			List<String> regMac = new ArrayList<String>();
			HashMap<String, Integer> nameIndexs = hTableConnPo.getNameExpandIndexs();
			if (regexExp != null) {
				regexExp = regexExp.trim();
				String tmpReg = regexExp;
				Matcher m = QueryRuleConditionPO.macroPattern.matcher(regexExp);
				while (m.find()) {// 查找宏变量
					tmpReg = tmpReg.substring(m.end());
					String mac = m.group(1);
					if (!regMac.contains(mac)) {
						regMac.add(mac);
					}
					m = QueryRuleConditionPO.macroPattern.matcher(tmpReg);
				}
				// if (regMac.size() > 0) {//不需要去除括号{} 需要动态编译正则表达式
				// regexExp =
				// QueryRuleConditionPO.macroPattern.matcher(regexExp).replaceAll("$1");
				// }
			}
			regexVar = new String[regMac.size()];
			regexVarIndex = new int[regexVar.length];
			if (regMac.size() > 0) {
				for (int i = 0; i < regexVar.length; i++) {
					regexVarIndex[i] = -1;
					regexVar[i] = regMac.get(i);
					if (nameIndexs.containsKey(regexVar[i])) {
						regexVarIndex[i] = nameIndexs.get(regexVar[i]);
					}
				}
			}
			regMac.clear();
			if (expr != null) {
				expr = expr.trim();
				String tmpReg = expr;
				Matcher m = QueryRuleConditionPO.macroPattern.matcher(expr);
				while (m.find()) {// 查找宏变量
					tmpReg = tmpReg.substring(m.end());
					String mac = m.group(1);
					if (!regMac.contains(mac)) {
						regMac.add(mac);
					}
					m = QueryRuleConditionPO.macroPattern.matcher(tmpReg);
				}
				if (conditonType == QueryRuleConditionPO.CONDITON_TYPE_EXPR && regMac.size() > 0) {// 条件计算才去除括号
					expr = QueryRuleConditionPO.macroPattern.matcher(expr).replaceAll("$1");
				}
			}
			if (regMac.size() > 0) {
				exprVar = new String[regMac.size()];
				exprVarIndex = new int[exprVar.length];
				for (int i = 0; i < exprVar.length; i++) {
					exprVarIndex[i] = -1;
					exprVar[i] = regMac.get(i);
					if (nameIndexs.containsKey(exprVar[i])) {
						exprVarIndex[i] = nameIndexs.get(exprVar[i]);
					}
				}
			}
			if (CONDITON_TYPE_REGEX == this.conditonType && null != this.regexExp && this.expr != null) {
				if (regexVar == null || regexVar.length == 0)
					this.pattern = Pattern.compile(this.regexExp);
				if (expr.indexOf('~') > 0) {
					String tmp[] = expr.split("~");
					this.matchExStr = tmp[1];
					expr = tmp[0];// 匹配用
					execExp = AviatorEvaluator.compile(tmp[1], true);
					Matcher vm = valPartsRegex.matcher(tmp[1]);
					String regpar = tmp[1];
					List<Integer> dindex = new ArrayList<Integer>();
					while (vm.find()) {
						regpar = regpar.substring(vm.end());
						int g = Integer.parseInt(vm.group(1));
						dindex.add(g);
						vm = valPartsRegex.matcher(regpar);
					}
					if (dindex.size() > 0) {
						regDindex = new int[dindex.size()];
						for (int i = 0; i < dindex.size(); i++)
							regDindex[i] = dindex.get(i);
					}
				}
			} else if (conditonType == QueryRuleConditionPO.CONDITON_TYPE_EXPR && this.expr != null) {
				execExp = AviatorEvaluator.compile(this.expr.trim(), true);
			} else {
				return false;
			}
			return true;
		} catch (Exception e) {
			return false;
		}
	}

	public int[] getRegexValIndex() {
		return regexVarIndex;
	}

	public void setRegexValIndex(int[] regexValIndex) {
		this.regexVarIndex = regexValIndex;
	}

	public int[] getExprVarIndex() {
		return exprVarIndex;
	}

	public void setExprVarIndex(int[] exprVarIndex) {
		this.exprVarIndex = exprVarIndex;
	}

	public Map<String, Object> toMap() {
		Map<String, Object> col = new HashMap<String, Object>();
		col.put("filterId", this.filterId);
		col.put("queryRuleId", this.queryRuleId);
		col.put("matchCondition", this.regexExp);
		col.put("conditonType", this.conditonType);
		col.put("expreCondition", this.expr);
		col.put("patternType", this.patternType);

		return col;
	}

	public String getRegexExp() {
		return regexExp;
	}

	public void setRegexExp(String rgexExp) {
		this.regexExp = rgexExp;
	}

	public String getExpr() {
		return expr;
	}

	public void setExpr(String expr) {
		this.expr = expr;
	}

	public Expression getExecExp() {
		return execExp;
	}

	public void setExecExp(Expression execExp) {
		this.execExp = execExp;
	}

	public String[] getRegexVar() {
		return regexVar;
	}

	public void setRegexVar(String[] regexVar) {
		this.regexVar = regexVar;
	}

	public String[] getExprVar() {
		return exprVar;
	}

	public void setExprVar(String[] exprVar) {
		this.exprVar = exprVar;
	}

	public long getFilterId() {
		return filterId;
	}

	public void setFilterId(long filterId) {
		this.filterId = filterId;
	}

	public long getQueryRuleId() {
		return queryRuleId;
	}

	public void setQueryRuleId(long queryRuleId) {
		this.queryRuleId = queryRuleId;
	}

	public int getConditonType() {
		return conditonType;
	}

	public void setConditonType(int conditonType) {
		this.conditonType = conditonType;
	}

	public int getPatternType() {
		return patternType;
	}

	public void setPatternType(int patternType) {
		this.patternType = patternType;
	}

	public Pattern getPattern() {
		return pattern;
	}

	public void setPattern(Pattern pattern) {
		pattern = pattern;
	}
}