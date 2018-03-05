package edu.alex.buslogic;

import java.io.IOException;
import java.io.InputStreamReader;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import javax.servlet.ServletContext;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

@Component("BBOPClassCodeScriptHelper")
public class BBOPClassCodeScriptHelper implements ScriptHelper {
	private final ServletContext context;
	
	@Autowired
	public BBOPClassCodeScriptHelper(ServletContext context) { this.context = context; };
	
	private String read(String path) throws IOException { return IOUtils.toString(new InputStreamReader(context.getResourceAsStream(path))); }
	
	private static Pattern p = Pattern.compile("^[0-9]{8}$");
	private static DateFormat f = new SimpleDateFormat("yyyyMMDD");
	private Gson gson = new Gson();
	 
	@Override
	public List<Object> getResult(Map<String, String> params) throws Exception {
		List<Object> result = new ArrayList<>();
		 
		if( "getSicNaics".equals( params.get("action") ) ) {
			String state = params.get("state");
			String ed = params.get("effdate");
			Date date = (ed != null && p.matcher(ed).matches()) ? f.parse(ed) : f.parse("20000101");
			if( "KS".equalsIgnoreCase(state) && date.compareTo(f.parse("20171010")) >= 0 ) {
				Map<String, List<Object>> o = gson.fromJson(read("resources/others/sic-naics.json"), new TypeToken<Map<String, List<Object>>>(){}.getType());
				result.addAll(o.get("items"));
			}
		}  
		
		return result;
	}

}
