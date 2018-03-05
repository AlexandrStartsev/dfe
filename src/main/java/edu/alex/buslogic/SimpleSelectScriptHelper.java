package edu.alex.buslogic;

import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.ServletContext;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@Component("SimpleSelectScriptHelper")
public class SimpleSelectScriptHelper implements ScriptHelper {
	@Autowired ServletContext context;
	
	private String read(String path) throws IOException { return IOUtils.toString(new InputStreamReader(context.getResourceAsStream(path))); }
	
	private static Type tt = new TypeToken<Map<String, Object>>(){}.getType();
	private static Gson gson = new Gson();

	@Override
	public List<Object> getResult(Map<String, String> params) throws Exception {
		new ArrayList<>();
		String lob = params.get("lob");
		List<String> states = Arrays.asList("ALL", params.get("state"));
		String option = params.get("option");
		
		Map<String, List<Map<String, String>>> o = gson.fromJson(read("resources/others/simpleselect.json"), tt);
		
		List<Object> result = o.get("items").stream()
									.filter(m -> m.get("lob").equals(lob) && states.contains(m.get("state")) && m.get("name").equals(option))
									.sorted((m1, m2) -> Integer.valueOf(m1.get("listposition")).compareTo(Integer.valueOf(m2.get("listposition"))))
									.map( m -> { Map<String, String> m1 = new HashMap<>(); m1.put("value", m.get("value")); m1.put("description", m.get("text")); return m1; })
									.collect(Collectors.toList());
		
		return result;
	}

}
