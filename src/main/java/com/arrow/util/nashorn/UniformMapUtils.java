package com.arrow.util.nashorn;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;

public class UniformMapUtils {
	
	/**
	 * 	 Usage: 
	 *  Map<String, Object> m3 =  gs.fromJson(json1, Map.class);
		Map<String, Object> m4 =  gs.fromJson(json2, Map.class);
		
		List<String> allowed = new ArrayList();
		allowed.add("policy.**");
		
		SortedSet<String> restricted = new TreeSet<>();
		restricted.add("policy.ss1");
		restricted.add("policy.qqeligible");
		restricted.add("policy.class.field5");
		
		allowed.forEach(s -> mergeWithPattern(m4, m3, "", s.split("\\."), 0, restricted));
	 */
	
	@SuppressWarnings("unchecked")
	public static void patternMerge(Map<String, Object> source, Map<String, Object> dest, String rootPath, String [] pattern, int depth, SortedSet<String> exclusions) {
		int ndepth = depth;
		Set<String> keys = new HashSet<>();
		if(pattern[ndepth].charAt(0) == '*') {
			keys.addAll(source.keySet());
			keys.addAll(dest.keySet());
			ndepth = (pattern[ndepth].equals("**") ? ndepth : ndepth + 1);
		} else {
			keys.add(pattern[ndepth++]);
		}
		for(Iterator<String> it = keys.iterator(); it.hasNext(); ) {
			String k = it.next();
			String excPath = (rootPath.length() == 0 ? k : rootPath + "." + k);
			if( ! exclusions.contains(excPath) ) {
				SortedSet<String> e1 = exclusions.subSet(excPath + ".", excPath + "/");
				Object sv = source.get(k);
				if(sv == null) {
					dest.remove(k);
				} else {
					if(! (sv instanceof List) || e1.size() == 0 ) 
						dest.put(k, sv);
					else {
						Object dv = dest.get(k);
						if(! (dv instanceof List)) {
							dest.put(k, dv = new ArrayList<>());
						}
						List<Map<String, Object>> d = (List<Map<String, Object>>) dv;
						List<Map<String, Object>> s = (List<Map<String, Object>>) sv;
						if(d.size() > s.size()) d = d.subList(0, s.size());
						while(d.size() < s.size()) d.add(new HashMap<String, Object>());
						for(int i = d.size() - 1; i >= 0; i--)
							patternMerge(s.get(i) , d.get(i), excPath, pattern, ndepth, e1);
					}
				}
			}
		}
	}
}
