package com.ery.meta.common.term;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import com.ery.meta.sys.code.CodeManager;
import com.ery.meta.sys.code.CodePO;

import com.ery.base.support.jdbc.DataAccess;
import com.ery.base.support.utils.MapUtils;

public class CodeTermDataServiceImpl extends TermDataService {

	public Object[][] getData(DataAccess access, Map<String, Object> params, TermDataCall call) {
		String codeType = MapUtils.getString(params, TermConstant.KEY_codeType, "");
		String notValueRange = MapUtils.getString(params, TermConstant.KEY_excludeValues, "") + ",";
		if (!"".equals(codeType)) {
			CodePO[] pos = CodeManager.getCodes(codeType);
			List<Object[]> list = new ArrayList<Object[]>();
			if (pos == null) {
				CodeManager.load();
				pos = CodeManager.getCodes(codeType);
			}
			for (CodePO po : pos) {
				if (notValueRange.contains(po.getCodeValue() + ","))
					continue;
				list.add(new Object[] { po.getCodeValue(), po.getCodeName() });
			}
			Object[][] objects = new Object[list.size()][2];
			for (int i = 0; i < list.size(); i++)
				objects[i] = list.get(i);
			return objects;
		}
		return null;
	}

}
