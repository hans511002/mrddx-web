package com.ery.meta.web.session;

import java.util.HashMap;
import java.util.Hashtable;
import java.util.Map;

import javax.servlet.http.HttpSession;

public class SessionContext {

	private static Hashtable<String, HashMap<String, Object>> context = new Hashtable<String, HashMap<String, Object>>();
	private static Hashtable<String, HttpSession> sessionContext = new Hashtable<String, HttpSession>();

	private SessionContext() {
	}

	public static void putValue(HttpSession session, String key, Object value) {
		String sid = session.getId();
		HashMap<String, Object> map = null;
		if (sessionContext.containsKey(sid)) {
			map = context.get(sid);
		} else {
			map = new HashMap<String, Object>();
			sessionContext.put(sid, session);
			context.put(sid, map);
		}
		map.put(key, value);

	}

	public static Object getValue(String sid, String key) {
		Object value = null;
		if (sessionContext.containsKey(sid)) {
			value = context.get(sid).get(key);
		}
		return value;
	}

	public static HttpSession getSession(String sid) {
		HttpSession session = null;
		if (sessionContext.containsKey(sid)) {
			session = sessionContext.get(sid);
		}
		return session;
	}

	public static void removeValue(String sid, String key) {
		if (sessionContext.containsKey(sid)) {
			HashMap<String, Object> map = context.get(sid);
			map.remove(key);
		}
	}

	public static void removeSession(final String sid) {
		new Thread(new Runnable() {
			public void run() {
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				sessionContext.remove(sid);
				context.remove(sid);
			}
		}).start();
	}

	public static boolean containsSession(String sid) {
		return context.containsKey(sid);
	}

	public static boolean containsSession(HttpSession session) {
		return context.containsKey(session.getId());
	}

	@SuppressWarnings("unchecked")
	public static Map<String, Object> getMap(String sid) {
		Map<String, Object> map = null;
		if (sessionContext.containsKey(sid)) {
			HashMap<String, Object> temp = context.get(sid);
			map = temp.getClass().cast(temp.clone());
		} else {

		}
		return map;
	}

	public static void destory() {
		context.clear();
		sessionContext.clear();
	}
}
